"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const packageDefinition = require("../packages/threadline-filters/package.json");
const manifestDirectory = path.join(__dirname, "../packages/threadline-filters");

const expectedStateKeyPerformance = new Map([
  ["lineBlend", "veryStrong"],
  ["testPattern", "veryStrong"],
  ["tireTracks", "veryStrong"],
  ["fingerprint", "veryStrong"],
  ["backgroundBlur", "strong"],
  ["falseColor", "strong"],
  ["crossProcess", "strong"],
  ["heatmap", "strong"],
  ["posterBlocks", "strong"],
  ["oilPaint", "strong"],
  ["popArt", "strong"],
  ["halftone", "strong"],
  ["glitch", "strong"],
  ["edges", "strong"],
  ["emboss", "strong"],
  ["pencil", "strong"],
  ["charcoal", "strong"],
  ["comic", "strong"],
  ["silhouette", "strong"],
  ["meshFence", "strong"],
  ["overlayOpacity", "strong"],
]);

const expectedGroupPerformance = new Map([
  ["materials", "strong"],
  ["atmosphere", "strong"],
  ["art", "veryStrong"],
  ["artists", "veryStrong"],
  ["graphics", "veryStrong"],
  ["word-art", "veryStrong"],
  ["fragment", "veryStrong"],
  ["cut", "veryStrong"],
  ["morph", "veryStrong"],
]);

/** Verifies the legacy intensity classifications now live in filter metadata.
 * @returns {void} Does not return a value; throws if performance labels drift from their contracts.
 */
function assertPerformanceMetadataContract() {
  const manifests = [];
  for (const fileName of fs.readdirSync(manifestDirectory)) {
    if (!fileName.endsWith("-metadata.json")) {
      continue;
    }
    manifests.push(JSON.parse(fs.readFileSync(path.join(manifestDirectory, fileName), "utf8")));
  }

  const groupIds = new Set();
  const stateKeyPerformance = new Map();
  for (const manifest of manifests) {
    groupIds.add(manifest.groupId);
    const groupPerformance = expectedGroupPerformance.get(manifest.groupId);
    for (const filter of manifest.filters) {
      if (groupPerformance) {
        assert.equal(filter.performance, groupPerformance, `${manifest.groupId}.${filter.id} group intensity changed`);
      }
      for (const control of filter.controls) {
        const expected = expectedStateKeyPerformance.get(control.stateKey);
        if (expected) {
          assert.equal(filter.performance, expected, `${control.stateKey} intensity changed`);
          stateKeyPerformance.set(control.stateKey, filter.performance);
        }
      }
    }
  }

  assert.equal(stateKeyPerformance.size, expectedStateKeyPerformance.size);
  for (const groupId of expectedGroupPerformance.keys()) {
    assert.equal(groupIds.has(groupId), true, `Missing performance metadata group ${groupId}`);
  }

  const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
  assert.match(appSource, /THREADLINE_FILTER_METADATA_RUNTIME\.flattenFilterControls\(manifest\)/);
  assert.match(appSource, /getControlIntensityClass\(control\.performance\)/);
  assert.doesNotMatch(appSource, /VERY_STRONG_CONTROL_KEYS|VERY_STRONG_CONTROL_GROUPS|STRONG_CONTROL_KEYS|STRONG_CONTROL_GROUPS/);
  assert.equal(packageDefinition.version, "0.34.0");
}

/** Runs the performance metadata contract as a Node test.
 * @returns {void} Does not return a value; reports assertion results to the test runner.
 */
function testPerformanceMetadataContract() {
  assertPerformanceMetadataContract();
}

test("performance markers are defined by filter metadata", testPerformanceMetadataContract);
