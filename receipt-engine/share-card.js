/* share-card.js — canvas share card, pre-generated on receipt render */

const ShareCard = (() => {
  const W = 1080;
  const H = 1350; // 4:5 portrait — native Instagram / LinkedIn format

  let _readyBlob = null;
  let _readyFilename = null;
  let _shareUrl = null;
  let _shareTitle = null;
  let _shareText = null;

  // pre-load logo so it's ready by the time prepare() is called
  let _logoImg = null;
  (() => {
    const img = new Image();
    img.onload = () => { _logoImg = img; };
    img.src = "../assets/logo.png";
  })();

  // ── Called immediately after receipt renders ───────────────────────
  function prepare(diagnosis) {
    _readyBlob = null;
    _readyFilename = null;
    _shareUrl = _getShareUrl(diagnosis);
    _shareTitle = _getShareTitle(diagnosis);
    _shareText = _getShareText(diagnosis);
    // restore save button visibility in case it was hidden on a previous run
    const saveBtn = document.getElementById("btn-save-card");
    if (saveBtn) saveBtn.style.display = "";

    if (diagnosis.isBuilder) {
      const canvas = document.getElementById("share-canvas");
      canvas.width = W;
      canvas.height = H;
      _drawBuilderCard(canvas.getContext("2d"), diagnosis, canvas);
    } else {
      const img = new Image();
      img.onload  = () => _drawAndStore(diagnosis, img);
      img.onerror = () => _drawAndStore(diagnosis, null);
      img.src = `../assets/archetypes/${diagnosis.archetype}.jpg`;
    }
  }

  function _drawAndStore(diagnosis, img) {
    const canvas = document.getElementById("share-canvas");
    canvas.width = W;
    canvas.height = H;
    _drawCasualCard(canvas.getContext("2d"), diagnosis, canvas, img);
  }

  // ── Share the public result URL so social platforms can scrape OG art ──
  function share() {
    if (!_shareUrl) { _fallbackMsg(); return; }

    if (navigator.share) {
      navigator.share({
        title: _shareTitle || "AI Waste Receipt",
        text: _shareText || "Find out your AI waste pattern.",
        url: _shareUrl,
      }).catch(() => _copyShareLink());
      return;
    }

    _copyShareLink();
  }

  function save() {
    if (!_readyBlob) { _fallbackMsg(); return; }
    _downloadBlob(_readyBlob, _readyFilename);
    _showDownloadNudge();
  }

  // ── Casual share card ─────────────────────────────────────────────
  function _drawCasualCard(ctx, d, canvas, img) {
    const archName = _getArchetypeName(d.archetype);
    const oneLiner = _getOneLiner(d.archetype);
    const pad = r(52);
    const maxW = W - pad * 2;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    const imgH = Math.round(H * 0.62);

    if (img) {
      ctx.save();
      const scale = Math.max(W / img.naturalWidth, imgH / img.naturalHeight);
      const sw = W / scale, sh = imgH / scale;
      const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, imgH);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, imgH);
      grad.addColorStop(0, "#1a1a2e"); grad.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, imgH);
    }

    const fadeGrad = ctx.createLinearGradient(0, imgH * 0.25, 0, imgH);
    fadeGrad.addColorStop(0,   "rgba(0,0,0,0)");
    fadeGrad.addColorStop(0.6, "rgba(0,0,0,0.82)");
    fadeGrad.addColorStop(1,   "rgba(0,0,0,0.97)");
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 0, W, imgH);

    // yellow top bar + eyebrow
    ctx.fillStyle = "#f0e830";
    ctx.fillRect(0, 0, W, 10);
    ctx.font = `600 ${r(20)}px 'Courier New', monospace`;
    ctx.letterSpacing = "3px";
    ctx.fillStyle = "#f0e830";
    ctx.fillText("AI WASTE RECEIPT", pad, r(56));

    // archetype name — auto-sized so the longest word always fits, bottom-anchored
    let fs = r(70);
    const longestWord = archName.split(" ").reduce((a, b) => a.length > b.length ? a : b);
    ctx.letterSpacing = "-1px";
    while (fs > r(28)) {
      ctx.font = `800 ${fs}px Arial, sans-serif`;
      if (ctx.measureText(longestWord).width <= maxW) break;
      fs -= 4;
    }
    const nameLines = _getWrappedLines(ctx, archName, maxW);
    const nlh = Math.round(fs * 1.1);
    const nameBottom = imgH - r(22);
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.92)"; ctx.shadowBlur = r(6); ctx.shadowOffsetY = r(2);
    nameLines.forEach((line, i) => {
      ctx.fillText(line, pad, nameBottom - (nameLines.length - 1 - i) * nlh);
    });
    ctx.restore();

    // one-liner — flows downward from below image
    ctx.fillStyle = "#cccccc";
    ctx.font = `italic 400 ${r(28)}px Arial, sans-serif`;
    ctx.letterSpacing = "0px";
    const olLines = _getWrappedLines(ctx, `"${oneLiner}"`, maxW);
    let ty = imgH + r(46);
    olLines.forEach(line => { ctx.fillText(line, pad, ty); ty += r(37); });

    // URL — short form, won't clip
    ctx.fillStyle = "#f0e830";
    ctx.font = `500 ${r(18)}px 'Courier New', monospace`;
    ctx.letterSpacing = "0px";
    ctx.fillText("prismaticlabs.ai", pad, ty + r(22));

    // logo — bottom-right so it never collides with left-aligned text
    if (_logoImg && _logoImg.naturalWidth) {
      const logoW = r(80);
      const logoH2 = Math.round(logoW * _logoImg.naturalHeight / _logoImg.naturalWidth);
      const px = r(10), py = r(8);
      const bw = logoW + px * 2, bh = logoH2 + py * 2;
      const bx = W - pad - bw;
      const by = H - r(28) - bh;
      ctx.fillStyle = "#ffffff";
      _roundRect(ctx, bx, by, bw, bh, r(7));
      ctx.fill();
      ctx.drawImage(_logoImg, bx + px, by + py, logoW, logoH2);
    }

    _store(canvas, `ai-waste-receipt-${d.archetype}.png`);
  }

  // ── Builder share card ─────────────────────────────────────────────
  function _drawBuilderCard(ctx, d, canvas) {
    const patName = _getPatternName(d.suspectedPattern);

    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#30f0c0"; ctx.fillRect(0, 0, W, 10);

    ctx.fillStyle = "#30f0c0";
    ctx.font = `600 ${r(28)}px 'Courier New', monospace`;
    ctx.letterSpacing = "4px";
    ctx.fillText("SILENT FAILURE RECEIPT", r(56), r(100));

    ctx.fillStyle = "#4a9a9a";
    ctx.font = `400 ${r(36)}px 'Courier New', monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText(d.suspectedPattern, r(56), r(200));

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${r(96)}px Arial, sans-serif`;
    ctx.letterSpacing = "-2px";
    _wrap(ctx, patName, r(56), r(340), W - r(112), r(110));

    ctx.strokeStyle = "#1e3a3a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r(56), r(520)); ctx.lineTo(W - r(56), r(520)); ctx.stroke();

    ctx.fillStyle = "#4a9a9a";
    ctx.font = `500 ${r(30)}px 'Courier New', monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("RISK", r(56), r(600));

    ctx.fillStyle = "#c0cfd0";
    ctx.font = `400 ${r(38)}px Arial, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrap(ctx, d.risk, r(56), r(660), W - r(112), r(48));

    ctx.strokeStyle = "#1e3a3a";
    ctx.beginPath(); ctx.moveTo(r(56), r(800)); ctx.lineTo(W - r(56), r(800)); ctx.stroke();

    ctx.fillStyle = "#4a9a9a";
    ctx.font = `500 ${r(30)}px 'Courier New', monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("SECONDARY RISK", r(56), r(880));

    ctx.fillStyle = "#888888";
    ctx.font = `italic 400 ${r(36)}px Arial, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrap(ctx, d.secondaryRisk, r(56), r(940), W - r(112), r(46));

    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${r(40)}px Arial, sans-serif`;
    _wrap(ctx, "Is your system failing silently?", r(56), r(1160), W - r(112), r(50));

    ctx.fillStyle = "#30f0c0";
    ctx.font = `500 ${r(32)}px 'Courier New', monospace`;
    ctx.letterSpacing = "1px";
    ctx.fillText("prismatic-labs.github.io/ai-waste-booth", r(56), r(1240));

    // branding logo
    _drawLogo(ctx, r(56), H - r(30));

    _store(canvas, `silent-failure-receipt-${d.suspectedPattern}.png`);
  }

  // ── Store blob once drawn ──────────────────────────────────────────
  function _store(canvas, filename) {
    _readyFilename = filename;
    canvas.toBlob(blob => {
      _readyBlob = blob;
      const btn = document.getElementById("btn-share-card");
      if (btn) btn.disabled = false;
      _updateShareUI(blob);
    }, "image/png");
  }

  function _updateShareUI(blob) {
    const shareBtn = document.getElementById("btn-share-card");
    const saveBtn  = document.getElementById("btn-save-card");
    if (!shareBtn || !saveBtn) return;

    shareBtn.textContent = navigator.share ? "Share result" : "Copy result link";
    saveBtn.textContent  = "Save image";
    saveBtn.style.display = "";
  }

  // ── Logo badge (white pill, logo image inside) ─────────────────────
  function _drawLogo(ctx, x, bottomY) {
    if (_logoImg && _logoImg.naturalWidth) {
      const logoDrawW = r(90);
      const logoDrawH = Math.round(logoDrawW * _logoImg.naturalHeight / _logoImg.naturalWidth);
      const padX = r(14), padY = r(10);
      const badgeW = logoDrawW + padX * 2;
      const badgeH = logoDrawH + padY * 2;
      const badgeX = x;
      const badgeY = bottomY - badgeH;

      ctx.fillStyle = "#ffffff";
      _roundRect(ctx, badgeX, badgeY, badgeW, badgeH, r(8));
      ctx.fill();
      ctx.drawImage(_logoImg, badgeX + padX, badgeY + padY, logoDrawW, logoDrawH);
    } else {
      ctx.fillStyle = "#555";
      ctx.font = `400 ${r(24)}px 'Courier New', monospace`;
      ctx.letterSpacing = "2px";
      ctx.fillText("◈ PRISMATIC LABS", x, bottomY - r(10));
    }
  }

  function _roundRect(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.arcTo(x + w, y, x + w, y + rad, rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
    ctx.lineTo(x + rad, y + h);
    ctx.arcTo(x, y + h, x, y + h - rad, rad);
    ctx.lineTo(x, y + rad);
    ctx.arcTo(x, y, x + rad, y, rad);
    ctx.closePath();
  }

  function _showDownloadNudge() {
    const btn = document.getElementById("btn-save-card");
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = "Image saved";
    setTimeout(() => { btn.textContent = orig; }, 3500);
  }

  function _copyShareLink() {
    if (!_shareUrl) { _fallbackMsg(); return; }
    const done = () => _showCopiedNudge();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_shareUrl).then(done).catch(() => _legacyCopy(_shareUrl, done));
      return;
    }

    _legacyCopy(_shareUrl, done);
  }

  function _legacyCopy(text, done) {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(input);
    done();
  }

  function _showCopiedNudge() {
    const btn = document.getElementById("btn-share-card");
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = "Result link copied";
    setTimeout(() => { btn.textContent = orig; }, 3500);
  }

  // ── Utilities ──────────────────────────────────────────────────────
  function _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function _fallbackMsg() {
    const btn = document.getElementById("btn-share-card");
    if (btn) btn.textContent = "Generating… try again";
  }

  function r(n) { return Math.round(n * (W / 430)); }

  // returns array of line strings (same logic as _wrap but no drawing)
  function _getWrappedLines(ctx, text, maxW) {
    const words = String(text).split(" ");
    const lines = [];
    let line = "";
    words.forEach(word => {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line); line = word;
      } else { line = test; }
    });
    if (line) lines.push(line);
    return lines;
  }

  function _wrap(ctx, text, x, y, maxW, lineH) {
    const words = String(text).split(" ");
    let line = "", curY = y;
    words.forEach(word => {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, curY); line = word; curY += lineH;
      } else { line = test; }
    });
    if (line) ctx.fillText(line, x, curY);
  }

  function getShareUrl(diagnosis) {
    return _getShareUrl(diagnosis);
  }

  function _getShareUrl(diagnosis) {
    const base = "https://prismatic-labs.github.io/ai-waste-booth";
    if (!diagnosis) return `${base}/`;
    const key = diagnosis.isBuilder ? diagnosis.suspectedPattern : diagnosis.archetype;
    return `${base}/share/${_slug(key)}/`;
  }

  function _getShareTitle(diagnosis) {
    if (!diagnosis) return "AI Waste Receipt";
    if (diagnosis.isBuilder) return `Silent Failure: ${_getPatternName(diagnosis.suspectedPattern)}`;
    return `I got ${_getArchetypeName(diagnosis.archetype)}`;
  }

  function _getShareText(diagnosis) {
    if (!diagnosis) return "Find out your AI waste pattern.";
    if (diagnosis.isBuilder) return "Is your AI system failing silently?";
    return "Find out your AI waste pattern.";
  }

  function _slug(value) {
    return String(value || "").toLowerCase().replace(/_/g, "-");
  }

  function _getArchetypeName(id) { return ARCHETYPES_DATA.find(x => x.id === id)?.name || id; }
  function _getOneLiner(id)      { return ARCHETYPES_DATA.find(x => x.id === id)?.oneLiner || ""; }
  function _getPatternName(id)   { return PATTERNS_DATA.find(x => x.id === id)?.name || id; }

  return { prepare, share, save, getShareUrl };
})();
