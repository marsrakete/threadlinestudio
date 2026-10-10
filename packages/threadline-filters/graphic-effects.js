(function (root, createLibrary) {
  "use strict";
  const library = createLibrary();
  if (typeof module === "object" && module.exports) module.exports = library;
  if (root) root.ThreadlineGraphicEffects = library;
})(globalThis, function () {
  "use strict";

  /** Creates the reusable graphic-style renderer API from host-supplied helpers.
   * @param {object} dependencies - Canvas, sampling, color, edge, and random helpers.
   * @returns {object} Frozen public graphic effect API.
   */
  function createGraphicEffects(dependencies) {
    const required = ["clamp", "mix", "seededNoise", "cloneCanvas", "createSampleSource", "getSampleSourceIndex", "rgbToHsl", "hslToRgb", "applyCannyLikeEdges", "curveThousand", "parseHexColor", "random"];
    if (!dependencies) throw new TypeError("Graphic renderer dependencies are required.");
    for (const name of required) {
      if (typeof dependencies[name] !== "function") throw new TypeError(name + " dependency is required.");
    }

    /** Applies active graphic styles in their established rendering order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} graphics - Graphic-style slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette.
     * @returns {void} Nothing.
     */
    function applyGraphicStyleEffects(canvas, graphics, colors) {
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      const dark = dependencies.parseHexColor(colors.duotoneDark);
      if (graphics.bauhaus > 0) applyBauhaus(canvas, dependencies.curveThousand(graphics.bauhaus / 100, 1.08, 2.8), accent, soft, dark);
      if (graphics.brutalism > 0) applyBrutalism(canvas, dependencies.curveThousand(graphics.brutalism / 100, 1.08, 2.8), dark);
      if (graphics.swissPoster > 0) applySwissPoster(canvas, dependencies.curveThousand(graphics.swissPoster / 100, 1.08, 2.7), accent, dark);
      if (graphics.kodachrome > 0) applyKodachrome(canvas, dependencies.curveThousand(graphics.kodachrome / 100, 1.06, 2.65));
      if (graphics.daguerreotype > 0) applyDaguerreotype(canvas, dependencies.curveThousand(graphics.daguerreotype / 100, 1.08, 2.7), dark);
      if (graphics.risograph > 0) applyRisograph(canvas, dependencies.curveThousand(graphics.risograph / 100, 1.08, 2.8), accent, soft, dark);
      if (graphics.screenprint > 0) applyScreenprint(canvas, dependencies.curveThousand(graphics.screenprint / 100, 1.08, 2.7), accent, soft, dark);
      if (graphics.roentgen > 0) applyRoentgen(canvas, dependencies.curveThousand(graphics.roentgen / 100, 1.55, 1.9), soft, dark);
    }

    /** Renders the  bauhaus graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyBauhaus(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 300 + strength * 180 + turbo * 160);
      const cols = Math.max(8, Math.round(10 + strength * 12 + turbo * 30));
      const rows = Math.max(8, Math.round(10 + strength * 12 + turbo * 30));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(245,242,234)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.12 + strength * 0.08 - turbo * 0.03, 0.05, 0.2);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellW;
          const y = row * cellH;
          const sx = dependencies.clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const [h, s, l] = dependencies.rgbToHsl(r, g, b);
          let target = { r: 236, g: 232, b: 224 };
          if (h >= 180 && h <= 260) target = { r: 46, g: 92, b: 210 };
          else if (h >= 35 && h <= 80) target = { r: 240, g: 196, b: 32 };
          else if (h <= 20 || h >= 330) target = { r: 224, g: 70, b: 54 };
          else if (l < 0.28) target = { r: dark.r, g: dark.g, b: dark.b };
          const blend = dependencies.clamp(0.42 + strength * 0.2 + turbo * 0.08, 0, 0.94);
          const fillR = Math.round(dependencies.mix(r, target.r, blend));
          const fillG = Math.round(dependencies.mix(g, target.g, blend));
          const fillB = Math.round(dependencies.mix(b, target.b, blend));
          ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.34 + strength * 0.16 + turbo * 0.04})`;
          if (dependencies.seededNoise(col, row, 1.7) > 0.58 - Math.min(0.18, turbo * 0.08)) {
            const inset = cellW * (0.08 - Math.min(0.04, turbo * 0.012));
            const insetY = cellH * (0.08 - Math.min(0.04, turbo * 0.012));
            ctx.fillRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
          }
          else {
            ctx.beginPath();
            ctx.arc(
              x + cellW * (0.5 + (dependencies.seededNoise(col, row, 9.7) - 0.5) * 0.1),
              y + cellH * (0.5 + (dependencies.seededNoise(col, row, 10.4) - 0.5) * 0.1),
              Math.min(cellW, cellH) * (0.22 + strength * 0.08 + turbo * 0.03),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          if (turbo > 0.1 && s > 0.18 && dependencies.seededNoise(col, row, 13.1) > 0.68) {
            ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + turbo * 0.05})`;
            ctx.lineWidth = Math.max(0.5, Math.min(cellW, cellH) * (0.05 + turbo * 0.01));
            ctx.strokeRect(
              x + cellW * 0.12,
              y + cellH * 0.12,
              cellW * (0.2 + Math.min(0.26, turbo * 0.04)),
              cellH * (0.2 + Math.min(0.26, turbo * 0.04))
            );
          }
        }
      }
    }
    
    /** Renders the  brutalism graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyBrutalism(canvas, amount, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const sourceCtx = source.getContext("2d", { willReadFrequently: true });
      const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const block = Math.max(2, Math.round(20 - strength * 8 - turbo * 10));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(228,226,221)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08 - turbo * 0.03, 0.03, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let y = 0; y < canvas.height; y += block) {
        for (let x = 0; x < canvas.width; x += block) {
          const sx = dependencies.clamp(Math.round(x + block * 0.5), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + block * 0.5), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
          const tone = Math.round(dependencies.clamp(gray * (0.84 + strength * 0.12 + turbo * 0.05), 18, 236));
          ctx.fillStyle = `rgba(${tone}, ${Math.round(tone * 0.98)}, ${Math.round(tone * 0.94)}, ${0.4 + strength * 0.18 + turbo * 0.04})`;
          let inset = 0;
          if (turbo > 0.15) inset = block * 0.02;
          ctx.fillRect(x + inset, y + inset, Math.max(1, block - inset * 2), Math.max(1, block - inset * 2));
          if (turbo > 0.18 && gray < 150 && dependencies.seededNoise(x, y, 2.7) > 0.54) {
            ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + turbo * 0.05})`;
            ctx.fillRect(
              x + block * (0.08 + dependencies.seededNoise(x, y, 3.8) * 0.28),
              y + block * (0.08 + dependencies.seededNoise(x, y, 4.4) * 0.28),
              Math.max(1, block * (0.16 + turbo * 0.05)),
              Math.max(1, block * (0.16 + turbo * 0.05))
            );
          }
        }
      }
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.18 + strength * 0.14 + turbo * 0.04})`;
      ctx.lineWidth = Math.max(0.75, block * (0.08 + turbo * 0.01));
      for (let y = 0; y < canvas.height; y += block) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let x = 0; x < canvas.width; x += block) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    }
    
    /** Renders the  swiss poster graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applySwissPoster(canvas, amount, accent, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 280 + strength * 220 + turbo * 180);
      const cols = Math.max(6, Math.round(7 + strength * 10 + turbo * 28));
      const rows = Math.max(8, Math.round(10 + strength * 12 + turbo * 34));
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(247,245,239)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.18 + strength * 0.12 - turbo * 0.04, 0.08, 0.3);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cellW;
          const y = row * cellH;
          const sx = dependencies.clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const gray = (r + g + b) / 3;
          const lightFill = {
            r: Math.round(dependencies.mix(r, 246, 0.34 + turbo * 0.08)),
            g: Math.round(dependencies.mix(g, 246, 0.34 + turbo * 0.08)),
            b: Math.round(dependencies.mix(b, 246, 0.34 + turbo * 0.08)),
          };
          const inset = cellW * (0.08 - Math.min(0.035, turbo * 0.01));
          const insetY = cellH * (0.08 - Math.min(0.035, turbo * 0.01));
          ctx.fillStyle = gray < 108
            ? `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.34 + strength * 0.2 + turbo * 0.04})`
            : `rgba(${lightFill.r}, ${lightFill.g}, ${lightFill.b}, ${0.28 + strength * 0.14 + turbo * 0.04})`;
          ctx.fillRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
          if (gray > 122 && dependencies.seededNoise(col, row, 2.3) > 0.72 - strength * 0.14 - turbo * 0.16) {
            ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.18 + strength * 0.14 + turbo * 0.05})`;
            ctx.fillRect(
              x + cellW * (0.12 + dependencies.seededNoise(col, row, 3.1) * 0.18),
              y + cellH * (0.1 + dependencies.seededNoise(col, row, 4.2) * 0.18),
              cellW * (0.18 + Math.min(0.26, turbo * 0.05)),
              cellH * (0.12 + Math.min(0.22, turbo * 0.04))
            );
          }
          if (turbo > 0.15 && gray < 138 && dependencies.seededNoise(col, row, 6.7) > 0.64 - Math.min(0.18, turbo * 0.08)) {
            ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + turbo * 0.05})`;
            ctx.fillRect(
              x + cellW * (0.08 + dependencies.seededNoise(col, row, 7.9) * 0.38),
              y + cellH * (0.08 + dependencies.seededNoise(col, row, 8.6) * 0.38),
              Math.max(1, cellW * (0.08 + turbo * 0.03)),
              Math.max(1, cellH * (0.08 + turbo * 0.03))
            );
          }
        }
      }
      if (turbo > 0.1) {
        ctx.save();
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + turbo * 0.04})`;
        ctx.lineWidth = Math.max(0.8, Math.min(cellW, cellH) * (0.04 + turbo * 0.01));
        for (let col = 1; col < cols; col += Math.max(2, Math.round(6 - Math.min(4, turbo)))) {
          const x = col * cellW;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    
    /** Renders the  kodachrome graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @returns {void} Nothing.
     */
    function applyKodachrome(canvas, amount) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      for (let i = 0; i < data.length; i += 4) {
        const [h, s, l] = dependencies.rgbToHsl(data[i], data[i + 1], data[i + 2]);
        const sat = dependencies.clamp(s * (1.08 + strength * 0.36 + turbo * 0.16), 0, 1);
        const light = dependencies.clamp(l * (0.96 + strength * 0.08 + turbo * 0.04), 0, 1);
        const [r, g, b] = dependencies.hslToRgb(h, sat, light);
        const warmBoost = 0.08 + strength * 0.12 + turbo * 0.05;
        const yellowBoost = 0.06 + strength * 0.1 + turbo * 0.05;
        const coolBoost = 0.08 + strength * 0.12 + turbo * 0.06;
        let warmTarget = r;
        if (h <= 20 || h >= 330) warmTarget = 236;
        let yellowTarget = g;
        if (h >= 35 && h <= 80) yellowTarget = 204;
        let coolTarget = b;
        if (h >= 180 && h <= 260) coolTarget = 182;
        let rr = Math.round(dependencies.mix(r, warmTarget, warmBoost));
        let gg = Math.round(dependencies.mix(g, yellowTarget, yellowBoost));
        let bb = Math.round(dependencies.mix(b, coolTarget, coolBoost));
        if (turbo > 0.08) {
          let density = 0.98 + turbo * 0.03;
          if (l < 0.38) density = 1.08 + turbo * 0.08;
          let redBoost = 0;
          if (h <= 18 || h >= 338) redBoost = turbo * 9;
          let greenBoost = 0;
          if (h >= 42 && h <= 78) greenBoost = turbo * 7;
          let blueBoost = -turbo * 4;
          if (h >= 190 && h <= 250) blueBoost = turbo * 10;
          rr = dependencies.clamp(rr * density + redBoost, 0, 255);
          gg = dependencies.clamp(gg * (1 + turbo * 0.03) + greenBoost, 0, 255);
          bb = dependencies.clamp(bb * (1 - turbo * 0.02) + blueBoost, 0, 255);
        }
        data[i] = rr;
        data[i + 1] = gg;
        data[i + 2] = bb;
      }
      ctx.putImageData(imageData, 0, 0);
      if (turbo > 0.1) {
        const source = dependencies.cloneCanvas(canvas);
        ctx.save();
        ctx.globalAlpha = dependencies.clamp(0.04 + turbo * 0.04, 0.04, 0.14);
        ctx.filter = `blur(${0.4 + turbo * 0.8}px) saturate(${1 + turbo * 0.12})`;
        ctx.drawImage(source, 0, 0);
        ctx.restore();
      }
    }
    
    /** Renders the  daguerreotype graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyDaguerreotype(canvas, amount, dark) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
        const silver = Math.round(dependencies.mix(gray, 210, 0.14 + strength * 0.14 + turbo * 0.05));
        const shadowWeight = 0.08 + (1 - gray / 255) * (0.12 + turbo * 0.04);
        data[i] = Math.round(dependencies.mix(silver, dark.r, shadowWeight));
        data[i + 1] = Math.round(dependencies.mix(silver, dark.g, 0.04 + (1 - gray / 255) * (0.08 + turbo * 0.03)));
        data[i + 2] = Math.round(dependencies.mix(silver, 182, 0.08 + strength * 0.1 + turbo * 0.04));
        if (turbo > 0.06) {
          const plateLift = turbo * 10;
          data[i] = dependencies.clamp(data[i] + plateLift * 0.4, 0, 255);
          data[i + 1] = dependencies.clamp(data[i + 1] + plateLift * 0.35, 0, 255);
          data[i + 2] = dependencies.clamp(data[i + 2] + plateLift * 0.55, 0, 255);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const source = dependencies.cloneCanvas(canvas);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08 + turbo * 0.03, 0.06, 0.22);
      ctx.filter = `blur(${0.4 + strength * 0.8 + turbo * 0.9}px)`;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      if (turbo > 0.06) {
        const overlay = dependencies.cloneCanvas(canvas);
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = dependencies.clamp(0.04 + turbo * 0.05, 0.04, 0.18);
        ctx.filter = `blur(${1 + turbo * 1.2}px)`;
        ctx.drawImage(overlay, 0, 0);
        ctx.restore();
      }
      if (turbo > 0.08) {
        const vignetteAlpha = dependencies.clamp(0.08 + strength * 0.06 + turbo * 0.04, 0.08, 0.22);
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.5,
          canvas.height * 0.48,
          Math.min(canvas.width, canvas.height) * 0.16,
          canvas.width * 0.5,
          canvas.height * 0.5,
          Math.max(canvas.width, canvas.height) * 0.72
        );
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.72, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${vignetteAlpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${vignetteAlpha})`);
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      if (turbo > 0.12) {
        const noiseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = noiseData.data;
        const noiseAmount = 4 + turbo * 6;
        for (let i = 0; i < pixels.length; i += 4) {
          const noise = (dependencies.random() - 0.5) * noiseAmount;
          pixels[i] = dependencies.clamp(pixels[i] + noise, 0, 255);
          pixels[i + 1] = dependencies.clamp(pixels[i + 1] + noise * 0.9, 0, 255);
          pixels[i + 2] = dependencies.clamp(pixels[i + 2] + noise * 1.1, 0, 255);
        }
        ctx.putImageData(noiseData, 0, 0);
      }
    }
    
    /** Renders the  risograph graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyRisograph(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 260 + strength * 200 + turbo * 180);
      const block = Math.max(2, Math.round(16 - strength * 5 - turbo * 7));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(249,246,240)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.08 + strength * 0.08 - turbo * 0.02, 0.03, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let y = 0; y < canvas.height; y += block) {
        for (let x = 0; x < canvas.width; x += block) {
          const sx = dependencies.clamp(Math.round(x + block * 0.5), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + block * 0.5), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
          const [h, s] = dependencies.rgbToHsl(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]);
          const noiseShift = dependencies.seededNoise(x / Math.max(1, block), y / Math.max(1, block), 5.1);
          if (gray < 170) {
            const radius = block * (0.12 + (1 - gray / 255) * 0.18 + turbo * 0.045);
            ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.14 + strength * 0.12 + turbo * 0.03})`;
            ctx.beginPath();
            ctx.arc(
              x + block * (0.42 + noiseShift * 0.12),
              y + block * (0.42 + dependencies.seededNoise(x, y, 1.7) * 0.12),
              Math.max(0.6, radius),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          if (gray < 118) {
            let hueBias = accent;
            if (h >= 180 && h <= 300) hueBias = soft;
            const radius = block * (0.08 + (1 - gray / 255) * 0.14 + turbo * 0.035);
            ctx.fillStyle = `rgba(${hueBias.r}, ${hueBias.g}, ${hueBias.b}, ${0.12 + strength * 0.12 + turbo * 0.04})`;
            ctx.beginPath();
            ctx.arc(
              x + block * (0.58 + dependencies.seededNoise(x, y, 3.7) * 0.1),
              y + block * (0.54 + dependencies.seededNoise(x, y, 4.4) * 0.1),
              Math.max(0.6, radius),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          if (gray < 84 || (s > 0.48 && gray < 132 && turbo > 0.2)) {
            const offset = turbo * block * 0.12;
            ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08 + turbo * 0.04})`;
            ctx.fillRect(
              x + block * 0.22 + offset * dependencies.seededNoise(x, y, 7.2),
              y + block * 0.22 + offset * dependencies.seededNoise(x, y, 8.3),
              Math.max(1, block * (0.18 + turbo * 0.04)),
              Math.max(1, block * (0.18 + turbo * 0.04))
            );
          }
          if (turbo > 0.12 && gray < 150 && dependencies.seededNoise(x, y, 11.4) > 0.52) {
            ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.03 + turbo * 0.035})`;
            ctx.fillRect(
              x + block * 0.06,
              y + block * 0.06,
              Math.max(1, block * (0.16 + turbo * 0.06)),
              Math.max(1, block * (0.06 + turbo * 0.02))
            );
          }
        }
      }
      if (turbo > 0.1) {
        ctx.save();
        ctx.globalAlpha = dependencies.clamp(0.06 + turbo * 0.04, 0.05, 0.16);
        ctx.translate(block * 0.22, block * 0.12);
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
      }
    }
    
    /** Renders the  screenprint graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyScreenprint(canvas, amount, accent, soft, dark) {
      const ctx = canvas.getContext("2d");
      const source = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 300 + strength * 180 + turbo * 140);
      const block = Math.max(2, Math.round(18 - strength * 7 - turbo * 8));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(248,244,236)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.1 + strength * 0.06 - turbo * 0.025, 0.04, 0.16);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let y = 0; y < canvas.height; y += block) {
        for (let x = 0; x < canvas.width; x += block) {
          const sx = dependencies.clamp(Math.round(x + block * 0.5), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y + block * 0.5), 0, canvas.height - 1);
          const index = dependencies.getSampleSourceIndex(sampleSource, sx, sy);
          const r = sampleSource.data[index];
          const g = sampleSource.data[index + 1];
          const b = sampleSource.data[index + 2];
          const [h] = dependencies.rgbToHsl(r, g, b);
          let target = { r: 242, g: 236, b: 228 };
          if (h >= 180 && h <= 260) target = { r: 40, g: 88, b: 210 };
          else if (h >= 35 && h <= 80) target = { r: 242, g: 201, b: 36 };
          else if (h <= 20 || h >= 330) target = { r: 224, g: 72, b: 62 };
          else if ((r + g + b) / 3 < 90) target = { r: dark.r, g: dark.g, b: dark.b };
          const mixAmount = dependencies.clamp(0.52 + strength * 0.18 + turbo * 0.08, 0, 0.96);
          const fill = {
            r: Math.round(dependencies.mix(r, target.r, mixAmount)),
            g: Math.round(dependencies.mix(g, target.g, mixAmount)),
            b: Math.round(dependencies.mix(b, target.b, mixAmount)),
          };
          ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.36 + strength * 0.16 + turbo * 0.04})`;
          const inset = block * Math.max(0, 0.02 - turbo * 0.005);
          ctx.fillRect(x + inset, y + inset, block - inset * 2, block - inset * 2);
          if (turbo > 0.06) {
            const dotRadius = Math.max(0.5, block * (0.1 + turbo * 0.04) * (0.45 + (255 - (r + g + b) / 3) / 255));
            ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.06 + turbo * 0.05})`;
            ctx.beginPath();
            ctx.arc(
              x + block * (0.5 + (dependencies.seededNoise(x, y, 12.3) - 0.5) * 0.24),
              y + block * (0.5 + (dependencies.seededNoise(x, y, 13.7) - 0.5) * 0.24),
              dotRadius,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          if (turbo > 0.26 && ((r + g + b) / 3) < 160) {
            ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.05 + turbo * 0.04})`;
            ctx.lineWidth = Math.max(0.5, block * 0.06);
            ctx.strokeRect(x + block * 0.1, y + block * 0.1, block * 0.8, block * 0.8);
          }
        }
      }
    }
    
    /** Renders the  roentgen graphic style in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyRoentgen(canvas, amount, soft, dark) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const source = dependencies.cloneCanvas(canvas);
      const edgeCanvas = dependencies.cloneCanvas(canvas);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      dependencies.applyCannyLikeEdges(edgeCanvas, 0.1 + strength * 0.34 + turbo * 0.06);
      const sourceData = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height);
      const edgeData = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < sourceData.data.length; i += 4) {
        const r = sourceData.data[i];
        const g = sourceData.data[i + 1];
        const b = sourceData.data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const inv = 255 - gray;
        const bone = dependencies.clamp(inv * (0.52 + strength * 0.2) + Math.max(r, g, b) * (0.08 + turbo * 0.05), 0, 255);
        const edge = edgeData[i] / 255;
        imageData.data[i] = dependencies.clamp(dependencies.mix(inv * 0.16, soft.r + bone * 0.08, 0.42 + strength * 0.12) + edge * (16 + turbo * 16), 0, 255);
        imageData.data[i + 1] = dependencies.clamp(dependencies.mix(inv * 0.28, soft.g + bone * 0.16, 0.48 + strength * 0.14) + edge * (26 + turbo * 24), 0, 255);
        imageData.data[i + 2] = dependencies.clamp(dependencies.mix(inv * 0.48, 224 + bone * 0.11, 0.54 + strength * 0.14) + edge * (34 + turbo * 30), 0, 255);
        imageData.data[i + 3] = sourceData.data[i + 3];
      }
      ctx.putImageData(imageData, 0, 0);
      if (turbo > 0.16) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = dependencies.clamp(0.05 + turbo * 0.035, 0.05, 0.18);
        ctx.filter = `blur(${0.5 + turbo * 1}px)`;
        ctx.drawImage(edgeCanvas, 0, 0);
        ctx.restore();
      }
      if (strength > 0.1) {
        const vignette = ctx.createRadialGradient(
          canvas.width * 0.5,
          canvas.height * 0.48,
          Math.min(canvas.width, canvas.height) * 0.18,
          canvas.width * 0.5,
          canvas.height * 0.5,
          Math.max(canvas.width, canvas.height) * 0.8
        );
        vignette.addColorStop(0, "rgba(255,255,255,0)");
        vignette.addColorStop(0.82, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.05 + strength * 0.03})`);
        vignette.addColorStop(1, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.05 + turbo * 0.03})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    return Object.freeze({ applyGraphicStyleEffects });
  }

  return Object.freeze({ createGraphicEffects });
});
