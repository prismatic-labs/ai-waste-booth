/* share-card.js — canvas share card, pre-generated on receipt render */

const ShareCard = (() => {
  const W = 1080;
  const H = 1350; // 4:5 portrait — native Instagram / LinkedIn format

  let _readyBlob = null;
  let _readyFilename = null;
  let _shareUrl = null;
  let _shareTitle = null;
  let _shareText = null;
  let _isBuilderShare = false;

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
    _isBuilderShare = !!diagnosis.isBuilder;
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

  // ── Prefer native image sharing; fall back to the public URL for OG scrapers ──
  function share() {
    if (!_shareUrl) { _fallbackMsg(); return; }

    const file = _getShareFile();
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: _shareTitle || "AI Waste Archetype",
        text: _shareText || "My AI waste archetype.",
      }).catch(() => _shareLink());
      return;
    }

    _shareLink();
  }

  function _shareLink() {
    if (navigator.share) {
      navigator.share({
        title: _shareTitle || "AI Waste Archetype",
        text: _shareText || "Find your AI waste archetype.",
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

  function _getShareFile() {
    if (!_readyBlob || !_readyFilename || typeof File === "undefined") return null;
    return new File([_readyBlob], _readyFilename, { type: "image/png" });
  }

  // ── Casual share card ─────────────────────────────────────────────
  function _drawCasualCard(ctx, d, canvas, img) {
    const archName = _getArchetypeName(d.archetype);
    const oneLiner = _getOneLiner(d.archetype);
    const pad = r(42);
    const maxW = W - pad * 2;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    // ── Name (hero) — font sized to fit, barH derived from result ──
    let fs = r(52); // r(52) ≈ 130px in a 1080px canvas — legible hero size
    const longestWord = archName.split(" ").reduce((a, b) => a.length > b.length ? a : b);
    ctx.letterSpacing = "-1px";
    while (fs > r(26)) {
      ctx.font = `900 ${fs}px Arial, sans-serif`;
      if (ctx.measureText(longestWord).width <= maxW) break;
      fs -= 2;
    }
    const nameLines = _getWrappedLines(ctx, archName, maxW);
    const nlh = Math.round(fs * 1.08);
    const barH = r(32) + nameLines.length * nlh + r(20);

    ctx.fillStyle = "#f0e830";
    ctx.fillRect(0, 0, W, r(5)); // thin yellow accent line

    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${fs}px Arial, sans-serif`;
    ctx.letterSpacing = "-1px";
    nameLines.forEach((line, i) => {
      ctx.fillText(line, pad, r(32) + fs + i * nlh);
    });

    // ── Illustration — fills space between name and bottom reserve ──
    const bottomReserve = r(155); // enough for one-liner + branding
    const imgH = Math.max(H - barH - bottomReserve, Math.round(H * 0.33));
    if (img) {
      ctx.save();
      const scale = Math.max(W / img.naturalWidth, imgH / img.naturalHeight);
      const sw = W / scale, sh = imgH / scale;
      const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, barH, W, imgH);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(0, barH, W, barH + imgH);
      grad.addColorStop(0, "#1a1a2e"); grad.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = grad; ctx.fillRect(0, barH, W, imgH);
    }
    const fadeGrad = ctx.createLinearGradient(0, barH + imgH * 0.45, 0, barH + imgH);
    fadeGrad.addColorStop(0, "rgba(0,0,0,0)");
    fadeGrad.addColorStop(1, "rgba(0,0,0,0.96)");
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, barH, W, imgH);

    // ── One-liner ─────────────────────────────────────────────────
    ctx.fillStyle = "#cccccc";
    ctx.font = `italic 400 ${r(22)}px Arial, sans-serif`;
    ctx.letterSpacing = "0px";
    const olLines = _getWrappedLines(ctx, `"${oneLiner}"`, maxW);
    let ty = barH + imgH + r(30);
    olLines.forEach(line => { ctx.fillText(line, pad, ty); ty += r(28); });

    // ── Bottom: single lockup — logo icon + URL, matched optical size ──
    const lockupY = ty + r(20);
    ctx.fillStyle = "#f0e830";
    ctx.font = `500 ${r(14)}px 'Courier New', monospace`;
    ctx.letterSpacing = "0px";
    const textH = r(14); // cap-height approximation
    if (_logoImg && _logoImg.naturalWidth) {
      const logoH2 = textH;
      const logoW = Math.round(logoH2 * _logoImg.naturalWidth / _logoImg.naturalHeight);
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = r(4);
      ctx.drawImage(_logoImg, pad, lockupY - logoH2, logoW, logoH2);
      ctx.restore();
      ctx.fillText("prismaticlabs.ai", pad + logoW + r(6), lockupY);
    } else {
      ctx.fillText("prismaticlabs.ai", pad, lockupY);
    }

    _store(canvas, `ai-waste-archetype-${d.archetype}.png`);
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

    shareBtn.textContent = navigator.share
      ? (_isBuilderShare ? "Share report" : "Share archetype")
      : (_isBuilderShare ? "Copy report link" : "Copy archetype link");
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
    btn.textContent = _isBuilderShare ? "Report link copied" : "Archetype link copied";
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
    if (!diagnosis) return "AI Waste Archetype";
    if (diagnosis.isBuilder) return `Silent Failure: ${_getPatternName(diagnosis.suspectedPattern)}`;
    return `I got ${_getArchetypeName(diagnosis.archetype)}`;
  }

  function _getShareText(diagnosis) {
    if (!diagnosis) return "Find your AI waste archetype.";
    if (diagnosis.isBuilder) return "Is your AI system failing silently?";
    return "Find your AI waste archetype.";
  }

  function _slug(value) {
    return String(value || "").toLowerCase().replace(/_/g, "-");
  }

  function _getArchetypeName(id) { return ARCHETYPES_DATA.find(x => x.id === id)?.name || id; }
  function _getOneLiner(id)      { return ARCHETYPES_DATA.find(x => x.id === id)?.oneLiner || ""; }
  function _getPatternName(id)   { return PATTERNS_DATA.find(x => x.id === id)?.name || id; }

  return { prepare, share, save, getShareUrl };
})();
