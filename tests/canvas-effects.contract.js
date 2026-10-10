const assert = require("node:assert/strict");
const test = require("node:test");
const canvasEffectsModule = require("../packages/threadline-filters/canvas-effects");
const filters = require("../packages/threadline-filters");

/** Creates a canvas test double with a configurable RGBA image buffer.
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @returns {object} Canvas-like object with a minimal 2D context.
 */
function createCanvas(width, height) {
  const imageData = { width, height, data: new Uint8ClampedArray(width * height * 4) };
  const operations = [];
  const context = {
    imageSmoothingEnabled: true,
    filter: "none",
    getImageData() {
      return imageData;
    },
    createImageData(nextWidth, nextHeight) {
      return { width: nextWidth, height: nextHeight, data: new Uint8ClampedArray(nextWidth * nextHeight * 4) };
    },
    putImageData(value) {
      imageData.data.set(value.data);
      operations.push("putImageData");
    },
    clearRect() {
      operations.push("clearRect");
    },
    drawImage() {
      operations.push("drawImage");
    },
    fillRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    save() {},
    clip() {},
    restore() {},
  };
  return {
    width,
    height,
    imageData,
    operations,
    getContext() {
      return context;
    },
  };
}

/** Creates the effect API with deterministic canvas, random and morphology dependencies.
 * @param {Array<object>} scratchCanvases - Receives canvases created by the runtime.
 * @param {function(): number} randomProvider - Random provider for glitch slices.
 * @returns {object} Configured canvas-effect API.
 */
function createEffects(scratchCanvases, randomProvider) {
  const runtime = {
    getScratchCanvas(width, height) {
      const canvas = createCanvas(width, height);
      scratchCanvases.push(canvas);
      return canvas;
    },
    random: randomProvider,
    cloneCanvas(canvas) {
      const clone = createCanvas(canvas.width, canvas.height);
      clone.imageData.data.set(canvas.imageData.data);
      return clone;
    },
  };
  const morphology = {
    applyMorphology(imageData) {
      return imageData;
    },
  };
  return canvasEffectsModule.createCanvasEffects({
    runtime,
    morphology,
    clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    },
    mix(original, target, amount) {
      return original + (target - original) * amount;
    },
    smoothstep(edge0, edge1, value) {
      const position = Math.min(1, Math.max(0, (value - edge0) / Math.max(0.0001, edge1 - edge0)));
      return position * position * (3 - 2 * position);
    },
    filters,
    parseHexColor(hex) {
      const value = hex.replace("#", "");
      return {
        r: Number.parseInt(value.slice(0, 2), 16),
        g: Number.parseInt(value.slice(2, 4), 16),
        b: Number.parseInt(value.slice(4, 6), 16),
      };
    },
  });
}

/** Confirms the module exports the planned canvas filter surface. */
test("exports the documented canvas-effect API", () => {
  const scratchCanvases = [];
  const effects = createEffects(scratchCanvases, () => 0.5);
  assert.deepEqual(Object.keys(effects).sort(), [
    "applyCannyLikeEdges",
    "applyCanvasBlur",
    "applyCharcoal",
    "applyComic",
    "applyContourTracing",
    "applyFocusBlur",
    "applyGlitch",
    "applyHalftone",
    "applyLineBlend",
    "applyMorphology",
    "applyOilPaint",
    "applyPixelate",
    "applyPopArt",
    "convolveCanvas",
  ]);
});

test("charcoal and comic render through injected pixel helpers", () => {
  const effects = createEffects([], () => 0.5);
  const charcoal = createCanvas(1, 1);
  charcoal.imageData.data.set([100, 150, 200, 73]);
  effects.applyCharcoal(charcoal, 0.5);
  assert.deepEqual([...charcoal.imageData.data], [132, 132, 132, 73]);

  const comic = createCanvas(1, 1);
  comic.imageData.data.set([127, 80, 250, 91]);
  effects.applyComic(comic, 0);
  assert.deepEqual([...comic.imageData.data], [128, 85, 255, 91]);
});

test("oil paint and pop art preserve alpha while transforming pixels", () => {
  const effects = createEffects([], () => 0.5);
  const oilPaint = createCanvas(1, 1);
  oilPaint.imageData.data.set([100, 120, 140, 73]);
  effects.applyOilPaint(oilPaint, 0.5);
  assert.equal(oilPaint.imageData.data[3], 73);
  assert.deepEqual([...oilPaint.imageData.data.slice(0, 3)], [100, 120, 140]);

  const popArt = createCanvas(1, 1);
  popArt.imageData.data.set([0, 0, 0, 91]);
  effects.applyPopArt(popArt, 0, "#123456");
  assert.deepEqual([...popArt.imageData.data], [6, 9, 11, 91]);
});

/** Tests convolution output, alpha preservation, zero-strength and invalid kernels. */
test("convolution preserves alpha, skips zero strength and rejects invalid kernels", () => {
  const effects = createEffects([], () => 0.5);
  const canvas = createCanvas(1, 1);
  canvas.imageData.data.set([30, 60, 90, 123]);
  effects.convolveCanvas(canvas, [1], 1);
  assert.deepEqual([...canvas.imageData.data], [30, 60, 90, 123]);
  canvas.operations.length = 0;
  effects.convolveCanvas(canvas, [1], 0);
  assert.deepEqual(canvas.operations, []);
  assert.throws(() => effects.convolveCanvas(canvas, [1, 2], 1), RangeError);
});

/** Ensures glitch consumes the injected random source rather than a hidden global. */
test("glitch uses injected random values for deterministic slice placement", () => {
  const values = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
  let index = 0;
  const effects = createEffects([], () => {
    const value = values[index];
    index += 1;
    return value;
  });
  const canvas = createCanvas(20, 10);
  effects.applyGlitch(canvas, 0.1);
  assert.equal(index, 6);
  assert.equal(canvas.operations.filter((operation) => operation === "drawImage").length, 2);
});

/** Rejects missing module dependencies at factory creation. */
test("requires explicit canvas-effect dependencies", () => {
  assert.throws(() => canvasEffectsModule.createCanvasEffects({}), TypeError);
});
