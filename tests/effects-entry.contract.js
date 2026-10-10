"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const effects = require("../packages/threadline-filters/effects.js");

/** Confirms the aggregate entry exposes every reusable module and its key API.
 * @param {object} api - The CommonJS API exported by effects.js.
 * @returns {void} Does not return a value; throws if the public contract changes.
 */
function assertModule(api) {
  assert.equal(typeof api, "object");
  assert.equal(Object.isFrozen(api), true);
  assert.deepEqual(Object.keys(api), [
    "filters",
    "canvasRuntime",
    "morphology",
    "canvas",
    "campaigns",
    "atmosphere",
    "primitives",
    "patterns",
    "materials",
    "graphics",
    "composition",
    "morphs",
    "text",
    "artists",
    "art",
    "sampling",
    "geometry",
  ]);
  assert.equal(typeof api.filters.applyGrayscale, "function");
  assert.equal(typeof api.canvasRuntime.createCanvasRuntime, "function");
  assert.equal(typeof api.morphology.createMorphologyEffects, "function");
  assert.equal(typeof api.canvas.createCanvasEffects, "function");
  assert.equal(typeof api.campaigns.createCampaignEffects, "function");
  assert.equal(typeof api.atmosphere.createAtmosphereEffects, "function");
  assert.equal(typeof api.primitives.drawLinePattern, "function");
  assert.equal(typeof api.patterns.createPatternEffects, "function");
  assert.equal(typeof api.materials.createMaterialEffects, "function");
  assert.equal(typeof api.graphics.createGraphicEffects, "function");
  assert.equal(typeof api.composition.createCompositionEffects, "function");
  assert.equal(typeof api.morphs.createMorphEffects, "function");
  assert.equal(typeof api.text.createTextEffects, "function");
  assert.equal(typeof api.artists.createArtistEffects, "function");
  assert.equal(typeof api.art.createArtEffects, "function");
  assert.equal(typeof api.sampling.createCanvasSampling, "function");
  assert.equal(typeof api.geometry.createCanvasGeometry, "function");
}

test("aggregate effects entry exposes the complete frozen API", function () {
  assertModule(effects);
});
