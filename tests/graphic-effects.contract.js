const assert = require("node:assert/strict");
const test = require("node:test");
const { createGraphicEffects } = require("../packages/threadline-filters/graphic-effects");

/** Creates a minimal pixel-backed Canvas double.
 * @returns {{canvas: object, pixels: Uint8ClampedArray, calls: object}} Canvas, pixels, and context call counts.
 */
function createCanvasDouble() {
  const pixels = new Uint8ClampedArray([120, 90, 40, 255]);
  const calls = { reads: 0, writes: 0 };
  const context = {
    getImageData() { calls.reads += 1; return { data: new Uint8ClampedArray(pixels) }; },
    putImageData(imageData) { calls.writes += 1; pixels.set(imageData.data); },
  };
  const canvas = { width: 1, height: 1, getContext() { return context; } };
  return { canvas, pixels, calls };
}

/** Creates graphic-style effects using deterministic helpers and harmless canvas stubs.
 * @returns {object} Configured graphic-style renderer API.
 */
function createEffects() {
  const dependencies = {
    clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); },
    mix(start, end, amount) { return start + (end - start) * amount; },
    seededNoise() { return 0.5; },
    cloneCanvas() { throw new Error("Unexpected canvas clone"); },
    createSampleSource() { throw new Error("Unexpected sample source"); },
    getSampleSourceIndex() { return 0; },
    rgbToHsl(red, green, blue) {
      const maximum = Math.max(red, green, blue) / 255;
      const minimum = Math.min(red, green, blue) / 255;
      const lightness = (maximum + minimum) / 2;
      let saturation = 0;
      if (maximum !== 0) saturation = (maximum - minimum) / maximum;
      return [40, saturation, lightness];
    },
    hslToRgb(hue, saturation, lightness) {
      return [hue * 255 / 360, saturation * 255, lightness * 255];
    },
    applyCannyLikeEdges() {},
    curveThousand(value) { return value; },
    parseHexColor() { return { r: 20, g: 30, b: 40 }; },
    random() { return 0.5; },
  };
  return createGraphicEffects(dependencies);
}

test("exports a frozen renderer API and rejects missing dependencies", () => {
  const effects = createEffects();
  assert.deepEqual(Object.keys(effects), ["applyGraphicStyleEffects"]);
  assert.equal(Object.isFrozen(effects), true);
  assert.throws(() => createGraphicEffects(), /dependencies are required/);
  assert.throws(() => createGraphicEffects({ clamp() {} }), /mix dependency is required/);
});

test("disabled graphic-style sliders do not access or change the canvas", () => {
  const effects = createEffects();
  const canvas = { getContext() { throw new Error("Disabled styles must not touch canvas"); } };
  effects.applyGraphicStyleEffects(canvas, {}, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
});

test("Kodachrome transforms RGB pixels while preserving alpha", () => {
  const effects = createEffects();
  const { canvas, pixels, calls } = createCanvasDouble();
  effects.applyGraphicStyleEffects(canvas, { kodachrome: 50 }, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
  assert.notDeepEqual([...pixels.slice(0, 3)], [120, 90, 40]);
  assert.equal(pixels[3], 255);
  assert.equal(calls.reads, 1);
  assert.equal(calls.writes, 1);
});
