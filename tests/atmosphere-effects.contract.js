const assert = require("node:assert/strict");
const test = require("node:test");
const { createAtmosphereEffects } = require("../packages/threadline-filters/atmosphere-effects");

/** Creates a small canvas double with mutable RGBA storage.
 * @param {number[]} initialPixels - Initial RGBA bytes.
 * @returns {{canvas: object, context: object, getPixels: function(): number[]}} Canvas test double and pixel reader.
 */
function createCanvasDouble(initialPixels) {
  const state = { pixels: new Uint8ClampedArray(initialPixels) };
  const gradient = { addColorStop() {} };
  const context = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    save() {},
    restore() {},
    drawImage() {},
    fillRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    createRadialGradient() { return gradient; },
    createLinearGradient() { return gradient; },
    getImageData() {
      return { data: new Uint8ClampedArray(state.pixels), width: 2, height: 1 };
    },
    createImageData(width, height) {
      return { data: new Uint8ClampedArray(width * height * 4), width, height };
    },
    putImageData(imageData) {
      state.pixels = new Uint8ClampedArray(imageData.data);
    },
  };
  const canvas = {
    width: 2,
    height: 1,
    getContext(type) {
      assert.equal(type, "2d");
      return context;
    },
  };
  return { canvas, context, getPixels() { return [...state.pixels]; } };
}

/** Creates the atmosphere library with deterministic, observable dependencies.
 * @param {object} canvasDouble - Canvas test double.
 * @param {object} overrides - Optional dependency replacements.
 * @returns {{effects: object, calls: object}} Atmosphere API and dependency call counts.
 */
function createEffects(canvasDouble, overrides = {}) {
  const calls = { pixelate: 0, linePattern: 0, random: 0 };
  const dependencies = {
    clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    },
    getScratchCanvas() {
      return canvasDouble.canvas;
    },
    applyPixelate() {
      calls.pixelate += 1;
    },
    drawLinePattern() {
      calls.linePattern += 1;
    },
    drawScratches() {},
    rgbaString(color, alpha) {
      return `rgba(${color.r},${color.g},${color.b},${alpha})`;
    },
    getPixelChannel(data, width, height, x, y, channel) {
      const pixelX = Math.min(width - 1, Math.max(0, x));
      const pixelY = Math.min(height - 1, Math.max(0, y));
      return data[(pixelY * width + pixelX) * 4 + channel];
    },
    seededNoise() {
      return 0;
    },
    random() {
      calls.random += 1;
      return 0.5;
    },
    ...overrides,
  };
  return { effects: createAtmosphereEffects(dependencies), calls };
}

test("exports the documented atmosphere API", () => {
  const canvasDouble = createCanvasDouble([80, 100, 120, 70, 140, 160, 180, 90]);
  const { effects } = createEffects(canvasDouble);
  assert.deepEqual(Object.keys(effects), ["applyAtmosphereEffects"]);
  assert.equal(Object.isFrozen(effects), true);
});

test("atmosphere orchestration leaves the canvas untouched when all sliders are zero", () => {
  const canvasDouble = createCanvasDouble([80, 100, 120, 70, 140, 160, 180, 90]);
  const before = canvasDouble.getPixels();
  const { effects, calls } = createEffects(canvasDouble);
  effects.applyAtmosphereEffects(canvasDouble.canvas, {}, { accent: {}, soft: {}, dark: {} });
  assert.deepEqual(canvasDouble.getPixels(), before);
  assert.deepEqual(calls, { pixelate: 0, linePattern: 0, random: 0 });
});

test("TV noise uses the injected RNG and preserves pixel alpha", () => {
  const canvasDouble = createCanvasDouble([100, 100, 100, 77, 100, 100, 100, 88]);
  const { effects, calls } = createEffects(canvasDouble);
  effects.applyAtmosphereEffects(canvasDouble.canvas, { tvNoise: 100 }, { accent: {}, soft: {}, dark: {} });
  assert.deepEqual(canvasDouble.getPixels(), [100, 100, 100, 77, 100, 100, 100, 88]);
  assert.equal(calls.random, 2);
});

test("print misregistration shifts color channels and keeps alpha at image boundaries", () => {
  const canvasDouble = createCanvasDouble([10, 20, 30, 44, 40, 50, 60, 99]);
  const { effects } = createEffects(canvasDouble);
  effects.applyAtmosphereEffects(canvasDouble.canvas, { printMisregister: 1 }, { accent: {}, soft: {}, dark: {} });
  assert.deepEqual(canvasDouble.getPixels(), [10, 20, 60, 44, 10, 50, 60, 99]);
});

test("rejects incomplete renderer dependencies", () => {
  assert.throws(() => createAtmosphereEffects(), /dependencies are required/);
  assert.throws(() => createAtmosphereEffects({ clamp() {} }), /dependencies are required/);
});
