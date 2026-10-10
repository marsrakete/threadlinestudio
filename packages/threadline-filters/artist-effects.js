(function (root, createLibrary) {
  "use strict";
  const library = createLibrary();
  if (typeof module === "object" && module.exports) module.exports = library;
  if (root) root.ThreadlineArtistEffects = library;
})(globalThis, function () {
  "use strict";

  /** Creates artist-inspired renderers using explicitly supplied image and color helpers.
   * @param {object} dependencies - Canvas, pixel sampling, color, seed, and path helpers.
   * @returns {object} Frozen artist effects API.
   */
  function createArtistEffects(dependencies) {
    const required = ["clamp", "mix", "seededNoise", "smoothstep", "cloneCanvas", "createSampleSource", "getSampleSourceIndex", "getSampleSourceChannel", "getPixelChannel", "getScratchCanvas", "rgbToHsl", "hslToRgb", "drawOrganicBlobPath", "curveThousand", "parseHexColor"];
    if (!dependencies) throw new TypeError("Artist renderer dependencies are required.");
    for (const name of required) {
      if (typeof dependencies[name] !== "function") throw new TypeError(name + " dependency is required.");
    }

    /** Applies active artist-inspired controls in their existing pipeline order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} artists - Artist-style slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette.
     * @returns {void} Nothing.
     */
    function applyArtistEffects(canvas, artists, colors) {
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      const dark = dependencies.parseHexColor(colors.duotoneDark);
      if (artists.mondriaan > 0) applyMondriaan(canvas, dependencies.curveThousand(artists.mondriaan / 100, 1.25, 1.85), dark);
      if (artists.vanGogh > 0) applyVanGogh(canvas, dependencies.curveThousand(artists.vanGogh / 100, 1.28, 1.75), accent, soft, dark);
      if (artists.augustMacke > 0) applyAugustMacke(canvas, dependencies.curveThousand(artists.augustMacke / 100, 1.24, 1.7), accent, soft, dark);
      if (artists.arp > 0) applyArp(canvas, dependencies.curveThousand(artists.arp / 100, 1.26, 1.7), accent, soft, dark);
      if (artists.paulKlee > 0) applyPaulKlee(canvas, dependencies.curveThousand(artists.paulKlee / 100, 1.23, 1.7), accent, soft, dark);
      if (artists.marcChagall > 0) applyMarcChagall(canvas, dependencies.curveThousand(artists.marcChagall / 100, 1.26, 1.75), accent, soft, dark);
      if (artists.kandinsky > 0) applyKandinsky(canvas, dependencies.curveThousand(artists.kandinsky / 100, 1.24, 1.8), accent, soft, dark);
      if (artists.malevich > 0) applyMalevich(canvas, dependencies.curveThousand(artists.malevich / 100, 1.24, 1.8), dark);
      if (artists.soniaDelaunay > 0) applySoniaDelaunay(canvas, dependencies.curveThousand(artists.soniaDelaunay / 100, 1.26, 1.78), accent, soft);
      if (artists.robertDelaunay > 0) applyRobertDelaunay(canvas, dependencies.curveThousand(artists.robertDelaunay / 100, 1.26, 1.78), accent, soft);
      if (artists.cezanne > 0) applyCezanne(canvas, dependencies.curveThousand(artists.cezanne / 100, 1.22, 1.72), accent, soft, dark);
      if (artists.braque > 0) applyBraque(canvas, dependencies.curveThousand(artists.braque / 100, 1.24, 1.7), dark);
      if (artists.franzMarc > 0) applyFranzMarc(canvas, dependencies.curveThousand(artists.franzMarc / 100, 1.24, 1.75), accent, soft, dark);
      if (artists.schiele > 0) applySchiele(canvas, dependencies.curveThousand(artists.schiele / 100, 1.26, 1.7), dark);
      if (artists.matisse > 0) applyMatisse(canvas, dependencies.curveThousand(artists.matisse / 100, 1.24, 1.76), accent, soft, dark);
      if (artists.miro > 0) applyMiro(canvas, dependencies.curveThousand(artists.miro / 100, 1.24, 1.74), dark);
      if (artists.pollock > 0) applyPollock(canvas, dependencies.curveThousand(artists.pollock / 100, 1.27, 1.85), accent, soft, dark);
      if (artists.lichtenstein > 0) applyLichtenstein(canvas, dependencies.curveThousand(artists.lichtenstein / 100, 1.26, 1.8), accent, soft, dark);
      if (artists.hokusai > 0) applyHokusai(canvas, dependencies.curveThousand(artists.hokusai / 100, 1.24, 1.78), dark);
      if (artists.escher > 0) applyEscher(canvas, dependencies.curveThousand(artists.escher / 100, 1.25, 1.82), dark);
      if (artists.klimt > 0) applyKlimt(canvas, dependencies.curveThousand(artists.klimt / 100, 1.26, 1.84), accent, soft, dark);
      if (artists.hilmaAfKlint > 0) applyHilmaAfKlint(canvas, dependencies.curveThousand(artists.hilmaAfKlint / 100, 1.24, 1.8), accent, soft, dark);
      if (artists.kusama > 0) applyKusama(canvas, dependencies.curveThousand(artists.kusama / 100, 1.26, 1.86), accent, soft, dark);
      if (artists.gerhardRichter > 0) applyGerhardRichter(canvas, dependencies.curveThousand(artists.gerhardRichter / 100, 1.24, 1.86), dark);
      if (artists.monet > 0) applyMonet(canvas, dependencies.curveThousand(artists.monet / 100, 1.22, 1.82), soft);
      if (artists.picasso > 0) applyPicasso(canvas, dependencies.curveThousand(artists.picasso / 100, 1.08, 2.9), accent, soft, dark);
      if (artists.ottoDix > 0) applyOttoDix(canvas, dependencies.curveThousand(artists.ottoDix / 100, 1.08, 2.8), dark);
      if (artists.andyWarhol > 0) applyAndyWarhol(canvas, dependencies.curveThousand(artists.andyWarhol / 100, 1.24, 1.84), accent, soft, dark);
      if (artists.botticelli > 0) applyBotticelli(canvas, dependencies.curveThousand(artists.botticelli / 100, 1.2, 1.8), soft, dark);
      if (artists.munch > 0) applyMunch(canvas, dependencies.curveThousand(artists.munch / 100, 1.08, 2.9), accent, soft, dark);
      if (artists.toulouseLautrec > 0) applyToulouseLautrec(canvas, dependencies.curveThousand(artists.toulouseLautrec / 100, 1.08, 2.8), accent, soft, dark);
      if (artists.salvadorDali > 0) applySalvadorDali(canvas, dependencies.curveThousand(artists.salvadorDali / 100, 1.04, 3.35), accent, soft, dark);
    }

    /** Renders the  mondriaan artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMondriaan(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(4, Math.round(4 + strength * 5 + turbo * 5));
      const rows = Math.max(5, Math.round(5 + strength * 6 + turbo * 6));
      const sampleCanvas = dependencies.getScratchCanvas(cols, rows);
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
      sampleCtx.drawImage(source, 0, 0, cols, rows);
      const sample = sampleCtx.getImageData(0, 0, cols, rows).data;
      const xLines = [0];
      const yLines = [0];
      const baseStepX = canvas.width / cols;
      const baseStepY = canvas.height / rows;
      const jitterX = baseStepX * (0.16 + strength * 0.08);
      const jitterY = baseStepY * (0.16 + strength * 0.08);
    
      for (let i = 1; i < cols; i += 1) {
        xLines.push(dependencies.clamp(Math.round(i * baseStepX + (dependencies.seededNoise(i, cols, 0.81) - 0.5) * jitterX), 0, canvas.width));
      }
      xLines.push(canvas.width);
    
      for (let i = 1; i < rows; i += 1) {
        yLines.push(dependencies.clamp(Math.round(i * baseStepY + (dependencies.seededNoise(i, rows, 1.37) - 0.5) * jitterY), 0, canvas.height));
      }
      yLines.push(canvas.height);
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(247, 244, 237)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      const originalAlpha = dependencies.clamp(0.34 - strength * 0.18, 0.06, 0.34);
      if (originalAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = originalAlpha;
        ctx.drawImage(source, 0, 0);
        ctx.restore();
      }
    
      const palette = [
        { r: 230, g: 44, b: 36 },
        { r: 247, g: 209, b: 32 },
        { r: 31, g: 77, b: 182 },
        { r: 246, g: 243, b: 235 },
        { r: 235, g: 231, b: 220 },
      ];
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x0 = xLines[col];
          const y0 = yLines[row];
          const x1 = xLines[col + 1];
          const y1 = yLines[row + 1];
          const width = Math.max(1, x1 - x0);
          const height = Math.max(1, y1 - y0);
          const index = (row * cols + col) * 4;
          const rgb = {
            r: sample[index],
            g: sample[index + 1],
            b: sample[index + 2],
          };
          const [h, s, l] = dependencies.rgbToHsl(rgb.r, rgb.g, rgb.b);
          const warmBias = Math.max(rgb.r - rgb.b, 0) / 255;
          const coolBias = Math.max(rgb.b - rgb.r, 0) / 255;
          const colorChance = 0.04 + strength * 0.16 + turbo * 0.08;
          const fieldNoise = dependencies.seededNoise(col, row, 2.11);
          let fill = palette[3];
    
          if (s > 0.26 && fieldNoise < colorChance) {
            if (h >= 35 && h <= 75) {
              fill = palette[1];
            } else if (h >= 180 && h <= 260) {
              fill = palette[2];
            } else if (h <= 20 || h >= 330 || warmBias > 0.18) {
              fill = palette[0];
            } else {
              if (fieldNoise > 0.62) fill = palette[2];
              else fill = palette[1];
            }
          } else if (l < 0.2 && strength > 0.55 && fieldNoise > 0.88) {
            fill = { r: 28, g: 28, b: 28 };
          } else if (l > 0.78 || fieldNoise > 0.42 + strength * 0.18) {
            if (fieldNoise > 0.82 && strength > 0.35) fill = palette[4];
            else fill = palette[3];
          } else if (coolBias > 0.14 && strength > 0.42 && fieldNoise < 0.16 + strength * 0.05) {
            fill = palette[2];
          } else if (warmBias > 0.16 && strength > 0.42 && fieldNoise < 0.16 + strength * 0.05) {
            if (fieldNoise < 0.08 + strength * 0.04) fill = palette[1];
            else fill = palette[0];
          }
    
          const fillMix = dependencies.clamp(0.36 + strength * 0.24 + turbo * 0.08, 0.32, 0.82);
          ctx.fillStyle = `rgb(${Math.round(dependencies.mix(rgb.r, fill.r, fillMix))}, ${Math.round(dependencies.mix(rgb.g, fill.g, fillMix))}, ${Math.round(dependencies.mix(rgb.b, fill.b, fillMix))})`;
          ctx.fillRect(x0, y0, width, height);
    
          if (strength > 0.08) {
            ctx.save();
            ctx.globalAlpha = dependencies.clamp(0.14 + strength * 0.12 - turbo * 0.03, 0.08, 0.22);
            ctx.drawImage(source, x0, y0, width, height, x0, y0, width, height);
            ctx.restore();
          }
        }
      }
    
      const lineWidth = Math.max(2, Math.round((canvas.width / 240) * (0.55 + strength * 0.7 + turbo * 0.16)));
      ctx.strokeStyle = `rgb(${dark.r}, ${dark.g}, ${dark.b})`;
      ctx.lineCap = "square";
    
      for (const x of xLines) {
        let widthScale = 1;
        if (dependencies.seededNoise(x, 0, 4.02) > 0.72) widthScale = 1.22;
        ctx.lineWidth = lineWidth * widthScale;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    
      for (const y of yLines) {
        let widthScale = 1;
        if (dependencies.seededNoise(0, y, 4.68) > 0.72) widthScale = 1.18;
        ctx.lineWidth = lineWidth * widthScale;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    
      if (strength > 0.24) {
        ctx.save();
        ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08 - turbo * 0.02, 0.06, 0.16);
        ctx.drawImage(source, 0, 0);
        ctx.restore();
      }
    }
    
    /** Renders the  van gogh artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyVanGogh(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 420 + strength * 220 + turbo * 80);
      const step = Math.max(6, Math.round(20 - strength * 8 - turbo * 4));
      const strokeLength = step * (1.8 + strength * 1.4 + turbo * 0.5);
      const strokeWidth = Math.max(1.4, step * (0.18 + strength * 0.05));
      const swirlWeight = 0.28 + strength * 0.42 + turbo * 0.08;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(245, soft.r, 0.12))}, ${Math.round(dependencies.mix(240, soft.g, 0.12))}, ${Math.round(dependencies.mix(226, soft.b, 0.12))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.22 + strength * 0.1, 0.18, 0.34);
      ctx.filter = `blur(${0.8 + strength * 2.4 + turbo * 0.4}px) saturate(${1.04 + strength * 0.18})`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const [h, s, l] = dependencies.rgbToHsl(r, g, b);
          const gx = ((dependencies.getSampleSourceChannel(sampleSource, sx + 1, sy, 0)
            + dependencies.getSampleSourceChannel(sampleSource, sx + 1, sy, 1)
            + dependencies.getSampleSourceChannel(sampleSource, sx + 1, sy, 2))
            - (dependencies.getSampleSourceChannel(sampleSource, sx - 1, sy, 0)
            + dependencies.getSampleSourceChannel(sampleSource, sx - 1, sy, 1)
            + dependencies.getSampleSourceChannel(sampleSource, sx - 1, sy, 2))) / 255;
          const gy = ((dependencies.getSampleSourceChannel(sampleSource, sx, sy + 1, 0)
            + dependencies.getSampleSourceChannel(sampleSource, sx, sy + 1, 1)
            + dependencies.getSampleSourceChannel(sampleSource, sx, sy + 1, 2))
            - (dependencies.getSampleSourceChannel(sampleSource, sx, sy - 1, 0)
            + dependencies.getSampleSourceChannel(sampleSource, sx, sy - 1, 1)
            + dependencies.getSampleSourceChannel(sampleSource, sx, sy - 1, 2))) / 255;
          const edgeAngle = Math.atan2(gy, gx) + Math.PI / 2;
          const swirlAngle = Math.atan2(sy - canvas.height / 2, sx - canvas.width / 2) + Math.PI / 2;
          const angle = edgeAngle * (1 - swirlWeight) + swirlAngle * swirlWeight + (dependencies.seededNoise(x, y, 7.1) - 0.5) * (0.2 + strength * 0.28);
          const vivid = dependencies.clamp(s * (1.08 + strength * 0.22), 0, 1);
          const bright = dependencies.clamp(l * (0.96 + strength * 0.08), 0, 1);
          let [sr, sg, sb] = dependencies.hslToRgb(h, vivid, bright);
    
          if (h >= 180 && h <= 260) {
            sr = Math.round(dependencies.mix(sr, 44, 0.08 + strength * 0.14));
            sg = Math.round(dependencies.mix(sg, 92, 0.08 + strength * 0.14));
            sb = Math.round(dependencies.mix(sb, 182, 0.12 + strength * 0.18));
          } else if (h >= 35 && h <= 75) {
            sr = Math.round(dependencies.mix(sr, 232, 0.1 + strength * 0.12));
            sg = Math.round(dependencies.mix(sg, 189, 0.08 + strength * 0.12));
            sb = Math.round(dependencies.mix(sb, 62, 0.08 + strength * 0.12));
          } else if (l < 0.28) {
            sr = Math.round(dependencies.mix(sr, dark.r, 0.12 + strength * 0.18));
            sg = Math.round(dependencies.mix(sg, dark.g, 0.12 + strength * 0.18));
            sb = Math.round(dependencies.mix(sb, dark.b, 0.12 + strength * 0.18));
          } else {
            sr = Math.round(dependencies.mix(sr, accent.r, 0.03 + strength * 0.05));
            sg = Math.round(dependencies.mix(sg, soft.g, 0.03 + strength * 0.05));
            sb = Math.round(dependencies.mix(sb, soft.b, 0.03 + strength * 0.05));
          }
    
          const px = x + (dependencies.seededNoise(x, y, 1.7) - 0.5) * step * 0.34;
          const py = y + (dependencies.seededNoise(x, y, 2.4) - 0.5) * step * 0.34;
          const len = strokeLength * (0.72 + dependencies.seededNoise(x, y, 3.8) * 0.72);
    
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);
          ctx.lineCap = "round";
          ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${0.46 + strength * 0.18})`;
          ctx.lineWidth = strokeWidth * (0.8 + dependencies.seededNoise(x, y, 4.6) * 0.9);
          ctx.beginPath();
          ctx.moveTo(-len * 0.45, 0);
          ctx.quadraticCurveTo(0, (dependencies.seededNoise(x, y, 5.2) - 0.5) * step * (0.7 + strength * 0.4), len * 0.45, 0);
          ctx.stroke();
          if (strength > 0.2) {
            ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(sr, 255, 0.24))}, ${Math.round(dependencies.mix(sg, 242, 0.18))}, ${Math.round(dependencies.mix(sb, 224, 0.12))}, ${0.12 + strength * 0.08})`;
            ctx.lineWidth = Math.max(0.8, ctx.lineWidth * 0.34);
            ctx.beginPath();
            ctx.moveTo(-len * 0.22, -ctx.lineWidth * 0.5);
            ctx.lineTo(len * 0.2, ctx.lineWidth * 0.3);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = dependencies.clamp(0.04 + strength * 0.08, 0.04, 0.14);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  august macke artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyAugustMacke(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(5, Math.round(6 + strength * 8 + turbo * 5));
      const rows = Math.max(5, Math.round(6 + strength * 7 + turbo * 5));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(248, soft.r, 0.08))}, ${Math.round(dependencies.mix(241, soft.g, 0.08))}, ${Math.round(dependencies.mix(228, soft.b, 0.08))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.22 + strength * 0.14, 0.2, 0.38);
      ctx.filter = `blur(${0.5 + strength * 1.2 + turbo * 0.25}px) saturate(${1.04 + strength * 0.2})`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellW;
          const y = row * cellH;
          const sx = dependencies.clamp(Math.round(x + cellW / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + cellH / 2), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          const [h, s, l] = dependencies.rgbToHsl(r, g, b);
          const dx = x + (dependencies.seededNoise(col, row, 0.71) - 0.5) * cellW * (0.12 + strength * 0.06);
          const dy = y + (dependencies.seededNoise(col, row, 1.33) - 0.5) * cellH * (0.12 + strength * 0.06);
          const w = cellW * (0.86 + dependencies.seededNoise(col, row, 2.17) * (0.16 + strength * 0.08));
          const hRect = cellH * (0.82 + dependencies.seededNoise(col, row, 2.91) * (0.22 + strength * 0.08));
          let [fr, fg, fb] = [r, g, b];
    
          if (h >= 25 && h <= 75) {
            [fr, fg, fb] = [dependencies.mix(fr, 232, 0.16 + strength * 0.12), dependencies.mix(fg, 188, 0.14 + strength * 0.12), dependencies.mix(fb, 74, 0.08 + strength * 0.08)];
          } else if (h >= 180 && h <= 250) {
            [fr, fg, fb] = [dependencies.mix(fr, 69, 0.1 + strength * 0.08), dependencies.mix(fg, 118, 0.1 + strength * 0.08), dependencies.mix(fb, 201, 0.16 + strength * 0.12)];
          } else if (h <= 20 || h >= 330) {
            [fr, fg, fb] = [dependencies.mix(fr, 220, 0.1 + strength * 0.08), dependencies.mix(fg, 98, 0.08 + strength * 0.06), dependencies.mix(fb, 74, 0.06 + strength * 0.05)];
          } else {
            [fr, fg, fb] = [dependencies.mix(fr, accent.r, 0.05 + strength * 0.04), dependencies.mix(fg, soft.g, 0.05 + strength * 0.04), dependencies.mix(fb, soft.b, 0.05 + strength * 0.04)];
          }
    
          ctx.save();
          ctx.translate(dx + w / 2, dy + hRect / 2);
          ctx.rotate((dependencies.seededNoise(col, row, 3.61) - 0.5) * (0.12 + strength * 0.16));
          ctx.fillStyle = `rgba(${Math.round(fr)}, ${Math.round(fg)}, ${Math.round(fb)}, ${0.34 + strength * 0.18})`;
          ctx.fillRect(-w / 2, -hRect / 2, w, hRect);
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
          ctx.lineWidth = Math.max(1, (canvas.width / 420) * (0.7 + strength * 0.4));
          ctx.strokeRect(-w / 2, -hRect / 2, w, hRect);
          ctx.restore();
    
          if (l < 0.42 && strength > 0.18 && dependencies.seededNoise(col, row, 4.27) > 0.55) {
            ctx.save();
            ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + strength * 0.1})`;
            ctx.lineWidth = Math.max(1, (canvas.width / 520) * (0.9 + strength * 0.5));
            ctx.beginPath();
            ctx.moveTo(dx + w * 0.18, dy + hRect * 0.08);
            ctx.lineTo(dx + w * 0.18, dy + hRect * 0.88);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
    
    /** Renders the  arp artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyArp(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 360 + strength * 160 + turbo * 60);
      const count = Math.round(16 + strength * 34 + turbo * 22);
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(244, soft.r, 0.06))}, ${Math.round(dependencies.mix(240, soft.g, 0.06))}, ${Math.round(dependencies.mix(233, soft.b, 0.06))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.2 + strength * 0.1, 0.16, 0.3);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 0.3) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 0.9) * canvas.height;
        const rx = canvas.width * (0.04 + dependencies.seededNoise(i, 3, 1.5) * (0.08 + strength * 0.06 + turbo * 0.02));
        const ry = canvas.height * (0.035 + dependencies.seededNoise(i, 4, 2.1) * (0.08 + strength * 0.06 + turbo * 0.02));
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
        const base = { r: sampleSource.data[index], g: sampleSource.data[index + 1], b: sampleSource.data[index + 2] };
        const [h, s, l] = dependencies.rgbToHsl(base.r, base.g, base.b);
        const neighborIndex = dependencies.getSampleSourceIndex(
          sampleSource,
          dependencies.clamp(Math.round(cx + rx * 0.35), 0, canvas.width - 1),
          dependencies.clamp(Math.round(cy + ry * 0.35), 0, canvas.height - 1)
        );
        const neighbor = { r: sampleSource.data[neighborIndex], g: sampleSource.data[neighborIndex + 1], b: sampleSource.data[neighborIndex + 2] };
        let target = base;
        if (h >= 35 && h <= 80) target = { r: 238, g: 200, b: 83 };
        else if (h >= 170 && h <= 260) target = { r: 74, g: 128, b: 196 };
        else if (h <= 20 || h >= 330) target = { r: 214, g: 92, b: 88 };
        else target = { r: dependencies.mix(base.r, soft.r, 0.24), g: dependencies.mix(base.g, accent.g, 0.18), b: dependencies.mix(base.b, soft.b, 0.2) };
        const fill = {
          r: Math.round(dependencies.mix(dependencies.mix(base.r, neighbor.r, 0.28 + turbo * 0.08), target.r, 0.34 + strength * 0.18)),
          g: Math.round(dependencies.mix(dependencies.mix(base.g, neighbor.g, 0.28 + turbo * 0.08), target.g, 0.34 + strength * 0.18)),
          b: Math.round(dependencies.mix(dependencies.mix(base.b, neighbor.b, 0.28 + turbo * 0.08), target.b, 0.34 + strength * 0.18)),
        };
    
        ctx.save();
        ctx.translate(cx, cy);
        const gx = dependencies.getSampleSourceChannel(sampleSource, sx + 2, sy, 0) - dependencies.getSampleSourceChannel(sampleSource, sx - 2, sy, 0);
        const gy = dependencies.getSampleSourceChannel(sampleSource, sx, sy + 2, 0) - dependencies.getSampleSourceChannel(sampleSource, sx, sy - 2, 0);
        ctx.rotate(Math.atan2(gy, gx) * 0.18 + (dependencies.seededNoise(i, 5, 2.7) - 0.5) * (0.55 + strength * 0.36));
        dependencies.drawOrganicBlobPath(ctx, 0, 0, rx, ry, 6, i + 11);
        ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.26 + strength * 0.16})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
        ctx.lineWidth = Math.max(0.8, (canvas.width / 760) * (0.9 + strength * 0.6));
        ctx.stroke();
        if (turbo > 0.1 && s > 0.16) {
          ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(fill.r, 255, 0.14))}, ${Math.round(dependencies.mix(fill.g, 255, 0.1))}, ${Math.round(dependencies.mix(fill.b, 255, 0.1))}, ${0.06 + turbo * 0.08})`;
          ctx.lineWidth = Math.max(0.4, ctx.lineWidth * 0.45);
          dependencies.drawOrganicBlobPath(ctx, 0, 0, rx * 0.56, ry * 0.56, 6, i + 51);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (turbo > 0.08) {
        ctx.save();
        ctx.globalAlpha = dependencies.clamp(0.08 + turbo * 0.08 + strength * 0.04, 0.06, 0.18);
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(source, 0, 0);
        ctx.restore();
      }
    }
    
    /** Renders the  paul klee artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyPaulKlee(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(7, Math.round(8 + strength * 10 + turbo * 5));
      const rows = Math.max(7, Math.round(8 + strength * 10 + turbo * 5));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(247, soft.r, 0.08))}, ${Math.round(dependencies.mix(236, soft.g, 0.08))}, ${Math.round(dependencies.mix(221, soft.b, 0.08))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellW;
          const y = row * cellH;
          const sx = dependencies.clamp(Math.round(x + cellW / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + cellH / 2), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          const tintMix = dependencies.clamp(0.24 + strength * 0.18, 0.2, 0.46);
          const target = {
            r: dependencies.mix(r, accent.r, 0.08 + strength * 0.08),
            g: dependencies.mix(g, soft.g, 0.1 + strength * 0.08),
            b: dependencies.mix(b, soft.b, 0.12 + strength * 0.08),
          };
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, target.r, tintMix))}, ${Math.round(dependencies.mix(g, target.g, tintMix))}, ${Math.round(dependencies.mix(b, target.b, tintMix))}, ${0.28 + strength * 0.18})`;
          ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.1 + strength * 0.08})`;
          ctx.lineWidth = Math.max(0.8, (canvas.width / 760) * (0.9 + strength * 0.5));
          ctx.strokeRect(x, y, cellW, cellH);
    
          if (dependencies.seededNoise(col, row, 6.1) > 0.76 - strength * 0.18) {
            ctx.save();
            ctx.translate(x + cellW / 2, y + cellH / 2);
            ctx.rotate((dependencies.seededNoise(col, row, 7.4) - 0.5) * 0.8);
            ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.16 + strength * 0.1})`;
            ctx.beginPath();
            ctx.moveTo(-cellW * 0.18, 0);
            ctx.lineTo(cellW * 0.18, 0);
            ctx.moveTo(0, -cellH * 0.18);
            ctx.lineTo(0, cellH * 0.18);
            ctx.stroke();
            ctx.restore();
          }
          if (dependencies.seededNoise(col, row, 8.2) > 0.82 - strength * 0.14) {
            ctx.save();
            ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.12 + strength * 0.08})`;
            ctx.beginPath();
            ctx.arc(x + cellW * 0.5, y + cellH * 0.5, Math.min(cellW, cellH) * (0.08 + strength * 0.06), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }
    
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08, 0.08, 0.14);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  marc chagall artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMarcChagall(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 360 + strength * 180 + turbo * 70);
      const count = Math.round(12 + strength * 24 + turbo * 16);
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, `rgba(${Math.round(dependencies.mix(38, soft.r, 0.18))}, ${Math.round(dependencies.mix(62, soft.g, 0.1))}, ${Math.round(dependencies.mix(110, soft.b, 0.08))}, 1)`);
      bg.addColorStop(1, `rgba(${Math.round(dependencies.mix(245, soft.r, 0.06))}, ${Math.round(dependencies.mix(236, soft.g, 0.06))}, ${Math.round(dependencies.mix(222, soft.b, 0.06))}, 1)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.24 + strength * 0.12, 0.2, 0.34);
      ctx.filter = `blur(${1.2 + strength * 3 + turbo * 0.4}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 1.2) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 1.9) * canvas.height;
        const w = canvas.width * (0.08 + dependencies.seededNoise(i, 3, 2.8) * (0.1 + strength * 0.08));
        const h = canvas.height * (0.06 + dependencies.seededNoise(i, 4, 3.7) * (0.11 + strength * 0.08));
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
        const base = { r: sampleSource.data[index], g: sampleSource.data[index + 1], b: sampleSource.data[index + 2] };
        const [hue, sat, lum] = dependencies.rgbToHsl(base.r, base.g, base.b);
        const anchorIndex = dependencies.getSampleSourceIndex(
          sampleSource,
          dependencies.clamp(Math.round(cx - w * 0.22), 0, canvas.width - 1),
          dependencies.clamp(Math.round(cy + h * 0.28), 0, canvas.height - 1)
        );
        const anchor = { r: sampleSource.data[anchorIndex], g: sampleSource.data[anchorIndex + 1], b: sampleSource.data[anchorIndex + 2] };
        let target = {
          r: dependencies.mix(base.r, soft.r, 0.08),
          g: dependencies.mix(base.g, accent.g, 0.06),
          b: dependencies.mix(base.b, soft.b, 0.08),
        };
        if (hue >= 180 && hue <= 260) target = { r: 58, g: 102, b: 188 };
        else if (hue >= 35 && hue <= 75) target = { r: 232, g: 192, b: 82 };
        else if (hue <= 20 || hue >= 330) target = { r: 196, g: 86, b: 108 };
        else if (lum < 0.28) target = { r: 35, g: 41, b: 84 };
        target = {
          r: dependencies.mix(dependencies.mix(base.r, anchor.r, 0.26 + turbo * 0.08), target.r, 0.34 + strength * 0.2),
          g: dependencies.mix(dependencies.mix(base.g, anchor.g, 0.26 + turbo * 0.08), target.g, 0.34 + strength * 0.2),
          b: dependencies.mix(dependencies.mix(base.b, anchor.b, 0.26 + turbo * 0.08), target.b, 0.34 + strength * 0.2),
        };
    
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((dependencies.seededNoise(i, 5, 4.5) - 0.5) * (0.8 + strength * 0.8));
        ctx.fillStyle = `rgba(${Math.round(target.r)}, ${Math.round(target.g)}, ${Math.round(target.b)}, ${0.18 + strength * 0.14})`;
        dependencies.drawOrganicBlobPath(ctx, 0, 0, w * 0.52, h * 0.52, 7, i + 41);
        ctx.fill();
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
        ctx.lineWidth = Math.max(1, (canvas.width / 780) * (1 + strength * 0.5));
        ctx.stroke();
        if (turbo > 0.08 && sat > 0.16) {
          ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(target.r, 255, 0.16))}, ${Math.round(dependencies.mix(target.g, 255, 0.12))}, ${Math.round(dependencies.mix(target.b, 255, 0.12))}, ${0.05 + turbo * 0.08})`;
          ctx.lineWidth = Math.max(0.4, ctx.lineWidth * 0.4);
          dependencies.drawOrganicBlobPath(ctx, 0, 0, w * 0.3, h * 0.3, 7, i + 71);
          ctx.stroke();
        }
        ctx.restore();
      }
    
      const moonX = canvas.width * (0.78 + dependencies.seededNoise(1, 1, 9.1) * 0.08);
      const moonY = canvas.height * (0.18 + dependencies.seededNoise(1, 2, 9.7) * 0.08);
      const moonR = Math.max(16, canvas.width * (0.028 + strength * 0.014));
      ctx.save();
      ctx.fillStyle = `rgba(246, 232, 169, ${0.14 + strength * 0.12})`;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08, 0.08, 0.18);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  kandinsky artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyKandinsky(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 360 + strength * 180 + turbo * 80);
      const count = Math.round(28 + strength * 54 + turbo * 32);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(245, 238, 224)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.12 + strength * 0.1, 0.1, 0.2);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 1.7) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 2.9) * canvas.height;
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
        const r = sampleSource.data[index];
        const g = sampleSource.data[index + 1];
        const b = sampleSource.data[index + 2];
        const [h, s, l] = dependencies.rgbToHsl(r, g, b);
        const radius = canvas.width * (0.014 + dependencies.seededNoise(i, 3, 3.4) * (0.04 + strength * 0.03));
        const gx = dependencies.getSampleSourceChannel(sampleSource, sx + 1, sy, 0) - dependencies.getSampleSourceChannel(sampleSource, sx - 1, sy, 0);
        const gy = dependencies.getSampleSourceChannel(sampleSource, sx, sy + 1, 0) - dependencies.getSampleSourceChannel(sampleSource, sx, sy - 1, 0);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.atan2(gy, gx) + (dependencies.seededNoise(i, 4, 4.2) - 0.5) * 1.2);
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.18 + strength * 0.16})`;
        ctx.lineWidth = Math.max(1, (canvas.width / 700) * (1 + strength * 0.8));
        ctx.beginPath();
        ctx.moveTo(-radius * 2.2, 0);
        ctx.lineTo(radius * 2.2, 0);
        ctx.moveTo(0, -radius * 2.2);
        ctx.lineTo(0, radius * 2.2);
        ctx.stroke();
        let target = { r: accent.r, g: soft.g, b: soft.b };
        if (h >= 180 && h <= 260) target = { r: 46, g: 88, b: 198 };
        else if (h >= 35 && h <= 80) target = { r: 242, g: 196, b: 52 };
        else if (h <= 20 || h >= 330) target = { r: 222, g: 70, b: 64 };
        else if (l < 0.28) target = { r: dark.r, g: dark.g, b: dark.b };
        const fillR = Math.round(dependencies.mix(r, target.r, 0.38 + strength * 0.18));
        const fillG = Math.round(dependencies.mix(g, target.g, 0.38 + strength * 0.18));
        const fillB = Math.round(dependencies.mix(b, target.b, 0.38 + strength * 0.18));
        ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.28 + strength * 0.18})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(fillR, 255, 0.12 + s * 0.12))}, ${Math.round(dependencies.mix(fillG, 255, 0.12 + s * 0.08))}, ${Math.round(dependencies.mix(fillB, 255, 0.12 + s * 0.08))}, ${0.22 + strength * 0.14})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius * (1.2 + dependencies.seededNoise(i, 5, 4.8) * 1.2), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08, 0.08, 0.18);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  malevich artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMalevich(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(10 + strength * 18 + turbo * 10);
      const palette = [
        { r: 17, g: 17, b: 17 },
        { r: 225, g: 50, b: 42 },
        { r: 36, g: 83, b: 208 },
        { r: 240, g: 198, b: 28 },
        { r: 247, g: 244, b: 234 },
      ];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(249,247,241)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.04 + strength * 0.05, 0.03, 0.1);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let i = 0; i < count; i += 1) {
        const w = canvas.width * (0.08 + dependencies.seededNoise(i, 1, 1.2) * (0.18 + strength * 0.1));
        const h = canvas.height * (0.05 + dependencies.seededNoise(i, 2, 1.9) * (0.16 + strength * 0.08));
        const x = dependencies.seededNoise(i, 3, 2.7) * (canvas.width - w);
        const y = dependencies.seededNoise(i, 4, 3.1) * (canvas.height - h);
        const sx = dependencies.clamp(Math.round(x + w * 0.5), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(y + h * 0.5), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
        const target = palette[Math.floor(dependencies.seededNoise(i, 6, 5.1) * palette.length)];
        const fill = {
          r: Math.round(dependencies.mix(base.r, target.r, 0.42 + strength * 0.24)),
          g: Math.round(dependencies.mix(base.g, target.g, 0.42 + strength * 0.24)),
          b: Math.round(dependencies.mix(base.b, target.b, 0.42 + strength * 0.24)),
        };
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((dependencies.seededNoise(i, 5, 4.3) - 0.5) * (0.6 + strength * 0.4));
        ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.34 + strength * 0.18})`;
        if (dependencies.seededNoise(i, 7, 6.2) > 0.72) {
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(w, h) * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-w / 2, -h / 2, w, h);
        }
        ctx.restore();
      }
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + strength * 0.1})`;
      ctx.lineWidth = Math.max(1, (canvas.width / 900) * (1 + strength * 0.6));
      ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.12 + strength * 0.08, 0.1, 0.22);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  sonia delaunay artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applySoniaDelaunay(canvas, amount, accent, soft) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(12 + strength * 18 + turbo * 10);
      const palette = [
        { r: 249, g: 65, b: 68 },
        { r: 249, g: 199, b: 79 },
        { r: 39, g: 125, b: 161 },
        { r: 144, g: 190, b: 109 },
        { r: 249, g: 132, b: 74 },
        { r: 87, g: 117, b: 144 },
      ];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(244, soft.r, 0.08))}, ${Math.round(dependencies.mix(238, soft.g, 0.08))}, ${Math.round(dependencies.mix(231, soft.b, 0.08))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08, 0.06, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 0.9) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 1.7) * canvas.height;
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
        const radius = canvas.width * (0.05 + dependencies.seededNoise(i, 3, 2.4) * (0.16 + strength * 0.08));
        const bands = Math.round(4 + strength * 4 + turbo * 2);
        for (let b = 0; b < bands; b += 1) {
          const start = dependencies.seededNoise(i, b, 3.6) * Math.PI * 2;
          const end = start + Math.PI * (0.5 + dependencies.seededNoise(i, b + 1, 4.2) * 0.9);
          const target = palette[(i + b) % palette.length];
          const fill = {
            r: Math.round(dependencies.mix(base.r, target.r, 0.38 + strength * 0.2)),
            g: Math.round(dependencies.mix(base.g, target.g, 0.38 + strength * 0.2)),
            b: Math.round(dependencies.mix(base.b, target.b, 0.38 + strength * 0.2)),
          };
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius * (1 - b / (bands + 1)), start, end);
          ctx.closePath();
          ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.18 + strength * 0.16})`;
          ctx.fill();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08, 0.08, 0.18);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  robert delaunay artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyRobertDelaunay(canvas, amount, accent, soft) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(10 + strength * 16 + turbo * 8);
      const palette = [
        { r: 255, g: 204, b: 41 },
        { r: 36, g: 80, b: 216 },
        { r: 232, g: 71, b: 73 },
        { r: 31, g: 158, b: 137 },
        { r: 247, g: 243, b: 232 },
      ];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(250, soft.r, 0.05))}, ${Math.round(dependencies.mix(246, accent.g, 0.03))}, ${Math.round(dependencies.mix(239, soft.b, 0.06))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 1.1) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 1.8) * canvas.height;
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
        const radius = canvas.width * (0.06 + dependencies.seededNoise(i, 3, 2.6) * (0.14 + strength * 0.06));
        const rings = Math.round(4 + strength * 3 + turbo * 2);
        for (let r = rings; r >= 1; r -= 1) {
          const target = palette[(i + r) % palette.length];
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(base.r, target.r, 0.4 + strength * 0.2))}, ${Math.round(dependencies.mix(base.g, target.g, 0.4 + strength * 0.2))}, ${Math.round(dependencies.mix(base.b, target.b, 0.4 + strength * 0.2))}, ${0.18 + strength * 0.16})`;
          ctx.beginPath();
          ctx.arc(cx, cy, radius * (r / rings), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08, 0.06, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  cezanne artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyCezanne(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(6, Math.round(20 - strength * 6 - turbo * 3));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(241, 233, 220)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          ctx.save();
          ctx.translate(x + step / 2, y + step / 2);
          ctx.rotate((dependencies.seededNoise(x, y, 0.9) - 0.5) * (0.45 + strength * 0.24));
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, accent.r, 0.05))}, ${Math.round(dependencies.mix(g, soft.g, 0.08))}, ${Math.round(dependencies.mix(b, dark.b, 0.03))}, ${0.34 + strength * 0.18})`;
          ctx.fillRect(-step * 0.65, -step * 0.24, step * 1.3, step * 0.48);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  braque artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyBraque(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(7, Math.round(7 + strength * 9 + turbo * 12));
      const rows = Math.max(7, Math.round(7 + strength * 9 + turbo * 12));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(226, 214, 194)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const sx = dependencies.clamp(Math.round((col + 0.5) * cellW), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round((row + 0.5) * cellH), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
          const tone = dependencies.clamp(gray * (0.78 + strength * 0.08), 30, 220);
          const x = col * cellW;
          const y = row * cellH;
          const contrast = Math.abs(
            gray
            - ((dependencies.getPixelChannel(sample, canvas.width, canvas.height, sx + Math.max(1, Math.round(cellW * 0.25)), sy, 0)
              + dependencies.getPixelChannel(sample, canvas.width, canvas.height, sx - Math.max(1, Math.round(cellW * 0.25)), sy, 0)
              + dependencies.getPixelChannel(sample, canvas.width, canvas.height, sx, sy + Math.max(1, Math.round(cellH * 0.25)), 0)
              + dependencies.getPixelChannel(sample, canvas.width, canvas.height, sx, sy - Math.max(1, Math.round(cellH * 0.25)), 0)) / 4)
          );
          ctx.save();
          ctx.translate(x + cellW / 2, y + cellH / 2);
          ctx.rotate((dependencies.seededNoise(col, row, 2.2) - 0.5) * (0.26 + strength * 0.18 + turbo * 0.08));
          ctx.fillStyle = `rgba(${tone}, ${tone * 0.95}, ${tone * 0.82}, ${0.26 + strength * 0.16})`;
          ctx.beginPath();
          ctx.moveTo(-cellW * (0.42 + contrast / 700), -cellH * 0.14);
          ctx.lineTo(cellW * 0.08, -cellH * (0.4 + contrast / 1200));
          ctx.lineTo(cellW * (0.42 + contrast / 900), cellH * 0.08);
          ctx.lineTo(-cellW * 0.08, cellH * (0.38 + contrast / 1200));
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
          ctx.lineWidth = Math.max(0.45, (canvas.width / 1400) * (0.6 + strength * 0.5 + turbo * 0.25));
          ctx.stroke();
          if (turbo > 0.15 && contrast > 18) {
            ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.05 + turbo * 0.08})`;
            ctx.beginPath();
            ctx.moveTo(-cellW * 0.18, -cellH * 0.08);
            ctx.lineTo(cellW * 0.16, cellH * 0.1);
            ctx.moveTo(cellW * 0.05, -cellH * 0.18);
            ctx.lineTo(-cellW * 0.14, cellH * 0.16);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08 + turbo * 0.04, 0.08, 0.22);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  franz marc artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyFranzMarc(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(26 + strength * 46 + turbo * 20);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(234, 231, 220)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 1.3) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 2.1) * canvas.height;
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const [h] = dependencies.rgbToHsl(sample[index], sample[index + 1], sample[index + 2]);
        let fill = { r: 50, g: 96, b: 194 };
        if (h >= 35 && h <= 80) fill = { r: 236, g: 194, b: 42 };
        else if (h <= 20 || h >= 330) fill = { r: 217, g: 78, b: 66 };
        else if (h >= 100 && h <= 180) fill = { r: 108, g: 168, b: 88 };
        const size = canvas.width * (0.02 + dependencies.seededNoise(i, 3, 3.7) * (0.08 + strength * 0.04));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((dependencies.seededNoise(i, 4, 4.6) - 0.5) * Math.PI);
        ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.28 + strength * 0.18})`;
        ctx.beginPath();
        ctx.moveTo(-size, size * 0.2);
        ctx.lineTo(0, -size);
        ctx.lineTo(size, size * 0.15);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08, 0.08, 0.16);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  schiele artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applySchiele(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(2, Math.round(14 - strength * 5 - turbo * 5));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(246, 238, 226)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.14 + strength * 0.08 + turbo * 0.04, 0.12, 0.26);
      ctx.filter = `blur(${0.35 + strength * 0.7 + turbo * 0.35}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(dependencies.mix(dark.g, 86, 0.22))}, ${Math.round(dependencies.mix(dark.b, 70, 0.18))}, ${0.22 + strength * 0.18})`;
      ctx.lineCap = "round";
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const gx = dependencies.getPixelChannel(sample, canvas.width, canvas.height, x + 1, y, 0) - dependencies.getPixelChannel(sample, canvas.width, canvas.height, x - 1, y, 0);
          const gy = dependencies.getPixelChannel(sample, canvas.width, canvas.height, x, y + 1, 0) - dependencies.getPixelChannel(sample, canvas.width, canvas.height, x, y - 1, 0);
          const mag = Math.abs(gx) + Math.abs(gy);
          if (mag < 46 + (1 - strength) * 26 - turbo * 8) continue;
          ctx.lineWidth = Math.max(0.55, (canvas.width / 1000) * (0.9 + strength * 1.1 + turbo * 0.5));
          const angle = Math.atan2(gy, gx) + Math.PI / 2;
          const len = step * (1.15 + dependencies.seededNoise(x, y, 6.1) * (0.9 + turbo * 0.35));
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(angle) * len * 0.5, y - Math.sin(angle) * len * 0.5);
          ctx.lineTo(x + Math.cos(angle) * len * 0.5, y + Math.sin(angle) * len * 0.5);
          ctx.stroke();
          if (turbo > 0.18 && mag > 90) {
            ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(dependencies.mix(dark.g, 102, 0.24))}, ${Math.round(dependencies.mix(dark.b, 84, 0.2))}, ${0.08 + turbo * 0.12})`;
            ctx.lineWidth = Math.max(0.35, ctx.lineWidth * 0.45);
            ctx.beginPath();
            ctx.moveTo(x - Math.cos(angle) * len * 0.22, y - Math.sin(angle) * len * 0.22);
            ctx.lineTo(x + Math.cos(angle) * len * 0.28, y + Math.sin(angle) * len * 0.28);
            ctx.stroke();
            ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(dependencies.mix(dark.g, 86, 0.22))}, ${Math.round(dependencies.mix(dark.b, 70, 0.18))}, ${0.22 + strength * 0.18})`;
          }
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.05 + turbo * 0.06, 0.03, 0.12);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  matisse artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMatisse(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(18 + strength * 34 + turbo * 18);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(245, 240, 230)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 0.8) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 1.4) * canvas.height;
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const r = sample[index];
        const g = sample[index + 1];
        const b = sample[index + 2];
        const rx = canvas.width * (0.03 + dependencies.seededNoise(i, 3, 2.2) * (0.08 + strength * 0.04));
        const ry = canvas.height * (0.03 + dependencies.seededNoise(i, 4, 2.9) * (0.08 + strength * 0.04));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((dependencies.seededNoise(i, 5, 3.6) - 0.5) * 0.7);
        dependencies.drawOrganicBlobPath(ctx, 0, 0, rx, ry, 7, i + 90);
        ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, accent.r, 0.12))}, ${Math.round(dependencies.mix(g, soft.g, 0.12))}, ${Math.round(dependencies.mix(b, soft.b, 0.12))}, ${0.3 + strength * 0.18})`;
        ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
    }
    
    /** Renders the  miro artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMiro(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(18 + strength * 30 + turbo * 18);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(247, 243, 232)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.05 + strength * 0.05, 0.04, 0.1);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.lineCap = "round";
      for (let i = 0; i < count; i += 1) {
        const x = dependencies.seededNoise(i, 1, 1.7) * canvas.width;
        const y = dependencies.seededNoise(i, 2, 2.4) * canvas.height;
        const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const r = sample[index];
        const g = sample[index + 1];
        const b = sample[index + 2];
        const size = canvas.width * (0.01 + dependencies.seededNoise(i, 3, 3.1) * (0.04 + strength * 0.02));
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.16 + strength * 0.16})`;
        ctx.lineWidth = Math.max(1, (canvas.width / 900) * (1 + strength * 0.8));
        ctx.beginPath();
        ctx.moveTo(x - size * 1.8, y + size * 1.4);
        ctx.quadraticCurveTo(x, y - size * 1.4, x + size * 2.1, y + size * 0.8);
        ctx.stroke();
        const [hue] = dependencies.rgbToHsl(r, g, b);
        let target = { r: 215, g: 38, b: 56 };
        if (hue >= 180 && hue <= 260) target = { r: 32, g: 85, b: 214 };
        else if (hue >= 35 && hue <= 75) target = { r: 240, g: 196, b: 25 };
        else if (dependencies.seededNoise(i, 5, 4.8) > 0.76) target = { r: 17, g: 17, b: 17 };
        ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, target.r, 0.42 + strength * 0.16))}, ${Math.round(dependencies.mix(g, target.g, 0.42 + strength * 0.16))}, ${Math.round(dependencies.mix(b, target.b, 0.42 + strength * 0.16))}, ${0.28 + strength * 0.18})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08, 0.06, 0.16);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  pollock artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyPollock(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 340 + strength * 160 + turbo * 80);
      const count = Math.round(56 + strength * 116 + turbo * 90);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.32 + strength * 0.14, 0.28, 0.46);
      ctx.filter = `blur(${0.25 + strength * 0.7}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.lineCap = "round";
      for (let i = 0; i < count; i += 1) {
        const x0 = dependencies.seededNoise(i, 3, 4.1) * canvas.width;
        const y0 = dependencies.seededNoise(i, 4, 4.7) * canvas.height;
        const sx = dependencies.clamp(Math.round(x0), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(y0), 0, canvas.height - 1);
        const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
        const r = sampleSource.data[index];
        const g = sampleSource.data[index + 1];
        const b = sampleSource.data[index + 2];
        const [h, s, l] = dependencies.rgbToHsl(r, g, b);
        let target = { r: accent.r, g: accent.g, b: accent.b };
        if (h >= 180 && h <= 260) target = { r: 60, g: 84, b: 168 };
        else if (h >= 35 && h <= 80) target = { r: 245, g: 233, b: 181 };
        else if (l < 0.28) target = { r: dark.r, g: dark.g, b: dark.b };
        else target = { r: soft.r, g: soft.g, b: soft.b };
        ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(r, target.r, 0.52 + strength * 0.18))}, ${Math.round(dependencies.mix(g, target.g, 0.52 + strength * 0.18))}, ${Math.round(dependencies.mix(b, target.b, 0.52 + strength * 0.18))}, ${0.12 + strength * 0.08 + s * 0.07})`;
        ctx.lineWidth = Math.max(0.5, (canvas.width / 1400) * (0.7 + dependencies.seededNoise(i, 2, 3.1) * 3.2 + strength * 1.5));
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        for (let s = 1; s <= 4; s += 1) {
          const px = dependencies.seededNoise(i, s + 4, 5.2) * canvas.width;
          const py = dependencies.seededNoise(i, s + 9, 6.1) * canvas.height;
          const psx = dependencies.clamp(Math.round(px), 0, canvas.width - 1);
          const psy = dependencies.clamp(Math.round(py), 0, canvas.height - 1);
          const pIndex = dependencies.getSampleSourceIndex(sampleSource, psx, psy);
          const luminance = (sampleSource.data[pIndex] + sampleSource.data[pIndex + 1] + sampleSource.data[pIndex + 2]) / (255 * 3);
          const drift = (luminance - 0.5) * canvas.height * 0.03;
          ctx.lineTo(px, py + drift);
        }
        ctx.stroke();
        if (turbo > 0.12 && dependencies.seededNoise(i, 12, 8.1) > 0.62) {
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, target.r, 0.54))}, ${Math.round(dependencies.mix(g, target.g, 0.54))}, ${Math.round(dependencies.mix(b, target.b, 0.54))}, ${0.08 + turbo * 0.08})`;
          ctx.beginPath();
          ctx.arc(x0, y0, Math.max(0.8, ctx.lineWidth * (0.7 + dependencies.seededNoise(i, 13, 8.7) * 1.8)), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.16 + strength * 0.1, 0.12, 0.24);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  lichtenstein artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyLichtenstein(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 320 + strength * 180 + turbo * 120);
      const block = Math.max(4, Math.round(22 - strength * 8 - turbo * 8));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(248, 242, 230)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += block) {
        for (let x = 0; x < canvas.width; x += block) {
          const sx = dependencies.clamp(Math.round(x + block / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + block / 2), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const [h, s, l] = dependencies.rgbToHsl(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]);
          let color = { r: 255, g: 239, b: 220 };
          if (h >= 180 && h <= 260) color = { r: 34, g: 82, b: 212 };
          else if (h <= 20 || h >= 330) color = { r: 225, g: 54, b: 64 };
          else if (h >= 35 && h <= 75) color = { r: 243, g: 201, b: 31 };
          else if (l < 0.28) color = { r: 22, g: 22, b: 22 };
          const fillR = Math.round(dependencies.mix(sampleSource.data[index], color.r, 0.52 + strength * 0.16 + turbo * 0.08));
          const fillG = Math.round(dependencies.mix(sampleSource.data[index + 1], color.g, 0.52 + strength * 0.16 + turbo * 0.08));
          const fillB = Math.round(dependencies.mix(sampleSource.data[index + 2], color.b, 0.52 + strength * 0.16 + turbo * 0.08));
          ctx.fillStyle = `rgb(${fillR},${fillG},${fillB})`;
          ctx.fillRect(x, y, block, block);
          ctx.fillStyle = `rgba(255,255,255,${0.18 + strength * 0.08})`;
          ctx.beginPath();
          ctx.arc(x + block * 0.5, y + block * 0.5, block * (0.08 + strength * 0.025 + turbo * 0.015), 0, Math.PI * 2);
          ctx.fill();
          if (turbo > 0.12 && s > 0.18) {
            ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.04 + turbo * 0.06})`;
            ctx.beginPath();
            ctx.arc(x + block * 0.24, y + block * 0.24, Math.max(0.7, block * (0.035 + turbo * 0.01)), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.18 + strength * 0.16})`;
      ctx.lineWidth = Math.max(0.7, block * 0.08);
      for (let y = 0; y < canvas.height; y += block) {
        for (let x = 0; x < canvas.width; x += block) {
          ctx.strokeRect(x, y, block, block);
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.05 + turbo * 0.06, 0.03, 0.12);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  hokusai artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyHokusai(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(240, 243, 240)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08, 0.08, 0.18);
      ctx.filter = `blur(${0.3 + strength * 0.6}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let y = 0; y < canvas.height; y += 8) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 10) {
          const sx = dependencies.clamp(x, 0, canvas.width - 1);
          const sy = dependencies.clamp(y, 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const blueBias = sample[index + 2] / 255;
          const grayBias = (sample[index] + sample[index + 1] + sample[index + 2]) / (255 * 3);
          const offset = Math.sin((x / canvas.width) * Math.PI * (3 + strength * 3)) * (4 + strength * 10) * blueBias;
          const yPos = y + offset - grayBias * (2 + strength * 5);
          if (x === 0) ctx.moveTo(x, yPos);
          else ctx.lineTo(x, yPos);
        }
        const rowSampleIndex = (dependencies.clamp(y, 0, canvas.height - 1) * canvas.width + Math.floor(canvas.width * 0.5)) * 4;
        const rr = sample[rowSampleIndex];
        const rg = sample[rowSampleIndex + 1];
        const rb = sample[rowSampleIndex + 2];
        ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(rr, 46, 0.46 + strength * 0.18))}, ${Math.round(dependencies.mix(rg, 92, 0.42 + strength * 0.18))}, ${Math.round(dependencies.mix(rb, 178, 0.52 + strength * 0.18))}, ${0.12 + strength * 0.12})`;
        ctx.lineWidth = Math.max(0.8, (canvas.width / 1100) * (1 + strength * 0.6));
        ctx.stroke();
        if (turbo > 0.12 && y % 24 === 0) {
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += 16) {
            const crest = Math.sin((x / canvas.width) * Math.PI * (4 + turbo * 2)) * (6 + turbo * 10);
            const foamY = y + crest - 8;
            if (x === 0) ctx.moveTo(x, foamY);
            else ctx.lineTo(x, foamY);
          }
          ctx.strokeStyle = `rgba(245, 248, 252, ${0.04 + turbo * 0.08})`;
          ctx.lineWidth = Math.max(0.5, (canvas.width / 1600) * (0.8 + turbo * 0.6));
          ctx.stroke();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.16 + strength * 0.12, 0.14, 0.28);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.1 + strength * 0.08})`;
      ctx.strokeRect(canvas.width * 0.03, canvas.height * 0.03, canvas.width * 0.94, canvas.height * 0.94);
    }
    
    /** Renders the  escher artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyEscher(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const tile = Math.max(12, Math.round(28 - strength * 8 - turbo * 5));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(244, 243, 237)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height + tile; y += tile) {
        for (let x = 0; x < canvas.width + tile; x += tile) {
          const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const gray = Math.round((sample[index] + sample[index + 1] + sample[index + 2]) / 3);
          let tone = 74;
          let color = {
            r: Math.round(dependencies.mix(sample[index], 78, 0.46)),
            g: Math.round(dependencies.mix(sample[index + 1], 78, 0.46)),
            b: Math.round(dependencies.mix(sample[index + 2], 78, 0.46)),
          };
          if (gray > 140) {
            tone = 236;
            color = {
              r: Math.round(dependencies.mix(sample[index], 242, 0.4)),
              g: Math.round(dependencies.mix(sample[index + 1], 242, 0.4)),
              b: Math.round(dependencies.mix(sample[index + 2], 242, 0.4)),
            };
          }
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.42 + strength * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(x, y - tile * 0.5);
          ctx.lineTo(x + tile * 0.5, y);
          ctx.lineTo(x, y + tile * 0.5);
          ctx.lineTo(x - tile * 0.5, y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.12})`;
          ctx.stroke();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.06, 0.06, 0.14);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  klimt artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyKlimt(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(52 + strength * 98 + turbo * 72);
      const gold = { r: 214, g: 174, b: 58 };
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(231, 211, 133)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.24 + strength * 0.14, 0.2, 0.38);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let i = 0; i < count; i += 1) {
        const x = dependencies.seededNoise(i, 1, 1.1) * canvas.width;
        const y = dependencies.seededNoise(i, 2, 1.9) * canvas.height;
        const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const r = sample[index];
        const g = sample[index + 1];
        const b = sample[index + 2];
        const [h, s, l] = dependencies.rgbToHsl(r, g, b);
        const size = canvas.width * (0.004 + dependencies.seededNoise(i, 3, 2.8) * (0.012 + strength * 0.006));
        let target = gold;
        if (l < 0.28) target = { r: 82, g: 60, b: 28 };
        if (h <= 20 || h >= 330) target = { r: 178, g: 70, b: 82 };
        if (h >= 35 && h <= 80) target = { r: 236, g: 202, b: 84 };
        const fillR = Math.round(dependencies.mix(r, target.r, 0.58 + strength * 0.18));
        const fillG = Math.round(dependencies.mix(g, target.g, 0.58 + strength * 0.18));
        const fillB = Math.round(dependencies.mix(b, target.b, 0.58 + strength * 0.18));
        ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.18 + strength * 0.14 + s * 0.04})`;
        if (dependencies.seededNoise(i, 4, 3.5) > 0.52) {
          ctx.fillRect(x, y, size, size);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        if (turbo > 0.08 && dependencies.seededNoise(i, 5, 4.2) > 0.7) {
          ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(fillR, 255, 0.12))}, ${Math.round(dependencies.mix(fillG, 255, 0.1))}, ${Math.round(dependencies.mix(fillB, 255, 0.08))}, ${0.04 + turbo * 0.05})`;
          ctx.lineWidth = Math.max(0.35, size * 0.18);
          ctx.strokeRect(x - size * 0.3, y - size * 0.3, size * 1.2, size * 1.2);
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.16 + strength * 0.1, 0.12, 0.24);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
      ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9);
    }
    
    /** Renders the  hilma af klint artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyHilmaAfKlint(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const count = Math.round(12 + strength * 18 + turbo * 10);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(244, 238, 229)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08, 0.06, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let i = 0; i < count; i += 1) {
        const cx = dependencies.seededNoise(i, 1, 0.7) * canvas.width;
        const cy = dependencies.seededNoise(i, 2, 1.3) * canvas.height;
        const sx = dependencies.clamp(Math.round(cx), 0, canvas.width - 1);
        const sy = dependencies.clamp(Math.round(cy), 0, canvas.height - 1);
        const index = (sy * canvas.width + sx) * 4;
        const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
        const radius = canvas.width * (0.03 + dependencies.seededNoise(i, 3, 2.1) * (0.08 + strength * 0.04));
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + strength * 0.1})`;
        ctx.lineWidth = Math.max(1, (canvas.width / 900) * (1 + strength * 0.5));
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 4; a += 0.2) {
          const rr = (a / (Math.PI * 4)) * radius;
          const px = cx + Math.cos(a) * rr;
          const py = cy + Math.sin(a) * rr;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = `rgba(${Math.round(dependencies.mix(base.r, dependencies.mix(accent.r, 255, 0.38), 0.42 + strength * 0.16))}, ${Math.round(dependencies.mix(base.g, dependencies.mix(soft.g, 255, 0.22), 0.42 + strength * 0.16))}, ${Math.round(dependencies.mix(base.b, dependencies.mix(soft.b, 255, 0.18), 0.42 + strength * 0.16))}, ${0.14 + strength * 0.1})`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08, 0.08, 0.18);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  kusama artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyKusama(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const spacing = Math.max(6, Math.round(26 - strength * 8 - turbo * 8));
      const dotScale = 0.18 + strength * 0.16 + turbo * 0.08;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(246, soft.r, 0.06))}, ${Math.round(dependencies.mix(238, soft.g, 0.06))}, ${Math.round(dependencies.mix(230, soft.b, 0.06))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.22 + strength * 0.14, 0.18, 0.36);
      ctx.filter = `blur(${0.4 + strength * 0.8 + turbo * 0.3}px) saturate(${1.04 + strength * 0.1})`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    
      for (let y = spacing / 2; y < canvas.height; y += spacing) {
        for (let x = spacing / 2; x < canvas.width; x += spacing) {
          const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          const [h, s, l] = dependencies.rgbToHsl(r, g, b);
          const radius = Math.max(
            1.2,
            spacing * (dotScale * (0.55 + s * 0.45) + l * 0.03 + dependencies.seededNoise(x, y, 1.7) * 0.09),
          );
          let target = { r: accent.r, g: accent.g, b: accent.b };
          if (h >= 180 && h <= 260) target = { r: 54, g: 86, b: 208 };
          else if (h >= 35 && h <= 80) target = { r: 242, g: 196, b: 38 };
          else if (h <= 20 || h >= 330) target = { r: 224, g: 58, b: 76 };
          else if (l < 0.26) target = { r: dark.r, g: dark.g, b: dark.b };
          else if (dependencies.seededNoise(x, y, 2.4) > 0.68) target = { r: 248, g: 248, b: 248 };
    
          const fillR = Math.round(dependencies.mix(r, target.r, 0.48 + strength * 0.18 + turbo * 0.06));
          const fillG = Math.round(dependencies.mix(g, target.g, 0.48 + strength * 0.18 + turbo * 0.06));
          const fillB = Math.round(dependencies.mix(b, target.b, 0.48 + strength * 0.18 + turbo * 0.06));
          const jitterX = (dependencies.seededNoise(x, y, 3.3) - 0.5) * spacing * (0.14 + turbo * 0.04);
          const jitterY = (dependencies.seededNoise(x, y, 4.1) - 0.5) * spacing * (0.14 + turbo * 0.04);
    
          ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.24 + strength * 0.16})`;
          ctx.beginPath();
          ctx.arc(x + jitterX, y + jitterY, radius, 0, Math.PI * 2);
          ctx.fill();
    
          if (turbo > 0.08) {
            ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(fillR, 255, 0.14))}, ${Math.round(dependencies.mix(fillG, 255, 0.14))}, ${Math.round(dependencies.mix(fillB, 255, 0.14))}, ${0.08 + turbo * 0.08})`;
            ctx.lineWidth = Math.max(0.35, radius * 0.16);
            ctx.beginPath();
            ctx.arc(x + jitterX, y + jitterY, radius * (0.56 + turbo * 0.08), 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08, 0.06, 0.16);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  gerhard richter artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyGerhardRichter(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(10, Math.round(12 + strength * 10 + turbo * 14));
      const rows = Math.max(14, Math.round(16 + strength * 12 + turbo * 16));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(246, 243, 236)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellW;
          const y = row * cellH;
          const sx = dependencies.clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          const [h, s, l] = dependencies.rgbToHsl(r, g, b);
          let target = { r, g, b };
          if (s < 0.18) {
            target = { r: 232, g: 228, b: 220 };
            if (l < 0.3) target = { r: dark.r, g: dark.g, b: dark.b };
            if (h <= 20 || h >= 330) target = { r: 214, g: 72, b: 86 };
            if (h >= 35 && h <= 80) target = { r: 236, g: 198, b: 54 };
            if (h >= 180 && h <= 260) target = { r: 58, g: 108, b: 214 };
          }
          const mixAmt = 0.42 + strength * 0.2 + turbo * 0.08;
          const fillR = Math.round(dependencies.mix(r, target.r, mixAmt));
          const fillG = Math.round(dependencies.mix(g, target.g, mixAmt));
          const fillB = Math.round(dependencies.mix(b, target.b, mixAmt));
          const inset = Math.max(0.5, Math.min(cellW, cellH) * (0.08 + dependencies.seededNoise(col, row, 2.7) * 0.08));
          ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.42 + strength * 0.18})`;
          ctx.fillRect(x + inset, y + inset, Math.max(1, cellW - inset * 2), Math.max(1, cellH - inset * 2));
          ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(fillR, 255, 0.08))}, ${Math.round(dependencies.mix(fillG, 255, 0.08))}, ${Math.round(dependencies.mix(fillB, 255, 0.08))}, ${0.08 + strength * 0.08})`;
          ctx.lineWidth = Math.max(0.4, Math.min(cellW, cellH) * 0.08);
          ctx.strokeRect(x + inset, y + inset, Math.max(1, cellW - inset * 2), Math.max(1, cellH - inset * 2));
        }
      }
    
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08, 0.08, 0.18);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  monet artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMonet(canvas, amount, soft) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(6, Math.round(22 - strength * 7 - turbo * 4));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(246, soft.r, 0.08))}, ${Math.round(dependencies.mix(240, soft.g, 0.08))}, ${Math.round(dependencies.mix(232, soft.b, 0.08))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          ctx.save();
          ctx.translate(x + step / 2, y + step / 2);
          ctx.rotate((dependencies.seededNoise(x, y, 1.7) - 0.5) * 0.8);
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, 244, 0.08 + strength * 0.08))}, ${Math.round(dependencies.mix(g, soft.g, 0.12 + strength * 0.12))}, ${Math.round(dependencies.mix(b, soft.b, 0.12 + strength * 0.12))}, ${0.34 + strength * 0.16})`;
          ctx.fillRect(-step * 0.72, -step * 0.18, step * 1.44, step * 0.36);
          ctx.restore();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.12 + strength * 0.08, 0.1, 0.22);
      ctx.filter = `blur(${0.5 + strength * 1.2 + turbo * 0.3}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    
    /** Renders the  picasso artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyPicasso(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 320 + strength * 160 + turbo * 120);
      const cols = Math.max(3, Math.round(5 + strength * 3 - turbo * 1.2));
      const rows = Math.max(3, Math.round(5 + strength * 3 - turbo * 1.2));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(239,232,220)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.12 + strength * 0.08 - turbo * 0.02, 0.06, 0.2);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      const points = [];
      for (let row = 0; row <= rows; row += 1) {
        points[row] = [];
        for (let col = 0; col <= cols; col += 1) {
          const edgeX = col === 0 || col === cols;
          const edgeY = row === 0 || row === rows;
          let jitterX = (dependencies.seededNoise(col, row, 1.1) - 0.5) * cellW * (0.9 + strength * 0.7 + turbo * 0.24);
          let jitterY = (dependencies.seededNoise(col, row, 2.3) - 0.5) * cellH * (0.9 + strength * 0.7 + turbo * 0.24);
          if (edgeX) jitterX = 0;
          if (edgeY) jitterY = 0;
          points[row][col] = {
            x: dependencies.clamp(col * cellW + jitterX, 0, canvas.width),
            y: dependencies.clamp(row * cellH + jitterY, 0, canvas.height),
          };
        }
      }
    
      const drawFacet = (vertices, row, col, variant = 0) => {
        let cx = 0;
        let cy = 0;
        for (const point of vertices) {
          cx += point.x;
          cy += point.y;
        }
        cx /= vertices.length;
        cy /= vertices.length;
        const r = dependencies.getSampleSourceChannel(sampleSource, cx, cy, 0);
        const g = dependencies.getSampleSourceChannel(sampleSource, cx, cy, 1);
        const b = dependencies.getSampleSourceChannel(sampleSource, cx, cy, 2);
        let warmTarget = { r: 186, g: 164, b: 138 };
        if (dependencies.seededNoise(col + variant * 0.2, row + variant * 0.3, 5.6) > 0.56) {
          warmTarget = { r: 224, g: 204, b: 168 };
        }
        if (dependencies.seededNoise(col + variant * 0.4, row + variant * 0.3, 2.8) > 0.52) {
          warmTarget = { r: accent.r, g: soft.g, b: soft.b };
        }
        const blend = dependencies.clamp(0.26 + strength * 0.18 + turbo * 0.08 + variant * 0.03, 0, 0.9);
        ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, warmTarget.r, blend))}, ${Math.round(dependencies.mix(g, warmTarget.g, blend))}, ${Math.round(dependencies.mix(b, warmTarget.b, blend))}, ${0.3 + strength * 0.16 + turbo * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i += 1) ctx.lineTo(vertices[i].x, vertices[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + strength * 0.08 + turbo * 0.04})`;
        ctx.lineWidth = Math.max(0.75, Math.min(cellW, cellH) * (0.026 + turbo * 0.01));
        ctx.stroke();
      };
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const p00 = points[row][col];
          const p10 = points[row][col + 1];
          const p01 = points[row + 1][col];
          const p11 = points[row + 1][col + 1];
          const mx = (p00.x + p10.x + p01.x + p11.x) * 0.25 + (dependencies.seededNoise(col, row, 7.7) - 0.5) * cellW * 0.16;
          const my = (p00.y + p10.y + p01.y + p11.y) * 0.25 + (dependencies.seededNoise(col, row, 8.8) - 0.5) * cellH * 0.16;
          const mid = { x: mx, y: my };
          const mode = dependencies.seededNoise(col, row, 4.1);
          if (mode > 0.66) {
            drawFacet([p00, p10, mid], row, col, 0);
            drawFacet([p00, mid, p01], row, col, 1);
            drawFacet([p10, p11, mid], row, col, 2);
            drawFacet([p01, mid, p11], row, col, 3);
          } else if (mode > 0.33) {
            drawFacet([p00, p10, p11, mid], row, col, 0);
            drawFacet([p00, mid, p01], row, col, 1);
          } else {
            drawFacet([p00, p10, mid], row, col, 0);
            drawFacet([p00, mid, p01, p11], row, col, 1);
          }
    
          if (strength > 0.22) {
            const innerLines = 1 + Math.min(5, Math.floor(strength * 3 + turbo * 2.5));
            ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.07 + turbo * 0.04})`;
            ctx.lineWidth = Math.max(0.45, Math.min(cellW, cellH) * (0.01 + turbo * 0.004));
            for (let i = 0; i < innerLines; i += 1) {
              const t = (i + 1) / (innerLines + 1);
              const ax = dependencies.mix(p00.x, p11.x, t) + (dependencies.seededNoise(col + i, row, 11.1) - 0.5) * cellW * 0.14;
              const ay = dependencies.mix(p00.y, p11.y, t) + (dependencies.seededNoise(col, row + i, 12.2) - 0.5) * cellH * 0.14;
              const bx = dependencies.mix(p10.x, p01.x, t) + (dependencies.seededNoise(col + i, row, 13.3) - 0.5) * cellW * 0.14;
              const by = dependencies.mix(p10.y, p01.y, t) + (dependencies.seededNoise(col, row + i, 14.4) - 0.5) * cellH * 0.14;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(bx, by);
              ctx.stroke();
            }
          }
        }
      }
    }
    
    /** Renders the  otto dix artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyOttoDix(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 360 + strength * 180 + turbo * 100);
      const step = Math.max(2, Math.round(12 - strength * 4 - turbo * 5));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(238,228,214)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.16 + strength * 0.08 + turbo * 0.03, 0.14, 0.3);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.lineCap = "round";
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const gx = dependencies.getSampleSourceChannel(sampleSource, x + 1, y, 0) - dependencies.getSampleSourceChannel(sampleSource, x - 1, y, 0);
          const gy = dependencies.getSampleSourceChannel(sampleSource, x, y + 1, 0) - dependencies.getSampleSourceChannel(sampleSource, x, y - 1, 0);
          const mag = Math.abs(gx) + Math.abs(gy);
          if (mag < 42 + (1 - strength) * 24 - turbo * 16) continue;
          const angle = Math.atan2(gy, gx) + Math.PI / 2;
          const len = step * (1.3 + dependencies.seededNoise(x, y, 2.2) * 1.1 + turbo * 0.22);
          ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(dependencies.mix(dark.g, 78, 0.24))}, ${Math.round(dependencies.mix(dark.b, 62, 0.2))}, ${0.18 + strength * 0.16 + turbo * 0.05})`;
          ctx.lineWidth = Math.max(0.5, (canvas.width / 1200) * (0.9 + strength * 1.1 + turbo * 0.3));
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(angle) * len * 0.5, y - Math.sin(angle) * len * 0.5);
          ctx.lineTo(x + Math.cos(angle) * len * 0.5, y + Math.sin(angle) * len * 0.5);
          ctx.stroke();
          if (turbo > 0.12 && mag > 72) {
            let crossAngle = angle - 0.42;
            if (dependencies.seededNoise(x, y, 12.8) > 0.5) crossAngle = angle + 0.42;
            const crossLen = len * (0.42 + turbo * 0.1);
            ctx.beginPath();
            ctx.moveTo(x - Math.cos(crossAngle) * crossLen * 0.5, y - Math.sin(crossAngle) * crossLen * 0.5);
            ctx.lineTo(x + Math.cos(crossAngle) * crossLen * 0.5, y + Math.sin(crossAngle) * crossLen * 0.5);
            ctx.stroke();
          }
        }
      }
    }
    
    /** Renders the  andy warhol artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyAndyWarhol(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const cols = 2;
      const rows = 2;
      const panelW = canvas.width / cols;
      const panelH = canvas.height / rows;
      const palettes = [
        [{ r: accent.r, g: accent.g, b: accent.b }, { r: soft.r, g: soft.g, b: soft.b }],
        [{ r: 54, g: 92, b: 214 }, { r: 244, g: 196, b: 46 }],
        [{ r: 230, g: 76, b: 132 }, { r: 92, g: 214, b: 166 }],
        [{ r: 238, g: 150, b: 52 }, { r: 62, g: 78, b: 168 }],
      ];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let pr = 0; pr < rows; pr += 1) {
        for (let pc = 0; pc < cols; pc += 1) {
          const panel = palettes[pr * cols + pc];
          for (let y = 0; y < panelH; y += 6) {
            for (let x = 0; x < panelW; x += 6) {
              const sx = dependencies.clamp(Math.round((x / panelW) * canvas.width), 0, canvas.width - 1);
              const sy = dependencies.clamp(Math.round((y / panelH) * canvas.height), 0, canvas.height - 1);
              const index = (sy * canvas.width + sx) * 4;
              const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
              let target = panel[1];
              if (gray < 128) target = panel[0];
              ctx.fillStyle = `rgba(${Math.round(dependencies.mix(sample[index], target.r, 0.64 + strength * 0.16))}, ${Math.round(dependencies.mix(sample[index + 1], target.g, 0.64 + strength * 0.16))}, ${Math.round(dependencies.mix(sample[index + 2], target.b, 0.64 + strength * 0.16))}, ${0.4 + strength * 0.14})`;
              ctx.fillRect(pc * panelW + x, pr * panelH + y, 6, 6);
            }
          }
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.18)`;
          ctx.lineWidth = Math.max(1, canvas.width / 700);
          ctx.strokeRect(pc * panelW, pr * panelH, panelW, panelH);
        }
      }
    }
    
    /** Renders the  botticelli artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyBotticelli(canvas, amount, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(6, Math.round(18 - strength * 5 - turbo * 3));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(245,239,230)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x + step / 2), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + step / 2), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          ctx.fillStyle = `rgba(${Math.round(dependencies.mix(r, 238, 0.14 + strength * 0.14))}, ${Math.round(dependencies.mix(g, soft.g, 0.16 + strength * 0.14))}, ${Math.round(dependencies.mix(b, 196, 0.12 + strength * 0.12))}, ${0.28 + strength * 0.16})`;
          ctx.beginPath();
          ctx.moveTo(x, y + step * 0.5);
          ctx.quadraticCurveTo(x + step * 0.5, y - step * 0.22, x + step, y + step * 0.5);
          ctx.quadraticCurveTo(x + step * 0.5, y + step * 1.12, x, y + step * 0.5);
          ctx.fill();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.12 + strength * 0.08, 0.1, 0.2);
      ctx.filter = `blur(${0.4 + strength * 0.8}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
      ctx.strokeRect(canvas.width * 0.04, canvas.height * 0.04, canvas.width * 0.92, canvas.height * 0.92);
    }
    
    /** Renders the  munch artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyMunch(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 340 + strength * 180 + turbo * 100);
      const rowStep = Math.max(5, Math.round(10 - turbo * 2));
      const colStep = Math.max(6, Math.round(12 - turbo * 2));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(239,226,214)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.06, 0.05, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let y = 0; y < canvas.height; y += rowStep) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += colStep) {
          const sx = dependencies.clamp(x, 0, canvas.width - 1);
          const sy = dependencies.clamp(y, 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const scream = Math.sin((x / canvas.width) * Math.PI * (3 + strength * 2 + turbo * 0.8)) * (6 + strength * 12 + turbo * 8);
          const lift = ((sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / (255 * 3) - 0.5) * canvas.height * 0.04;
          const py = y + scream + lift;
          if (x === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        const rowIndex = dependencies.getSampleSourceIndex(sampleSource, Math.floor(canvas.width * 0.5), dependencies.clamp(y, 0, canvas.height - 1));
        const rr = sampleSource.data[rowIndex];
        const rg = sampleSource.data[rowIndex + 1];
        const rb = sampleSource.data[rowIndex + 2];
        ctx.strokeStyle = `rgba(${Math.round(dependencies.mix(rr, accent.r, 0.36 + strength * 0.18 + turbo * 0.06))}, ${Math.round(dependencies.mix(rg, soft.g, 0.28 + strength * 0.14 + turbo * 0.05))}, ${Math.round(dependencies.mix(rb, dark.b, 0.18 + strength * 0.12 + turbo * 0.05))}, ${0.16 + strength * 0.14 + turbo * 0.05})`;
        ctx.lineWidth = Math.max(0.8, (canvas.width / 1200) * (1 + strength * 0.8 + turbo * 0.35));
        ctx.stroke();
        if (turbo > 0.14 && y % (rowStep * 2) === 0) {
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += colStep) {
            const sx = dependencies.clamp(x, 0, canvas.width - 1);
            const sy = dependencies.clamp(y + rowStep * 0.6, 0, canvas.height - 1);
            const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
            const wave = Math.sin((x / canvas.width) * Math.PI * (4 + turbo)) * (3 + turbo * 5);
            const lift = ((sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / (255 * 3) - 0.5) * canvas.height * 0.03;
            const py = y + rowStep * 0.6 + wave + lift;
            if (x === 0) ctx.moveTo(x, py);
            else ctx.lineTo(x, py);
          }
          ctx.globalAlpha = 0.82;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    
    /** Renders the  toulouse lautrec artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applyToulouseLautrec(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(5, Math.round(8 + strength * 8 + turbo * 18));
      const rows = Math.max(6, Math.round(10 + strength * 10 + turbo * 20));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(244,236,224)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.08 - turbo * 0.03, 0.05, 0.18);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellW;
          const y = row * cellH;
          const sx = dependencies.clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const r = sample[index];
          const g = sample[index + 1];
          const b = sample[index + 2];
          const [h] = dependencies.rgbToHsl(r, g, b);
          let target = { r: 232, g: 212, b: 176 };
          if (h <= 20 || h >= 330) target = { r: accent.r, g: accent.g, b: accent.b };
          else if (h >= 35 && h <= 80) target = { r: 234, g: 192, b: 82 };
          else if (h >= 180 && h <= 260) target = { r: 86, g: 108, b: 164 };
          const blend = dependencies.clamp(0.4 + strength * 0.18 + turbo * 0.07, 0, 0.88);
          const fillR = Math.round(dependencies.mix(r, target.r, blend));
          const fillG = Math.round(dependencies.mix(g, target.g, blend));
          const fillB = Math.round(dependencies.mix(b, target.b, blend));
          const inset = cellW * (0.08 - Math.min(0.035, turbo * 0.01));
          const insetY = cellH * (0.08 - Math.min(0.035, turbo * 0.01));
          ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.34 + strength * 0.16 + turbo * 0.04})`;
          ctx.fillRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08 + turbo * 0.04})`;
          ctx.lineWidth = Math.max(0.6, Math.min(cellW, cellH) * (0.03 + turbo * 0.008));
          ctx.strokeRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
          if (turbo > 0.12 && dependencies.seededNoise(col, row, 5.7) > 0.62) {
            ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.05 + turbo * 0.04})`;
            ctx.fillRect(
              x + cellW * (0.12 + dependencies.seededNoise(col, row, 6.1) * 0.22),
              y + cellH * (0.12 + dependencies.seededNoise(col, row, 7.3) * 0.22),
              cellW * (0.16 + turbo * 0.04),
              cellH * (0.1 + turbo * 0.03)
            );
          }
        }
      }
    }
    
    /** Renders the  salvador dali artist-inspired image effect.
     * @param {*} canvas - Canvas renderer input.
     * @param {*} amount - Canvas renderer input.
     * @param {*} accent - Canvas renderer input.
     * @param {*} soft - Canvas renderer input.
     * @param {*} dark - Canvas renderer input.
     * @returns {void} Nothing.
     */
    function applySalvadorDali(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const stripHeight = Math.max(2, Math.round(16 - strength * 4 - turbo * 5));
      const phaseOne = dependencies.smoothstep(0.04, 0.38, amount);
      const phaseTwo = dependencies.smoothstep(0.34, 1.1, amount);
      const phaseThree = dependencies.smoothstep(1.05, 2.4, amount);
      const phaseFour = dependencies.smoothstep(2.2, 3.4, amount);
      const waveA = 6 + phaseOne * 14 + phaseTwo * 18 + phaseThree * 26 + phaseFour * 28;
      const waveB = 3 + phaseOne * 8 + phaseTwo * 10 + phaseThree * 12 + phaseFour * 16;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(236,224,205)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += stripHeight) {
        const progress = y / Math.max(1, canvas.height - 1);
        const melt = Math.sin(progress * Math.PI * (2 + phaseThree * 0.8 + phaseFour * 0.8) + amount * 1.35) * waveA;
        const drift = Math.cos(progress * Math.PI * (4.2 + phaseTwo * 1.6 + phaseFour * 0.9)) * waveB;
        const wobble = Math.sin(progress * Math.PI * (6.2 + phaseThree * 2 + phaseFour * 1.4) + amount * 0.9)
          * (1.2 + phaseTwo * 4 + phaseThree * 7 + phaseFour * 10);
        const offsetX = melt + drift + wobble + (dependencies.seededNoise(progress, amount, 2.7) - 0.5) * (6 + phaseTwo * 8 + phaseThree * 10 + phaseFour * 16);
        const drawWidth = canvas.width + Math.abs(offsetX) * (0.2 + phaseThree * 0.28 + phaseFour * 0.24);
        ctx.drawImage(
          source,
          0,
          y,
          canvas.width,
          Math.min(stripHeight + 2, canvas.height - y),
          -offsetX * (0.08 + phaseThree * 0.06 + phaseFour * 0.05),
          y + Math.sin(progress * Math.PI * (2.8 + phaseThree * 0.9 + phaseFour * 1.1)) * (phaseOne * 3 + phaseTwo * 5 + phaseThree * 9 + phaseFour * 13),
          drawWidth,
          Math.min(stripHeight + 3 + Math.round(phaseThree * 2 + phaseFour * 3), canvas.height - y)
        );
      }
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = dependencies.clamp(0.05 + phaseTwo * 0.06 + phaseThree * 0.08 + phaseFour * 0.1, 0.05, 0.34);
      ctx.filter = `blur(${0.6 + phaseTwo * 1.1 + phaseThree * 1.8 + phaseFour * 2.6}px) saturate(${1.04 + phaseTwo * 0.12 + phaseThree * 0.16 + phaseFour * 0.2})`;
      ctx.drawImage(source, canvas.width * (0.004 + phaseThree * 0.012 + phaseFour * 0.018), -canvas.height * (0.004 + phaseTwo * 0.006 + phaseFour * 0.012));
      if (phaseThree > 0.04) {
        ctx.drawImage(source, -canvas.width * (0.004 + phaseThree * 0.01 + phaseFour * 0.016), canvas.height * (0.006 + phaseThree * 0.01 + phaseFour * 0.014));
      }
      if (phaseFour > 0.06) {
        ctx.drawImage(source, canvas.width * 0.018, canvas.height * (0.012 + phaseFour * 0.02));
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.04 + phaseTwo * 0.06 + phaseThree * 0.08 + phaseFour * 0.1, 0.04, 0.32);
      ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.16)`;
      for (let i = 0; i < 3 + Math.round(phaseTwo * 6 + phaseThree * 8 + phaseFour * 12); i += 1) {
        const rx = canvas.width * (0.05 + dependencies.seededNoise(i, amount, 7.2) * (0.08 + phaseFour * 0.08));
        const ry = canvas.height * (0.02 + dependencies.seededNoise(i, amount, 8.4) * (0.04 + phaseFour * 0.05));
        const cx = canvas.width * dependencies.seededNoise(i, amount, 3.1);
        const cy = canvas.height * (0.14 + dependencies.seededNoise(i, amount, 4.6) * 0.72);
        dependencies.drawOrganicBlobPath(ctx, cx, cy, rx, ry, 7 + Math.round(phaseFour * 2), i * 2.1 + amount);
        ctx.fill();
      }
      ctx.restore();
      if (phaseThree > 0.06) {
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.03 + phaseThree * 0.025 + phaseFour * 0.03})`;
        ctx.lineWidth = Math.max(0.5, canvas.width / 1800);
        for (let x = 0; x < canvas.width; x += Math.max(18, Math.round(canvas.width / 20))) {
          ctx.beginPath();
          ctx.moveTo(x, canvas.height * 0.74);
          ctx.bezierCurveTo(
            x + waveA * (0.42 + phaseFour * 0.5),
            canvas.height * (0.8 + Math.sin(x * 0.01) * 0.04),
            x - waveA * (0.34 + phaseFour * 0.34),
            canvas.height * (0.92 + Math.cos(x * 0.013) * 0.03),
            x + Math.sin(x * 0.02) * (4 + phaseThree * 7 + phaseFour * 10),
            canvas.height
          );
          ctx.stroke();
        }
        for (let i = 0; i < Math.round(2 + phaseThree * 4 + phaseFour * 8); i += 1) {
          const mx = canvas.width * dependencies.seededNoise(i, turbo, 10.1);
          const my = canvas.height * (0.2 + dependencies.seededNoise(i, turbo, 10.8) * 0.58);
          const rx = canvas.width * (0.02 + dependencies.seededNoise(i, turbo, 11.4) * (0.03 + phaseFour * 0.05));
          const ry = canvas.height * (0.01 + dependencies.seededNoise(i, turbo, 12.2) * (0.018 + phaseFour * 0.03));
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.025 + phaseThree * 0.02 + phaseFour * 0.03})`;
          ctx.beginPath();
          ctx.ellipse(mx, my, rx, ry, dependencies.seededNoise(i, turbo, 13.4) * Math.PI, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.06 + phaseOne * 0.05 + phaseTwo * 0.03 + phaseFour * 0.03, 0.06, 0.22);
      ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, 0.16)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    return Object.freeze({ applyArtistEffects });
  }

  return Object.freeze({ createArtistEffects });
});
