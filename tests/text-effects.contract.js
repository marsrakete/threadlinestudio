const assert = require("node:assert/strict");
const test = require("node:test");
const { createTextEffects } = require("../packages/threadline-filters/text-effects");

/** Creates text effects with deterministic host-side helpers.
 * @returns {object} Configured text renderer API.
 */
function createEffects() {
  const helpers = [
    "clamp", "mix", "seededNoise", "cloneCanvas", "createSampleSource",
    "getSampleSourceIndex", "getSampleSourceChannel", "getPixelIndex",
    "getRgbSaturation", "getScratchCanvas", "applyCannyLikeEdges",
    "buildRoundedRectPath", "buildDieCutPath", "rgbaString", "curveThousand",
    "parseHexColor",
  ];
  const dependencies = {};
  for (const name of helpers) dependencies[name] = function dependencyStub() {};
  dependencies.clamp = function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  };
  dependencies.curveThousand = function curveThousand(value) { return value; };
  dependencies.parseHexColor = function parseHexColor() { return { r: 12, g: 34, b: 56 }; };
  return createTextEffects(dependencies);
}

test("exports a frozen text-art API and rejects incomplete dependencies", () => {
  const effects = createEffects();
  assert.deepEqual(Object.keys(effects), ["applyWordArtEffects"]);
  assert.equal(Object.isFrozen(effects), true);
  assert.throws(() => createTextEffects(), /dependencies are required/);
  assert.throws(() => createTextEffects({ clamp() {} }), /mix dependency is required/);
});

test("disabled text controls leave the canvas untouched", () => {
  const effects = createEffects();
  const canvas = { getContext() { throw new Error("Disabled text controls must not touch canvas"); } };
  effects.applyWordArtEffects(canvas, {}, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
});
