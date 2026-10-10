const assert = require("node:assert/strict");
const test = require("node:test");
const { createMorphEffects } = require("../packages/threadline-filters/morph-effects");

/** Creates a data-backed Canvas double with the operations needed by the warp pipeline.
 * @param {number} width - Canvas width in pixels.
 * @param {number} height - Canvas height in pixels.
 * @param {Uint8ClampedArray} pixels - Initial RGBA pixel data.
 * @returns {object} Canvas with mutable pixel data and a 2D context double.
 */
function createCanvasDouble(width, height, pixels) {
  const canvas = { width, height, pixels };
  const context = {
    getImageData() { return { data: new Uint8ClampedArray(canvas.pixels), width, height }; },
    createImageData(imageWidth, imageHeight) {
      return { data: new Uint8ClampedArray(imageWidth * imageHeight * 4), width: imageWidth, height: imageHeight };
    },
    putImageData(imageData) { canvas.pixels.set(imageData.data); },
    save() {},
    restore() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fillRect() {},
  };
  canvas.getContext = function getContext() { return context; };
  return canvas;
}

/** Creates morph effects with deterministic pixel sampling and geometry dependencies.
 * @returns {object} Configured morph renderer API.
 */
function createEffects() {
  return createMorphEffects({
    clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); },
    seededNoise() { return 0.5; },
    cloneCanvas(canvas) { return createCanvasDouble(canvas.width, canvas.height, new Uint8ClampedArray(canvas.pixels)); },
    createSampleSource(canvas) { return { data: new Uint8ClampedArray(canvas.pixels), width: canvas.width, height: canvas.height }; },
    getSampleSourceIndex(source, x, y) {
      const column = Math.min(source.width - 1, Math.max(0, Math.round(x)));
      const row = Math.min(source.height - 1, Math.max(0, Math.round(y)));
      return (row * source.width + column) * 4;
    },
    curveThousand(value) { return value; },
    parseHexColor() { return { r: 20, g: 30, b: 40 }; },
  });
}

test("exports a frozen morph API and rejects missing dependencies", () => {
  const effects = createEffects();
  assert.deepEqual(Object.keys(effects), ["applyMorphEffects"]);
  assert.equal(Object.isFrozen(effects), true);
  assert.throws(() => createMorphEffects(), /dependencies are required/);
  assert.throws(() => createMorphEffects({ clamp() {} }), /seededNoise dependency is required/);
});

test("disabled morph sliders do not access the canvas", () => {
  const effects = createEffects();
  const canvas = { getContext() { throw new Error("Disabled morphs must not touch canvas"); } };
  effects.applyMorphEffects(canvas, {}, { overlayColor: "#112233", duotoneLight: "#445566" });
});

test("swirl morph warps image pixels and preserves their alpha channel", () => {
  const effects = createEffects();
  const pixels = new Uint8ClampedArray(8 * 8 * 4);
  for (let index = 0; index < pixels.length; index += 4) {
    const pixel = index / 4;
    pixels[index] = pixel * 3;
    pixels[index + 1] = pixel * 2;
    pixels[index + 2] = 255 - pixel;
    pixels[index + 3] = 255;
  }
  const canvas = createCanvasDouble(8, 8, pixels);
  const before = [...canvas.pixels];
  effects.applyMorphEffects(canvas, { swirlMorph: 100 }, { overlayColor: "#112233", duotoneLight: "#445566" });
  assert.notDeepEqual([...canvas.pixels], before);
  for (let index = 3; index < canvas.pixels.length; index += 4) assert.equal(canvas.pixels[index], 255);
});
