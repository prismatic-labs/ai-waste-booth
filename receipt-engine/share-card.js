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

  // ── Casual share card — magazine cover style ───────────────────────
  function _drawCasualCard(ctx, d, canvas, img) {
    const archName = _getArchetypeName(d.archetype);
    const oneLiner = _getOneLiner(d.archetype);

    // full-bleed dark background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    const imgH = Math.round(H * 0.62);

    // archetype image full-bleed top
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

    // gradient overlay — fades image into black bottom half
    const fadeGrad = ctx.createLinearGradient(0, imgH * 0.35, 0, imgH);
    fadeGrad.addColorStop(0, "rgba(0,0,0,0)");
    fadeGrad.addColorStop(1, "rgba(0,0,0,0.96)");
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 0, W, imgH);

    // yellow top bar
    ctx.fillStyle = "#f0e830";
    ctx.fillRect(0, 0, W, 10);

    // "AI WASTE RECEIPT" — top label
    ctx.fillStyle = "#f0e830";
    ctx.font = `600 ${r(30)} 'Courier New', monospace`;
    ctx.letterSpacing = "4px";
    ctx.fillText("AI WASTE RECEIPT", r(56), r(70));

    // archetype name — huge, over image
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${r(110)} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.letterSpacing = "-3px";
    _wrap(ctx, archName, r(56), imgH - r(80), W - r(112), r(120));

    // one-liner — just below image boundary
    ctx.fillStyle = "#aaaaaa";
    ctx.font = `400 ${r(42)} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrap(ctx, oneLiner, r(56), imgH + r(72), W - r(112), r(52));

    // divider
    ctx.strokeStyle = "#2a2a2a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r(56), imgH + r(150)); ctx.lineTo(W - r(56), imgH + r(150)); ctx.stroke();

    // share prompt
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${r(40)} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrap(ctx, `Which one are you?`, r(56), imgH + r(220), W - r(112), r(50));

    // URL call to action
    ctx.fillStyle = "#f0e830";
    ctx.font = `500 ${r(34)} 'Courier New', monospace`;
    ctx.letterSpacing = "1px";
    ctx.fillText("prismatic-labs.github.io/ai-waste-booth", r(56), imgH + r(300));

    // branding logo
    _drawLogo(ctx, r(56), H - r(30));

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
      // signal the share button it's ready
      const btn = document.getElementById("btn-share-card");
      if (btn) btn.disabled = false;
    }, "image/png");
  }

  // ── Logo badge (white pill, logo image inside) ─────────────────────
  function _drawLogo(ctx, x, bottomY) {
    if (_logoImg && _logoImg.naturalWidth) {
      const logoDrawW = r(160);
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
    btn.textContent = "Saved! Upload it to LinkedIn or Instagram ↑";
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
