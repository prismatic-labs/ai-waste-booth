/** @OnlyCurrentDoc */
// AI Waste Archetypes — census collector
// Paste this entire file into Google Apps Script, then follow SETUP.md
//
// The web app URL is public (it ships in the site's JS), so treat every POST as
// untrusted:
//   - accept only the exact payload shape the booth sends, with known values
//   - store free text as inert, scrubbed plain text (no formulas, links or emails)
//   - drop duplicates and cap write volume so a flood can't bury real data
// Rejection reasons go to the private execution log, never to the caller.

// Must match content/archetypes.json and content/patterns.json
const ARCHETYPES = [
  "regeneration_goblin",
  "context_hoarder",
  "confident_hallucination_enjoyer",
  "prompt_archaeologist",
  "copy_paste_pilot",
  "improviser",
];

const PATTERNS = [
  "STALL-001",
  "CACHE-001",
  "RAG-001",
  "BABBLE-001",
  "ZOMBIE-001",
  "CTX-001",
  "EMPTY-001",
];

// Must match APP_TYPES in receipt-engine/app.js ("your system" is its fallback)
const BUILDER_USE_CASES = [
  "Support bot / chatbot",
  "RAG app",
  "AI agent",
  "Coding / writing copilot",
  "Automation pipeline",
  "Something else",
  "your system",
];

// Must match the quiz's "Other…" input (maxlength="80", min 3 chars)
const USE_CASE_MIN_CHARS = 3;
const USE_CASE_MAX_CHARS = 80;

const ALLOWED_KEYS   = ["id", "useCase", "archetype", "suspectedPattern", "isBuilder"];
const MAX_BODY_CHARS = 1000;
const UUID_RE        = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Volume caps. A busy booth produces a few results a minute; these leave
// plenty of headroom while stopping a script from filling the sheet.
const MAX_PER_MINUTE = 30;
const MAX_PER_6H     = 1000;  // CacheService entries live at most 6h
const MAX_ROWS       = 20000;
const DEDUPE_SECONDS = 6 * 60 * 60;

function doPost(e) {
  try {
    const body = _readBody(e);
    if (!body) return _reject("bad body");

    const row = _validate(body);
    if (!row) return _reject("invalid payload");

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(3000)) return _reject("lock timeout");
    try {
      const cache = CacheService.getScriptCache();

      if (cache.get("seen:" + body.id)) return _reject("duplicate id");
      if (!_withinRateLimits(cache)) return _reject("rate limited");

      const sheet = _getSheet();
      if (sheet.getLastRow() > MAX_ROWS) return _reject("sheet full");

      sheet.appendRow(row);
      cache.put("seen:" + body.id, "1", DEDUPE_SECONDS);
    } finally {
      lock.releaseLock();
    }

    return _reply(true);
  } catch (err) {
    return _reject("exception: " + err);
  }
}

function _readBody(e) {
  const post = e && e.postData;
  if (!post || typeof post.contents !== "string") return null;
  if (post.contents.length > MAX_BODY_CHARS) return null;

  const type = String(post.type || "").toLowerCase();
  if (type.indexOf("text/plain") !== 0 && type.indexOf("application/json") !== 0) return null;

  const d = JSON.parse(post.contents);
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  return d;
}

// Returns a safe row, or null if the payload isn't exactly what the booth sends
function _validate(d) {
  const keys = Object.keys(d);
  if (keys.some(k => ALLOWED_KEYS.indexOf(k) === -1)) return null;

  if (typeof d.id !== "string" || !UUID_RE.test(d.id)) return null;
  if (typeof d.isBuilder !== "boolean") return null;
  if (typeof d.useCase !== "string") return null;

  let archetype = "";
  let pattern   = "";
  let useCase   = "";

  if (d.isBuilder) {
    if (PATTERNS.indexOf(d.suspectedPattern) === -1) return null;
    if (d.archetype != null) return null;
    if (BUILDER_USE_CASES.indexOf(d.useCase) === -1) return null;
    pattern = d.suspectedPattern;
    useCase = d.useCase;
  } else {
    if (ARCHETYPES.indexOf(d.archetype) === -1) return null;
    if (d.suspectedPattern != null) return null;
    useCase = _scrubText(d.useCase);
    if (useCase.length < USE_CASE_MIN_CHARS) return null;
    archetype = d.archetype;
  }

  return [
    new Date(),
    d.isBuilder ? "Builder" : "Casual",
    archetype,
    pattern,
    _plainText(useCase),
    d.id,
  ];
}

// Free text from the "Other…" box: strip control and bidi/invisible characters,
// collapse whitespace, redact anything that looks like contact details or a link
// (keeps the census anonymous and stops clickable links landing in the sheet)
function _scrubText(value) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, USE_CASE_MAX_CHARS)
    .replace(/[^\s@]+@[^\s@]+/g, "[email]")
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, "[link]")
    .replace(/\b[\w-]+(?:\.[\w-]+)*\.(?:com|net|org|io|ai|co|uk|pt|dev|app|xyz|me|info)\b\S*/gi, "[link]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, m => (m.replace(/\D/g, "").length >= 9 ? "[number]" : m));
}

// A leading apostrophe makes Sheets store the value as text instead of
// evaluating it (blocks =IMPORTXML(...) style exfiltration)
function _plainText(value) {
  if (!value) return "";
  return /^[=+\-@'\t\r\n]/.test(value) ? "'" + value : value;
}

// Fixed-window counters; caller must hold the script lock
function _withinRateLimits(cache) {
  const now       = Date.now();
  const minuteKey = "rl:m:" + Math.floor(now / 60000);
  const windowKey = "rl:6h:" + Math.floor(now / 21600000);

  const perMinute = Number(cache.get(minuteKey) || 0);
  const perWindow = Number(cache.get(windowKey) || 0);
  if (perMinute >= MAX_PER_MINUTE || perWindow >= MAX_PER_6H) return false;

  cache.put(minuteKey, String(perMinute + 1), 120);
  cache.put(windowKey, String(perWindow + 1), 21600);
  return true;
}

function _reject(reason) {
  console.warn("census rejected: " + reason);
  return _reply(false);
}

function _reply(ok) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: ok }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Writes go to a dedicated "Responses" tab, created with headers on first run
function _getSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Responses") || ss.insertSheet("Responses");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Type", "Archetype", "Pattern", "Use Case", "ID"]);
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(5, 280);
  }

  return sheet;
}

// Run this manually in the editor to see a live tally in the logs
function logTally() {
  const sheet = _getSheet();
  const rows  = sheet.getDataRange().getValues().slice(1);
  const tally = {};

  rows.forEach(row => {
    const key = row[2] || row[3] || "unknown";
    tally[key] = (tally[key] || 0) + 1;
  });

  Logger.log("Total responses: " + rows.length);
  Logger.log(JSON.stringify(tally, null, 2));
}
