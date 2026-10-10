(function (root, createLibrary) {
  "use strict";
  const library = createLibrary();
  if (typeof module === "object" && module.exports) module.exports = library;
  if (root) root.ThreadlineMorphEffects = library;
})(globalThis, function () {
  "use strict";

  /** Creates image-warp renderers with explicit sampling, noise, and canvas dependencies.
   * @param {object} dependencies - Canvas, sampling, color, and deterministic noise helpers.
   * @returns {object} Frozen morph renderer API.
   */
  function createMorphEffects(dependencies) {
    const required = ["clamp", "seededNoise", "cloneCanvas", "createSampleSource", "getSampleSourceIndex", "curveThousand", "parseHexColor"];
    if (!dependencies) throw new TypeError("Morph renderer dependencies are required.");
    for (const name of required) {
      if (typeof dependencies[name] !== "function") throw new TypeError(name + " dependency is required.");
    }

    /** Applies configured morph controls in the established order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} morph - Morph slider values.
     * @param {{overlayColor: string, duotoneLight: string}} colors - Project palette.
     * @returns {void} Nothing.
     */
    function applyMorphEffects(canvas, morph, colors) {
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      if (morph.swirlMorph > 0) applySwirlMorph(canvas, dependencies.curveThousand(morph.swirlMorph / 100, 1.08, 2.9));
      if (morph.meltMorph > 0) applyMeltMorph(canvas, dependencies.curveThousand(morph.meltMorph / 100, 1.06, 3.05), accent);
      if (morph.rubberSheet > 0) applyRubberSheet(canvas, dependencies.curveThousand(morph.rubberSheet / 100, 1.08, 2.8));
      if (morph.wavePull > 0) applyWavePull(canvas, dependencies.curveThousand(morph.wavePull / 100, 1.06, 2.95), soft);
      if (morph.pinchMorph > 0) applyPinchMorph(canvas, dependencies.curveThousand(morph.pinchMorph / 100, 1.06, 2.9));
      if (morph.bulgeMorph > 0) applyBulgeMorph(canvas, dependencies.curveThousand(morph.bulgeMorph / 100, 1.06, 2.9));
      if (morph.creasePull > 0) applyCreasePull(canvas, dependencies.curveThousand(morph.creasePull / 100, 1.08, 2.85), soft);
      if (morph.crumpleMorph > 0) applyCrumpleMorph(canvas, dependencies.curveThousand(morph.crumpleMorph / 100, 1.08, 2.95), soft);
    }

    /** Applies the  swirl morph image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applySwirlMorph(canvas, amount) {
      const centers = [
        { x: canvas.width * 0.3, y: canvas.height * 0.34, radius: Math.min(canvas.width, canvas.height) * (0.24 + amount * 0.06) },
        { x: canvas.width * 0.72, y: canvas.height * 0.62, radius: Math.min(canvas.width, canvas.height) * (0.2 + amount * 0.08) },
      ];
      warpCanvas(canvas, (x, y) => {
        let sx = x;
        let sy = y;
        for (const center of centers) {
          const dx = sx - center.x;
          const dy = sy - center.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > center.radius || dist < 0.001) continue;
          const t = 1 - dist / center.radius;
          const angle = t * t * (0.55 + amount * 0.9);
          const cos = Math.cos(-angle);
          const sin = Math.sin(-angle);
          sx = center.x + dx * cos - dy * sin;
          sy = center.y + dx * sin + dy * cos;
        }
        return [sx, sy];
      });
    }
    
    /** Applies the  melt morph image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @param {*} accent - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applyMeltMorph(canvas, amount, accent) {
      const width = canvas.width;
      const height = canvas.height;
      warpCanvas(canvas, (x, y) => {
        const progress = y / Math.max(1, height - 1);
        const drift = Math.sin((x / width) * Math.PI * (3 + amount * 2.6) + progress * (4 + amount * 2.8)) * (6 + amount * 18);
        const sag = progress * progress * (8 + amount * 26) * (0.35 + dependencies.seededNoise(x * 0.02, y * 0.02, 0.77));
        const pull = Math.max(0, progress - 0.24) * (8 + amount * 32);
        return [x + drift * 0.25, y - sag - pull * 0.16];
      });
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.03 + dependencies.clamp(amount, 0, 1) * 0.05})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    
    /** Applies the  rubber sheet image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applyRubberSheet(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const srcCtx = source.getContext("2d", { willReadFrequently: true });
      const { data, width, height } = srcCtx.getImageData(0, 0, source.width, source.height);
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const sampleSource = dependencies.createSampleSource(source, 120 + strength * 80 + turbo * 70);
      const anchors = [];
      const cols = 4;
      const rows = 4;
    
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const px = canvas.width * (0.14 + (col / Math.max(1, cols - 1)) * 0.72);
          const py = canvas.height * (0.14 + (row / Math.max(1, rows - 1)) * 0.72);
          const idx = dependencies.getSampleSourceIndex(sampleSource, px, py);
          const luma = (
            sampleSource.data[idx]
            + sampleSource.data[idx + 1]
            + sampleSource.data[idx + 2]
          ) / 3;
          const darkness = 1 - luma / 255;
          if (darkness < 0.22 && dependencies.seededNoise(col, row, 0.71) < 0.55) continue;
          anchors.push({
            x: px + (dependencies.seededNoise(col, row, 1.13) - 0.5) * canvas.width * 0.08,
            y: py + (dependencies.seededNoise(col, row, 1.47) - 0.5) * canvas.height * 0.08,
            radius: Math.min(canvas.width, canvas.height) * (0.14 + darkness * 0.16 + strength * 0.06 + turbo * 0.03),
            pull: (0.18 + darkness * 0.42 + strength * 0.28 + turbo * 0.12) * Math.min(canvas.width, canvas.height) * 0.055,
          pinch: getPinchDirection(col, row),
          });
        }
      }
    
      if (anchors.length === 0) {
        anchors.push({
          x: canvas.width * 0.5,
          y: canvas.height * 0.5,
          radius: Math.min(canvas.width, canvas.height) * 0.24,
          pull: Math.min(canvas.width, canvas.height) * 0.05 * (0.5 + strength),
          pinch: 1,
        });
      }
    
      warpCanvas(canvas, (x, y) => {
        let sx = x;
        let sy = y;
    
        for (const anchor of anchors) {
          const dx = sx - anchor.x;
          const dy = sy - anchor.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          if (dist > anchor.radius) continue;
          const t = 1 - dist / anchor.radius;
          const membrane = t * t * (1.22 - t * 0.35);
          const bend = anchor.pull * membrane * anchor.pinch;
          sx -= (dx / dist) * bend;
          sy -= (dy / dist) * bend;
          const tangent = membrane * (0.08 + strength * 0.1 + turbo * 0.04) * anchor.radius;
          sx += (-dy / dist) * tangent * 0.16;
          sy += (dx / dist) * tangent * 0.12;
        }
    
        const luma = sampleImageLuma(data, width, height, sx, sy);
        const localDepth = (1 - luma / 255) * (0.8 + strength * 1.6 + turbo * 0.6);
        const reboundX = Math.sin((y / height) * Math.PI * (2.4 + strength * 1.6) + x * 0.006) * localDepth * 1.8;
        const reboundY = Math.cos((x / width) * Math.PI * (2 + strength * 1.4) + y * 0.007) * localDepth * 1.3;
        return [sx + reboundX, sy + reboundY];
      });
    
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.globalAlpha = dependencies.clamp(0.03 + strength * 0.04, 0.03, 0.08);
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = Math.max(0.6, canvas.width * 0.0018);
      const grid = Math.max(32, Math.round(56 - strength * 10 - turbo * 8));
      for (let y = grid; y < canvas.height; y += grid) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 12) {
          const yy = y + Math.sin(x * 0.014 + y * 0.008) * (1.2 + strength * 2.4);
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      for (let x = grid; x < canvas.width; x += grid) {
        ctx.beginPath();
        for (let y = 0; y <= canvas.height; y += 12) {
          const xx = x + Math.cos(y * 0.013 + x * 0.007) * (1.2 + strength * 2.1);
          if (y === 0) ctx.moveTo(xx, y);
          else ctx.lineTo(xx, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    
    /** Applies the  wave pull image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @param {*} soft - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applyWavePull(canvas, amount, soft) {
      const width = canvas.width;
      const height = canvas.height;
      warpCanvas(canvas, (x, y) => {
        const waveX = Math.sin((y / height) * Math.PI * (3.2 + amount * 2.8) + x * 0.008) * (8 + amount * 22);
        const waveY = Math.cos((x / width) * Math.PI * (2.8 + amount * 2.4) + y * 0.01) * (5 + amount * 16);
        return [x + waveX, y + waveY];
      });
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.strokeStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.04 + dependencies.clamp(amount, 0, 1) * 0.06})`;
      ctx.lineWidth = Math.max(0.6, canvas.width * 0.002);
      const lines = Math.max(4, Math.round(4 + dependencies.clamp(amount, 0, 1) * 7));
      for (let i = 0; i < lines; i += 1) {
        const y = (canvas.height / (lines + 1)) * (i + 1);
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 12) {
          const yy = y + Math.sin(x * 0.015 + i * 0.8 + amount * 2) * (2 + amount * 5);
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    
    /** Applies the  pinch morph image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applyPinchMorph(canvas, amount) {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const phaseOne = Math.min(1, amount * 1.4);
      const phaseTwo = Math.min(1, Math.max(0, amount - 0.28) * 1.25);
      const phaseThree = Math.min(1, Math.max(0, amount - 0.62) * 1.6);
      const radius = Math.min(width, height) * (0.28 + strength * 0.1 + turbo * 0.08 + phaseThree * 0.04);
      warpCanvas(canvas, (x, y) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        if (dist > radius) return [x, y];
        const t = 1 - dist / radius;
        const pull = t * t * (12 + phaseOne * 18 + phaseTwo * 22 + phaseThree * 34 + turbo * 28);
        const spiral = t * (phaseTwo * 2.2 + phaseThree * 4.6 + turbo * 3.2);
        return [
          x + (dx / dist) * pull - (dy / dist) * spiral,
          y + (dy / dist) * pull + (dx / dist) * spiral,
        ];
      });
    }
    
    /** Applies the  bulge morph image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applyBulgeMorph(canvas, amount) {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const phaseOne = Math.min(1, amount * 1.35);
      const phaseTwo = Math.min(1, Math.max(0, amount - 0.25) * 1.35);
      const phaseThree = Math.min(1, Math.max(0, amount - 0.58) * 1.75);
      const radius = Math.min(width, height) * (0.3 + strength * 0.12 + turbo * 0.08 + phaseThree * 0.05);
      warpCanvas(canvas, (x, y) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        if (dist > radius) return [x, y];
        const t = 1 - dist / radius;
        const push = t * (0.9 + t * 1.15) * (10 + phaseOne * 18 + phaseTwo * 24 + phaseThree * 30 + turbo * 26);
        const lens = t * t * (phaseTwo * 2 + phaseThree * 4.2 + turbo * 3);
        return [
          x - (dx / dist) * push + (dy / dist) * lens,
          y - (dy / dist) * push - (dx / dist) * lens,
        ];
      });
    }
    
    /** Applies the  crease pull image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @param {*} soft - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applyCreasePull(canvas, amount, soft) {
      const width = canvas.width;
      const height = canvas.height;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const phaseTwo = Math.min(1, Math.max(0, amount - 0.24) * 1.45);
      const phaseThree = Math.min(1, Math.max(0, amount - 0.58) * 1.8);
      const lines = [];
      const count = Math.max(3, Math.round(3 + strength * 4 + phaseTwo * 3 + turbo * 3));
      for (let i = 0; i < count; i += 1) {
        const vertical = dependencies.seededNoise(i, amount, 0.71) > 0.45;
        lines.push({
          vertical,
          pos: getCreasePosition(vertical, width, height, i, amount),
          tilt: (dependencies.seededNoise(i, amount, 1.91) - 0.5) * (0.28 + phaseTwo * 0.18 + turbo * 0.1),
          radius: getCreaseAxisLength(vertical, width, height) * (0.05 + strength * 0.045 + phaseTwo * 0.03 + turbo * 0.03),
          pull: 5 + strength * 12 + phaseTwo * 18 + phaseThree * 22 + turbo * 20,
        });
      }
      warpCanvas(canvas, (x, y) => {
        let sx = x;
        let sy = y;
        for (const line of lines) {
        let base = y - (line.pos + (x - width * 0.5) * line.tilt);
        if (line.vertical) base = x - (line.pos + (y - height * 0.5) * line.tilt);
          const absBase = Math.abs(base);
          if (absBase > line.radius) continue;
          const t = 1 - absBase / line.radius;
          const fold = t * t * line.pull;
          const cross = t * (phaseTwo * 1.4 + phaseThree * 3.1 + turbo * 2.4);
          if (line.vertical) {
            sx += Math.sign(base || 1) * fold;
            sy += Math.sin((y / height) * Math.PI * (2 + phaseThree)) * cross;
          } else {
            sy += Math.sign(base || 1) * fold;
            sx += Math.sin((x / width) * Math.PI * (2 + phaseThree)) * cross;
          }
        }
        return [sx, sy];
      });
      const ctx = canvas.getContext("2d");
      ctx.save();
      for (const line of lines) {
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + strength * 0.04})`;
        ctx.lineWidth = Math.max(0.6, getCreaseAxisLength(line.vertical, width, height) * 0.002);
        ctx.beginPath();
        if (line.vertical) {
          ctx.moveTo(line.pos - 1, 0);
          ctx.lineTo(line.pos + height * line.tilt - 1, height);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.03 + strength * 0.05})`;
          ctx.beginPath();
          ctx.moveTo(line.pos + 1, 0);
          ctx.lineTo(line.pos + height * line.tilt + 1, height);
          ctx.stroke();
        } else {
          ctx.moveTo(0, line.pos - 1);
          ctx.lineTo(width, line.pos + width * line.tilt - 1);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.03 + strength * 0.05})`;
          ctx.beginPath();
          ctx.moveTo(0, line.pos + 1);
          ctx.lineTo(width, line.pos + width * line.tilt + 1);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    
    /** Applies the  crumple morph image transformation.
     * @param {*} canvas - Morph renderer input.
     * @param {*} amount - Morph renderer input.
     * @param {*} soft - Morph renderer input.
     * @returns {void} Nothing.
     */
    function applyCrumpleMorph(canvas, amount, soft) {
      const width = canvas.width;
      const height = canvas.height;
      const strength = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const phaseTwo = Math.min(1, Math.max(0, amount - 0.2) * 1.5);
      const phaseThree = Math.min(1, Math.max(0, amount - 0.55) * 1.9);
      const nodes = [];
      const count = Math.max(6, Math.round(6 + strength * 6 + phaseTwo * 5 + turbo * 5));
      for (let i = 0; i < count; i += 1) {
        nodes.push({
          x: width * (0.08 + dependencies.seededNoise(i, amount, 0.63) * 0.84),
          y: height * (0.08 + dependencies.seededNoise(i, amount, 1.11) * 0.84),
          radius: Math.min(width, height) * (0.07 + dependencies.seededNoise(i, amount, 1.57) * 0.08 + strength * 0.035 + phaseThree * 0.02),
          force: (dependencies.seededNoise(i, amount, 2.03) - 0.5) * (14 + strength * 14 + phaseTwo * 16 + phaseThree * 22 + turbo * 18),
        });
      }
      warpCanvas(canvas, (x, y) => {
        let sx = x;
        let sy = y;
        for (const node of nodes) {
          const dx = sx - node.x;
          const dy = sy - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          if (dist > node.radius) continue;
          const t = 1 - dist / node.radius;
          const bend = t * t * node.force;
          sx -= (dx / dist) * bend * 0.45;
          sy -= (dy / dist) * bend * 0.45;
          sx += (-dy / dist) * bend * (0.08 + phaseTwo * 0.05);
          sy += (dx / dist) * bend * (0.08 + phaseTwo * 0.05);
        }
        const ripple = Math.sin((x + y) * 0.022 + amount * 1.8) * (1 + strength * 3.2 + phaseThree * 2.2 + turbo * 1.6);
        return [sx + ripple * (0.28 + phaseThree * 0.14), sy - ripple * (0.24 + phaseThree * 0.12)];
      });
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.strokeStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.03 + strength * 0.05})`;
      ctx.lineWidth = Math.max(0.5, width * 0.0016);
      for (const node of nodes) {
        ctx.beginPath();
        ctx.moveTo(node.x - node.radius * 0.4, node.y - node.radius * 0.4);
        ctx.lineTo(node.x + node.radius * 0.4, node.y + node.radius * 0.4);
        ctx.stroke();
      }
      ctx.restore();
    }
    
    /** Processes image pixels for the shared morph renderer.
     * @param {*} canvas - Morph renderer input.
     * @param {*} mapper - Morph renderer input.
     * @returns {void} Nothing.
     */
    function warpCanvas(canvas, mapper) {
      const source = dependencies.cloneCanvas(canvas);
      const srcCtx = source.getContext("2d", { willReadFrequently: true });
      const dstCtx = canvas.getContext("2d");
      const srcImage = srcCtx.getImageData(0, 0, source.width, source.height);
      const src = srcImage.data;
      const width = srcImage.width;
      const height = srcImage.height;
      const dest = dstCtx.createImageData(width, height);
      const out = dest.data;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const [sx, sy] = mapper(x, y, width, height);
          sampleImageDataBilinear(src, width, height, sx, sy, out, (y * width + x) * 4);
        }
      }
      dstCtx.putImageData(dest, 0, 0);
    }
    
    /** Processes image pixels for the shared morph renderer.
     * @param {*} src - Morph renderer input.
     * @param {*} width - Morph renderer input.
     * @param {*} height - Morph renderer input.
     * @param {*} x - Morph renderer input.
     * @param {*} y - Morph renderer input.
     * @param {*} out - Morph renderer input.
     * @param {*} outIndex - Morph renderer input.
     * @returns {number} Sampled image value.
     */
    function sampleImageDataBilinear(src, width, height, x, y, out, outIndex) {
      const clampedX = dependencies.clamp(x, 0, width - 1);
      const clampedY = dependencies.clamp(y, 0, height - 1);
      const x0 = Math.floor(clampedX);
      const y0 = Math.floor(clampedY);
      const x1 = Math.min(width - 1, x0 + 1);
      const y1 = Math.min(height - 1, y0 + 1);
      const tx = clampedX - x0;
      const ty = clampedY - y0;
      const i00 = (y0 * width + x0) * 4;
      const i10 = (y0 * width + x1) * 4;
      const i01 = (y1 * width + x0) * 4;
      const i11 = (y1 * width + x1) * 4;
      for (let c = 0; c < 4; c += 1) {
        const top = src[i00 + c] * (1 - tx) + src[i10 + c] * tx;
        const bottom = src[i01 + c] * (1 - tx) + src[i11 + c] * tx;
        out[outIndex + c] = top * (1 - ty) + bottom * ty;
      }
    }
    
    /** Processes image pixels for the shared morph renderer.
     * @param {*} src - Morph renderer input.
     * @param {*} width - Morph renderer input.
     * @param {*} height - Morph renderer input.
     * @param {*} x - Morph renderer input.
     * @param {*} y - Morph renderer input.
     * @returns {number} Sampled image value.
     */
    function sampleImageLuma(src, width, height, x, y) {
      const ix = dependencies.clamp(Math.round(x), 0, width - 1);
      const iy = dependencies.clamp(Math.round(y), 0, height - 1);
      const index = (iy * width + ix) * 4;
      return 0.299 * src[index] + 0.587 * src[index + 1] + 0.114 * src[index + 2];
    }

    /** Returns the horizontal or vertical dimension selected by a crease orientation.
     * @param {boolean} vertical - Whether the crease runs vertically.
     * @param {number} width - Canvas width in pixels.
     * @param {number} height - Canvas height in pixels.
     * @returns {number} The axis dimension for the orientation.
     */
    function getCreaseAxisLength(vertical, width, height) {
      if (vertical) return width;
      return height;
    }

    /** Calculates a deterministic crease position along its chosen axis.
     * @param {boolean} vertical - Whether the crease runs vertically.
     * @param {number} width - Canvas width in pixels.
     * @param {number} height - Canvas height in pixels.
     * @param {number} index - Crease index used as the seed.
     * @param {number} amount - Morph strength used as the seed.
     * @returns {number} Position in canvas pixels.
     */
    function getCreasePosition(vertical, width, height, index, amount) {
      if (vertical) return width * (0.12 + dependencies.seededNoise(index, amount, 1.13) * 0.76);
      return height * (0.12 + dependencies.seededNoise(index, amount, 1.47) * 0.76);
    }

    /** Selects a deterministic pinch or pull direction for a rubber-sheet anchor.
     * @param {number} column - Anchor grid column.
     * @param {number} row - Anchor grid row.
     * @returns {number} Either positive one or negative one.
     */
    function getPinchDirection(column, row) {
      if (dependencies.seededNoise(column, row, 2.03) > 0.42) return 1;
      return -1;
    }
    return Object.freeze({ applyMorphEffects });
  }

  return Object.freeze({ createMorphEffects });
});
