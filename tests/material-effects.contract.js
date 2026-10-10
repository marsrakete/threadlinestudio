const assert = require("node:assert/strict");
const test = require("node:test");
const { createMaterialEffects } = require("../packages/threadline-filters/material-effects");

/** Creates a minimal pixel-backed Canvas double for material contracts.
 * @returns {{canvas: object, pixels: Uint8ClampedArray}} Canvas and its mutable pixel buffer.
 */
function createCanvasDouble() {
  const pixels = new Uint8ClampedArray([100, 110, 120, 255]);
  const context = {
    getImageData() { return { data: new Uint8ClampedArray(pixels) }; },
    putImageData(imageData) { pixels.set(imageData.data); },
  };
  const canvas = { width: 1, height: 1, getContext() { return context; } };
  return { canvas, pixels };
}

/** Creates material renderers with deterministic host dependencies.
 * @param {object} overrides - Optional dependency overrides for assertions.
 * @returns {{effects: object, calls: object}} Renderer API and observed dependency calls.
 */
function createEffects(overrides = {}) {
  const calls = { lines: 0, scratches: 0, random: 0 };
  const dependencies = {
    clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); },
    mix(start, end, amount) { return start + (end - start) * amount; },
    smoothstep(edge0, edge1, value) {
      const amount = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
      return amount * amount * (3 - 2 * amount);
    },
    curveThousand(value) { return value; },
    random() { calls.random += 1; return 0.5; },
    getScratchCanvas() { throw new Error("Unexpected scratch canvas request"); },
    cloneCanvas() { throw new Error("Unexpected clone request"); },
    drawLinePattern() { calls.lines += 1; },
    drawScratches(context, canvas, amount, random) { calls.scratches += 1; assert.equal(random(), 0.5); },
    drawPerforatedPattern() {},
    parseHexColor() { return { r: 10, g: 20, b: 30 }; },
    rgbaString() { return "rgba(10,20,30,0.1)"; },
    applyGrayscale() {},
    applyScanlines() {},
    ...overrides,
  };
  return { effects: createMaterialEffects(dependencies), calls };
}

test("exports a frozen material API and rejects missing dependencies", () => {
  const { effects } = createEffects();
  assert.deepEqual(Object.keys(effects), ["applyMaterialEffects"]);
  assert.equal(Object.isFrozen(effects), true);
  assert.throws(() => createMaterialEffects(), /dependencies are required/);
  assert.throws(() => createMaterialEffects({ clamp() {} }), /mix dependency is required/);
});

test("disabled sliders do not touch canvas pixels", () => {
  const { effects } = createEffects();
  const { canvas, pixels } = createCanvasDouble();
  const original = [...pixels];
  effects.applyMaterialEffects(canvas, {}, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
  assert.deepEqual([...pixels], original);
});

test("pixel materials use the injected deterministic random source", () => {
  const { effects, calls } = createEffects();
  const { canvas, pixels } = createCanvasDouble();
  effects.applyMaterialEffects(canvas, { paperFiber: 100 }, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
  assert.deepEqual([...pixels], [118, 124, 126, 255]);
  assert.equal(calls.random, 1);
});

test("shared renderers receive material settings and the injected RNG", () => {
  const { effects, calls } = createEffects();
  const { canvas } = createCanvasDouble();
  effects.applyMaterialEffects(canvas, { linen: 40, scratches: 20 }, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
  assert.equal(calls.lines, 2);
  assert.equal(calls.scratches, 1);
});
