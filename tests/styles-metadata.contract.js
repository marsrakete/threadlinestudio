"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const manifest = require("../packages/threadline-filters/styles-metadata.json");
const schema = require("../packages/threadline-filters/metadata.schema.json");
const packageDefinition = require("../packages/threadline-filters/package.json");
const legacyControls = require("./fixtures/styles-controls-legacy.json");
const localeDirectory = path.join(__dirname, "../packages/threadline-filters/locales");

/** Finds a style control through its persisted project-state key.
 * @param {string} stateKey - Existing style control key stored in project settings.
 * @param {Array<object>} controls - Flattened controls from the style manifest.
 * @returns {object|undefined} Matching control, or undefined when the key is absent.
 */
function findStyleMetadataControl(stateKey, controls) {
  for (const control of controls) {
    if (control.stateKey === stateKey) {
      return control;
    }
  }
  return undefined;
}

/** Validates style metadata against the schema, legacy values, and locale resources.
 * @returns {void} Does not return a value; throws when a control mapping or label is invalid.
 */
function assertStylesMetadataContract() {
  assert.equal(manifest.schemaVersion, schema.properties.schemaVersion.const);
  assert.equal(manifest.groupId, "styles");
  assert.equal(manifest.filters.length, 23);

  const controls = [];
  const translationKeys = [manifest.labelKey, manifest.descriptionKey];
  const filterIds = new Set();
  for (const filter of manifest.filters) {
    assert.equal(filterIds.has(filter.id), false, `Duplicate filter ID: ${filter.id}`);
    filterIds.add(filter.id);
    translationKeys.push(filter.labelKey);
    const controlIds = new Set();
    for (const control of filter.controls) {
      assert.equal(controlIds.has(control.id), false, `Duplicate control ID: ${filter.id}.${control.id}`);
      controlIds.add(control.id);
      assert.equal(control.type, "range");
      assert.ok(control.max > control.min, `${control.stateKey} must have a positive range`);
      assert.ok(control.step > 0, `${control.stateKey} must have a positive step`);
      assert.ok(control.defaultValue >= control.min && control.defaultValue <= control.max, `${control.stateKey} default is outside its range`);
      controls.push(control);
      translationKeys.push(control.labelKey);
    }
  }

  assert.equal(controls.length, 25);
  assert.equal(controls.length, legacyControls.length);
  for (const legacyControl of legacyControls) {
    const mappedControl = findStyleMetadataControl(legacyControl.key, controls);
    assert.ok(mappedControl, `Missing existing state key: ${legacyControl.key}`);
    assert.equal(mappedControl.min, legacyControl.min, `${legacyControl.key} minimum changed`);
    assert.equal(mappedControl.max, legacyControl.max, `${legacyControl.key} maximum changed`);
    assert.equal(mappedControl.step, legacyControl.step, `${legacyControl.key} step changed`);
    assert.equal(mappedControl.defaultValue, legacyControl.value, `${legacyControl.key} default changed`);
  }

  for (const localeName of ["de", "en", "fr"]) {
    const locale = JSON.parse(fs.readFileSync(path.join(localeDirectory, `${localeName}.json`), "utf8"));
    for (const translationKey of translationKeys) {
      assert.equal(typeof locale[translationKey], "string", `${localeName} missing ${translationKey}`);
      assert.notEqual(locale[translationKey].trim(), "", `${localeName} has an empty ${translationKey}`);
    }
  }

  assert.equal(packageDefinition.exports["./styles-metadata"], "./styles-metadata.json");
  assert.equal(packageDefinition.files.includes("styles-metadata.json"), true);
  assert.equal(packageDefinition.version, "0.34.0");
  const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
  assert.match(appSource, /styles:\s*buildControlsFromMetadata\(FILTER_METADATA\.styles\)/);
}

/** Runs the styles metadata contract as a Node test.
 * @returns {void} Does not return a value; reports assertion results to the test runner.
 */
function testStylesMetadataContract() {
  assertStylesMetadataContract();
}

test("styles metadata preserves legacy controls and resolves in all locales", testStylesMetadataContract);
