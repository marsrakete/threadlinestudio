const assert = require("node:assert/strict");
const test = require("node:test");
const { createCompositionEffects } = require("../packages/threadline-filters/composition-effects");

/** Creates a drawing Canvas double for fragment and cut renderer contracts.
 * @returns {{canvas: object, calls: object}} Canvas and recorded draw operation counts.
 */
function createCanvasDouble() {
  const calls = { draws: 0, strokes: 0, fills: 0 };
  const context = {};
  for (const name of ["save", "restore", "clearRect", "beginPath", "moveTo", "lineTo", "closePath", "clip", "translate", "rotate", "setLineDash", "arcTo"]) {
    context[name] = function noop() {};
  }
  for (const name of Object.keys(calls)) {
    let method = "fill";
    if (name === "draws") method = "drawImage";
    if (name === "strokes") method = "stroke";
    context[method] = function countCall() { calls[name] += 1; };
  }
  const canvas = {
    width: 80,
    height: 60,
    getContext() { return context; },
  };
  return { canvas, calls };
}

/** Creates composition effects with deterministic reusable helpers.
 * @returns {object} Configured composition renderer API.
 */
function createEffects() {
  return createCompositionEffects({
    clamp(value, minimum, maximum) { return Math.min(maximum, Math.max(minimum, value)); },
    mix(start, end, amount) { return start + (end - start) * amount; },
    seededNoise() { return 0.5; },
    cloneCanvas(canvas) { return { width: canvas.width, height: canvas.height }; },
    createSampleSource() { return { data: new Uint8ClampedArray(80 * 60 * 4) }; },
    getSampleSourceIndex() { return 0; },
    buildRoundedRectPath() {},
    buildDieCutPath() {},
    curveThousand(value) { return value; },
    parseHexColor() { return { r: 12, g: 34, b: 56 }; },
  });
}

test("exports documented composition operations and rejects invalid dependencies", () => {
  const effects = createEffects();
  assert.deepEqual(Object.keys(effects).sort(), ["applyCutEffects", "applyFragmentEffects"]);
  assert.equal(Object.isFrozen(effects), true);
  assert.throws(() => createCompositionEffects(), /dependencies are required/);
  assert.throws(() => createCompositionEffects({ clamp() {} }), /mix dependency is required/);
});

test("disabled fragment and cut sliders do not access the canvas", () => {
  const effects = createEffects();
  const canvas = { getContext() { throw new Error("Disabled effects must not touch canvas"); } };
  const colors = { overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899" };
  effects.applyFragmentEffects(canvas, {}, colors);
  effects.applyCutEffects(canvas, {}, colors);
});

test("tile swapping draws the original canvas through deterministic tile geometry", () => {
  const effects = createEffects();
  const { canvas, calls } = createCanvasDouble();
  effects.applyFragmentEffects(canvas, { tileSwap: 35 }, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
  assert.ok(calls.draws > 0);
  assert.ok(calls.strokes > 0);
});
