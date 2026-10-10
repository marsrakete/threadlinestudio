"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const manifest = require("../packages/threadline-filters/corrections-metadata.json");
const schema = require("../packages/threadline-filters/metadata.schema.json");
const packageDefinition = require("../packages/threadline-filters/package.json");
const legacyControls = require("./fixtures/corrections-controls-legacy.json");
const localeDirectory = path.join(__dirname, "../packages/threadline-filters/locales");

/** Checks corrections metadata against the old controls and all shipped locales.
 * @returns {void} Does not return a value; throws if IDs, ranges, defaults, or labels drift.
 */
function assertCorrectionsMetadataContract() {
  assert.equal(manifest.schemaVersion, schema.properties.schemaVersion.const);
  assert.equal(manifest.groupId, "corrections");
  assert.equal(manifest.filters.length, legacyControls.length);

  const controls = [];
  const translationKeys = [manifest.labelKey, manifest.descriptionKey];
  const filterIds = new Set();
  for (const filter of manifest.filters) {
    assert.equal(filterIds.has(filter.id), false, `Duplicate filter ID: ${filter.id}`);
    filterIds.add(filter.id);
    assert.equal(filter.controls.length, 1, `${filter.id} should expose one range control`);
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
    assert.ok(mappedControl, `Missing existing state key: ${legacyControl.key}`);
    assert.equal(mappedControl.min, legacyControl.min);
    assert.equal(mappedControl.max, legacyControl.max);
    assert.equal(mappedControl.step, legacyControl.step);
    assert.equal(mappedControl.defaultValue, legacyControl.value);
  }

  for (const localeName of ["de", "en", "fr"]) {
    const localePath = path.join(localeDirectory, `${localeName}.json`);
    const locale = JSON.parse(fs.readFileSync(localePath, "utf8"));
    for (const translationKey of translationKeys) {
      assert.equal(typeof locale[translationKey], "string", `${localeName} missing ${translationKey}`);
      assert.notEqual(locale[translationKey].trim(), "", `${localeName} has an empty ${translationKey}`);
    }
  }

  assert.equal(packageDefinition.exports["./corrections-metadata"], "./corrections-metadata.json");
  assert.equal(packageDefinition.files.includes("corrections-metadata.json"), true);
  assert.equal(packageDefinition.version, "0.34.0");
  const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
  assert.match(appSource, /corrections:\s*buildControlsFromMetadata\(FILTER_METADATA\.corrections\)/);
}

/** Runs the corrections metadata contract as a Node test.
 * @returns {void} Does not return a value; reports assertion results to the test runner.
 */
function testCorrectionsMetadataContract() {
  assertCorrectionsMetadataContract();
}

test("corrections metadata preserves legacy controls and resolves in all locales", testCorrectionsMetadataContract);
