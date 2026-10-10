(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineCanvasSampling = library;
  }
})(globalThis, function () {
  "use strict";

  const validatedSampleSources = new WeakSet();

  /** Creates reusable downsampled canvas sampling helpers.
   * @param {{getScratchCanvas:function(number,number):HTMLCanvasElement,clamp:function(number,number,number):number}} dependencies - Scratch canvas and numeric helpers.
   * @returns {object} Frozen source creation and pixel sampling API.
   */
  function createCanvasSampling(dependencies) {
    if (!dependencies || typeof dependencies.getScratchCanvas !== "function" || typeof dependencies.clamp !== "function") {
      throw new TypeError("getScratchCanvas and clamp dependencies are required.");
    }

    /** Creates a downsampled pixel source while preserving its original dimensions.
     * @param {HTMLCanvasElement} canvas - Source canvas with a readable 2D context.
     * @param {number} maxDimension - Longest allowed sampled side; values are clamped to at least 32.
     * @returns {{data:Uint8ClampedArray,width:number,height:number,originWidth:number,originHeight:number}} Sampled pixels and source dimensions.
     */
    function createSampleSource(canvas, maxDimension) {
      if (!canvas || !Number.isFinite(canvas.width) || canvas.width <= 0 || !Number.isFinite(canvas.height) || canvas.height <= 0) {
        throw new TypeError("canvas must have positive finite dimensions.");
      }
      let maximum = maxDimension;
      if (maximum === undefined) {
        maximum = 420;
      }
      if (typeof maximum !== "number" || !Number.isFinite(maximum)) {
        throw new TypeError("maxDimension must be a finite number.");
      }
      const safeMaximum = Math.max(32, Math.round(maximum));
      const longestSide = Math.max(canvas.width, canvas.height);
      let scale = 1;
      if (longestSide > safeMaximum) {
        scale = safeMaximum / longestSide;
      }
      const width = Math.max(1, Math.round(canvas.width * scale));
      const height = Math.max(1, Math.round(canvas.height * scale));
      const sampleCanvas = dependencies.getScratchCanvas(width, height);
      const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
      if (!context || typeof context.clearRect !== "function" || typeof context.drawImage !== "function" || typeof context.getImageData !== "function") {
        throw new TypeError("scratch canvas must provide a readable 2D context.");
      }
      context.clearRect(0, 0, width, height);
      context.drawImage(canvas, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      if (!imageData || !(imageData.data instanceof Uint8ClampedArray) || imageData.data.length !== width * height * 4) {
        throw new TypeError("scratch canvas returned invalid RGBA image data.");
      }
      const sampleSource = Object.freeze({
        data: imageData.data,
        width,
        height,
        originWidth: canvas.width,
        originHeight: canvas.height,
      });
      validatedSampleSources.add(sampleSource);
      return sampleSource;
    }

    /** Maps source-canvas coordinates to an RGBA byte index in a sampled source.
     * @param {{width:number,height:number,originWidth:number,originHeight:number}} sampleSource - Sample metadata.
     * @param {number} x - Horizontal source coordinate.
     * @param {number} y - Vertical source coordinate.
     * @returns {number} Byte index of the mapped RGBA pixel.
     */
    function getSampleSourceIndex(sampleSource, x, y) {
      validateSampleSource(sampleSource);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError("sample coordinates must be finite numbers.");
      }
      const sx = dependencies.clamp(
        Math.round((dependencies.clamp(x, 0, sampleSource.originWidth - 1) / Math.max(1, sampleSource.originWidth - 1)) * Math.max(0, sampleSource.width - 1)),
        0,
        sampleSource.width - 1
      );
      const sy = dependencies.clamp(
        Math.round((dependencies.clamp(y, 0, sampleSource.originHeight - 1) / Math.max(1, sampleSource.originHeight - 1)) * Math.max(0, sampleSource.height - 1)),
        0,
        sampleSource.height - 1
      );
      return (sy * sampleSource.width + sx) * 4;
    }

    /** Reads one color channel at source-canvas coordinates.
     * @param {{data:Uint8ClampedArray,width:number,height:number,originWidth:number,originHeight:number}} sampleSource - Sample pixels and dimensions.
     * @param {number} x - Horizontal source coordinate.
     * @param {number} y - Vertical source coordinate.
     * @param {number} channel - RGBA channel index from zero to three.
     * @returns {number} Sampled channel byte value.
     */
    function getSampleSourceChannel(sampleSource, x, y, channel) {
      if (!Number.isInteger(channel) || channel < 0 || channel > 3) {
        throw new RangeError("channel must be an integer from zero through three.");
      }
      return sampleSource.data[getSampleSourceIndex(sampleSource, x, y) + channel];
    }

    /** Reads a rounded, edge-clamped pixel channel from a full-resolution RGBA buffer.
     * @param {Uint8ClampedArray} data - RGBA pixels arranged row by row.
     * @param {number} width - Image width in pixels.
     * @param {number} height - Image height in pixels.
     * @param {number} x - Horizontal pixel coordinate.
     * @param {number} y - Vertical pixel coordinate.
     * @param {number} channel - RGBA channel index from zero to three.
     * @returns {number} Channel value at the nearest in-bounds pixel.
     */
    function getPixelChannel(data, width, height, x, y, channel) {
      if (!(data instanceof Uint8ClampedArray)) {
        throw new TypeError("data must be a Uint8ClampedArray.");
      }
      if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0 || data.length !== width * height * 4) {
        throw new RangeError("data length must match positive image dimensions.");
      }
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError("pixel coordinates must be finite numbers.");
      }
      if (!Number.isInteger(channel) || channel < 0 || channel > 3) {
        throw new RangeError("channel must be an integer from zero through three.");
      }
      const pixelX = dependencies.clamp(Math.round(x), 0, width - 1);
      const pixelY = dependencies.clamp(Math.round(y), 0, height - 1);
      return data[(pixelY * width + pixelX) * 4 + channel];
    }

    /** Validates dimensions and pixel storage before coordinate mapping.
     * @param {object} sampleSource - Sample source to validate.
     * @returns {void} Throws when sample metadata is malformed.
     */
    function validateSampleSource(sampleSource) {
      if (sampleSource && validatedSampleSources.has(sampleSource)) {
        return;
      }
      if (!sampleSource || !(sampleSource.data instanceof Uint8ClampedArray)) {
        throw new TypeError("sampleSource must contain Uint8ClampedArray data.");
      }
      const dimensions = [sampleSource.width, sampleSource.height, sampleSource.originWidth, sampleSource.originHeight];
      for (const dimension of dimensions) {
        if (!Number.isInteger(dimension) || dimension <= 0) {
          throw new RangeError("sample dimensions must be positive integers.");
        }
      }
      if (sampleSource.data.length !== sampleSource.width * sampleSource.height * 4) {
        throw new RangeError("sample data length must match its dimensions.");
      }
      validatedSampleSources.add(sampleSource);
    }

    return Object.freeze({ createSampleSource, getSampleSourceIndex, getSampleSourceChannel, getPixelChannel });
  }

  return Object.freeze({ createCanvasSampling });
});
