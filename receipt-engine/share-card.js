/* share-card.js — canvas-based PNG share card, no html2canvas dependency */

const ShareCard = (() => {
  const W = 1080;
  const H = 1350; // 4:5 portrait

  function generate(diagnosis) {
    const canvas = document.getElementById("share-canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    if (diagnosis.isBuilder) {
      _drawBuilderCard(ctx, diagnosis, canvas);
    } else {
      const archImg = new Image();
      archImg.onload  = () => _drawCasualCard(ctx, diagnosis, canvas, archImg);
      archImg.onerror = () => _drawCasualCard(ctx, diagnosis, canvas, null);
      archImg.src = `../assets/archetypes/${diagnosis.archetype}.jpg`;
    }
  }

  // ── Casual share card ────────────────────────────────────────────
  function _drawCasualCard(ctx, d, canvas, img) {
    const archName = _getArchetypeName(d.archetype);

    // background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    // top accent bar
    ctx.fillStyle = "#f0e830";
    ctx.fillRect(0, 0, W, 8);

    // archetype image (top ~45% of card)
    if (img) {
      const imgH = Math.round(H * 0.45);
      ctx.save();
      ctx.globalAlpha = 0.92;
      // cover fit
      const scale = Math.max(W / img.naturalWidth, imgH / img.naturalHeight);
      const sw = W / scale;
      const sh = imgH / scale;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 8, W, imgH);
      ctx.restore();

      // gradient overlay over image bottom
      const grad = ctx.createLinearGradient(0, imgH * 0.5, 0, imgH + 8);
      grad.addColorStop(0, "rgba(10,10,10,0)");
      grad.addColorStop(1, "rgba(10,10,10,1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 8, W, imgH);
    } else {
      // placeholder gradient
      const grad = ctx.createLinearGradient(0, 0, W, H * 0.45);
      grad.addColorStop(0, "#1a1a1a");
      grad.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 8, W, H * 0.45);
    }

    const textY = img ? Math.round(H * 0.47) : 200;

    // "AI WASTE RECEIPT" label
    ctx.fillStyle = "#f0e830";
    ctx.font = `500 ${_px(28)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "4px";
    ctx.fillText("AI WASTE RECEIPT", _px(64), textY);

    // archetype name
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${_px(96)} -apple-system, sans-serif`;
    ctx.letterSpacing = "-2px";
    _wrapText(ctx, archName, _px(64), textY + _px(110), W - _px(128), _px(108));

    // one-liner
    const oneLiner = _getOneLiner(d.archetype);
    ctx.fillStyle = "#aaaaaa";
    ctx.font = `400 ${_px(38)} -apple-system, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrapText(ctx, oneLiner, _px(64), textY + _px(260), W - _px(128), _px(46));

    // divider
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(_px(64), textY + _px(360));
    ctx.lineTo(W - _px(64), textY + _px(360));
    ctx.stroke();

    // share line
    ctx.fillStyle = "#888888";
    ctx.font = `400 ${_px(32)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "0px";
    _wrapText(ctx,
      `"I got diagnosed as ${archName} by Prismatic Labs"`,
      _px(64), textY + _px(430), W - _px(128), _px(40));

    // branding
    ctx.fillStyle = "#555555";
    ctx.font = `400 ${_px(26)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("◈ PRISMATIC LABS · prismaticlabs.ai", _px(64), H - _px(64));

    _export(canvas, `ai-waste-receipt-${d.archetype}.png`);
  }

  // ── Builder share card ────────────────────────────────────────────
  function _drawBuilderCard(ctx, d, canvas) {
    // background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, W, H);

    // top accent bar
    ctx.fillStyle = "#30f0c0";
    ctx.fillRect(0, 0, W, 8);

    // label
    ctx.fillStyle = "#30f0c0";
    ctx.font = `500 ${_px(26)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "4px";
    ctx.fillText("SILENT FAILURE RECEIPT", _px(64), _px(120));

    // pattern ID
    ctx.fillStyle = "#c0cfd0";
    ctx.font = `400 ${_px(36)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText(d.suspectedPattern, _px(64), _px(220));

    // pattern name
    const patName = _getPatternName(d.suspectedPattern);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${_px(80)} -apple-system, sans-serif`;
    ctx.letterSpacing = "-1px";
    _wrapText(ctx, patName, _px(64), _px(340), W - _px(128), _px(92));

    // risk
    ctx.fillStyle = "#4a9a9a";
    ctx.font = `500 ${_px(30)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("RISK", _px(64), _px(520));

    ctx.fillStyle = "#c0cfd0";
    ctx.font = `400 ${_px(36)} -apple-system, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrapText(ctx, d.risk, _px(64), _px(580), W - _px(128), _px(44));

    // divider
    ctx.strokeStyle = "#1e3a3a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(_px(64), _px(720));
    ctx.lineTo(W - _px(64), _px(720));
    ctx.stroke();

    // secondary risk
    ctx.fillStyle = "#4a9a9a";
    ctx.font = `500 ${_px(30)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("SECONDARY RISK", _px(64), _px(800));

    ctx.fillStyle = "#888888";
    ctx.font = `400 italic ${_px(34)} -apple-system, sans-serif`;
    ctx.letterSpacing = "0px";
    _wrapText(ctx, d.secondaryRisk, _px(64), _px(862), W - _px(128), _px(42));

    // branding
    ctx.fillStyle = "#2a4040";
    ctx.font = `400 ${_px(26)} 'Courier New', Courier, monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText("◈ PRISMATIC LABS · prismaticlabs.ai", _px(64), H - _px(64));

    _export(canvas, `silent-failure-receipt-${d.suspectedPattern}.png`);
  }

  // ── Export ────────────────────────────────────────────────────────
  function _export(canvas, filename) {
    canvas.toBlob(blob => {
      if (!blob) { _fallback(canvas, filename); return; }

      const file = new File([blob], filename, { type: "image/png" });

      // Web Share API with files (iOS Safari 15+, Android Chrome)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: "My AI Waste Receipt",
          text: "Get yours at Prismatic Labs →",
        }).catch(() => _downloadBlob(blob, filename));
        return;
      }

      _downloadBlob(blob, filename);
    }, "image/png");
  }

  function _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function _fallback(canvas, filename) {
    // last resort — open in new tab so user can long-press save
    try {
      const url = canvas.toDataURL("image/png");
      const w = window.open();
      if (w) {
        w.document.write(`<img src="${url}" style="max-width:100%"><p>Long-press or right-click to save.</p>`);
      }
    } catch (e) {}
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function _px(n) {
    // returns value scaled to canvas size (W=1080)
    return Math.round(n * (W / 430));
  }

  function _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(" ");
    let line = "";
    let currentY = y;
    words.forEach((word, i) => {
      const test = line + (line ? " " : "") + word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = test;
      }
    });
    if (line) ctx.fillText(line, x, currentY);
  }

  function _getArchetypeName(id) {
    const a = ARCHETYPES_DATA.find(x => x.id === id);
    return a ? a.name : id;
  }

  function _getOneLiner(id) {
    const a = ARCHETYPES_DATA.find(x => x.id === id);
    return a ? a.oneLiner : "";
  }

  function _getPatternName(id) {
    const p = PATTERNS_DATA.find(x => x.id === id);
    return p ? p.name : id;
  }

  return { generate };
})();
