"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const schema = require("../packages/threadline-filters/metadata.schema.json");
const packageDefinition = require("../packages/threadline-filters/package.json");

/** Checks the versioned metadata schema and the package's public schema path.
 * @returns {void} Does not return a value; throws when the schema contract changes.
 */
function assertMetadataSchemaContract() {
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.match(schema.$comment, /max > min/);
  assert.equal(schema.properties.schemaVersion.const, 1);
  assert.deepEqual(schema.required, ["schemaVersion", "groupId", "labelKey", "filters"]);
  assert.deepEqual(schema.properties.filters.items.$ref, "#/$defs/filter");
  assert.deepEqual(schema.$defs.filter.required, ["id", "labelKey", "controls"]);
  assert.deepEqual(schema.$defs.filter.properties.performance.enum, ["normal", "strong", "veryStrong"]);
  assert.deepEqual(schema.$defs.filter.properties.controls.items.$ref, "#/$defs/control");
  assert.deepEqual(schema.$defs.control.required, [
    "id",
    "stateKey",
    "labelKey",
    "type",
    "min",
    "max",
    "step",
    "defaultValue",
  ]);
  assert.equal(schema.$defs.control.properties.type.const, "range");
  assert.equal(schema.$defs.control.properties.step.exclusiveMinimum, 0);
  assert.equal(packageDefinition.exports["./metadata-schema"], "./metadata.schema.json");
  assert.equal(packageDefinition.exports["./canvas-sampling"], "./canvas-sampling.js");
  assert.equal(packageDefinition.exports["./canvas-geometry"], "./canvas-geometry.js");
  assert.equal(packageDefinition.version, "0.34.0");
  assert.equal(packageDefinition.files.includes("metadata.schema.json"), true);
}

test("filter metadata schema v1 is versioned and exported by the package", function () {
  assertMetadataSchemaContract();
});
