/* receipt.js — social card + personal receipt, both layouts */

const Receipt = (() => {
  const SOCIAL_CARD_DELAY = 500; // receipt starts after social card fades in

  function render(diagnosis) {
    _renderSocialCard(diagnosis);
    ShareCard.prepare(diagnosis);
    _renderPersonalReceipt(diagnosis);
    _renderCTASection(diagnosis);

    const shareBtn = document.getElementById("btn-share-card");
    if (shareBtn) {
      shareBtn.textContent = "Share result";
      shareBtn.classList.toggle("builder-cta", diagnosis.isBuilder);
    }
  }

  // ── Social card (first thing users see) ───────────────────────────
  function _renderSocialCard(d) {
    const container = document.getElementById("social-card-container");
    if (!container) return;

    let html;
    if (d.isBuilder) {
      const patName = _getPatternName(d.suspectedPattern);
      html = `
        <div class="social-card builder-social">
          <span class="social-card-eyebrow">SILENT FAILURE RECEIPT</span>
          <span class="social-card-pattern-id">${_esc(d.suspectedPattern)}</span>
          <span class="social-card-name">${_esc(patName)}</span>
          <span class="social-card-risk-line">${_esc(d.risk)}</span>
          <div class="social-card-footer">
            <span class="social-card-hook">Is your system failing silently?</span>
            <span class="social-card-url">prismatic-labs.github.io/ai-waste-booth</span>
          </div>
        </div>`;
    } else {
      const archName = _getArchetypeName(d.archetype);
      const oneLiner = _getOneLiner(d.archetype);
      const imgSrc   = `../assets/archetypes/${d.archetype}.jpg`;
      html = `
        <div class="social-card casual-social">
          <div class="social-card-image-wrap">
            <img class="social-card-img" src="${imgSrc}" alt="${_esc(archName)}"
                 onerror="this.parentElement.style.background='#1a1a2e'">
            <div class="social-card-overlay">
              <span class="social-card-eyebrow">AI WASTE RECEIPT</span>
              <span class="social-card-name">${_esc(archName)}</span>
              <span class="social-card-oneliner">"${_esc(oneLiner)}"</span>
            </div>
          </div>
          <div class="social-card-footer">
            <span class="social-card-hook">Which one are you?</span>
            <span class="social-card-url">prismatic-labs.github.io/ai-waste-booth</span>
          </div>
        </div>`;
    }

    container.innerHTML = html;
    setTimeout(() => {
      const card = container.querySelector(".social-card");
      if (card) card.classList.add("visible");
    }, 150);
  }

  // ── Personal receipt ───────────────────────────────────────────────
  function _renderPersonalReceipt(diagnosis) {
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

    const lastDelay = lines[lines.length - 1]?.delay || 0;
    setTimeout(() => {
      _renderQR(diagnosis);
    }, lastDelay + 80);
  }

  // ── CTA section (below receipt) ────────────────────────────────────
  function _renderCTASection(d) {
    const container = document.getElementById("receipt-cta-actions");
    if (!container) return;

    const upgradeUrl  = (typeof CONFIG !== "undefined" && CONFIG.UPGRADE_URL)     || "#";
    const vetchScanUrl= (typeof CONFIG !== "undefined" && CONFIG.VETCH_SCAN_URL)  || upgradeUrl;
    const vetchRevUrl = (typeof CONFIG !== "undefined" && CONFIG.VETCH_REVIEW_URL) ||
                        (typeof CONFIG !== "undefined" && CONFIG.TEARDOWN_URL)     || "#";

    if (d.isBuilder) {
      container.innerHTML = `
        <a href="${_esc(vetchScanUrl)}" class="btn-primary builder-cta"
           target="_blank" rel="noopener">Run a free Vetch scan</a>
        <a href="${_esc(vetchRevUrl)}" class="btn-secondary"
           target="_blank" rel="noopener">Book a Vetch review — from £295</a>`;
    } else {
      container.innerHTML = `
        <a href="${_esc(upgradeUrl)}" class="btn-primary"
           target="_blank" rel="noopener">Clean up one GUI AI workflow — £15</a>
        <p class="cta-supporting-line">Bring one bounded GUI workflow: an email, summary, research brief, content draft,
          or repeatable task. We return a reusable workflow and usage notes within 5 working days.</p>`;
    }
  }

  // ── Casual receipt — personal diagnosis only ───────────────────────
  function _buildCasualLines(d) {
    const dateStr = _fmtDate(d.timestamp);

    const lines = [];
    let t = SOCIAL_CARD_DELAY;
    const step = 55;
    const push = (html) => { lines.push({ html, delay: t }); t += step; };

    push(`<span class="receipt-rule">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
    push(`<span style="text-align:center;display:block;font-size:11px;letter-spacing:2px;color:#888;">YOUR DIAGNOSIS</span>`);
    push(`<span class="receipt-rule">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">USE CASE</span><br><span>${_esc(d.useCase)}</span>`);
    push(`<span class="receipt-label">DATE</span><br><span>${dateStr}</span>`);
    push(`<br><span class="receipt-rule">─────────────────────────────</span>`);
    push(`<span class="receipt-label">SYMPTOMS</span>`);
    d.symptoms.forEach(s => push(`<span>• ${_esc(s)}</span>`));
    push(`<br>`);
    push(`<span class="receipt-label">VERDICT</span>`);
    push(`<span class="receipt-verdict">"${_esc(d.verdict)}"</span>`);
    push(`<br>`);
    push(`<span class="receipt-label">FIX WORKFLOW</span>`);
    d.humanFix.forEach((f, i) => push(`<span>${i + 1}. ${_esc(f)}</span>`));
    push(`<br><span class="receipt-rule">─────────────────────────────</span>`);
    push(`<a href="https://prismaticlabs.ai" target="_blank" rel="noopener" style="font-size:10px;color:#888;text-decoration:none;">Prismatic Labs · prismaticlabs.ai</a>`);
    push(`<span class="receipt-rule">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);

    return lines;
  }

  // ── Builder receipt — silent failure report ────────────────────────
  function _buildBuilderLines(d) {
    const dateStr     = _fmtDate(d.timestamp);
    const patternName = _getPatternName(d.suspectedPattern);

    const lines = [];
    let t = SOCIAL_CARD_DELAY;
    const step = 65;
    const push = (html) => { lines.push({ html, delay: t }); t += step; };

    push(`<span class="receipt-rule" style="color:#1e3a3a;">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);
    push(`<span style="text-align:center;display:block;font-size:11px;letter-spacing:2px;color:#4a6a6a;">SILENT FAILURE REPORT</span>`);
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
    push(`<span style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#4a9a9a;">RUN A FREE VETCH SCAN</span>`);
    push(`<div id="receipt-qr-builder" class="receipt-qr"></div>`);
    push(`<span class="receipt-rule" style="color:#1e3a3a;">─────────────────────────────</span>`);
    push(`<a href="https://prismaticlabs.ai" target="_blank" rel="noopener" style="font-size:10px;color:#4a6a6a;text-decoration:none;">Prismatic Labs · prismaticlabs.ai</a>`);
    push(`<span class="receipt-rule" style="color:#1e3a3a;">━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>`);

    return lines;
  }

  // ── QR rendering ──────────────────────────────────────────────────
  function _renderQR(diagnosis) {
    if (typeof QRCode === "undefined") return;

    if (diagnosis.isBuilder) {
      const el = document.getElementById("receipt-qr-builder");
      if (!el) return;
      const url = (typeof CONFIG !== "undefined" && CONFIG.VETCH_SCAN_URL) ||
                  (typeof CONFIG !== "undefined" && CONFIG.TEARDOWN_URL) || "";
      if (url) _makeQR(el, url, "Scan to run a free Vetch scan", "#30f0c0", "#0d1117", 96);
    }
  }

  function _makeQR(containerEl, url, ctaText, colorDark, colorLight, size) {
    const wrap = document.createElement("div");
    wrap.className = "receipt-qr-image";
    try {
      new QRCode(wrap, {
        text: url,
        width: size || 96,
        height: size || 96,
        colorDark,
        colorLight,
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

  function _getArchetypeName(id) { return ARCHETYPES_DATA.find(x => x.id === id)?.name    || id; }
  function _getOneLiner(id)      { return ARCHETYPES_DATA.find(x => x.id === id)?.oneLiner || ""; }
  function _getPatternName(id)   { return PATTERNS_DATA.find(x => x.id === id)?.name       || id; }

  return { render };
})();
