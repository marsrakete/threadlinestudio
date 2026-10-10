const assert = require("node:assert/strict");
const test = require("node:test");
const { createArtistEffects } = require("../packages/threadline-filters/artist-effects");

/** Creates artist effects with deterministic host dependencies.
 * @returns {object} Configured artist renderer API.
 */
function createEffects() {
  const helperNames = [
    "clamp", "mix", "seededNoise", "smoothstep", "cloneCanvas",
    "createSampleSource", "getSampleSourceIndex", "getSampleSourceChannel",
    "getPixelChannel", "getScratchCanvas", "rgbToHsl", "hslToRgb",
    "drawOrganicBlobPath", "curveThousand", "parseHexColor",
  ];
  const dependencies = {};
  for (const name of helperNames) dependencies[name] = function dependencyStub() {};
  dependencies.parseHexColor = function parseHexColor() { return { r: 12, g: 34, b: 56 }; };
  dependencies.curveThousand = function curveThousand(value) { return value; };
  return createArtistEffects(dependencies);
}

test("exports a frozen artist API and rejects incomplete dependencies", () => {
  const effects = createEffects();
  assert.deepEqual(Object.keys(effects), ["applyArtistEffects"]);
  assert.equal(Object.isFrozen(effects), true);
  assert.throws(() => createArtistEffects(), /dependencies are required/);
  assert.throws(() => createArtistEffects({ clamp() {} }), /mix dependency is required/);
});

test("disabled artist controls do not access the canvas", () => {
  const effects = createEffects();
  const canvas = { getContext() { throw new Error("Disabled artist controls must not touch canvas"); } };
  effects.applyArtistEffects(canvas, {}, {
    overlayColor: "#112233", duotoneLight: "#445566", duotoneDark: "#778899",
  });
});
