(function (root, createLibrary) {
  "use strict";
  const library = createLibrary();
  if (typeof module === "object" && module.exports) module.exports = library;
  if (root) root.ThreadlineArtEffects = library;
})(globalThis, function () {
  "use strict";

  /** Creates illustrative and collage renderers from explicit host dependencies.
   * @param {object} dependencies - Canvas, pixel, geometry, color, and random helpers.
   * @returns {object} Frozen art effect API.
   */
  function createArtEffects(dependencies) {
    const required = ["clamp", "mix", "seededNoise", "smoothstep", "rgbaString", "cloneCanvas", "createSampleSource", "getSampleSourceIndex", "getScratchCanvas", "buildRoundedRectPath", "buildDieCutPath", "drawRoundedRectPath", "applyCannyLikeEdges", "convolveCanvas", "applyBasicAdjustments", "applyGrayscale", "applyPosterize", "curveThousand", "parseHexColor", "random"];
    if (!dependencies) throw new TypeError("Art renderer dependencies are required.");
    for (const name of required) {
      if (typeof dependencies[name] !== "function") throw new TypeError(name + " dependency is required.");
    }

    /** Applies active illustrative art effects in the established render order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} art - Art effect slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette.
     * @returns {void} Nothing.
     */
    function applyArtEffects(canvas, art, colors) {
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      const dark = dependencies.parseHexColor(colors.duotoneDark);
    
      if (art.gridDecay > 0) applyGridDecay(canvas, art.gridDecay / 100, dark);
      if (art.dadaCollage > 0) applyDadaCollage(canvas, art.dadaCollage / 100, accent, soft, dark);
      if (art.cubistFacets > 0) applyCubistFacets(canvas, art.cubistFacets / 100, accent, soft, dark);
      if (art.dreamLook > 0) applyDreamLook(canvas, art.dreamLook / 100, soft);
      if (art.squashStretch > 0) applySquashStretch(canvas, art.squashStretch / 100);
      if (art.asciiText > 0) applyAsciiText(canvas, art.asciiText / 100, dark, soft);
      if (art.carpet > 0) applyCarpet(canvas, art.carpet / 100, accent, soft, dark);
      if (art.mosaic > 0) applyMosaic(canvas, art.mosaic / 100);
      if (art.matrixRain > 0) applyMatrixRain(canvas, art.matrixRain / 100);
      if (art.candy > 0) applyCandy(canvas, art.candy / 100, accent, soft, dark);
      if (art.neonLines > 0) applyNeonLines(canvas, art.neonLines / 100);
      if (art.icehouse > 0) applyIcehouse(canvas, art.icehouse / 100);
      if (art.sandstorm > 0) applySandstorm(canvas, art.sandstorm / 100);
      if (art.abstracted > 0) applyAbstracted(canvas, art.abstracted / 100, accent, soft, dark);
      if (art.feltMarker > 0) applyFeltMarker(canvas, art.feltMarker / 100);
      if (art.linoCut > 0) applyLinoCut(canvas, art.linoCut / 100, dark, soft);
      if (art.pointillism > 0) applyPointillism(canvas, art.pointillism / 100);
      if (art.ballpointPen > 0) applyBallpointPen(canvas, art.ballpointPen / 100);
      if (art.randomWords > 0) applyRandomWords(canvas, art.randomWords / 100, accent, soft, dark);
      if (art.minecraft > 0) applyMinecraft(canvas, art.minecraft / 100);
    }
    
    /** Delegates text-art rendering to the reusable text-effects module.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} wordArt - Text-art slider values.
     * @param {object} colors - Project palette settings.
     * @returns {void} Nothing.
     */

    /** Renders the  grid decay illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyGridDecay(canvas, amount, dark) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const source = dependencies.cloneCanvas(canvas);
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const cols = Math.max(8, Math.round(12 + density * 4));
      const tile = Math.max(8, canvas.width / cols);
      const rows = Math.ceil(canvas.height / tile);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * tile;
          const y = row * tile;
          const progress = dependencies.smoothstep(0.08, 1, y / Math.max(1, canvas.height - tile));
          const disorder = density * progress;
          const offsetX = (dependencies.seededNoise(col, row, 0.31) - 0.5) * tile * 1.75 * disorder;
          const offsetY = (dependencies.seededNoise(col, row, 1.17) - 0.5) * tile * 2.1 * disorder;
          const rotation = (dependencies.seededNoise(col, row, 2.83) - 0.5) * (0.28 + disorder * 0.12);
          const size = tile * (0.98 + disorder * 0.14);
    
          ctx.save();
          ctx.translate(x + tile / 2 + offsetX, y + tile / 2 + offsetY);
          ctx.rotate(rotation);
          ctx.drawImage(source, x, y, tile, tile, -size / 2, -size / 2, size, size);
          if (strength > 0.08) {
            ctx.lineWidth = 0.4 + Math.min(1.6, disorder * 0.12);
            ctx.strokeStyle = dependencies.rgbaString(dark, 0.03 + Math.min(0.24, disorder * 0.02));
            ctx.strokeRect(-size / 2, -size / 2, size, size);
          }
          ctx.restore();
        }
      }
    }
    
    /** Renders the  dada collage illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyDadaCollage(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const progress = dependencies.clamp(amount / 10, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 280 + progress * 220 + turbo * 80);
      const fragmentCount = Math.round(10 + progress * 120 + turbo * 80);
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgba(246,242,234,${0.96})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = 0.18 + progress * 0.18;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      for (let i = 0; i < fragmentCount; i += 1) {
        const x = dependencies.seededNoise(i, 1, 0.14) * canvas.width * 0.82;
        const y = dependencies.seededNoise(i, 2, 0.49) * canvas.height * 0.82;
        const w = canvas.width * (0.05 + dependencies.seededNoise(i, 3, 0.92) * (0.1 + progress * 0.12 + turbo * 0.03));
        const h = canvas.height * (0.035 + dependencies.seededNoise(i, 4, 1.31) * (0.08 + progress * 0.09 + turbo * 0.025));
        const dx = x + (dependencies.seededNoise(i, 6, 2.53) - 0.5) * canvas.width * (0.026 + progress * 0.13 + turbo * 0.03);
        const dy = y + (dependencies.seededNoise(i, 7, 3.11) - 0.5) * canvas.height * (0.026 + progress * 0.13 + turbo * 0.03);
        const rotation = (dependencies.seededNoise(i, 5, 1.89) - 0.5) * (0.16 + progress * 0.72 + turbo * 0.18);
        const sx = dependencies.clamp(Math.round(x + w / 2), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(y + h / 2), 0, canvas.height - 1);
        const colorIndex = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
        const paperColor = {
          r: dependencies.mix(sampleSource.data[colorIndex], soft.r, 0.42),
          g: dependencies.mix(sampleSource.data[colorIndex + 1], accent.g, 0.18),
          b: dependencies.mix(sampleSource.data[colorIndex + 2], dark.b, 0.12),
        };
    
        ctx.save();
        ctx.translate(dx + w / 2, dy + h / 2);
        ctx.rotate(rotation);
        ctx.globalAlpha = dependencies.clamp(0.16 + progress * 0.24 + turbo * 0.06, 0, 0.58);
        ctx.drawImage(source, x, y, w, h, -w / 2, -h / 2, w, h);
        let paperTint = dependencies.rgbaString(accent, 0.03 + progress * 0.07 + turbo * 0.018);
        if (i % 3 === 0) paperTint = dependencies.rgbaString(paperColor, 0.04 + progress * 0.1 + turbo * 0.025);
        else if (i % 3 === 1) paperTint = dependencies.rgbaString(soft, 0.05 + progress * 0.085 + turbo * 0.02);
        ctx.fillStyle = paperTint;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = dependencies.rgbaString(dark, 0.07 + progress * 0.09 + turbo * 0.02);
        ctx.lineWidth = 0.55 + progress * 0.6 + turbo * 0.08;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.restore();
    
      if (progress > 0.45) {
        const wordCount = Math.round(2 + progress * 8 + turbo * 3);
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < wordCount; i += 1) {
          const word = ["void", "echo", "clip", "noise", "paste", "cut"][i % 6];
          const size = 10 + dependencies.seededNoise(i, 8, 0.9) * (10 + progress * 30);
          ctx.font = `${Math.round(size)}px 'Aptos Display', 'Segoe UI', sans-serif`;
          let wordColor = accent;
          if (i % 2 === 0) wordColor = dark;
          ctx.fillStyle = dependencies.rgbaString(wordColor, 0.03 + progress * 0.045);
          ctx.fillText(word, dependencies.seededNoise(i, 9, 1.2) * canvas.width, dependencies.seededNoise(i, 10, 1.8) * canvas.height);
        }
        ctx.restore();
      }
    }
    
    /** Renders the  cubist facets illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyCubistFacets(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const cols = Math.max(5, Math.round(8 + density * 2.5));
      const rows = Math.max(6, Math.round(9 + density * 3));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellW;
          const y = row * cellH;
          const shiftX = (dependencies.seededNoise(col, row, 3.9) - 0.5) * cellW * 0.42 * density;
          const shiftY = (dependencies.seededNoise(col, row, 4.7) - 0.5) * cellH * 0.42 * density;
          const skewA = 0.14 + dependencies.seededNoise(col, row, 5.1) * 0.3;
          const skewB = 0.12 + dependencies.seededNoise(col, row, 5.6) * 0.32;
    
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + cellW * skewA + shiftX, y + shiftY);
          ctx.lineTo(x + cellW + shiftX, y + cellH * skewB + shiftY);
          ctx.lineTo(x + cellW * (1 - skewA) + shiftX, y + cellH + shiftY);
          ctx.lineTo(x + shiftX, y + cellH * (1 - skewB) + shiftY);
          ctx.closePath();
          ctx.clip();
          ctx.globalAlpha = dependencies.clamp(0.66 + strength * 0.12, 0, 0.9);
          ctx.drawImage(
            source,
            x,
            y,
            cellW,
            cellH,
            x + shiftX * (0.7 + density * 0.04),
            y + shiftY * (0.7 + density * 0.04),
            cellW * (0.98 + strength * 0.12 + density * 0.03),
            cellH * (0.98 + strength * 0.12 + density * 0.03)
          );
          ctx.restore();
    
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + cellW * skewA + shiftX, y + shiftY);
          ctx.lineTo(x + cellW + shiftX, y + cellH * skewB + shiftY);
          ctx.lineTo(x + cellW * (1 - skewA) + shiftX, y + cellH + shiftY);
          ctx.lineTo(x + shiftX, y + cellH * (1 - skewB) + shiftY);
          ctx.closePath();
          ctx.strokeStyle = dependencies.rgbaString(dark, 0.06 + strength * 0.1);
          ctx.lineWidth = 0.6 + strength * 0.5;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    
    /** Renders the  dream look illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyDreamLook(canvas, amount, soft) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const sampleSource = dependencies.createSampleSource(source, 260 + strength * 200 + density * 40);
      const step = Math.max(10, Math.round(28 - Math.min(18, density * 1.6)));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(248, 244, 240)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const w = step * (1.12 + dependencies.seededNoise(x, y, 0.8) * 0.42);
          const h = step * (1.04 + dependencies.seededNoise(x, y, 1.6) * 0.42);
          const dx = x + (dependencies.seededNoise(x, y, 2.3) - 0.5) * step * (0.22 + density * 0.018);
          const dy = y + (dependencies.seededNoise(x, y, 3.1) - 0.5) * step * (0.22 + density * 0.018);
          ctx.save();
          ctx.translate(dx + w / 2, dy + h / 2);
          ctx.rotate((dependencies.seededNoise(x, y, 4.2) - 0.5) * (0.14 + density * 0.03));
          ctx.fillStyle = `rgba(${sampleSource.data[index]},${sampleSource.data[index + 1]},${sampleSource.data[index + 2]},${0.3 + strength * 0.18})`;
          dependencies.drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.28);
          ctx.fill();
          ctx.restore();
        }
      }
    
      const blurCanvas = dependencies.cloneCanvas(canvas);
      const blurCtx = blurCanvas.getContext("2d");
      blurCtx.filter = `blur(${2 + strength * 10 + density * 1.8}px)`;
      blurCtx.drawImage(canvas, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = dependencies.clamp(0.14 + strength * 0.12, 0, 0.28);
      ctx.drawImage(blurCanvas, canvas.width * 0.014, -canvas.height * 0.012, canvas.width, canvas.height);
      ctx.drawImage(blurCanvas, -canvas.width * 0.012, canvas.height * 0.01, canvas.width, canvas.height);
      ctx.restore();
    
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, dependencies.rgbaString(soft, 0.05 + strength * 0.08));
      gradient.addColorStop(0.5, "rgba(255,255,255,0.04)");
      gradient.addColorStop(1, dependencies.rgbaString(soft, 0.1 + strength * 0.14));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    /** Renders the  ascii text illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyAsciiText(canvas, amount, dark, soft) {
      const source = dependencies.cloneCanvas(canvas);
      const progress = dependencies.clamp(amount / 10, 0, 1);
      const step = Math.max(7, Math.round(30 - progress * 21));
      const sampleCanvas = dependencies.getScratchCanvas(
        Math.max(1, Math.round(canvas.width / step)),
        Math.max(1, Math.round(canvas.height / step))
      );
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleCtx.drawImage(source, 0, 0, sampleCanvas.width, sampleCanvas.height);
      const sample = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      const ctx = canvas.getContext("2d");
      const chars = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
    
      ctx.save();
      ctx.fillStyle = dependencies.rgbaString(soft, 0.985);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${Math.max(8, Math.round(step * 1.02))}px 'Consolas', 'Courier New', monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < sampleCanvas.height; y += 1) {
        for (let x = 0; x < sampleCanvas.width; x += 1) {
          const index = (y * sampleCanvas.width + x) * 4;
          const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
          const darkness = 1 - gray / 255;
          const charIndex = dependencies.clamp(Math.floor(darkness * (chars.length - 1)), 0, chars.length - 1);
          const color = {
            r: dependencies.mix(sample[index], dark.r, 0.08 + darkness * 0.16),
            g: dependencies.mix(sample[index + 1], dark.g, 0.08 + darkness * 0.16),
            b: dependencies.mix(sample[index + 2], dark.b, 0.08 + darkness * 0.16),
          };
          ctx.fillStyle = dependencies.rgbaString(color, 0.42 + darkness * 0.26 + progress * 0.08);
          ctx.fillText(chars[charIndex], x * step, y * step);
        }
      }
      ctx.restore();
    }
    
    /** Renders the  carpet illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyCarpet(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const sampleSource = dependencies.createSampleSource(source, 260 + strength * 180 + density * 40);
      const step = Math.max(7, Math.round(22 - Math.min(14, density * 1.4)));
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(241, 230, 214)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const baseColor = {
            r: sampleSource.data[index],
            g: sampleSource.data[index + 1],
            b: sampleSource.data[index + 2],
          };
          const warmColor = {
            r: dependencies.clamp(baseColor.r * 0.86 + accent.r * 0.18 + 18, 0, 255),
            g: dependencies.clamp(baseColor.g * 0.78 + soft.r * 0.1 + 10, 0, 255),
            b: dependencies.clamp(baseColor.b * 0.66 + dark.b * 0.08, 0, 255),
          };
          const coolColor = {
            r: dependencies.clamp(baseColor.r * 0.74 + soft.r * 0.16, 0, 255),
            g: dependencies.clamp(baseColor.g * 0.82 + soft.g * 0.18, 0, 255),
            b: dependencies.clamp(baseColor.b * 0.8 + accent.b * 0.12 + 8, 0, 255),
          };
          const yarnShift = (dependencies.seededNoise(x, y, 0.37) - 0.5) * step * (0.18 + density * 0.01);
          const loopW = step * (0.86 + dependencies.seededNoise(x, y, 1.11) * 0.34);
          const loopH = step * (0.38 + dependencies.seededNoise(x, y, 1.77) * 0.18);
          const corner = Math.min(loopW, loopH) * 0.48;
    
          ctx.save();
          ctx.translate(x + step / 2, y + step / 2);
          ctx.rotate((dependencies.seededNoise(x, y, 2.33) - 0.5) * (0.18 + density * 0.018));
          ctx.fillStyle = dependencies.rgbaString(warmColor, 0.82 + strength * 0.12);
          dependencies.drawRoundedRectPath(ctx, -loopW / 2, -loopH / 2 + yarnShift, loopW, loopH, corner);
          ctx.fill();
          ctx.fillStyle = dependencies.rgbaString(coolColor, 0.7 + strength * 0.12);
          dependencies.drawRoundedRectPath(ctx, -loopH / 2 + yarnShift, -loopW / 2, loopH, loopW, corner);
          ctx.fill();
    
          const shine = ctx.createLinearGradient(-loopW / 2, 0, loopW / 2, 0);
          shine.addColorStop(0, "rgba(255,255,255,0)");
          shine.addColorStop(0.45, `rgba(255,255,255,${0.08 + strength * 0.08})`);
          shine.addColorStop(0.55, `rgba(255,255,255,${0.18 + strength * 0.12})`);
          shine.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = shine;
          dependencies.drawRoundedRectPath(ctx, -loopW / 2, -loopH / 2 + yarnShift, loopW, loopH, corner);
          ctx.fill();
          ctx.restore();
        }
      }
    }
    
    /** Renders the  mosaic illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMosaic(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const sampleSource = dependencies.createSampleSource(source, 260 + strength * 200 + density * 40);
      const step = Math.max(7, Math.round(26 - Math.min(18, density * 1.8)));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f5f0e9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const dx = x + (dependencies.seededNoise(x, y, 0.12) - 0.5) * step * (0.22 + density * 0.01);
          const dy = y + (dependencies.seededNoise(x, y, 0.77) - 0.5) * step * (0.22 + density * 0.01);
          const w = step * (0.86 + dependencies.seededNoise(x, y, 1.17) * (0.34 + strength * 0.12));
          const h = step * (0.72 + dependencies.seededNoise(x, y, 1.73) * (0.42 + strength * 0.14));
          const r = Math.min(w, h) * (0.18 + strength * 0.18);
          ctx.fillStyle = `rgba(${sampleSource.data[index]},${sampleSource.data[index + 1]},${sampleSource.data[index + 2]},${0.84 + strength * 0.12})`;
          dependencies.drawRoundedRectPath(ctx, dx, dy, w, h, r);
          ctx.fill();
        }
      }
    }
    
    /** Renders the  matrix rain illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMatrixRain(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const cols = Math.max(10, Math.round(canvas.width / Math.max(9, 22 - Math.min(12, density * 1.2))));
      const size = canvas.width / cols;
      const rows = Math.ceil(canvas.height / size);
      const glyphs = "01アイウエオカキクケコサシスセソ";
      const sampleCanvas = dependencies.getScratchCanvas(cols, rows);
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleCtx.drawImage(source, 0, 0, cols, rows);
      const sample = sampleCtx.getImageData(0, 0, cols, rows).data;
      ctx.save();
      ctx.fillStyle = `rgba(0,18,8,${0.12 + strength * 0.18})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${Math.round(size)}px monospace`;
      ctx.textBaseline = "top";
      for (let col = 0; col < cols; col += 1) {
        const head = Math.floor(dependencies.seededNoise(col, 5, amount) * rows);
        for (let row = 0; row < rows; row += 1) {
          const sampleIndex = (row * cols + col) * 4;
          const luminance = (sample[sampleIndex] + sample[sampleIndex + 1] + sample[sampleIndex + 2]) / 3;
          const char = glyphs[Math.floor(dependencies.seededNoise(col, row, 1.2) * glyphs.length)];
          const distance = Math.abs(row - head);
          const alpha = Math.max(0, 0.92 - distance * 0.15) * (0.18 + strength * 0.82) * (0.35 + (255 - luminance) / 255 * 0.65);
          if (alpha <= 0.03) continue;
          const glow = dependencies.clamp(80 + (255 - luminance), 80, 255);
          let red = 64;
          let blue = 128;
          if (distance === 0) {
            red = 210;
            blue = glow;
          }
          ctx.fillStyle = `rgba(${red},${glow},${blue},${alpha})`;
          ctx.fillText(char, col * size, row * size);
        }
      }
      ctx.restore();
    }
    
    /** Renders the  candy illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyCandy(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const sampleSource = dependencies.createSampleSource(source, 260 + strength * 200 + density * 40);
      const step = Math.max(8, Math.round(26 - Math.min(18, density * 1.8)));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff7fb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const hue = (sampleSource.data[index] * 0.5 + sampleSource.data[index + 1] * 0.8 + sampleSource.data[index + 2] * 1.2 + (x + y)) % 360;
          const dx = x + (dependencies.seededNoise(x, y, 0.42) - 0.5) * step * (0.24 + density * 0.01);
          const dy = y + (dependencies.seededNoise(x, y, 1.08) - 0.5) * step * (0.24 + density * 0.01);
          const w = step * (0.86 + dependencies.seededNoise(x, y, 1.71) * 0.38);
          const h = step * (0.8 + dependencies.seededNoise(x, y, 2.33) * 0.34);
          const r = Math.min(w, h) * (0.34 + strength * 0.16);
          ctx.save();
          ctx.translate(dx + w / 2, dy + h / 2);
          ctx.rotate((dependencies.seededNoise(x, y, 3.11) - 0.5) * (0.6 + density * 0.04));
          const sat = 84 + dependencies.seededNoise(x, y, 3.55) * 14;
          const light = 56 + dependencies.seededNoise(x, y, 3.77) * 18;
          ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.38 + strength * 0.22})`;
          dependencies.drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
          ctx.fill();
          ctx.strokeStyle = `hsla(${(hue + 24) % 360}, 100%, 92%, ${0.24 + strength * 0.16})`;
          ctx.lineWidth = 0.6 + strength * 1.2;
          ctx.stroke();
          const gloss = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
          gloss.addColorStop(0, `rgba(255,255,255,${0.22 + strength * 0.18})`);
          gloss.addColorStop(0.38, "rgba(255,255,255,0.04)");
          gloss.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = gloss;
          dependencies.drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
          ctx.fill();
          if (density > 2.2) {
            ctx.fillStyle = `rgba(255,255,255,${0.06 + strength * 0.08})`;
            ctx.beginPath();
            ctx.arc(-w * 0.14, -h * 0.14, Math.min(w, h) * 0.12, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
    }
    
    /** Renders the  neon lines illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyNeonLines(canvas, amount) {
      const edgeCanvas = dependencies.cloneCanvas(canvas);
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      dependencies.applyCannyLikeEdges(edgeCanvas, 0.22 + strength * 0.78);
      const data = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const stepY = Math.max(2, Math.round(8 - Math.min(5, density * 0.6)));
      const stepX = Math.max(2, Math.round(6 - Math.min(3, density * 0.35)));
      const lineLayers = Math.max(1, Math.round(1 + density * 0.35));
      for (let layer = 0; layer < lineLayers; layer += 1) {
        const hueShift = layer * (36 + density * 1.5);
        for (let y = 0; y < canvas.height; y += stepY) {
          let segments = 0;
          ctx.beginPath();
          for (let x = 0; x < canvas.width; x += stepX) {
            const index = (y * canvas.width + x) * 4;
            const gray = (data[index] + data[index + 1] + data[index + 2]) / 3;
            if (gray < 166) {
              let waveScale = 0;
              if (density > 2) waveScale = 1 + density * 0.12;
              const wave = Math.sin((x + layer * 19) * 0.04 + y * 0.01) * waveScale;
              const offset = (gray / 255 - 0.5) * (8 + density * 0.4) + wave;
              if (segments === 0) ctx.moveTo(x, y + offset);
              else ctx.lineTo(x, y + offset);
              segments += 1;
            }
          }
          if (segments < 2) continue;
          const hue = ((y / Math.max(1, canvas.height)) * 280 + 160 + hueShift) % 360;
          ctx.strokeStyle = `hsla(${hue}, 100%, 66%, ${0.12 + strength * 0.18})`;
          ctx.shadowBlur = 10 + density * 2.8;
          ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.86)`;
          ctx.lineWidth = 0.9 + density * 0.12;
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    
    /** Renders the  icehouse illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyIcehouse(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const progress = dependencies.clamp(amount / 10, 0, 1);
      const sampleSource = dependencies.createSampleSource(source, 280 + progress * 220);
      const spacing = Math.max(7, Math.round(28 - progress * 18));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(238, 244, 252)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = 0.18 + progress * 0.22;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      for (let baseY = 0; baseY < canvas.height; baseY += spacing) {
        ctx.beginPath();
        let hasSegment = false;
        for (let x = 0; x <= canvas.width; x += 6) {
          const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(baseY), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
          const saturation = Math.max(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]) - Math.min(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]);
          const amplitude = (1 - gray / 255) * (5 + progress * 18) + saturation * 0.02;
          const wave = Math.sin(x * (0.016 + progress * 0.01) + gray * 0.025 + baseY * 0.018) * amplitude;
          const detail = Math.cos(x * 0.048 + baseY * 0.021) * amplitude * 0.28;
          const y = baseY + wave + detail;
          if (!hasSegment) {
            ctx.moveTo(x, y);
            hasSegment = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        const hue = (baseY / Math.max(1, canvas.height)) * 360;
        ctx.strokeStyle = `hsla(${hue}, 82%, 54%, ${0.18 + progress * 0.22})`;
        ctx.lineWidth = 0.7 + progress * 1.8;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.06 + progress * 0.1;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  sandstorm illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applySandstorm(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const density = Math.max(0, amount);
      const progress = dependencies.clamp(amount / 10, 0, 1);
      const cols = Math.max(20, Math.round(26 + progress * 60));
      const rows = Math.max(18, Math.round((canvas.height / canvas.width) * cols));
      const sampleCanvas = dependencies.getScratchCanvas(cols, rows);
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleCtx.drawImage(source, 0, 0, cols, rows);
      const sample = sampleCtx.getImageData(0, 0, cols, rows).data;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
      ctx.fillStyle = `rgba(230, 208, 168,${0.06 + progress * 0.2})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const count = Math.round(180 + progress * 2400);
      ctx.save();
      ctx.strokeStyle = `rgba(232,210,164,${0.04 + progress * 0.14})`;
      ctx.lineWidth = 0.35 + progress * 1.1;
      for (let i = 0; i < count; i += 1) {
        const x = dependencies.seededNoise(i, 1, 0.4) * canvas.width;
        const y = dependencies.seededNoise(i, 2, 1.3) * canvas.height;
        const col = dependencies.clamp(Math.floor((x / canvas.width) * cols), 0, cols - 1);
        const row = dependencies.clamp(Math.floor((y / canvas.height) * rows), 0, rows - 1);
        const index = (row * cols + col) * 4;
        const luminance = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
        const drift = (dependencies.seededNoise(i, 5, 0.93) - 0.5) * (8 + progress * 60);
        const len = 3 + dependencies.seededNoise(i, 3, 2.1) * (8 + progress * 32) * (0.45 + (255 - luminance) / 255);
        ctx.strokeStyle = `rgba(${210 + (255 - luminance) * 0.15},${186 + (255 - luminance) * 0.08},${140 + (255 - luminance) * 0.05},${0.045 + progress * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len + drift, y + len * (0.12 + progress * 0.28));
        ctx.stroke();
      }
      ctx.restore();
    }
    
    /** Renders the  abstracted illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyAbstracted(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const sampleSource = dependencies.createSampleSource(source, 260 + strength * 200 + density * 40);
      const step = Math.max(9, Math.round(28 - Math.min(18, density * 1.8)));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f3efe9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const dx = x + (dependencies.seededNoise(x, y, 0.61) - 0.5) * step * (0.42 + density * 0.016);
          const dy = y + (dependencies.seededNoise(x, y, 1.18) - 0.5) * step * (0.42 + density * 0.016);
          const w = step * (0.8 + dependencies.seededNoise(x, y, 1.93) * 0.52);
          const h = step * (0.8 + dependencies.seededNoise(x, y, 2.49) * 0.48);
          const color = {
            r: dependencies.clamp(sampleSource.data[index] + (dependencies.seededNoise(x, y, 3.01) - 0.5) * (28 + density * 3), 0, 255),
            g: dependencies.clamp(sampleSource.data[index + 1] + (dependencies.seededNoise(x, y, 3.61) - 0.5) * (28 + density * 3), 0, 255),
            b: dependencies.clamp(sampleSource.data[index + 2] + (dependencies.seededNoise(x, y, 4.2) - 0.5) * (28 + density * 3), 0, 255),
          };
          ctx.save();
          ctx.translate(dx + w / 2, dy + h / 2);
          ctx.rotate((dependencies.seededNoise(x, y, 4.73) - 0.5) * (0.9 + density * 0.08));
          ctx.scale(1 + (dependencies.seededNoise(x, y, 5.21) - 0.5) * (strength + density * 0.05), 1 + (dependencies.seededNoise(x, y, 5.83) - 0.5) * (strength + density * 0.05));
          if (density > 2) {
            ctx.transform(
              1,
              (dependencies.seededNoise(x, y, 6.11) - 0.5) * 0.35,
              (dependencies.seededNoise(x, y, 6.63) - 0.5) * 0.35,
              1,
              0,
              0
            );
          }
          ctx.fillStyle = dependencies.rgbaString(color, 0.72 + strength * 0.16);
          dependencies.drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.26);
          ctx.fill();
          let threadColor = soft;
          if (dependencies.seededNoise(x, y, 6.4) > 0.5) threadColor = accent;
          ctx.strokeStyle = dependencies.rgbaString(threadColor, 0.08 + strength * 0.12);
          ctx.lineWidth = 0.4 + strength;
          ctx.stroke();
          if (density > 2.8) {
            ctx.strokeStyle = dependencies.rgbaString(dark, 0.04 + strength * 0.08);
            ctx.lineWidth = 0.3 + strength * 0.6;
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.lineTo(w / 2, 0);
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(0, h / 2);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }
    
    /** Renders the  felt marker illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyFeltMarker(canvas, amount) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      dependencies.applyPosterize(imageData.data, Math.round(3 + amount * 5));
      dependencies.applyBasicAdjustments(imageData.data, {
        brightness: 4,
        contrast: 12 + amount * 18,
        saturation: 16 + amount * 30,
        blur: 0,
        sharpen: 0,
      }, 0);
      ctx.putImageData(imageData, 0, 0);
      dependencies.convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 0.08 + amount * 0.18);
    }
    
    /** Renders the  lino cut illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyLinoCut(canvas, amount, dark, soft) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const progress = dependencies.clamp(amount / 10, 0, 1);
      dependencies.applyGrayscale(data, 1);
      const threshold = 214 - progress * 150;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i];
        const jitter = (dependencies.random() - 0.5) * (6 + progress * 30);
        const edgeBias = dependencies.smoothstep(threshold - 30, threshold + 20, gray + jitter);
        let value = 18;
        if (edgeBias > 0.54) value = 246;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }
      ctx.putImageData(imageData, 0, 0);
      dependencies.convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 0.04 + progress * 0.28);
      const tinted = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < tinted.data.length; i += 4) {
        const isLight = tinted.data[i] > 180;
        if (isLight) {
          tinted.data[i] = soft.r;
          tinted.data[i + 1] = soft.g;
          tinted.data[i + 2] = soft.b;
        } else {
          tinted.data[i] = dark.r;
          tinted.data[i + 1] = dark.g;
          tinted.data[i + 2] = dark.b;
        }
      }
      ctx.putImageData(tinted, 0, 0);
    }
    
    /** Renders the  pointillism illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyPointillism(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const sampleSource = dependencies.createSampleSource(source, 260 + strength * 220 + density * 30);
      const step = Math.max(4, Math.round(8 + Math.min(14, density * 1.1)));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8f4ef";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const radius = 0.8 + (1 - ((sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 765)) * step * (0.2 + strength * 0.24);
          ctx.fillStyle = `rgba(${sampleSource.data[index]},${sampleSource.data[index + 1]},${sampleSource.data[index + 2]},${0.72 + strength * 0.16})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    /** Renders the  ballpoint pen illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyBallpointPen(canvas, amount) {
      const density = Math.max(0, amount);
      const progress = dependencies.clamp(amount / 10, 0, 1);
      const source = dependencies.cloneCanvas(canvas);
      const edgeCanvas = dependencies.cloneCanvas(canvas);
      dependencies.applyCannyLikeEdges(edgeCanvas, 0.2 + progress * 0.55);
      const sampleSource = dependencies.createSampleSource(source, 320 + progress * 220 + density * 30);
      const edges = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f8f7f1";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.strokeStyle = `rgba(37,64,148,${0.12 + progress * 0.2})`;
      ctx.lineWidth = 0.55 + progress * 0.65;
      const spacing = Math.max(5, Math.round(13 - progress * 7));
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 6) {
          const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
          const edgeGray = (edges[index] + edges[index + 1] + edges[index + 2]) / 3;
          const offset = (1 - gray / 255) * spacing * (0.46 + progress * 0.2) + (1 - edgeGray / 255) * spacing * 0.38;
          if (x === 0) ctx.moveTo(x, y + offset);
          else ctx.lineTo(x, y + offset);
        }
        ctx.stroke();
      }
      if (density > 0.8) {
        ctx.globalAlpha = 0.22 + progress * 0.18;
        for (let y = spacing / 2; y < canvas.height; y += spacing * 1.4) {
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 8) {
            const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
            const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
            const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
            const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
            const edgeGray = (edges[index] + edges[index + 1] + edges[index + 2]) / 3;
            const offset = (1 - gray / 255) * spacing * 0.32 + (1 - edgeGray / 255) * spacing * 0.24;
            if (x === 0) ctx.moveTo(x, y + offset);
            else ctx.lineTo(x, y + offset);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 0.3 + progress * 0.24;
      ctx.drawImage(edgeCanvas, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  squash stretch illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applySquashStretch(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const bands = Math.max(10, Math.round(18 + amount * 18));
      const bandHeight = canvas.height / bands;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < bands; i += 1) {
        const y = i * bandHeight;
        const wave = Math.sin((i / bands) * Math.PI * 2);
        const scaleX = 1 + wave * amount * 0.26;
        const width = canvas.width * scaleX;
        const dx = (canvas.width - width) / 2;
        ctx.drawImage(source, 0, y, canvas.width, bandHeight, dx, y, width, bandHeight);
      }
    }
    
    /** Renders the  random words illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyRandomWords(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const words = ["noise", "echo", "urban", "fragment", "signal", "color", "dream", "grid", "pixel", "tempo", "trace"];
      const palette = [accent, soft, dark, { r: 255, g: 255, b: 255 }];
      const count = Math.round(8 + density * 12);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < count; i += 1) {
        const paletteColor = palette[i % palette.length];
        const size = 12 + dependencies.seededNoise(i, 3, 0.9) * (12 + density * 16);
        ctx.font = `${Math.round(size)}px 'Aptos Display', 'Segoe UI', sans-serif`;
        const x = dependencies.seededNoise(i, 1, 0.2) * canvas.width;
        const y = dependencies.seededNoise(i, 2, 1.2) * canvas.height;
        const rotation = (dependencies.seededNoise(i, 4, 1.8) - 0.5) * (0.3 + density * 0.06);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillStyle = dependencies.rgbaString(paletteColor, 0.08 + strength * 0.12);
        ctx.fillText(words[Math.floor(dependencies.seededNoise(i, 5, 2.6) * words.length)], 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }
    
    /** Builds a rounded rectangle path on the provided Canvas context.
     * @param {CanvasRenderingContext2D} ctx - Path drawing context.
     * @param {number} x - Left edge in pixels.
     * @param {number} y - Top edge in pixels.
     * @param {number} width - Shape width in pixels.
     * @param {number} height - Shape height in pixels.
     * @param {number} radius - Corner radius in pixels.
     * @returns {void} Nothing.
     */
    
    /** Renders the  minecraft illustrative art effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMinecraft(canvas, amount) {
      const block = Math.max(6, Math.round(18 - amount * 6));
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const sampleSource = dependencies.createSampleSource(source, 220 + amount * 40);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += block) {
        for (let x = 0; x < canvas.width; x += block) {
          const sx = dependencies.clamp(Math.round(x + block / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + block / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = Math.round(sampleSource.data[index] / 32) * 32;
          const g = Math.round(sampleSource.data[index + 1] / 32) * 32;
          const b = Math.round(sampleSource.data[index + 2] / 32) * 32;
          ctx.fillStyle = `rgb(${dependencies.clamp(r + 16, 0, 255)},${dependencies.clamp(g + 16, 0, 255)},${dependencies.clamp(b + 16, 0, 255)})`;
          ctx.fillRect(x, y, block, block);
          ctx.fillStyle = `rgba(255,255,255,${0.08 + amount * 0.08})`;
          ctx.fillRect(x, y, block, Math.max(1, block * 0.18));
          ctx.fillStyle = `rgba(0,0,0,${0.12 + amount * 0.12})`;
          ctx.fillRect(x, y + block * 0.82, block, Math.max(1, block * 0.18));
        }
      }
    }
    return Object.freeze({ applyArtEffects });
  }

  return Object.freeze({ createArtEffects });
});
