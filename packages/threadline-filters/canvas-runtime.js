(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineCanvasRuntime = library;
  }
})(globalThis, function () {
  "use strict";

  /** Creates an isolated canvas runtime using supplied canvas and random providers.
   * @param {{createCanvas: function(): HTMLCanvasElement, random: function(): number}} dependencies - Canvas creation and random-value dependencies.
   * @returns {{getScratchCanvas: function(number, number): HTMLCanvasElement, reset: function(): void, cloneCanvas: function(HTMLCanvasElement): HTMLCanvasElement, release: function(): void, random: function(): number}} Canvas lifecycle and random API.
   */
  function createCanvasRuntime(dependencies) {
    if (!dependencies || typeof dependencies.createCanvas !== "function" || typeof dependencies.random !== "function") {
      throw new TypeError("createCanvas and random must be provided as functions.");
    }

    const canvases = [];
    let nextCanvasIndex = 0;

    /** Validates requested canvas dimensions and returns no value.
     * @param {number} width - Positive integer width in pixels.
     * @param {number} height - Positive integer height in pixels.
     * @returns {void} Nothing.
     */
    function validateDimensions(width, height) {
      if (!Number.isInteger(width) || width <= 0) {
        throw new RangeError("width must be a positive integer.");
      }
      if (!Number.isInteger(height) || height <= 0) {
        throw new RangeError("height must be a positive integer.");
      }
    }

    /** Resizes a canvas only when needed and returns that canvas.
     * @param {HTMLCanvasElement} canvas - Canvas to resize.
     * @param {number} width - Target width in pixels.
     * @param {number} height - Target height in pixels.
     * @returns {HTMLCanvasElement} Resized canvas.
     */
    function resizeCanvas(canvas, width, height) {
      if (canvas.width !== width) {
        canvas.width = width;
      }
      if (canvas.height !== height) {
        canvas.height = height;
      }
      return canvas;
    }

    /** Resets reusable Canvas state and clears retained pixels before reuse.
     * @param {HTMLCanvasElement} canvas - Scratch canvas to prepare for a new render pass.
     * @returns {HTMLCanvasElement} Cleared canvas with default drawing state.
     */
    function prepareScratchCanvas(canvas) {
      const context = canvas.getContext("2d");
      if (!context) {
        throw new TypeError("Scratch canvas must provide a 2D context.");
      }
      if (typeof context.reset === "function") {
        context.reset();
      } else {
        if (typeof context.setTransform === "function") {
          context.setTransform(1, 0, 0, 1, 0, 0);
        }
        context.globalAlpha = 1;
        context.globalCompositeOperation = "source-over";
        context.filter = "none";
        context.shadowBlur = 0;
        context.shadowColor = "rgba(0, 0, 0, 0)";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.imageSmoothingEnabled = true;
        context.lineWidth = 1;
        context.lineCap = "butt";
        context.lineJoin = "miter";
        context.miterLimit = 10;
        context.lineDashOffset = 0;
        if (typeof context.setLineDash === "function") {
          context.setLineDash([]);
        }
        if (typeof context.clearRect === "function") {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return canvas;
    }

    /** Gets a reusable scratch canvas for the current render pass.
     * @param {number} width - Positive integer width in pixels.
     * @param {number} height - Positive integer height in pixels.
     * @returns {HTMLCanvasElement} Scratch canvas sized to the requested dimensions.
     */
    function getScratchCanvas(width, height) {
      validateDimensions(width, height);
      const index = nextCanvasIndex;
      let canvas = canvases[index];
      if (!canvas) {
        canvas = dependencies.createCanvas();
        if (!canvas || typeof canvas.getContext !== "function") {
          throw new TypeError("createCanvas must return a canvas-like object.");
        }
        canvases[index] = canvas;
      }
      nextCanvasIndex += 1;
      resizeCanvas(canvas, width, height);
      return prepareScratchCanvas(canvas);
    }

    /** Resets scratch allocation to reuse canvases from the beginning next pass.
     * @returns {void} Nothing.
     */
    function reset() {
      nextCanvasIndex = 0;
    }

    /** Copies a source canvas into the next scratch canvas.
     * @param {HTMLCanvasElement} source - Canvas to copy.
     * @returns {HTMLCanvasElement} Scratch canvas containing the source pixels.
     */
    function cloneCanvas(source) {
      if (!source || !Number.isInteger(source.width) || !Number.isInteger(source.height)) {
        throw new TypeError("source must be a canvas with integer dimensions.");
      }
      const copy = getScratchCanvas(source.width, source.height);
      const context = copy.getContext("2d", { willReadFrequently: true });
      if (!context || typeof context.drawImage !== "function") {
        throw new TypeError("Scratch canvas must provide a 2D context with drawImage.");
      }
      context.drawImage(source, 0, 0);
      return copy;
    }

    /** Releases all retained scratch canvases and resets allocation state.
     * @returns {void} Nothing.
     */
    function release() {
      for (const canvas of canvases) {
        canvas.width = 0;
        canvas.height = 0;
      }
      canvases.length = 0;
      nextCanvasIndex = 0;
    }

    /** Returns a random number from the injected provider in the half-open zero-to-one range.
     * @returns {number} Random value greater than or equal to zero and less than one.
     */
    function random() {
      const value = dependencies.random();
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value >= 1) {
        throw new RangeError("random provider must return a number from zero inclusive to one exclusive.");
      }
      return value;
    }

    return Object.freeze({ getScratchCanvas, reset, cloneCanvas, release, random });
  }

  return Object.freeze({ createCanvasRuntime });
});
