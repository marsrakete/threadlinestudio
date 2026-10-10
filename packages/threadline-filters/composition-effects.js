(function (root, createLibrary) {
  "use strict";
  const library = createLibrary();
  if (typeof module === "object" && module.exports) module.exports = library;
  if (root) root.ThreadlineCompositionEffects = library;
})(globalThis, function () {
  "use strict";

  /** Creates fragment and cut renderers with host-provided canvas and sampling helpers.
   * @param {object} dependencies - Canvas, color, sampling, and geometry dependencies.
   * @returns {object} Frozen composition renderer API.
   */
  function createCompositionEffects(dependencies) {
    const required = ["clamp", "mix", "seededNoise", "cloneCanvas", "createSampleSource", "getSampleSourceIndex", "buildRoundedRectPath", "buildDieCutPath", "curveThousand", "parseHexColor"];
    if (!dependencies) throw new TypeError("Composition renderer dependencies are required.");
    for (const name of required) {
      if (typeof dependencies[name] !== "function") throw new TypeError(name + " dependency is required.");
    }

    /** Applies configured fragment controls in their established order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} fragment - Fragment slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette.
     * @returns {void} Nothing.
     */
    function applyFragmentEffects(canvas, fragment, colors) {
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      const dark = dependencies.parseHexColor(colors.duotoneDark);
      if (fragment.tileSwap > 0) applyTileSwap(canvas, dependencies.curveThousand(fragment.tileSwap / 100, 1.12, 2.55), dark);
      if (fragment.stripShift > 0) applyStripShift(canvas, dependencies.curveThousand(fragment.stripShift / 100, 1.1, 2.45), accent, dark);
      if (fragment.shards > 0) applyShards(canvas, dependencies.curveThousand(fragment.shards / 100, 1.12, 2.6), dark);
      if (fragment.patchwork > 0) applyPatchwork(canvas, dependencies.curveThousand(fragment.patchwork / 100, 1.1, 2.45), accent, soft, dark);
    }

    /** Applies configured cut controls in their established order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} cut - Cut slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette.
     * @returns {void} Nothing.
     */
    function applyCutEffects(canvas, cut, colors) {
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      const dark = dependencies.parseHexColor(colors.duotoneDark);
      if (cut.punchCard > 0) applyPunchCard(canvas, dependencies.curveThousand(cut.punchCard / 100, 1.1, 2.35), soft, dark);
      if (cut.perforation > 0) applyPerforation(canvas, dependencies.curveThousand(cut.perforation / 100, 1.12, 2.45), soft, dark);
      if (cut.dieCut > 0) applyDieCut(canvas, dependencies.curveThousand(cut.dieCut / 100, 1.12, 2.45), accent, soft, dark);
      if (cut.paperCut > 0) applyPaperCut(canvas, dependencies.curveThousand(cut.paperCut / 100, 1.1, 2.4), soft, dark);
    }

    /** Renders the  tile swap composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyTileSwap(canvas, amount, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(5, Math.round(7 + strength * 6 + turbo * 7));
      const tileW = canvas.width / cols;
      const rows = Math.max(4, Math.round(canvas.height / tileW));
      const tileH = canvas.height / rows;
      const cells = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          cells.push({ col, row });
        }
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const cell of cells) {
        const swapChance = 0.18 + strength * 0.46 + turbo * 0.12;
        const radius = 1 + Math.round(strength * 2 + turbo * 3);
        let srcCol = cell.col;
        let srcRow = cell.row;
        if (dependencies.seededNoise(cell.col, cell.row, 0.71) < swapChance) {
          srcCol = dependencies.clamp(cell.col + Math.round((dependencies.seededNoise(cell.col, cell.row, 1.17) - 0.5) * radius * 2), 0, cols - 1);
          srcRow = dependencies.clamp(cell.row + Math.round((dependencies.seededNoise(cell.col, cell.row, 1.93) - 0.5) * radius * 2), 0, rows - 1);
        }
        const sx = srcCol * tileW;
        const sy = srcRow * tileH;
        const dx = cell.col * tileW;
        const dy = cell.row * tileH;
        const lift = (dependencies.seededNoise(cell.col, cell.row, 2.63) - 0.5) * tileW * (0.05 + strength * 0.06);
        const drop = (dependencies.seededNoise(cell.col, cell.row, 3.01) - 0.5) * tileH * (0.05 + strength * 0.06);
        ctx.drawImage(source, sx, sy, tileW, tileH, dx + lift, dy + drop, tileW, tileH);
      }
      ctx.save();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.12})`;
      ctx.lineWidth = Math.max(0.6, tileW * 0.015);
      for (let col = 1; col < cols; col += 1) {
        const x = col * tileW;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let row = 1; row < rows; row += 1) {
        const y = row * tileH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }
    
    /** Renders the  strip shift composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyStripShift(canvas, amount, accent, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const stripH = Math.max(8, Math.round(28 - strength * 10 - turbo * 7));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += stripH) {
        const offset = (dependencies.seededNoise(y, amount, 0.83) - 0.5) * canvas.width * (0.04 + strength * 0.14 + turbo * 0.08);
        const wobble = Math.sin((y / canvas.height) * Math.PI * (2 + turbo * 1.4)) * canvas.width * (0.01 + strength * 0.03);
        ctx.drawImage(source, offset + wobble, y, canvas.width, stripH, 0, y, canvas.width, stripH);
      }
      if (amount > 0.55) {
        const stripW = Math.max(10, Math.round(32 - strength * 10 - turbo * 8));
        for (let x = 0; x < canvas.width; x += stripW * 3) {
          const offsetY = (dependencies.seededNoise(x, amount, 2.17) - 0.5) * canvas.height * (0.02 + strength * 0.08 + turbo * 0.05);
          ctx.drawImage(source, x, offsetY, stripW, canvas.height, x, 0, stripW, canvas.height);
        }
      }
      ctx.save();
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.06 + strength * 0.12})`;
      ctx.lineWidth = Math.max(0.6, stripH * 0.06);
      for (let y = stripH; y < canvas.height; y += stripH) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }
    
    /** Renders the  shards composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyShards(canvas, amount, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const cols = Math.max(4, Math.round(6 + strength * 5 + turbo * 5));
      const cell = canvas.width / cols;
      const rows = Math.max(4, Math.round(canvas.height / cell));
      const cellH = canvas.height / rows;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = 0.16 + strength * 0.12;
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * cell;
          const y = row * cellH;
          const jitterX = cell * (0.18 + strength * 0.16 + turbo * 0.06);
          const jitterY = cellH * (0.18 + strength * 0.16 + turbo * 0.06);
          const points = [
            [x + (dependencies.seededNoise(col, row, 0.61) - 0.5) * jitterX, y + (dependencies.seededNoise(col, row, 0.93) - 0.5) * jitterY],
            [x + cell + (dependencies.seededNoise(col, row, 1.21) - 0.5) * jitterX, y + (dependencies.seededNoise(col, row, 1.51) - 0.5) * jitterY],
            [x + cell + (dependencies.seededNoise(col, row, 1.87) - 0.5) * jitterX, y + cellH + (dependencies.seededNoise(col, row, 2.13) - 0.5) * jitterY],
            [x + (dependencies.seededNoise(col, row, 2.43) - 0.5) * jitterX, y + cellH + (dependencies.seededNoise(col, row, 2.77) - 0.5) * jitterY],
          ];
          const cx = points.reduce((sum, point) => sum + point[0], 0) / points.length;
          const cy = points.reduce((sum, point) => sum + point[1], 0) / points.length;
          const dx = (dependencies.seededNoise(col, row, 3.11) - 0.5) * cell * (0.08 + strength * 0.12 + turbo * 0.05);
          const dy = (dependencies.seededNoise(col, row, 3.37) - 0.5) * cellH * (0.08 + strength * 0.12 + turbo * 0.05);
          const angle = (dependencies.seededNoise(col, row, 3.81) - 0.5) * (0.08 + strength * 0.16 + turbo * 0.06);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
          ctx.closePath();
          ctx.clip();
          ctx.translate(cx + dx, cy + dy);
          ctx.rotate(angle);
          ctx.drawImage(source, x, y, cell, cellH, -cell / 2, -cellH / 2, cell, cellH);
          ctx.restore();
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
          ctx.closePath();
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.14})`;
          ctx.lineWidth = Math.max(0.7, cell * 0.016);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    
    /** Renders the  patchwork composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyPatchwork(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const step = Math.max(16, Math.round(52 - strength * 18 - turbo * 10));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(246, soft.r, 0.06))}, ${Math.round(dependencies.mix(240, soft.g, 0.06))}, ${Math.round(dependencies.mix(232, soft.b, 0.06))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const w = step * (0.88 + dependencies.seededNoise(x, y, 0.71) * 0.42);
          const h = step * (0.82 + dependencies.seededNoise(x, y, 1.09) * 0.44);
          const dx = x + (dependencies.seededNoise(x, y, 1.63) - 0.5) * step * 0.14;
          const dy = y + (dependencies.seededNoise(x, y, 2.01) - 0.5) * step * 0.14;
          const radius = Math.max(3, step * 0.08);
          ctx.save();
          dependencies.buildRoundedRectPath(ctx, dx, dy, w, h, radius);
          ctx.clip();
          ctx.drawImage(source, x, y, w, h, dx, dy, w, h);
          ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.04 + strength * 0.06})`;
          ctx.fillRect(dx, dy, w, h);
          ctx.restore();
          ctx.save();
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.16 + strength * 0.12})`;
          ctx.lineWidth = Math.max(0.8, step * 0.03);
          ctx.setLineDash([Math.max(2, step * 0.08), Math.max(2, step * 0.06)]);
          dependencies.buildRoundedRectPath(ctx, dx, dy, w, h, radius);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    
    /** Renders the  punch card composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyPunchCard(canvas, amount, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 220 + strength * 150 + turbo * 120);
      const step = Math.max(14, Math.round(34 - strength * 10 - turbo * 8));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(248, soft.r, 0.1))}, ${Math.round(dependencies.mix(244, soft.g, 0.08))}, ${Math.round(dependencies.mix(232, soft.b, 0.08))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = step * 0.7; y < canvas.height; y += step) {
        for (let x = step * 0.7; x < canvas.width; x += step) {
          const idx = dependencies.getSampleSourceIndex(sampleSource, x, y);
          const gray = (sampleSource.data[idx] + sampleSource.data[idx + 1] + sampleSource.data[idx + 2]) / 3;
          const darkness = 1 - gray / 255;
          if (darkness < 0.14 && dependencies.seededNoise(x, y, 0.91) < 0.9) continue;
          const radius = Math.max(2, step * (0.14 + darkness * 0.22 + turbo * 0.04));
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + 1.2, y + 1.2, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + darkness * 0.14})`;
          ctx.fill();
          ctx.restore();
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(source, 0, 0);
          ctx.restore();
        }
      }
    }
    
    /** Renders the  perforation composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyPerforation(canvas, amount, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0);
      const bands = Math.max(2, Math.round(3 + strength * 3 + turbo * 3));
      for (let band = 0; band < bands; band += 1) {
        const horizontal = dependencies.seededNoise(band, amount, 0.63) > 0.35;
        if (horizontal) {
          const y = canvas.height * (0.12 + (band / Math.max(1, bands - 1)) * 0.76);
          const h = Math.max(12, canvas.height * (0.02 + strength * 0.015 + turbo * 0.01));
          ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.26 + strength * 0.12})`;
          ctx.fillRect(0, y - h / 2, canvas.width, h);
          const holeStep = Math.max(9, Math.round(18 - strength * 4 - turbo * 4));
          for (let x = 0; x < canvas.width; x += holeStep) {
            const r = Math.max(2, h * (0.18 + strength * 0.08));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + holeStep * 0.5, y, r, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(source, 0, 0);
            ctx.restore();
          }
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.1 + strength * 0.08})`;
          ctx.setLineDash([Math.max(2, h * 0.2), Math.max(2, h * 0.16)]);
          ctx.lineWidth = Math.max(0.8, h * 0.06);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          const x = canvas.width * (0.12 + (band / Math.max(1, bands - 1)) * 0.76);
          const w = Math.max(12, canvas.width * (0.02 + strength * 0.015 + turbo * 0.01));
          ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.24 + strength * 0.12})`;
          ctx.fillRect(x - w / 2, 0, w, canvas.height);
          const holeStep = Math.max(9, Math.round(18 - strength * 4 - turbo * 4));
          for (let y = 0; y < canvas.height; y += holeStep) {
            const r = Math.max(2, w * (0.18 + strength * 0.08));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y + holeStep * 0.5, r, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(source, 0, 0);
            ctx.restore();
          }
        }
      }
    }
    
    /** Renders the  die cut composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} accent - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyDieCut(canvas, amount, accent, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 220 + strength * 150 + turbo * 120);
      const step = Math.max(28, Math.round(62 - strength * 18 - turbo * 12));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(248, soft.r, 0.08))}, ${Math.round(dependencies.mix(246, soft.g, 0.08))}, ${Math.round(dependencies.mix(236, soft.b, 0.08))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = step * 0.7; y < canvas.height; y += step) {
        for (let x = step * 0.7; x < canvas.width; x += step) {
          const idx = dependencies.getSampleSourceIndex(sampleSource, x, y);
          const gray = (sampleSource.data[idx] + sampleSource.data[idx + 1] + sampleSource.data[idx + 2]) / 3;
          const darkness = 1 - gray / 255;
          if (darkness < 0.2 && dependencies.seededNoise(x, y, 0.93) < 0.8) continue;
          const w = step * (0.6 + darkness * 0.34 + turbo * 0.04);
          const h = step * (0.54 + darkness * 0.3 + turbo * 0.03);
          const shape = Math.floor(dependencies.seededNoise(x, y, 1.29) * 3);
          ctx.save();
          dependencies.buildDieCutPath(ctx, x, y, w, h, shape);
          ctx.clip();
          ctx.drawImage(source, 0, 0);
          ctx.restore();
          ctx.save();
          ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.1})`;
          ctx.lineWidth = Math.max(0.8, step * 0.03);
          dependencies.buildDieCutPath(ctx, x, y, w, h, shape);
          ctx.stroke();
          ctx.restore();
          if (darkness > 0.44) {
            ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.04 + darkness * 0.06})`;
            dependencies.buildDieCutPath(ctx, x, y, w, h, shape);
            ctx.fill();
          }
        }
      }
    }
    
    /** Renders the  paper cut composition effect in place.
     * @param {*} canvas - Renderer input.
     * @param {*} amount - Renderer input.
     * @param {*} soft - Renderer input.
     * @param {*} dark - Renderer input.
     * @returns {void} Nothing.
     */
    function applyPaperCut(canvas, amount, soft, dark) {
      const source = dependencies.cloneCanvas(canvas);
      const ctx = canvas.getContext("2d");
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 200 + strength * 140 + turbo * 120);
      const step = Math.max(14, Math.round(30 - strength * 8 - turbo * 6));
      const layers = [
        { tint: { r: soft.r, g: soft.g, b: soft.b }, alpha: 1, threshold: 0.18, offset: 0 },
        { tint: { r: Math.round(dependencies.mix(soft.r, 255, 0.12)), g: Math.round(dependencies.mix(soft.g, 255, 0.12)), b: Math.round(dependencies.mix(soft.b, 255, 0.12)) }, alpha: 0.92, threshold: 0.34, offset: step * 0.12 },
        { tint: { r: Math.round(dependencies.mix(soft.r, dark.r, 0.08)), g: Math.round(dependencies.mix(soft.g, dark.g, 0.08)), b: Math.round(dependencies.mix(soft.b, dark.b, 0.08)) }, alpha: 0.88, threshold: 0.5, offset: step * 0.24 },
      ];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgb(${Math.round(dependencies.mix(252, soft.r, 0.04))}, ${Math.round(dependencies.mix(250, soft.g, 0.04))}, ${Math.round(dependencies.mix(244, soft.b, 0.04))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const layer of layers) {
        ctx.save();
        ctx.fillStyle = `rgba(${layer.tint.r}, ${layer.tint.g}, ${layer.tint.b}, ${layer.alpha})`;
        for (let y = 0; y < canvas.height; y += step) {
          for (let x = 0; x < canvas.width; x += step) {
            const idx = dependencies.getSampleSourceIndex(sampleSource, x, y);
            const gray = (sampleSource.data[idx] + sampleSource.data[idx + 1] + sampleSource.data[idx + 2]) / 3;
            const darkness = 1 - gray / 255;
            if (darkness < layer.threshold) continue;
            const w = step * (1.18 + darkness * 0.42);
            const h = step * (1.02 + darkness * 0.34);
            dependencies.buildRoundedRectPath(ctx, x + layer.offset, y + layer.offset, w, h, Math.max(3, step * 0.16));
            ctx.fill();
          }
        }
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.18 + strength * 0.12, 0.18, 0.34);
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
    return Object.freeze({ applyFragmentEffects, applyCutEffects });
  }

  return Object.freeze({ createCompositionEffects });
});
