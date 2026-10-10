"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { createThreadlineFilters } = require("../packages/threadline-filters/factory");

/** Creates a factory instance for a selected capability list.
 * @param {object} capabilities - Enabled capability flags.
 * @param {object} adapters - Optional host adapters keyed by capability.
 * @returns {object} Initialized Threadline filter API.
 */
function createFactory(capabilities, adapters) {
  return createThreadlineFilters({ schemaVersion: 1, capabilities, adapters });
}

test("factory exposes pixel filters by default and returns a frozen API", function () {
  const api = createFactory();
  assert.equal(Object.isFrozen(api), true);
  assert.equal(Object.isFrozen(api.capabilities), true);
  assert.equal(typeof api.filters.applyGrayscale, "function");
  assert.equal(typeof api.geometry.buildDieCutPath, "function");
  assert.equal(api.capabilities.pixel, true);
  assert.equal(api.capabilities.campaigns, false);
  assert.deepEqual(Object.keys(api), ["filters", "capabilities", "geometry"]);
});

test("factory wires campaigns and patterns with library-owned dependencies", function () {
  const api = createFactory({ campaigns: true, patterns: true });
  assert.equal(typeof api.campaigns.applyRainbow, "function");
  assert.equal(typeof api.patterns.applyPatternEffects, "function");
  assert.equal(api.capabilities.campaigns, true);
  assert.equal(api.capabilities.art, false);
  assert.equal(Object.isFrozen(api), true);
});

test("factory builds Canvas runtime internally and validates the injected random source", function () {
  const api = createThreadlineFilters({
    schemaVersion: 1,
    capabilities: { canvas: true },
    canvas: {
      createCanvas: function createCanvas() {
        return {};
      },
    },
    random: function random() {
      return 0.25;
    },
  });
  assert.equal(typeof api.canvas.applyCanvasBlur, "function");
  assert.equal(api.runtime.random(), 0.25);
  assert.equal(typeof api.morphology.applyMorphology, "function");
  assert.equal(typeof api.sampling.createSampleSource, "function");
  const invalidRandom = createThreadlineFilters({
    schemaVersion: 1,
    capabilities: { canvas: true },
    canvas: { createCanvas: function createCanvas() { return {}; } },
    random: function random() { return 1; },
  });
  assert.throws(function invalidRandomValue() {
    invalidRandom.runtime.random();
  }, /random provider must return/);
  assert.throws(function missingCanvasProvider() {
    createFactory({ canvas: true });
  }, /requires canvas.createCanvas/);
});

test("factory wires atmosphere from internal Canvas, sampling, and drawing modules", function () {
  const api = createThreadlineFilters({
    schemaVersion: 1,
    capabilities: { atmosphere: true },
    canvas: {
      createCanvas: function createCanvas() {
        return {};
      },
    },
    random: function random() {
      return 0.5;
    },
  });
  assert.equal(typeof api.atmosphere.applyAtmosphereEffects, "function");
  assert.equal(api.capabilities.atmosphere, true);
  assert.equal(api.capabilities.canvas, false);
  assert.equal(api.canvas, undefined);
  assert.throws(function atmosphereNeedsCanvas() {
    createFactory({ atmosphere: true });
  }, /capabilities.atmosphere requires canvas.createCanvas/);
});

test("factory wires materials, graphics, and composition from shared modules", function () {
  const api = createThreadlineFilters({
    schemaVersion: 1,
    capabilities: { materials: true, graphics: true, composition: true },
    canvas: {
      createCanvas: function createCanvas() {
        return {};
      },
    },
    random: function random() {
      return 0.5;
    },
  });
  assert.equal(typeof api.materials.applyMaterialEffects, "function");
  assert.equal(typeof api.graphics.applyGraphicStyleEffects, "function");
  assert.equal(typeof api.composition.applyFragmentEffects, "function");
  assert.equal(typeof api.composition.applyCutEffects, "function");
  assert.equal(api.capabilities.patterns, false);
  assert.equal(api.patterns, undefined);
  for (const capability of ["materials", "graphics", "composition"]) {
    assert.throws(function missingCanvasProvider() {
      createThreadlineFilters({ schemaVersion: 1, capabilities: { [capability]: true } });
    }, new RegExp("capabilities\\." + capability + " requires canvas\\.createCanvas"));
  }
});

test("factory wires morph, text, artist, and art families without family adapters", function () {
  const api = createThreadlineFilters({
    schemaVersion: 1,
    capabilities: { morphs: true, text: true, artists: true, art: true },
    canvas: {
      createCanvas: function createCanvas() {
        return {};
      },
    },
    random: function random() {
      return 0.5;
    },
  });
  assert.equal(typeof api.morphs.applyMorphEffects, "function");
  assert.equal(typeof api.text.applyWordArtEffects, "function");
  assert.equal(typeof api.artists.applyArtistEffects, "function");
  assert.equal(typeof api.art.applyArtEffects, "function");
  assert.equal(api.capabilities.morphs, true);
  assert.equal(api.capabilities.text, true);
  assert.equal(api.capabilities.artists, true);
  assert.equal(api.capabilities.art, true);
  for (const capability of ["morphs", "text", "artists", "art"]) {
    assert.throws(function missingCanvasProvider() {
      createFactory({ [capability]: true });
    }, new RegExp("capabilities\\." + capability + " requires canvas\\.createCanvas"));
  }
});

test("factory validates schema version, capabilities, and adapter object", function () {
  assert.throws(function missingHost() {
    createThreadlineFilters();
  }, /host configuration is required/);
  assert.throws(function wrongVersion() {
    createThreadlineFilters({ schemaVersion: 2 });
  }, /schemaVersion 1 is required/);
  assert.throws(function unknownCapability() {
    createFactory({ surprise: true });
  }, /Unknown Threadline filter capability/);
  assert.throws(function invalidCapabilityFlag() {
    createFactory({ campaigns: "yes" });
  }, /must be a boolean/);
  assert.throws(function invalidAdapters() {
    createThreadlineFilters({ schemaVersion: 1, adapters: [] });
  }, /adapters must be an object/);
});
