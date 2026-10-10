const assert = require("node:assert/strict");
const test = require("node:test");
const { createArtEffects } = require("../packages/threadline-filters/art-effects");

/** Creates art effects with deterministic host-side Canvas and pixel helpers.
 * @returns {object} Configured art renderer API.
 */
function createEffects() {
  const helperNames = [
    "clamp", "mix", "seededNoise", "smoothstep", "rgbaString", "cloneCanvas",
    "createSampleSource", "getSampleSourceIndex", "getScratchCanvas",
    "buildRoundedRectPath", "buildDieCutPath", "drawRoundedRectPath",
    "applyCannyLikeEdges", "convolveCanvas", "applyBasicAdjustments",
    "applyGrayscale", "applyPosterize", "curveThousand", "parseHexColor", "random",
  ];
  const dependencies = {};
  for (const name of helperNames) dependencies[name] = function dependencyStub() {};
  dependencies.parseHexColor = function parseHexColor() { return { r: 12, g: 34, b: 56 }; };
  dependencies.curveThousand = function curveThousand(value) { return value; };
  return createArtEffects(dependencies);
}

test("exports a frozen art API and rejects incomplete dependencies", () => {
  const effects = createEffects();
  assert.deepEqual(Object.keys(effects), ["applyArtEffects"]);
  assert.equal(Object.isFrozen(effects), true);
  assert.throws(() => createArtEffects(), /dependencies are required/);
  assert.throws(() => createArtEffects({ clamp() {} }), /mix dependency is required/);
});

test("disabled art controls do not access the canvas", () => {
  const effects = createEffects();
  const canvas = { getContext() { throw new Error("Disabled art controls must not touch canvas"); } };
  effects.applyArtEffects(canvas, {}, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
});
