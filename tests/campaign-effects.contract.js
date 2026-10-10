const assert = require("node:assert/strict");
const test = require("node:test");
const { createCampaignEffects } = require("../packages/threadline-filters/campaign-effects");

/** Creates the campaign library with deterministic numeric helpers.
 * @returns {object} Campaign effect API instance.
 */
function createEffects() {
  return createCampaignEffects({
    clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    },
    mix(original, target, amount) {
      return original + (target - original) * amount;
    },
  });
}

/** Creates a canvas-like test double that records drawing operations.
 * @returns {{canvas: object, calls: object[]}} Canvas double and recorded calls.
 */
function createCanvasDouble() {
  const calls = [];
  const methodNames = [
    "save", "restore", "translate", "rotate", "beginPath", "moveTo",
    "bezierCurveTo", "closePath", "fill", "stroke", "lineTo",
  ];
  const context = {};
  for (const methodName of methodNames) {
    context[methodName] = function recordCall(...args) {
      calls.push({ methodName, args });
    };
  }
  const canvas = {
    width: 200,
    height: 100,
    getContext(type) {
      assert.equal(type, "2d");
      return context;
    },
  };
  return { canvas, calls, context };
}

test("exports the documented campaign API", () => {
  const effects = createEffects();
  assert.deepEqual(Object.keys(effects).sort(), ["applyMoustache", "applyRainbow", "applyRibbon", "hasOverlays"]);
  assert.equal(Object.isFrozen(effects), true);
});

test("rainbow filter changes RGB bands, preserves alpha, and is a no-op at zero", () => {
  const effects = createEffects();
  const pixels = new Uint8ClampedArray([120, 120, 120, 70, 120, 120, 120, 80]);
  const original = new Uint8ClampedArray(pixels);

  assert.equal(effects.applyRainbow(pixels, 2, 1, 0, 0), pixels);
  assert.deepEqual(pixels, original);
  effects.applyRainbow(pixels, 2, 1, 1, 1);
  assert.notDeepEqual(pixels.slice(0, 3), original.slice(0, 3));
  assert.deepEqual([...pixels.filter((value, index) => index % 4 === 3)], [70, 80]);
});

test("canvas overlays draw geometry and return no value", () => {
  const effects = createEffects();
  const moustache = createCanvasDouble();
  const ribbon = createCanvasDouble();

  assert.equal(effects.applyMoustache(moustache.canvas, 0.6, 0.4, 0.2, -0.1), undefined);
  assert.equal(moustache.calls.filter((call) => call.methodName === "bezierCurveTo").length, 6);
  assert.equal(effects.applyRibbon(ribbon.canvas, 0.5, 0.8), undefined);
  assert.equal(ribbon.calls.filter((call) => call.methodName === "stroke").length, 2);
});

test("overlay availability follows either campaign slider", () => {
  const effects = createEffects();
  assert.equal(effects.hasOverlays({ movemberSize: 0, ribbonSize: 0 }), false);
  assert.equal(effects.hasOverlays({ movemberSize: 1, ribbonSize: 0 }), true);
  assert.equal(effects.hasOverlays({ movemberSize: 0, ribbonSize: 1 }), true);
});

test("requires explicit campaign pixel helpers", () => {
  assert.throws(() => createCampaignEffects(), /clamp and mix/);
  assert.throws(() => createCampaignEffects({ clamp() {} }), /clamp and mix/);
});
