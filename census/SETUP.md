# Census Setup — 10 minutes

Captures every completed quiz/diagnostic: timestamp, type, archetype or pattern, use case.
No personal data. Fails silently — never blocks the receipt.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**
2. Rename it: `AI Waste Receipt — Booth Census`
3. Leave it open

---

## Step 2 — Open Apps Script

1. In the sheet: **Extensions → Apps Script**
2. Delete everything in the editor (the default `function myFunction` stub)
3. Open `census/apps-script.gs` from this repo, copy everything, paste it in
4. Click **Save** (floppy disk icon) — name the project `AI Waste Census`

---

## Step 3 — Deploy as a web app

1. Click **Deploy → New deployment**
2. Click the gear icon next to **Select type** → choose **Web app**
3. Fill in:
   - Description: `Booth census v1`
   - Execute as: **Me**
   - Who has access: **Anyone** ← important, the booth app posts here anonymously
4. Click **Deploy**
5. Click **Authorise access** → pick your Google account → click **Advanced → Go to AI Waste Census (unsafe)** → **Allow**
6. Copy the **Web app URL** — it looks like `https://script.google.com/macros/s/ABC.../exec`

---

## Step 4 — Wire it into the booth app

Open `receipt-engine/config.js` and paste the URL:

```js
const CONFIG = {
  CENSUS_ENDPOINT: "https://script.google.com/macros/s/YOUR_ID_HERE/exec",
  // ... other URLs
};
```

Commit and push. Done.

---

## Step 5 — Test it

Complete the quiz on the live site, then check the sheet — a new row should appear within a few seconds.

---

## Updating the script later

After pasting a new version of `apps-script.gs`, a plain Save is not enough — the live
URL keeps serving the old code until you redeploy:

1. **Deploy → Manage deployments**
2. Click the pencil icon on the existing deployment
3. **Version: New version** → **Deploy**

The URL stays the same, so `config.js` doesn't change. If Google asks to re-authorise,
accept — `@OnlyCurrentDoc` narrows access to this one spreadsheet.

The script only accepts payloads that exactly match what the booth sends. Keep the lists
at the top of the script in sync with the app, or those results will be silently dropped:

- `ARCHETYPES` ↔ `content/archetypes.json`
- `PATTERNS` ↔ `content/patterns.json`
- `BUILDER_USE_CASES` ↔ `APP_TYPES` labels in `receipt-engine/app.js`
- `USE_CASE_MAX_CHARS` ↔ the `maxlength` on the quiz's "Other…" input

Rejected submissions never show an error to the visitor. To see why something was
dropped, open **Executions** in the Apps Script sidebar and look for `census rejected:`.

Rows go to a tab named **Responses** (created automatically). Rows written by an older
version of the script may be on the first tab instead.

---

## Checking the tally during the event

In the Apps Script editor, click the function dropdown (top toolbar, next to the run ▶ button), select `logTally`, then click ▶.  
The Execution Log panel at the bottom shows total responses and a breakdown by archetype/pattern.

Or just watch the sheet directly — it updates in real time.
