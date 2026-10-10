(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineMorphologyEffects = library;
  }
})(globalThis, function () {
  "use strict";

  /** Creates morphology operations with explicit image-buffer and math dependencies.
   * @param {{createImageData: function(number, number): ImageData, clamp: function(number, number, number): number, mix: function(number, number, number): number}} dependencies - ImageData factory and channel helpers.
   * @returns {{applyMorphology: function(ImageData, number, number, string, number): ImageData}} Morphology API.
   */
  function createMorphologyEffects(dependencies) {
    if (!dependencies || typeof dependencies.createImageData !== "function" || typeof dependencies.clamp !== "function" || typeof dependencies.mix !== "function") {
      throw new TypeError("createImageData, clamp, and mix dependencies are required.");
    }

    /** Creates a same-size copy of an RGBA image buffer.
     * @param {ImageData} source - Source image data to copy.
     * @returns {ImageData} Independent pixel-data copy.
     */
    function cloneImageData(source) {
      const clone = dependencies.createImageData(source.width, source.height);
      clone.data.set(source.data);
      return clone;
    }

    /** Blends two same-size RGBA buffers while retaining base alpha values.
     * @param {ImageData} base - Original image data.
     * @param {ImageData} effect - Processed image data.
     * @param {number} amount - Blend strength.
     * @returns {ImageData} Newly allocated blended image data.
     */
    function mixImageData(base, effect, amount) {
      const output = dependencies.createImageData(base.width, base.height);
      for (let i = 0; i < base.data.length; i += 4) {
        output.data[i] = dependencies.clamp(dependencies.mix(base.data[i], effect.data[i], amount), 0, 255);
        output.data[i + 1] = dependencies.clamp(dependencies.mix(base.data[i + 1], effect.data[i + 1], amount), 0, 255);
        output.data[i + 2] = dependencies.clamp(dependencies.mix(base.data[i + 2], effect.data[i + 2], amount), 0, 255);
        output.data[i + 3] = base.data[i + 3];
      }
      return output;
    }

    /** Produces a blended absolute-difference image while retaining first-buffer alpha.
     * @param {ImageData} first - First image data.
     * @param {ImageData} second - Second image data.
     * @param {number} amount - Difference blend strength.
     * @returns {ImageData} Newly allocated difference image data.
     */
    function differenceImageData(first, second, amount) {
      const output = dependencies.createImageData(first.width, first.height);
      for (let i = 0; i < first.data.length; i += 4) {
        output.data[i] = dependencies.clamp(dependencies.mix(first.data[i], dependencies.clamp(first.data[i] - second.data[i] + 128, 0, 255), amount), 0, 255);
        output.data[i + 1] = dependencies.clamp(dependencies.mix(first.data[i + 1], dependencies.clamp(first.data[i + 1] - second.data[i + 1] + 128, 0, 255), amount), 0, 255);
        output.data[i + 2] = dependencies.clamp(dependencies.mix(first.data[i + 2], dependencies.clamp(first.data[i + 2] - second.data[i + 2] + 128, 0, 255), amount), 0, 255);
        output.data[i + 3] = first.data[i + 3];
      }
      return output;
    }

    /** Runs one max/min neighborhood pass across RGB channels.
     * @param {ImageData} source - Image data to process.
     * @param {number} width - Image width in pixels.
     * @param {number} height - Image height in pixels.
     * @param {number} radius - Integer pixel radius of the square neighborhood.
     * @param {string} operation - Either `max` for dilation or `min` for erosion.
     * @returns {ImageData} Newly allocated morphology-pass result.
     */
    function morphologyPass(source, width, height, radius, operation) {
      const output = dependencies.createImageData(width, height);
      const src = source.data;
      const dst = output.data;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = (y * width + x) * 4;
          let r = 255;
          let g = 255;
          let b = 255;
          if (operation === "max") {
            r = 0;
            g = 0;
            b = 0;
          }

          for (let ky = -radius; ky <= radius; ky += 1) {
            for (let kx = -radius; kx <= radius; kx += 1) {
              const px = dependencies.clamp(x + kx, 0, width - 1);
              const py = dependencies.clamp(y + ky, 0, height - 1);
              const sample = (py * width + px) * 4;
              if (operation === "max") {
                r = Math.max(r, src[sample]);
                g = Math.max(g, src[sample + 1]);
                b = Math.max(b, src[sample + 2]);
              } else {
                r = Math.min(r, src[sample]);
                g = Math.min(g, src[sample + 1]);
                b = Math.min(b, src[sample + 2]);
              }
            }
          }

          dst[index] = r;
          dst[index + 1] = g;
          dst[index + 2] = b;
          dst[index + 3] = src[index + 3];
        }
      }
      return output;
    }

    /** Applies a named morphology operation and blends it with the source.
     * @param {ImageData} source - RGBA image data to process.
     * @param {number} width - Image width in pixels; must match source dimensions.
     * @param {number} height - Image height in pixels; must match source dimensions.
     * @param {string} mode - One of `dilate`, `erode`, `open`, `close`, `tophat`, or `blackhat`.
     * @param {number} amount - Effect strength from zero to one.
     * @returns {ImageData} Newly allocated processed image data.
     */
    function applyMorphology(source, width, height, mode, amount) {
      if (!source || !source.data || source.width !== width || source.height !== height || source.data.length !== width * height * 4) {
        throw new RangeError("ImageData dimensions and RGBA buffer must match the supplied dimensions.");
      }
      if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
        throw new RangeError("Image dimensions must be positive integers.");
      }
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 1) {
        throw new RangeError("amount must be a finite number from zero to one.");
      }
      const validModes = ["dilate", "erode", "open", "close", "tophat", "blackhat"];
      if (!validModes.includes(mode)) {
        throw new RangeError("mode must be a supported morphology operation.");
      }

      let baseRadius = 0.6 + amount * 2.2;
      if (mode === "tophat" || mode === "blackhat") {
        baseRadius = 1 + amount * 2.2;
      }
      const radius = Math.max(1, Math.round(baseRadius));
      let iterations = 1;
      if (amount > 0.72) {
        iterations = 2;
      }
      let working = cloneImageData(source);

      /** Runs a dilation or erosion pass using the current radius.
       * @param {string} operation - `dilate` or `erode` operation name.
       * @param {ImageData} input - Image data to process.
       * @returns {ImageData} Result of the morphology pass.
       */
      function run(operation, input) {
        if (operation === "dilate") {
          return morphologyPass(input, width, height, radius, "max");
        }
        return morphologyPass(input, width, height, radius, "min");
      }

      if (mode === "dilate" || mode === "erode") {
        for (let i = 0; i < iterations; i += 1) {
          working = run(mode, working);
        }
        return mixImageData(source, working, 0.08 + amount * 0.42);
      }

      if (mode === "open") {
        let result = working;
        for (let i = 0; i < iterations; i += 1) result = run("erode", result);
        for (let i = 0; i < iterations; i += 1) result = run("dilate", result);
        return mixImageData(source, result, 0.1 + amount * 0.38);
      }

      if (mode === "close") {
        let result = working;
        for (let i = 0; i < iterations; i += 1) result = run("dilate", result);
        for (let i = 0; i < iterations; i += 1) result = run("erode", result);
        return mixImageData(source, result, 0.1 + amount * 0.38);
      }

      if (mode === "tophat") {
        let result = working;
        for (let i = 0; i < iterations; i += 1) result = run("erode", result);
        for (let i = 0; i < iterations; i += 1) result = run("dilate", result);
        return differenceImageData(source, result, 0.08 + amount * 0.4);
      }

      let result = working;
      for (let i = 0; i < iterations; i += 1) result = run("dilate", result);
      for (let i = 0; i < iterations; i += 1) result = run("erode", result);
      return differenceImageData(result, source, 0.08 + amount * 0.4);
    }

    return Object.freeze({ applyMorphology });
  }

  return Object.freeze({ createMorphologyEffects });
});
