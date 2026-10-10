(function (root, createLibrary) {
  "use strict";
  const library = createLibrary();
  if (typeof module === "object" && module.exports) module.exports = library;
  if (root) root.ThreadlineTextEffects = library;
})(globalThis, function () {
  "use strict";

  /** Creates reusable typographic image renderers from explicit host dependencies.
   * @param {object} dependencies - Canvas, text sampling, path, color, and scratch helpers.
   * @returns {object} Frozen text effect API.
   */
  function createTextEffects(dependencies) {
    const required = ["clamp", "mix", "seededNoise", "cloneCanvas", "createSampleSource", "getSampleSourceIndex", "getSampleSourceChannel", "getPixelIndex", "getRgbSaturation", "getScratchCanvas", "applyCannyLikeEdges", "buildRoundedRectPath", "buildDieCutPath", "rgbaString", "curveThousand", "parseHexColor"] ;
    if (!dependencies) throw new TypeError("Text renderer dependencies are required.");
    for (const name of required) {
      if (typeof dependencies[name] !== "function") throw new TypeError(name + " dependency is required.");
    }

    /** Applies active text-art controls in the established rendering order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} wordArt - Text-art slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette.
     * @returns {void} Nothing.
     */
    function applyWordArtEffects(canvas, wordArt, colors) {
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      const dark = dependencies.parseHexColor(colors.duotoneDark);
      if (wordArt.textMosaic > 0) applyTextMosaic(canvas, dependencies.curveThousand(wordArt.textMosaic / 100, 1.12, 2.3), accent, soft, dark);
      if (wordArt.asciiDeluxe > 0) applyAsciiDeluxe(canvas, dependencies.curveThousand(wordArt.asciiDeluxe / 100, 1.14, 2.35), accent, soft, dark);
      if (wordArt.keywordCloud > 0) applyKeywordCloud(canvas, dependencies.curveThousand(wordArt.keywordCloud / 100, 1.12, 2.25), accent, soft, dark);
      if (wordArt.contourText > 0) applyContourText(canvas, dependencies.curveThousand(wordArt.contourText / 100, 1.14, 2.4), accent, dark);
      if (wordArt.typoHalftone > 0) applyTypoHalftone(canvas, dependencies.curveThousand(wordArt.typoHalftone / 100, 1.1, 2.2), accent, soft, dark);
      if (wordArt.typoRelief > 0) applyTypoRelief(canvas, dependencies.curveThousand(wordArt.typoRelief / 100, 1.14, 2.4), accent, soft, dark);
      if (wordArt.linePoetry > 0) applyLinePoetry(canvas, dependencies.curveThousand(wordArt.linePoetry / 100, 1.12, 2.25), accent, soft, dark);
      if (wordArt.stampText > 0) applyStampText(canvas, dependencies.curveThousand(wordArt.stampText / 100, 1.14, 2.35), accent, soft, dark);
      if (wordArt.magazineCollage > 0) applyMagazineCollage(canvas, dependencies.curveThousand(wordArt.magazineCollage / 100, 1.16, 2.45), accent, soft, dark);
      if (wordArt.popSlogans > 0) applyPopSlogans(canvas, dependencies.curveThousand(wordArt.popSlogans / 100, 1.14, 2.4), accent, soft, dark);
      if (wordArt.matrixText > 0) applyMatrixText(canvas, dependencies.curveThousand(wordArt.matrixText / 100, 1.16, 2.5), accent, soft, dark);
      if (wordArt.wordSilhouette > 0) applyWordSilhouette(canvas, dependencies.curveThousand(wordArt.wordSilhouette / 100, 1.14, 2.35), accent, soft, dark);
    }

    /** Renders the  text mosaic text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyTextMosaic(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(10, Math.round(30 - strength * 10 - turbo * 5));
      const sampleSource = dependencies.createSampleSource(source, 220 + strength * 160 + turbo * 120);
      const words = ["THREAD", "LINE", "STUDIO", "PIXEL", "TRACE", "TONE", "COLOR", "FORM"];
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          const fontSize = Math.max(9, Math.round(step * (0.65 + darkness * 0.55 + turbo * 0.08)));
          const word = words[Math.floor(dependencies.seededNoise(x, y, 0.71) * words.length)];
          const rotation = (dependencies.seededNoise(x, y, 1.37) - 0.5) * (0.16 + strength * 0.22 + turbo * 0.08);
          const alpha = dependencies.clamp(0.32 + darkness * 0.38 + strength * 0.12, 0.24, 0.88);
          const color = {
            r: Math.round(dependencies.mix(r, accent.r, 0.08 + darkness * 0.18)),
            g: Math.round(dependencies.mix(g, dark.g, 0.06 + darkness * 0.14)),
            b: Math.round(dependencies.mix(b, dark.b, 0.08 + darkness * 0.2)),
          };
          ctx.save();
          ctx.translate(
            x + step * 0.5 + (dependencies.seededNoise(x, y, 2.1) - 0.5) * step * (0.12 + strength * 0.08),
            y + step * 0.5 + (dependencies.seededNoise(x, y, 2.9) - 0.5) * step * (0.12 + strength * 0.08)
          );
          ctx.rotate(rotation);
          ctx.font = `${fontSize}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.fillText(word, 0, 0);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  ascii deluxe text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyAsciiDeluxe(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(7, Math.round(24 - strength * 8 - turbo * 5));
      const sampleCanvas = dependencies.getScratchCanvas(
        Math.max(1, Math.round(canvas.width / step)),
        Math.max(1, Math.round(canvas.height / step))
      );
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleCtx.drawImage(source, 0, 0, sampleCanvas.width, sampleCanvas.height);
      const sample = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      const chars = ["·", ".", ":", ";", "!", "1", "7", "A", "R", "T", "#", "@", "&", "%", "M", "W"];
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = dependencies.rgbaString(soft, 0.98);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = "top";
    
      for (let y = 0; y < sampleCanvas.height; y += 1) {
        for (let x = 0; x < sampleCanvas.width; x += 1) {
          const index = (y * sampleCanvas.width + x) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          const char = chars[dependencies.clamp(Math.floor(darkness * (chars.length - 1)), 0, chars.length - 1)];
          const size = Math.max(7, Math.round(step * (0.9 + darkness * 0.24 + turbo * 0.06)));
          const color = {
            r: Math.round(dependencies.mix(r, accent.r, 0.12 + darkness * 0.22)),
            g: Math.round(dependencies.mix(g, dark.g, 0.1 + darkness * 0.18)),
            b: Math.round(dependencies.mix(b, dark.b, 0.14 + darkness * 0.24)),
          };
          ctx.font = `${size}px 'Consolas', 'Courier New', monospace`;
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${dependencies.clamp(0.34 + darkness * 0.46 + strength * 0.08, 0.28, 0.94)})`;
          ctx.fillText(char, x * step, y * step);
        }
      }
    }
    
    /** Renders the  keyword cloud text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyKeywordCloud(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 220 + strength * 140 + turbo * 100);
      const words = ["image", "focus", "trace", "signal", "word", "pixel", "tone", "light", "form", "echo"];
      const step = Math.max(18, Math.round(42 - strength * 14 - turbo * 6));
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    
      for (let y = step * 0.6; y < canvas.height; y += step) {
        for (let x = step * 0.6; x < canvas.width; x += step) {
          const index = dependencies.getSampleSourceIndex(sampleSource, x, y);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          const densityGate = 0.18 + (1 - darkness) * 0.54;
          if (dependencies.seededNoise(x, y, 0.61) < densityGate) continue;
          const size = Math.max(10, Math.round(step * (0.38 + darkness * 0.64 + turbo * 0.06)));
          const word = words[Math.floor(dependencies.seededNoise(x, y, 2.33) * words.length)];
          const color = {
            r: Math.round(dependencies.mix(r, accent.r, 0.12 + darkness * 0.12)),
            g: Math.round(dependencies.mix(g, dark.g, 0.08 + darkness * 0.08)),
            b: Math.round(dependencies.mix(b, dark.b, 0.1 + darkness * 0.1)),
          };
          ctx.save();
          ctx.translate(
            x + (dependencies.seededNoise(x, y, 1.47) - 0.5) * step * 0.22,
            y + (dependencies.seededNoise(x, y, 3.1) - 0.5) * step * 0.22
          );
          ctx.rotate((dependencies.seededNoise(x, y, 4.2) - 0.5) * (0.14 + strength * 0.12));
          ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${dependencies.clamp(0.16 + darkness * 0.36 + strength * 0.1, 0.14, 0.68)})`;
          ctx.fillText(word, 0, 0);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  contour text text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyContourText(canvas, amount, accent, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const edgeCanvas = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      dependencies.applyCannyLikeEdges(edgeCanvas, 0.18 + strength * 0.24 + turbo * 0.08);
      const ctx = canvas.getContext("2d");
      const sourceData = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const edgeData = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const step = Math.max(8, Math.round(26 - strength * 10 - turbo * 5));
      const tokens = ["trace", "edge", "line", "draw", "tone"];
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.18 + strength * 0.16, 0.16, 0.36);
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const idx = dependencies.getPixelIndex(dependencies.clamp(x, 0, canvas.width - 1), dependencies.clamp(y, 0, canvas.height - 1), canvas.width);
          const edge = edgeData[idx] / 255;
          if (edge < 0.18) continue;
          const r = sourceData[idx];
          const g = sourceData[idx + 1];
          const b = sourceData[idx + 2];
          const luminance = (r + g + b) / 3;
          const word = tokens[Math.floor(dependencies.seededNoise(x, y, 3.2) * tokens.length)];
          const angle = (dependencies.seededNoise(x, y, 4.7) - 0.5) * (0.45 + strength * 0.5 + turbo * 0.18);
          const fontSize = Math.max(10, Math.round(step * (0.5 + edge * 0.9 + turbo * 0.08)));
          const color = {
            r: Math.round(dependencies.mix(r, accent.r, 0.14 + edge * 0.38)),
            g: Math.round(dependencies.mix(g, dark.g, 0.06 + edge * 0.18)),
            b: Math.round(dependencies.mix(b, dark.b, 0.16 + edge * 0.42)),
          };
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.font = `${fontSize}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${dependencies.clamp(0.2 + edge * 0.72 + strength * 0.08, 0.24, 0.92)})`;
          ctx.fillText(word, 0, 0);
          if (luminance < 118) {
            ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + edge * 0.24})`;
            ctx.lineWidth = Math.max(0.6, fontSize * 0.028);
            ctx.strokeText(word, 0, 0);
          }
          ctx.restore();
        }
      }
    }
    
    /** Renders the  typo halftone text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyTypoHalftone(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(8, Math.round(24 - strength * 10 - turbo * 4));
      const sampleSource = dependencies.createSampleSource(source, 240 + strength * 160 + turbo * 100);
      const glyphs = ["·", ":", "o", "O", "8", "&", "#"];
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(248, soft.r, 0.06))}, ${Math.round(dependencies.mix(246, soft.g, 0.06))}, ${Math.round(dependencies.mix(238, soft.b, 0.06))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          const glyph = glyphs[dependencies.clamp(Math.floor(darkness * (glyphs.length - 1)), 0, glyphs.length - 1)];
          const size = Math.max(8, Math.round(step * (0.42 + darkness * 1.12 + turbo * 0.08)));
          const fill = {
            r: Math.round(dependencies.mix(dark.r, accent.r, 0.16 + darkness * 0.18)),
            g: Math.round(dependencies.mix(dark.g, g, 0.26 + darkness * 0.18)),
            b: Math.round(dependencies.mix(dark.b, b, 0.28 + darkness * 0.16)),
          };
          ctx.save();
          ctx.translate(x + step / 2, y + step / 2);
          ctx.rotate((dependencies.seededNoise(x, y, 5.1) - 0.5) * (0.12 + turbo * 0.08));
          ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${dependencies.clamp(0.22 + darkness * 0.62 + strength * 0.1, 0.22, 0.94)})`;
          ctx.fillText(glyph, 0, 0);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  typo relief text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyTypoRelief(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const edgeCanvas = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      dependencies.applyCannyLikeEdges(edgeCanvas, 0.16 + strength * 0.22 + turbo * 0.08);
      const ctx = canvas.getContext("2d");
      const sourceData = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const edgeData = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const step = Math.max(10, Math.round(28 - strength * 10 - turbo * 4));
      const words = ["TYPE", "FORM", "PRESS", "RELIEF", "TRACE", "SIGN"];
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(246, soft.r, 0.06))}, ${Math.round(dependencies.mix(242, soft.g, 0.08))}, ${Math.round(dependencies.mix(236, soft.b, 0.06))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.06, 0.08, 0.18);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    
      for (let y = step * 0.6; y < canvas.height; y += step) {
        for (let x = step * 0.6; x < canvas.width; x += step) {
          const idx = dependencies.getPixelIndex(dependencies.clamp(x, 0, canvas.width - 1), dependencies.clamp(y, 0, canvas.height - 1), canvas.width);
          const edge = edgeData[idx] / 255;
          const r = sourceData[idx];
          const g = sourceData[idx + 1];
          const b = sourceData[idx + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          if (edge < 0.12 && darkness < 0.34) continue;
          const word = words[Math.floor(dependencies.seededNoise(x, y, 6.2) * words.length)];
          const size = Math.max(10, Math.round(step * (0.42 + darkness * 0.5 + edge * 0.42 + turbo * 0.04)));
          const fill = {
            r: Math.round(dependencies.mix(soft.r, r, 0.18 + darkness * 0.12)),
            g: Math.round(dependencies.mix(soft.g, g, 0.18 + darkness * 0.12)),
            b: Math.round(dependencies.mix(soft.b, b, 0.18 + darkness * 0.12)),
          };
          const emboss = {
            r: Math.round(dependencies.mix(dark.r, accent.r, 0.1 + edge * 0.2)),
            g: Math.round(dependencies.mix(dark.g, dark.g, 0.8)),
            b: Math.round(dependencies.mix(dark.b, b, 0.06 + edge * 0.08)),
          };
          const dx = x + (dependencies.seededNoise(x, y, 7.1) - 0.5) * step * 0.1;
          const dy = y + (dependencies.seededNoise(x, y, 7.9) - 0.5) * step * 0.1;
          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate((dependencies.seededNoise(x, y, 8.6) - 0.5) * (0.08 + strength * 0.08));
          ctx.font = `700 ${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(255,255,255,${0.14 + edge * 0.22 + strength * 0.04})`;
          ctx.fillText(word, 0.8, 0.8);
          ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${dependencies.clamp(0.7 + darkness * 0.12, 0.68, 0.9)})`;
          ctx.fillText(word, 0, 0);
          ctx.strokeStyle = `rgba(${emboss.r}, ${emboss.g}, ${emboss.b}, ${0.12 + edge * 0.34 + strength * 0.06})`;
          ctx.lineWidth = Math.max(0.5, size * 0.024);
          ctx.strokeText(word, -0.6, -0.6);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  line poetry text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyLinePoetry(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const lineStep = Math.max(12, Math.round(24 - strength * 7 - turbo * 4));
      const sampleSource = dependencies.createSampleSource(source, 280 + strength * 180 + turbo * 120);
      const phrase = "threadline studio trace color tone image contour rhythm line form ";
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.05, 0.08, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.textBaseline = "middle";
    
      for (let y = lineStep * 0.7; y < canvas.height; y += lineStep) {
        let cursor = 8;
        let offset = 0;
        while (cursor < canvas.width - 20) {
          const sampleX = dependencies.clamp(cursor, 0, canvas.width - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sampleX, y);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          const chunkLength = Math.max(6, Math.round(6 + darkness * 10 + turbo * 1.5));
          const text = phrase.slice(offset % phrase.length, (offset % phrase.length) + chunkLength).padEnd(chunkLength, phrase);
          const size = Math.max(9, Math.round(9 + darkness * 6 + turbo * 1.1));
          const baselineShift = (1 - darkness) * lineStep * 0.22 + (dependencies.seededNoise(cursor, y, 4.9) - 0.5) * (1 + strength * 1.8);
          ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(dark.r, accent.r, 0.1 + darkness * 0.16))}, ${Math.round(dependencies.mix(dark.g, g, 0.12 + darkness * 0.08))}, ${Math.round(dependencies.mix(dark.b, b, 0.12 + darkness * 0.08))}, ${dependencies.clamp(0.34 + darkness * 0.4 + strength * 0.08, 0.28, 0.9)})`;
          ctx.fillText(text, cursor, y + baselineShift);
          if (darkness > 0.58) {
            ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + darkness * 0.12})`;
            ctx.lineWidth = Math.max(0.5, size * 0.02);
            ctx.strokeText(text, cursor, y + baselineShift);
          }
          const width = ctx.measureText(text).width;
          cursor += Math.max(12, width * (0.8 + darkness * 0.12));
          offset += chunkLength;
        }
      }
    }
    
    /** Renders the  stamp text text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyStampText(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 210 + strength * 140 + turbo * 100);
      const words = ["STAMP", "TRACE", "PRINT", "THREAD", "FORM", "PRESS"];
      const step = Math.max(24, Math.round(48 - strength * 14 - turbo * 7));
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.12 + strength * 0.12, 0.1, 0.28);
      ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    
      for (let y = step * 0.65; y < canvas.height; y += step) {
        for (let x = step * 0.65; x < canvas.width; x += step) {
          const index = dependencies.getSampleSourceIndex(sampleSource, x, y);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          if (darkness < 0.22 && dependencies.seededNoise(x, y, 1.21) < 0.82) continue;
          const word = words[Math.floor(dependencies.seededNoise(x, y, 3.41) * words.length)];
          const size = Math.max(12, Math.round(step * (0.32 + darkness * 0.34 + turbo * 0.04)));
          ctx.save();
          ctx.translate(
            x + (dependencies.seededNoise(x, y, 2.17) - 0.5) * step * 0.16,
            y + (dependencies.seededNoise(x, y, 2.93) - 0.5) * step * 0.16
          );
          ctx.rotate((dependencies.seededNoise(x, y, 4.23) - 0.5) * (0.14 + strength * 0.12));
          ctx.font = `700 ${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(dark.r, accent.r, 0.18 + darkness * 0.08))}, ${Math.round(dependencies.mix(dark.g, g, 0.08))}, ${Math.round(dependencies.mix(dark.b, b, 0.08))}, ${dependencies.clamp(0.12 + darkness * 0.3 + strength * 0.08, 0.12, 0.48)})`;
          ctx.fillText(word, 0, 0);
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + darkness * 0.12})`;
          ctx.lineWidth = Math.max(0.8, size * 0.03);
          ctx.strokeText(word, 0, 0);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  magazine collage text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyMagazineCollage(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 220 + strength * 150 + turbo * 100);
      const words = ["studio", "image", "signal", "fragment", "editorial", "print", "urban", "graphic"];
      const stepX = Math.max(26, Math.round(64 - strength * 20 - turbo * 12));
      const stepY = Math.max(18, Math.round(40 - strength * 12 - turbo * 8));
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(248, soft.r, 0.04))}, ${Math.round(dependencies.mix(246, soft.g, 0.04))}, ${Math.round(dependencies.mix(240, soft.b, 0.04))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.06 + strength * 0.04, 0.06, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let y = stepY * 0.7; y < canvas.height; y += stepY) {
        for (let x = stepX * 0.7; x < canvas.width; x += stepX) {
          const index = dependencies.getSampleSourceIndex(sampleSource, x, y);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          if (darkness < 0.18 && dependencies.seededNoise(x, y, 0.81) < 0.7) continue;
          const w = stepX * (0.62 + dependencies.seededNoise(x, y, 2.27) * 0.52 + darkness * 0.18);
          const h = stepY * (0.58 + dependencies.seededNoise(x, y, 3.11) * 0.42 + darkness * 0.1);
          const bg = {
            r: Math.round(dependencies.mix(soft.r, r, 0.26 + darkness * 0.16)),
            g: Math.round(dependencies.mix(soft.g, g, 0.26 + darkness * 0.16)),
            b: Math.round(dependencies.mix(soft.b, b, 0.26 + darkness * 0.16)),
          };
          ctx.save();
          ctx.translate(
            x + (dependencies.seededNoise(x, y, 1.63) - 0.5) * stepX * (0.22 + strength * 0.1),
            y + (dependencies.seededNoise(x, y, 1.91) - 0.5) * stepY * (0.22 + strength * 0.1)
          );
          ctx.rotate((dependencies.seededNoise(x, y, 4.51) - 0.5) * (0.18 + strength * 0.16 + turbo * 0.05));
          ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${0.82 + darkness * 0.08})`;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.save();
          ctx.globalAlpha = dependencies.clamp(0.14 + darkness * 0.16 + strength * 0.04, 0.12, 0.34);
          ctx.drawImage(source, x - w / 2, y - h / 2, w, h, -w / 2, -h / 2, w, h);
          ctx.restore();
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.18)`;
          ctx.lineWidth = 1;
          ctx.strokeRect(-w / 2, -h / 2, w, h);
          ctx.font = `700 ${Math.max(10, Math.round(h * (0.48 + darkness * 0.12)))}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(dark.r, accent.r, 0.14 + darkness * 0.1))}, ${Math.round(dependencies.mix(dark.g, dark.g, 0.8))}, ${Math.round(dependencies.mix(dark.b, b, 0.08))}, 0.88)`;
          ctx.fillText(words[Math.floor(dependencies.seededNoise(x, y, 5.73) * words.length)], 0, 0);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  pop slogans text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyPopSlogans(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 220 + strength * 150 + turbo * 100);
      const slogans = ["WOW", "BANG", "LOOK", "COLOR", "POP", "FLASH", "YES", "GO"];
      const stepX = Math.max(30, Math.round(72 - strength * 18 - turbo * 10));
      const stepY = Math.max(22, Math.round(48 - strength * 12 - turbo * 6));
      const palette = [
        { r: 244, g: 86, b: 58 },
        { r: 255, g: 214, b: 51 },
        { r: 58, g: 124, b: 255 },
        { r: 26, g: 26, b: 26 },
      ];
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08, 0.1, 0.24);
      ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    
      for (let y = stepY * 0.7; y < canvas.height; y += stepY) {
        for (let x = stepX * 0.7; x < canvas.width; x += stepX) {
          const index = dependencies.getSampleSourceIndex(sampleSource, x, y);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          const saturation = dependencies.getRgbSaturation(r, g, b);
          const edgeProbe = Math.abs(
            dependencies.getSampleSourceChannel(sampleSource, x + stepX * 0.3, y, 0) -
            dependencies.getSampleSourceChannel(sampleSource, x - stepX * 0.3, y, 0)
          ) + Math.abs(
            dependencies.getSampleSourceChannel(sampleSource, x, y + stepY * 0.3, 1) -
            dependencies.getSampleSourceChannel(sampleSource, x, y - stepY * 0.3, 1)
          );
          const motifSignal = darkness * 0.58 + saturation * 0.28 + dependencies.clamp(edgeProbe / 255, 0, 1) * 0.34;
          if (motifSignal < 0.2 && dependencies.seededNoise(x, y, 0.91) < 0.86) continue;
          const slogan = slogans[Math.floor(dependencies.seededNoise(x, y, 1.77) * slogans.length)];
          const paletteColor = palette[Math.floor(dependencies.seededNoise(x, y, 2.6) * palette.length)];
          const blend = dependencies.clamp(0.26 + saturation * 0.34 + darkness * 0.16, 0.22, 0.72);
          const bg = {
            r: Math.round(dependencies.mix(paletteColor.r, r, blend)),
            g: Math.round(dependencies.mix(paletteColor.g, g, blend)),
            b: Math.round(dependencies.mix(paletteColor.b, b, blend)),
          };
          const w = stepX * (0.7 + dependencies.seededNoise(x, y, 3.21) * 0.44 + motifSignal * 0.2);
          const h = stepY * (0.72 + dependencies.seededNoise(x, y, 3.94) * 0.32 + motifSignal * 0.12);
          const fontSize = Math.max(11, Math.round(h * (0.46 + motifSignal * 0.22 + turbo * 0.05)));
          const tx = x + (dependencies.seededNoise(x, y, 4.82) - 0.5) * stepX * 0.16;
          const ty = y + (dependencies.seededNoise(x, y, 5.47) - 0.5) * stepY * 0.16;
          const imgAlpha = dependencies.clamp(0.18 + motifSignal * 0.34 + strength * 0.06, 0.16, 0.5);
          const boxAlpha = dependencies.clamp(0.62 + motifSignal * 0.18, 0.58, 0.88);
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate((dependencies.seededNoise(x, y, 6.23) - 0.5) * (0.16 + strength * 0.12));
          ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${boxAlpha})`;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.save();
          ctx.globalAlpha = imgAlpha;
          ctx.beginPath();
          ctx.rect(-w / 2, -h / 2, w, h);
          ctx.clip();
          ctx.drawImage(source, x - w / 2, y - h / 2, w, h, -w / 2, -h / 2, w, h);
          ctx.restore();
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.24)`;
          ctx.lineWidth = 1;
          ctx.strokeRect(-w / 2, -h / 2, w, h);
          if (motifSignal > 0.42) {
            ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.18, motifSignal * 0.18)})`;
            ctx.lineWidth = Math.max(0.8, h * 0.03);
            ctx.beginPath();
            ctx.moveTo(-w / 2 + 3, -h / 2 + h * 0.22);
            ctx.lineTo(w / 2 - 3, -h / 2 + h * 0.22);
            ctx.stroke();
          }
          ctx.font = `800 ${fontSize}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(dark.r, r, 0.14 + motifSignal * 0.08))}, ${Math.round(dependencies.mix(dark.g, g, 0.14 + motifSignal * 0.08))}, ${Math.round(dependencies.mix(dark.b, b, 0.14 + motifSignal * 0.08))}, 0.92)`;
          ctx.fillText(slogan, 0.8, 0.8);
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(255, soft.r, 0.08))}, ${Math.round(dependencies.mix(255, soft.g, 0.08))}, ${Math.round(dependencies.mix(255, soft.b, 0.08))}, 0.96)`;
          ctx.fillText(slogan, 0, 0);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  matrix text text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyMatrixText(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(12, Math.round(canvas.width / Math.max(10, 28 - amount * 1.05)));
      const size = canvas.width / cols;
      const rows = Math.ceil(canvas.height / size);
      const glyphs = ["0", "1", "data", "echo", "trace", "grid", "node", "code"];
      const sampleCanvas = dependencies.getScratchCanvas(cols, rows);
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleCtx.drawImage(source, 0, 0, cols, rows);
      const sample = sampleCtx.getImageData(0, 0, cols, rows).data;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(228, soft.r, 0.18))}, ${Math.round(dependencies.mix(244, soft.g, 0.12))}, ${Math.round(dependencies.mix(232, soft.b, 0.12))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.18 + strength * 0.12, 0.16, 0.34);
      ctx.filter = `blur(${0.3 + strength * 0.7}px) saturate(${1.02 + strength * 0.08})`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(110, accent.r, 0.08))}, ${Math.round(dependencies.mix(188, soft.g, 0.1))}, ${Math.round(dependencies.mix(136, dark.b, 0.04))}, ${0.08 + strength * 0.05})`;
      ctx.lineWidth = Math.max(0.4, size * 0.04);
      for (let x = 0; x <= canvas.width; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += size) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
      ctx.textBaseline = "top";
    
      for (let col = 0; col < cols; col += 1) {
        const head = Math.floor(dependencies.seededNoise(col, amount, 0.66) * rows);
        for (let row = 0; row < rows; row += 1) {
          const index = (row * cols + col) * 4;
          const luminance = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
          const darkness = 1 - luminance / 255;
          const distance = Math.abs(row - head);
          const alpha = Math.max(0, 0.96 - distance * 0.11) * (0.2 + strength * 0.7) * (0.28 + darkness * 0.72);
          if (alpha <= 0.035) continue;
          const text = glyphs[Math.floor(dependencies.seededNoise(col, row, 1.42) * glyphs.length)];
          const sizePx = Math.max(8, Math.round(size * (0.66 + darkness * 0.26 + turbo * 0.04)));
          ctx.font = `${sizePx}px 'Consolas', 'Courier New', monospace`;
          let tint = {
            r: Math.round(dependencies.mix(68, accent.r, 0.12 + darkness * 0.08)),
            g: Math.round(dependencies.mix(150, soft.g, 0.1 + darkness * 0.08)),
            b: Math.round(dependencies.mix(88, dark.b, 0.04 + darkness * 0.03)),
          };
          if (distance === 0) tint = { r: 56, g: 132, b: 88 };
          ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${alpha})`;
          const drawX = col * size + size * 0.08;
          const drawY = row * size + size * 0.08;
          ctx.fillText(text, drawX, drawY);
          if (distance === 0 || darkness > 0.64) {
            ctx.fillStyle = `rgba(255,255,255,${Math.min(0.28, alpha * 0.3)})`;
            ctx.fillText(text, drawX + 0.5, drawY + 0.35);
          }
        }
      }
    }
    
    /** Renders the  word silhouette text effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyWordSilhouette(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(10, Math.round(28 - strength * 9 - turbo * 5));
      const sampleSource = dependencies.createSampleSource(source, 220 + strength * 150 + turbo * 120);
      const words = ["shape", "outline", "echo", "image", "word", "form", "silhouette"];
      const threshold = 0.7 - strength * 0.24 - turbo * 0.08;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const darkness = 1 - gray / 255;
          if (darkness < threshold) continue;
          const word = words[Math.floor(dependencies.seededNoise(x, y, 6.8) * words.length)];
          const size = Math.max(9, Math.round(step * (0.46 + darkness * 0.82 + turbo * 0.06)));
          const ink = {
            r: Math.round(dependencies.mix(dark.r, accent.r, 0.08 + darkness * 0.14)),
            g: Math.round(dependencies.mix(dark.g, g, 0.08 + darkness * 0.08)),
            b: Math.round(dependencies.mix(dark.b, b, 0.12 + darkness * 0.14)),
          };
          ctx.save();
          ctx.translate(
            x + step / 2 + (dependencies.seededNoise(x, y, 7.5) - 0.5) * step * 0.08,
            y + step / 2 + (dependencies.seededNoise(x, y, 8.2) - 0.5) * step * 0.08
          );
          ctx.rotate((dependencies.seededNoise(x, y, 9.1) - 0.5) * (0.08 + turbo * 0.06));
          ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
          ctx.fillStyle = `rgba(${ink.r}, ${ink.g}, ${ink.b}, ${dependencies.clamp(0.26 + darkness * 0.62 + strength * 0.08, 0.28, 0.96)})`;
          ctx.fillText(word, 0, 0);
          ctx.restore();
        }
      }
    }
    
    return Object.freeze({ applyWordArtEffects });
  }

  return Object.freeze({ createTextEffects });
});
