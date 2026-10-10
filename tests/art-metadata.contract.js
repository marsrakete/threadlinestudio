"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const manifest = require("../packages/threadline-filters/art-metadata.json");
const schema = require("../packages/threadline-filters/metadata.schema.json");
const packageDefinition = require("../packages/threadline-filters/package.json");
const legacyControls = require("./fixtures/art-controls-legacy.json");
const localeDirectory = path.join(__dirname, "../packages/threadline-filters/locales");

/** Validates art-filter metadata, performance classifications, legacy settings, and translations.
 * @returns {void} Does not return a value; throws if the art-filter contract changes.
 */
function assertArtMetadataContract() {
  assert.equal(manifest.schemaVersion, schema.properties.schemaVersion.const);
  assert.equal(manifest.groupId, "art");
  assert.equal(manifest.filters.length, 20);

  const controls = [];
  const translationKeys = [manifest.labelKey, manifest.descriptionKey];
  const filterIds = new Set();
  for (const filter of manifest.filters) {
    assert.equal(filterIds.has(filter.id), false, `Duplicate filter ID: ${filter.id}`);
    filterIds.add(filter.id);
    assert.equal(filter.performance, "veryStrong", `${filter.id} should retain its very-strong marker`);
    assert.equal(filter.controls.length, 1);
    translationKeys.push(filter.labelKey);
    for (const control of filter.controls) {
      assert.equal(control.type, "range");
      assert.ok(control.max > control.min);
      assert.ok(control.step > 0);
      assert.ok(control.defaultValue >= control.min && control.defaultValue <= control.max);
      controls.push(control);
      translationKeys.push(control.labelKey);
    }
  }

  assert.equal(controls.length, legacyControls.length);
  for (const legacyControl of legacyControls) {
    let mappedControl;
    for (const control of controls) {
      if (control.stateKey === legacyControl.key) {
        mappedControl = control;
        break;
      }
    }
    assert.ok(mappedControl, `Missing existing art-filter state key: ${legacyControl.key}`);
    assert.equal(mappedControl.min, legacyControl.min);
    assert.equal(mappedControl.max, legacyControl.max);
    assert.equal(mappedControl.step, legacyControl.step);
    assert.equal(mappedControl.defaultValue, legacyControl.value);
  }

  for (const localeName of ["de", "en", "fr"]) {
    const locale = JSON.parse(fs.readFileSync(path.join(localeDirectory, `${localeName}.json`), "utf8"));
    for (const translationKey of translationKeys) {
      assert.equal(typeof locale[translationKey], "string", `${localeName} missing ${translationKey}`);
      assert.notEqual(locale[translationKey].trim(), "", `${localeName} has an empty ${translationKey}`);
    }
  }

  assert.equal(packageDefinition.exports["./art-metadata"], "./art-metadata.json");
  assert.equal(packageDefinition.files.includes("art-metadata.json"), true);
  assert.equal(packageDefinition.version, "0.34.0");
  const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
  assert.match(appSource, /art:\s*buildControlsFromMetadata\(FILTER_METADATA\.art\)/);
  assert.match(appSource, /performance: control\.performance/);
}

/** Runs the art metadata contract as a Node test.
 * @returns {void} Does not return a value; reports assertion results to the test runner.
 */
function testArtMetadataContract() {
  assertArtMetadataContract();
}

test("art metadata preserves controls, very-strong classification, and all locales", testArtMetadataContract);
