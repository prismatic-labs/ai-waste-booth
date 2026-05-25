/* share-card.js — canvas share card, pre-generated on receipt render */

const ShareCard = (() => {
  const W = 1080;
  const H = 1350; // 4:5 portrait — native Instagram / LinkedIn format

  let _readyBlob = null;
  let _readyFilename = null;

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

  // ── Called on share button click — uses pre-stored blob ────────────
  function share() {
    if (!_readyBlob) { _fallbackMsg(); return; }

    const file = new File([_readyBlob], _readyFilename, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: "My AI Waste Receipt",
        text: "Find out which AI waster you are →",
      }).catch(() => {
        _downloadBlob(_readyBlob, _readyFilename);
        _showDownloadNudge();
      });
      return;
    }
    // desktop or no Web Share API — download and prompt user to upload
    _downloadBlob(_readyBlob, _readyFilename);
    _showDownloadNudge();
  }

  function save() {
    if (!_readyBlob) { _fallbackMsg(); return; }
    _downloadBlob(_readyBlob, _readyFilename);
  }

  // ── Casual share card ─────────────────────────────────────────────
  function _drawCasualCard(ctx, d, canvas, img) {
    const archName = _getArchetypeName(d.archetype);
    const oneLiner = _getOneLiner(d.archetype);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    // image takes 65% — leaves 472px text section below
    const imgH = Math.round(H * 0.65);

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

    // strong gradient — ensures white text is always readable
    const fadeGrad = ctx.createLinearGradient(0, imgH * 0.22, 0, imgH);
    fadeGrad.addColorStop(0,    "rgba(0,0,0,0)");
    fadeGrad.addColorStop(0.6,  "rgba(0,0,0,0.82)");
    fadeGrad.addColorStop(1,    "rgba(0,0,0,0.97)");
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 0, W, imgH);

    // yellow top bar + eyebrow label
    ctx.fillStyle = "#f0e830";
    ctx.fillRect(0, 0, W, 10);
    ctx.font = `600 ${r(22)} 'Courier New', monospace`;
    ctx.letterSpacing = "3px";
    ctx.fillText("AI WASTE RECEIPT", r(56), r(58));

    // archetype name — bottom-anchored within gradient zone
    // uses _getWrappedLines so multi-word names stack upward correctly
    ctx.font = `800 ${r(76)} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.letterSpacing = "-2px";
    const nameLines  = _getWrappedLines(ctx, archName, W - r(112));
    const nameLineH  = r(86);
    const nameBottom = imgH - r(28); // baseline of last line
    ctx.save();
    ctx.shadowColor    = "rgba(0,0,0,0.92)";
    ctx.shadowBlur     = r(6);
    ctx.shadowOffsetY  = r(2);
    ctx.fillStyle = "#ffffff";
    nameLines.forEach((line, i) => {
      const y = nameBottom - (nameLines.length - 1 - i) * nameLineH;
      ctx.fillText(line, r(56), y);
    });
    ctx.restore();

    // one-liner
    ctx.fillStyle  = "#cccccc";
    ctx.font       = `400 italic ${r(32)} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrap(ctx, `"${oneLiner}"`, r(56), imgH + r(44), W - r(112), r(40));

    // URL
    ctx.fillStyle = "#f0e830";
    ctx.font      = `500 ${r(20)} 'Courier New', monospace`;
    ctx.letterSpacing = "0.5px";
    ctx.fillText("prismatic-labs.github.io/ai-waste-booth", r(56), imgH + r(140));

    // logo
    _drawLogo(ctx, r(56), H - r(36));

    _store(canvas, `ai-waste-receipt-${d.archetype}.png`);
  }

  // ── Builder share card ─────────────────────────────────────────────
  function _drawBuilderCard(ctx, d, canvas) {
    const patName = _getPatternName(d.suspectedPattern);

    ctx.fillStyle = "#0d1117"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#30f0c0"; ctx.fillRect(0, 0, W, 10);

    ctx.fillStyle = "#30f0c0";
    ctx.font = `600 ${r(28)} 'Courier New', monospace`;
    ctx.letterSpacing = "4px";
    ctx.fillText("SILENT FAILURE RECEIPT", r(56), r(100));

    ctx.fillStyle = "#4a9a9a";
    ctx.font = `400 ${r(36)} 'Courier New', monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText(d.suspectedPattern, r(56), r(200));

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${r(96)} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.letterSpacing = "-2px";
    _wrap(ctx, patName, r(56), r(340), W - r(112), r(110));

    ctx.strokeStyle = "#1e3a3a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r(56), r(520)); ctx.lineTo(W - r(56), r(520)); ctx.stroke();

    ctx.fillStyle = "#4a9a9a";
    ctx.font = `500 ${r(30)} 'Courier New', monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("RISK", r(56), r(600));

    ctx.fillStyle = "#c0cfd0";
    ctx.font = `400 ${r(38)} -apple-system, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrap(ctx, d.risk, r(56), r(660), W - r(112), r(48));

    ctx.strokeStyle = "#1e3a3a";
    ctx.beginPath(); ctx.moveTo(r(56), r(800)); ctx.lineTo(W - r(56), r(800)); ctx.stroke();

    ctx.fillStyle = "#4a9a9a";
    ctx.font = `500 ${r(30)} 'Courier New', monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("SECONDARY RISK", r(56), r(880));

    ctx.fillStyle = "#888888";
    ctx.font = `italic 400 ${r(36)} -apple-system, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrap(ctx, d.secondaryRisk, r(56), r(940), W - r(112), r(46));

    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${r(40)} -apple-system, sans-serif`;
    _wrap(ctx, "Is your system failing silently?", r(56), r(1160), W - r(112), r(50));

    ctx.fillStyle = "#30f0c0";
    ctx.font = `500 ${r(32)} 'Courier New', monospace`;
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

    const testFile = new File([blob], "test.png", { type: "image/png" });
    const canWebShare = !!(navigator.share && navigator.canShare && navigator.canShare({ files: [testFile] }));

    if (canWebShare) {
      shareBtn.textContent = "Share to Instagram / WhatsApp";
      saveBtn.textContent  = "Save to Camera Roll";
    } else {
      shareBtn.textContent = "Download Image";
      saveBtn.style.display = "none";
    }
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
      ctx.font = `400 ${r(24)} 'Courier New', monospace`;
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
    const btn = document.getElementById("btn-share-card");
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = "Downloaded! Upload it to LinkedIn or Instagram ↑";
    setTimeout(() => { btn.textContent = orig; }, 4500);
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

  function _getArchetypeName(id) { return ARCHETYPES_DATA.find(x => x.id === id)?.name || id; }
  function _getOneLiner(id)      { return ARCHETYPES_DATA.find(x => x.id === id)?.oneLiner || ""; }
  function _getPatternName(id)   { return PATTERNS_DATA.find(x => x.id === id)?.name || id; }

  return { prepare, share, save };
})();
