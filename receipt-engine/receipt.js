/* receipt.js — renders both Archetype and Silent Failure receipt layouts */

const Receipt = (() => {
  function render(diagnosis) {
    const container = document.getElementById("receipt-container");
    container.innerHTML = "";

    const card = document.createElement("div");
    card.className = diagnosis.isBuilder ? "receipt-card builder" : "receipt-card";
    card.id = "receipt-card";

    const lines = diagnosis.isBuilder
      ? _buildBuilderLines(diagnosis)
      : _buildCasualLines(diagnosis);

    lines.forEach(({ html, delay }) => {
      const span = document.createElement("div");
      span.className = "receipt-line";
      span.innerHTML = html;
      card.appendChild(span);
      setTimeout(() => span.classList.add("visible"), delay);
    });

    container.appendChild(card);

    // render QR after last line appears
    const lastDelay = lines[lines.length - 1]?.delay || 0;
    setTimeout(() => _renderQR(diagnosis), lastDelay + 80);

    // update share button style for builder
    const shareBtn = document.getElementById("btn-share-card");
    if (diagnosis.isBuilder) {
      shareBtn.classList.add("builder-cta");
      shareBtn.textContent = "Save / Share Receipt";
    } else {
      shareBtn.classList.remove("builder-cta");
      shareBtn.textContent = "Save / Share Receipt";
    }
  }

  // ── Casual (Archetype) layout ──────────────────────────────────────
  function _buildCasualLines(d) {
    const dateStr = _fmtDate(d.timestamp);
    const archName = _getArchetypeName(d.archetype);
    const imgSrc = `../assets/archetypes/${d.archetype}.jpg`;

    const lines = [];
    let t = 0;
    const step = 60;

    const push = (html) => { lines.push({ html, delay: t }); t += step; };

    push(`<span class="receipt-rule">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
    push(`<span style="text-align:center;display:block;font-weight:bold;letter-spacing:2px;font-size:12px;">AI WASTE RECEIPT</span>`);
    push(`<span class="receipt-rule">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
    push(`<br>`);
    push(`<span class="clearfix">
      <img class="receipt-img" src="${imgSrc}" alt="${archName}"
           onerror="this.style.display='none'">
      <span class="receipt-label">USE CASE</span><br>
      <span>${_esc(d.useCase)}</span>
    </span>`);
    push(`<span class="receipt-label">DATE</span><br><span>${dateStr}</span>`);
    push(`<br><span class="receipt-rule">─────────────────────────────</span>`);
    push(`<span class="receipt-label">DIAGNOSIS</span>`);
    push(`<span class="receipt-archetype-name">${_esc(archName)}</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">SYMPTOMS</span>`);
    d.symptoms.forEach(s => push(`<span>• ${_esc(s)}</span>`));
    push(`<br>`);
    push(`<span class="receipt-label">VERDICT</span>`);
    push(`<span class="receipt-verdict">"${_esc(d.verdict)}"</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">FIX WORKFLOW</span>`);
    d.humanFix.forEach((f, i) => push(`<span>${i + 1}. ${_esc(f)}</span>`));
    push(`<br><span class="receipt-rule">─────────────────────────────</span>`);
    push(`<span style="font-size:15px;font-weight:bold;letter-spacing:1px;color:#b8a800;">▶ UPGRADE THIS WORKFLOW — £15</span>`);
    push(`<span style="font-size:12px;color:#888;">Ox Tech Week offer · scan to claim</span>`);
    push(`<div id="receipt-qr-casual" class="receipt-qr" style="margin-top:8px;"></div>`);
    push(`<span class="receipt-rule">─────────────────────────────</span>`);
    push(`<span style="font-size:10px;color:#888;">Prismatic Labs · prismaticlabs.ai</span>`);
    push(`<span class="receipt-rule">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);

    return lines;
  }

  // ── Builder (Silent Failure) layout ───────────────────────────────
  function _buildBuilderLines(d) {
    const dateStr = _fmtDate(d.timestamp);
    const patternName = _getPatternName(d.suspectedPattern);

    const lines = [];
    let t = 0;
    const step = 70;
    const push = (html) => { lines.push({ html, delay: t }); t += step; };

    push(`<span class="receipt-rule" style="color:#1e3a3a;">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
    push(`<span style="text-align:center;display:block;font-weight:bold;letter-spacing:2px;font-size:11px;color:#4a9a9a;">SILENT FAILURE RECEIPT</span>`);
    push(`<span class="receipt-rule" style="color:#1e3a3a;">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">SYSTEM</span><br><span>${_esc(d.useCase)}</span>`);
    push(`<span class="receipt-label">DATE</span><br><span>${dateStr}</span>`);
    push(`<br><span class="receipt-rule" style="color:#1e3a3a;">─────────────────────────────</span>`);
    push(`<span class="receipt-label">SUSPECTED FAILURE PATTERN</span>`);
    push(`<span class="receipt-archetype-name">${_esc(d.suspectedPattern)} — ${_esc(patternName)}</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">RISK</span>`);
    push(`<span>${_esc(d.risk)}</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">SECONDARY RISK</span>`);
    push(`<span class="receipt-verdict">${_esc(d.secondaryRisk)}</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">WHAT TO CHECK</span>`);
    d.whatToCheck.forEach(w => push(`<span>• ${_esc(w)}</span>`));
    push(`<br><span class="receipt-rule" style="color:#1e3a3a;">─────────────────────────────</span>`);
    push(`<span style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#4a9a9a;">NEXT STEP</span>`);
    push(`<span style="font-size:11px;">Book a 20-min Silent Failure Teardown</span>`);
    push(`<div id="receipt-qr-builder" class="receipt-qr"></div>`);
    push(`<span class="receipt-rule" style="color:#1e3a3a;">─────────────────────────────</span>`);
    push(`<span style="font-size:10px;color:#4a6a6a;">Prismatic Labs · prismaticlabs.ai</span>`);
    push(`<span class="receipt-rule" style="color:#1e3a3a;">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);

    return lines;
  }

  // ── QR rendering ──────────────────────────────────────────────────
  function _renderQR(diagnosis) {
    if (typeof QRCode === "undefined") return;

    if (diagnosis.isBuilder) {
      const el = document.getElementById("receipt-qr-builder");
      if (!el) return;
      _makeQR(el, CONFIG.TEARDOWN_URL, "Book a 20-min Teardown", "#30f0c0", "#0d1117", 96);
    } else {
      const el = document.getElementById("receipt-qr-casual");
      if (!el) return;
      _makeQR(el, CONFIG.UPGRADE_URL, "Scan to upgrade — £15 Ox Tech Week offer", "#000000", "#f5f0e8", 110);
    }
  }

  function _makeQR(containerEl, url, ctaText, colorDark, colorLight, size) {
    const wrap = document.createElement("div");
    wrap.className = "receipt-qr-image";
    const qrSize = size || 96;

    try {
      new QRCode(wrap, {
        text: url,
        width: qrSize,
        height: qrSize,
        colorDark: colorDark || "#000000",
        colorLight: colorLight || "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (e) {
      wrap.textContent = "[QR]";
    }

    const label = document.createElement("span");
    label.className = "receipt-cta-text";
    label.textContent = ctaText;

    containerEl.appendChild(wrap);
    containerEl.appendChild(label);
  }

  // ── Helpers ────────────────────────────────────────────────────────
  function _esc(str) {
    if (!str) return "";
    const d = document.createElement("div");
    d.textContent = String(str);
    return d.innerHTML;
  }

  function _fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return iso; }
  }

  function _getArchetypeName(id) {
    const a = ARCHETYPES_DATA.find(x => x.id === id);
    return a ? a.name : id;
  }

  function _getPatternName(id) {
    const p = PATTERNS_DATA.find(x => x.id === id);
    return p ? p.name : id;
  }

  return { render };
})();
