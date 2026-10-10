(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineCampaignEffects = library;
  }
})(globalThis, function () {
  "use strict";

  /** Creates campaign renderers with explicit pixel helper dependencies.
   * @param {{clamp: function(number, number, number): number, mix: function(number, number, number): number}} dependencies - Numeric helpers used by the campaign pixel filter.
   * @returns {object} Frozen public campaign-effect API.
   */
  function createCampaignEffects(dependencies) {
    if (!dependencies || typeof dependencies.clamp !== "function" || typeof dependencies.mix !== "function") {
      throw new TypeError("clamp and mix dependencies are required.");
    }

    /** Draws a scalable moustache overlay at an adjustable avatar position.
     * @param {HTMLCanvasElement} canvas - Canvas to draw into.
     * @param {number} size - Normalized moustache size.
     * @param {number} shape - Normalized moustache shape.
     * @param {number} offsetX - Normalized horizontal offset from the center.
     * @param {number} offsetY - Normalized vertical offset from the default position.
     * @returns {void} Nothing.
     */
    function applyMoustache(canvas, size, shape, offsetX, offsetY) {
      const context = canvas.getContext("2d");
      const width = canvas.width * (0.13 + size * 0.24);
      const height = width * (0.2 + shape * 0.34);
      const centerX = canvas.width * (0.5 + offsetX * 0.45);
      const centerY = canvas.height * (0.59 + offsetY * 0.45);
      const lobe = width * (0.5 - shape * 0.08);
      const tipY = height * (0.18 + shape * 0.48);

      context.save();
      context.translate(centerX, centerY);
      context.fillStyle = "#211714";
      context.strokeStyle = "rgba(255,255,255,0.42)";
      context.lineWidth = Math.max(1, canvas.width * 0.002);
      context.beginPath();
      context.moveTo(0, height * 0.1);
      context.bezierCurveTo(-width * 0.14, -height * 0.48, -lobe * 0.56, -height * 0.25, -lobe, -height * 0.02);
      context.bezierCurveTo(-width * 0.93, height * 0.48, -width * 0.48, height * 0.4, -width * 0.08, tipY);
      context.bezierCurveTo(-width * 0.04, height * 0.12, -width * 0.02, height * 0.04, 0, height * 0.1);
      context.bezierCurveTo(width * 0.14, -height * 0.48, lobe * 0.56, -height * 0.25, lobe, -height * 0.02);
      context.bezierCurveTo(width * 0.93, height * 0.48, width * 0.48, height * 0.4, width * 0.08, tipY);
      context.bezierCurveTo(width * 0.04, height * 0.12, width * 0.02, height * 0.04, 0, height * 0.1);
      context.closePath();
      context.fill();
      context.stroke();
      context.restore();
    }

    /** Blends repeating rainbow bands into image luminance so photo detail remains visible.
     * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
     * @param {number} width - Image width in pixels.
     * @param {number} height - Image height in pixels.
     * @param {number} bandWidth - Normalized width of each rainbow band.
     * @param {number} intensity - Normalized rainbow blend strength.
     * @returns {Uint8ClampedArray} The mutated pixel buffer.
     */
    function applyRainbow(data, width, height, bandWidth, intensity) {
      const colors = [
        [230, 55, 75],
        [246, 139, 52],
        [248, 218, 69],
        [63, 171, 98],
        [55, 120, 213],
        [133, 76, 184],
      ];
      const stripeWidth = Math.max(2, Math.round(Math.min(width, height) * (0.018 + bandWidth * 0.14)));
      const blend = intensity * 0.62;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const stripeIndex = Math.floor(x / stripeWidth) % colors.length;
          const color = colors[stripeIndex];
          const pixelIndex = (y * width + x) * 4;
          const luminance = 0.299 * data[pixelIndex] + 0.587 * data[pixelIndex + 1] + 0.114 * data[pixelIndex + 2];
          const shade = 0.28 + (luminance / 255) * 0.72;
          data[pixelIndex] = dependencies.mix(data[pixelIndex], color[0] * shade, blend);
          data[pixelIndex + 1] = dependencies.mix(data[pixelIndex + 1], color[1] * shade, blend);
          data[pixelIndex + 2] = dependencies.mix(data[pixelIndex + 2], color[2] * shade, blend);
        }
      }
      return data;
    }

    /** Draws a scalable awareness ribbon overlay.
     * @param {HTMLCanvasElement} canvas - Canvas to draw into.
     * @param {number} size - Normalized ribbon size.
     * @param {number} shape - Normalized ribbon style selector.
     * @returns {void} Nothing.
     */
    function applyRibbon(canvas, size, shape) {
      const context = canvas.getContext("2d");
      const scale = 0.52 + size * 0.9;
      const centerX = canvas.width * 0.82;
      const centerY = canvas.height * 0.2;
      const bandWidth = canvas.width * 0.022 * scale;
      const loopWidth = canvas.width * (0.045 + shape * 0.035) * scale;
      const loopHeight = canvas.height * (0.075 + shape * 0.045) * scale;
      let color = "#ed5a9a";
      if (shape >= 0.5) {
        color = "#d92e3f";
      }

      context.save();
      context.translate(centerX, centerY);
      context.rotate(-0.22);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "rgba(24,12,18,0.62)";
      context.lineWidth = bandWidth + Math.max(2, canvas.width * 0.006);
      context.beginPath();
      context.moveTo(0, loopHeight * 0.22);
      context.bezierCurveTo(-loopWidth * 1.8, -loopHeight * 1.4, -loopWidth * 0.2, -loopHeight * 1.55, 0, 0);
      context.moveTo(0, loopHeight * 0.22);
      context.bezierCurveTo(loopWidth * 1.8, -loopHeight * 1.4, loopWidth * 0.2, -loopHeight * 1.55, 0, 0);
      context.moveTo(0, 0);
      context.lineTo(-loopWidth * 0.62, loopHeight * 1.5);
      context.moveTo(0, 0);
      context.lineTo(loopWidth * 0.76, loopHeight * 1.38);
      context.stroke();

      context.strokeStyle = color;
      context.lineWidth = bandWidth;
      context.beginPath();
      context.moveTo(0, loopHeight * 0.22);
      context.bezierCurveTo(-loopWidth * 1.8, -loopHeight * 1.4, -loopWidth * 0.2, -loopHeight * 1.55, 0, 0);
      context.moveTo(0, loopHeight * 0.22);
      context.bezierCurveTo(loopWidth * 1.8, -loopHeight * 1.4, loopWidth * 0.2, -loopHeight * 1.55, 0, 0);
      context.moveTo(0, 0);
      context.lineTo(-loopWidth * 0.62, loopHeight * 1.5);
      context.moveTo(0, 0);
      context.lineTo(loopWidth * 0.76, loopHeight * 1.38);
      context.stroke();
      context.restore();
    }

    /** Reports whether any canvas campaign overlay should be rendered.
     * @param {{movemberSize: number, ribbonSize: number}} campaigns - Campaign slider values.
     * @returns {boolean} True when a moustache or ribbon is active.
     */
    function hasOverlays(campaigns) {
      return campaigns.movemberSize > 0 || campaigns.ribbonSize > 0;
    }

    return Object.freeze({ applyMoustache, applyRainbow, applyRibbon, hasOverlays });
  }

  return Object.freeze({ createCampaignEffects });
});
