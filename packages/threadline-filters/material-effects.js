(function (root, createLibrary) {
  "use strict";
  const library = createLibrary();
  if (typeof module === "object" && module.exports) module.exports = library;
  if (root) root.ThreadlineMaterialEffects = library;
})(globalThis, function () {
  "use strict";

  /** Creates material renderers from explicit canvas, color, pixel, and random dependencies.
   * @param {object} dependencies - Required renderer helpers supplied by the host project.
   * @returns {object} Frozen material renderer API.
   */
  function createMaterialEffects(dependencies) {
    const required = ["clamp", "mix", "smoothstep", "curveThousand", "random", "getScratchCanvas", "cloneCanvas", "drawLinePattern", "drawScratches", "drawPerforatedPattern", "parseHexColor", "rgbaString", "applyGrayscale", "applyScanlines"];
    if (!dependencies) throw new TypeError("Material renderer dependencies are required.");
    for (const name of required) {
      if (typeof dependencies[name] !== "function") throw new TypeError(`${name} dependency is required.`);
    }

    /** Applies configured material effects in the established application order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} materials - Material slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette settings.
     * @returns {void} Nothing.
     */
    function applyMaterialEffects(canvas, materials, colors) {
      const context = canvas.getContext("2d");
      const accent = dependencies.parseHexColor(colors.overlayColor);
      const soft = dependencies.parseHexColor(colors.duotoneLight);
      const dark = dependencies.parseHexColor(colors.duotoneDark);
      if (materials.bottleGlass > 0) tintAndNoiseCanvas(canvas, dependencies.curveThousand(materials.bottleGlass / 100, 1.3, 1), [-22, 18, -12], 10);
      if (materials.frostedGlass > 0) applyFrostedGlass(canvas, dependencies.curveThousand(materials.frostedGlass / 100, 1.35, 1));
      if (materials.raindrops > 0) drawRaindrops(context, canvas, dependencies.curveThousand(materials.raindrops / 100, 1.35, 2.4));
      if (materials.scratches > 0) dependencies.drawScratches(context, canvas, dependencies.curveThousand(materials.scratches / 100, 1.5, 1), dependencies.random);
      if (materials.plasticWrap > 0) drawPlasticWrap(context, canvas, dependencies.curveThousand(materials.plasticWrap / 100, 1.4, 1));
      if (materials.paperFiber > 0) tintAndNoiseCanvas(canvas, dependencies.curveThousand(materials.paperFiber / 100, 1.3, 1), [18, 14, 6], 18);
      if (materials.cardboard > 0) tintAndNoiseCanvas(canvas, dependencies.curveThousand(materials.cardboard / 100, 1.28, 1), [28, 14, -8], 22);
      if (materials.newsprint > 0) applyNewsprint(canvas, dependencies.curveThousand(materials.newsprint / 100, 1.18, 1));
      if (materials.thermalFax > 0) applyThermalFax(canvas, dependencies.curveThousand(materials.thermalFax / 100, 1.32, 1));
      if (materials.brushedMetal > 0) drawBrushedMetal(context, canvas, dependencies.curveThousand(materials.brushedMetal / 100, 1.35, 1));
      if (materials.perforatedMetal > 0) dependencies.drawPerforatedPattern(context, canvas, materials.perforatedMetal / 100, dark);
      if (materials.concrete > 0) tintAndNoiseCanvas(canvas, dependencies.curveThousand(materials.concrete / 100, 1.28, 1), [-10, -10, -10], 28);
      if (materials.asphalt > 0) tintAndNoiseCanvas(canvas, dependencies.curveThousand(materials.asphalt / 100, 1.28, 1), [-28, -24, -18], 34);
      if (materials.paperTexture > 0) applyPaperTexture(context, canvas, materials.paperTexture / 100);
      if (materials.linen > 0) drawLinen(context, canvas, dependencies.curveThousand(materials.linen / 100, 1.3, 1), soft);
      if (materials.meshFabric > 0) drawFabricMesh(context, canvas, dependencies.curveThousand(materials.meshFabric / 100, 1.35, 1), accent, dark);
    }

    /** Blurs a copy of the canvas and composites it as frosted glass.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized glass strength.
     * @returns {void} Nothing.
     */
    function applyFrostedGlass(canvas, amount) {
      const blurCanvas = dependencies.getScratchCanvas(canvas.width, canvas.height);
      const blurContext = blurCanvas.getContext("2d");
      blurContext.filter = `blur(${1.5 + amount * 6}px)`;
      blurContext.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
      blurContext.drawImage(canvas, 0, 0);
      const context = canvas.getContext("2d");
      context.save();
      context.globalAlpha = 0.28 + amount * 0.42;
      context.drawImage(blurCanvas, 0, 0);
      context.restore();
    }

    /** Draws randomized radial water drops.
     * @param {CanvasRenderingContext2D} context - Target canvas context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds.
     * @param {number} amount - Normalized drop density and size.
     * @returns {void} Nothing.
     */
    function drawRaindrops(context, canvas, amount) {
      context.save();
      const density = Math.max(0, amount);
      const progress = dependencies.clamp(amount, 0, 1);
      const drops = Math.round(28 + density * 180 + Math.max(0, density - 1) * 320);
      for (let index = 0; index < drops; index += 1) {
        const x = dependencies.random() * canvas.width;
        const y = dependencies.random() * canvas.height;
        const radius = 1.8 + dependencies.random() * (3.5 + density * 8);
        const gradient = context.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255,255,255,${0.18 + progress * 0.28})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }

    /** Draws translucent diagonal plastic-wrap highlights.
     * @param {CanvasRenderingContext2D} context - Target canvas context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds.
     * @param {number} amount - Normalized wrap strength.
     * @returns {void} Nothing.
     */
    function drawPlasticWrap(context, canvas, amount) {
      context.save();
      const count = Math.round(8 + amount * 20);
      for (let index = 0; index < count; index += 1) {
        const x = dependencies.random() * canvas.width;
        const width = 18 + dependencies.random() * canvas.width * 0.18;
        const gradient = context.createLinearGradient(x, 0, x + width, canvas.height);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.45, `rgba(255,255,255,${0.06 + amount * 0.16})`);
        gradient.addColorStop(0.55, `rgba(255,255,255,${0.12 + amount * 0.22})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = gradient;
        context.fillRect(x, 0, width, canvas.height);
      }
      context.restore();
    }

    /** Re-renders the image as a coarse newspaper halftone.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized print strength.
     * @returns {void} Nothing.
     */
    function applyNewsprint(canvas, amount) {
      const source = dependencies.cloneCanvas(canvas);
      const sample = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
      const context = canvas.getContext("2d");
      const progress = dependencies.clamp(amount / 10, 0, 1);
      const step = Math.max(5, Math.round(5 + progress * 15));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#f2ece3";
      context.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const sx = dependencies.clamp(Math.round(x), 0, canvas.width - 1);
          const sy = dependencies.clamp(Math.round(y), 0, canvas.height - 1);
          const pixelIndex = (sy * canvas.width + sx) * 4;
          const gray = (sample[pixelIndex] + sample[pixelIndex + 1] + sample[pixelIndex + 2]) / 3;
          const radius = (1 - gray / 255) * (0.35 + step * (0.28 + progress * 0.22));
          if (radius < 0.22) continue;
          let horizontalOffset = step * 0.48;
          if (y / step % 2 === 0) horizontalOffset = step * 0.15;
          context.fillStyle = `rgba(24,22,20,${0.14 + progress * 0.18})`;
          context.beginPath();
          context.arc(x + horizontalOffset, y + step * 0.4, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
    }

    /** Applies a warm monochrome thermal-fax treatment and paper noise.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized fax strength.
     * @returns {void} Nothing.
     */
    function applyThermalFax(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      dependencies.applyGrayscale(data, 1);
      const warmth = 8 + amount * 22;
      const threshold = 198 - amount * 54;
      for (let index = 0; index < data.length; index += 4) {
        const gray = data[index];
        const localContrast = dependencies.smoothstep(threshold - 42, threshold + 26, gray);
        const ink = dependencies.clamp(255 - localContrast * 255, 0, 255);
        const softened = dependencies.mix(gray, ink, 0.18 + amount * 0.42);
        data[index] = dependencies.clamp(softened + warmth, 0, 255);
        data[index + 1] = dependencies.clamp(softened + warmth * 0.96, 0, 255);
        data[index + 2] = dependencies.clamp(softened + warmth * 0.8, 0, 255);
      }
      dependencies.applyScanlines(data, canvas.width, canvas.height, 0.06 + amount * 0.22);
      context.putImageData(imageData, 0, 0);
      tintAndNoiseCanvas(canvas, amount * 0.55, [10, 8, -2], 8);
    }

    /** Adds randomized horizontal metallic streaks to image pixels.
     * @param {CanvasRenderingContext2D} context - Target canvas context.
     * @param {HTMLCanvasElement} canvas - Canvas to process.
     * @param {number} amount - Normalized metal strength.
     * @returns {void} Nothing.
     */
    function drawBrushedMetal(context, canvas, amount) {
      context.save();
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let y = 0; y < canvas.height; y += 1) {
        const streak = (dependencies.random() - 0.5) * (18 + amount * 48);
        for (let x = 0; x < canvas.width; x += 1) {
          const index = (y * canvas.width + x) * 4;
          data[index] = dependencies.clamp(data[index] + streak + 12 * amount, 0, 255);
          data[index + 1] = dependencies.clamp(data[index + 1] + streak + 12 * amount, 0, 255);
          data[index + 2] = dependencies.clamp(data[index + 2] + streak + 16 * amount, 0, 255);
        }
      }
      context.putImageData(imageData, 0, 0);
      context.restore();
    }

    /** Applies the paper-texture pixel tint and grain.
     * @param {CanvasRenderingContext2D} context - Target canvas context.
     * @param {HTMLCanvasElement} canvas - Canvas to process.
     * @param {number} amount - Normalized texture strength.
     * @returns {void} Nothing.
     */
    function applyPaperTexture(context, canvas, amount) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const tint = 6 + amount * 12;
      for (let index = 0; index < data.length; index += 4) {
        const noise = (dependencies.random() - 0.5) * (10 + amount * 18);
        data[index] = dependencies.clamp(data[index] + noise + tint, 0, 255);
        data[index + 1] = dependencies.clamp(data[index + 1] + noise + tint * 0.95, 0, 255);
        data[index + 2] = dependencies.clamp(data[index + 2] + noise + tint * 0.82, 0, 255);
      }
      context.putImageData(imageData, 0, 0);
    }

    /** Draws the crossed weave of linen threads.
     * @param {CanvasRenderingContext2D} context - Target canvas context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds.
     * @param {number} amount - Normalized weave strength.
     * @param {object} soft - Parsed light RGB color.
     * @returns {void} Nothing.
     */
    function drawLinen(context, canvas, amount, soft) {
      dependencies.drawLinePattern(context, canvas, { spacing: Math.max(10, 22 - amount * 8), lineWidth: 1 + amount, angle: 0, color: dependencies.rgbaString(soft, 0.04 + amount * 0.08) });
      dependencies.drawLinePattern(context, canvas, { spacing: Math.max(10, 22 - amount * 8), lineWidth: 1 + amount, angle: 90, color: dependencies.rgbaString(soft, 0.04 + amount * 0.08) });
    }

    /** Draws a colored crosshatch fabric mesh.
     * @param {CanvasRenderingContext2D} context - Target canvas context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds.
     * @param {number} amount - Normalized mesh strength.
     * @param {object} accent - Parsed accent RGB color.
     * @param {object} dark - Parsed dark RGB color.
     * @returns {void} Nothing.
     */
    function drawFabricMesh(context, canvas, amount, accent, dark) {
      dependencies.drawLinePattern(context, canvas, { spacing: Math.max(8, 18 - amount * 7), lineWidth: 1 + amount * 1.5, angle: 0, color: dependencies.rgbaString(dark, 0.04 + amount * 0.08) });
      dependencies.drawLinePattern(context, canvas, { spacing: Math.max(8, 18 - amount * 7), lineWidth: 1 + amount * 1.5, angle: 90, color: dependencies.rgbaString(accent, 0.04 + amount * 0.08) });
    }

    /** Applies an RGB tint shift and injected random grain to canvas pixels.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized effect strength.
     * @param {number[]} rgbShift - Per-channel tint offsets.
     * @param {number} noiseScale - Noise multiplier.
     * @returns {void} Nothing.
     */
    function tintAndNoiseCanvas(canvas, amount, rgbShift, noiseScale) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let index = 0; index < data.length; index += 4) {
        const noise = (dependencies.random() - 0.5) * noiseScale * amount;
        data[index] = dependencies.clamp(data[index] + rgbShift[0] * amount + noise, 0, 255);
        data[index + 1] = dependencies.clamp(data[index + 1] + rgbShift[1] * amount + noise, 0, 255);
        data[index + 2] = dependencies.clamp(data[index + 2] + rgbShift[2] * amount + noise, 0, 255);
      }
      context.putImageData(imageData, 0, 0);
    }

    return Object.freeze({ applyMaterialEffects });
  }

  return Object.freeze({ createMaterialEffects });
});
