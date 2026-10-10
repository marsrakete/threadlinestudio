"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const runtime = require("../packages/threadline-filters/metadata-runtime");
const manifest = require("../packages/threadline-filters/fragment-metadata.json");
const packageDefinition = require("../packages/threadline-filters/package.json");

/** Verifies flattening preserves filter identity, controls, defaults, and performance metadata.
 * @returns {void} Does not return a value; throws when flattened metadata changes.
 */
function assertFlattenFilterControlsContract() {
  const controls = runtime.flattenFilterControls(manifest);
  assert.equal(controls.length, 4);
  assert.deepEqual(controls[0], {
    controlId: "strength",
    filterId: "tile-swap",
    stateKey: "tileSwap",
    labelKey: "filters.fragment.tileSwap",
    min: 0,
    max: 1000,
    step: 1,
    defaultValue: 0,
    performance: "veryStrong",
  });
  assert.equal(Object.isFrozen(controls), true);
  assert.equal(Object.isFrozen(controls[0]), true);
}

/** Verifies the metadata runtime normalizes absent performance levels and handles empty groups.
 * @returns {void} Does not return a value; throws when boundary behavior changes.
 */
function assertMetadataRuntimeBoundaryContract() {
  const controls = runtime.flattenFilterControls({
    filters: [{ id: "plain-filter", controls: [{ id: "value", stateKey: "value", min: 0, max: 1, step: 1, defaultValue: 0 }] }],
  });
  assert.equal(controls[0].performance, "normal");
  assert.deepEqual(runtime.flattenFilterControls({ filters: [] }), []);
}

/** Verifies malformed manifests and controls are rejected with useful type errors.
 * @returns {void} Does not return a value; throws if invalid input is accepted.
 */
function assertMetadataRuntimeInvalidInputContract() {
  assert.throws(() => runtime.flattenFilterControls(null), TypeError);
  assert.throws(() => runtime.flattenFilterControls({ filters: {} }), TypeError);
  assert.throws(() => runtime.flattenFilterControls({ filters: [{ controls: [] }] }), TypeError);
  assert.throws(() => runtime.flattenFilterControls({ filters: [{ id: "broken", controls: [{}] }] }), TypeError);
  assert.equal(packageDefinition.exports["./metadata-runtime"], "./metadata-runtime.js");
  assert.equal(packageDefinition.private, true);
  assert.equal(Object.isFrozen(runtime), true);
}

test("metadata runtime flattens filter controls into frozen reusable records", assertFlattenFilterControlsContract);
test("metadata runtime normalizes performance and supports an empty filter list", assertMetadataRuntimeBoundaryContract);
test("metadata runtime rejects malformed manifests and exports a frozen API", assertMetadataRuntimeInvalidInputContract);
