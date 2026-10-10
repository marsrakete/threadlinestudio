"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const manifest = require("../packages/threadline-filters/campaign-metadata.json");
const schema = require("../packages/threadline-filters/metadata.schema.json");
const packageDefinition = require("../packages/threadline-filters/package.json");
const legacyControls = require("./fixtures/campaign-controls-legacy.json");
const localeDirectory = path.join(__dirname, "../packages/threadline-filters/locales");

/** Finds a manifest control through its persisted project-state key.
 * @param {string} stateKey - Existing control key stored in project settings.
 * @param {Array<object>} controls - Flattened manifest controls to search.
 * @returns {object|undefined} Matching control, or undefined when the key is absent.
 */
function findMetadataControl(stateKey, controls) {
  for (const control of controls) {
    if (control.stateKey === stateKey) {
      return control;
    }
  }
  return undefined;
}

/** Checks campaign metadata against the schema shape, stored settings, and locale resources.
 * @returns {void} Does not return a value; throws if a mapping or translation is missing.
 */
function assertCampaignMetadataContract() {
  assert.equal(manifest.schemaVersion, schema.properties.schemaVersion.const);
  assert.equal(manifest.groupId, "campaigns");
  assert.equal(manifest.filters.length, 6);

  const currentControls = legacyControls;
  const metadataControls = [];
  const translationKeys = [manifest.labelKey, manifest.descriptionKey];
  const filterIds = new Set();

  for (const filter of manifest.filters) {
    assert.equal(filterIds.has(filter.id), false, `Duplicate filter ID: ${filter.id}`);
    filterIds.add(filter.id);
    translationKeys.push(filter.labelKey);

    const controlIds = new Set();
    for (const control of filter.controls) {
      assert.equal(controlIds.has(control.id), false, `Duplicate control ID: ${control.id}`);
      controlIds.add(control.id);
      assert.equal(control.type, "range");
      assert.ok(control.max > control.min, `${control.stateKey} must have a positive range`);
      assert.ok(control.step > 0, `${control.stateKey} must have a positive step`);
      assert.ok(control.defaultValue >= control.min && control.defaultValue <= control.max, `${control.stateKey} default is outside its range`);
      metadataControls.push(control);
      translationKeys.push(control.labelKey);
    }
  }

  assert.equal(metadataControls.length, currentControls.length);
  for (const currentControl of currentControls) {
    const mappedControl = findMetadataControl(currentControl.key, metadataControls);
    assert.ok(mappedControl, `Missing campaign state key: ${currentControl.key}`);
    assert.equal(mappedControl.min, currentControl.min, `${currentControl.key} minimum changed`);
    assert.equal(mappedControl.max, currentControl.max, `${currentControl.key} maximum changed`);
    assert.equal(mappedControl.step, currentControl.step, `${currentControl.key} step changed`);
    assert.equal(mappedControl.defaultValue, currentControl.value, `${currentControl.key} default changed`);
  }

  for (const localeName of ["de", "en", "fr"]) {
    const locale = JSON.parse(fs.readFileSync(path.join(localeDirectory, `${localeName}.json`), "utf8"));
    for (const translationKey of translationKeys) {
      assert.equal(typeof locale[translationKey], "string", `${localeName} missing ${translationKey}`);
      assert.notEqual(locale[translationKey].trim(), "", `${localeName} has an empty ${translationKey}`);
    }
  }

  assert.equal(packageDefinition.exports["./campaign-metadata"], "./campaign-metadata.json");
  assert.equal(packageDefinition.exports["./locales/de"], "./locales/de.json");
  assert.equal(packageDefinition.exports["./locales/en"], "./locales/en.json");
  assert.equal(packageDefinition.exports["./locales/fr"], "./locales/fr.json");
  assert.equal(packageDefinition.version, "0.34.0");

  const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
  assert.match(appSource, /campaigns:\s*buildControlsFromMetadata\(FILTER_METADATA\.campaigns\)/);
  assert.match(appSource, /FILTER_METADATA_LOCALES\[language\]\[key\]/);
  const loaderSource = fs.readFileSync(path.join(__dirname, "../campaign-metadata-loader.js"), "utf8");
  assert.match(loaderSource, /campaign-metadata\.json/);
  assert.match(loaderSource, /corrections-metadata\.json/);
  assert.match(loaderSource, /styles-metadata\.json/);
  assert.match(loaderSource, /fx-metadata\.json/);
  assert.match(loaderSource, /morphology-metadata\.json/);
  assert.match(loaderSource, /patterns-metadata\.json/);
  assert.match(loaderSource, /materials-metadata\.json/);
  assert.match(loaderSource, /atmosphere-metadata\.json/);
  assert.match(loaderSource, /art-metadata\.json/);
  assert.match(loaderSource, /artists-metadata\.json/);
  assert.match(loaderSource, /graphics-metadata\.json/);
  assert.match(loaderSource, /word-art-metadata\.json/);
  assert.match(loaderSource, /fragment-metadata\.json/);
  assert.match(loaderSource, /cut-metadata\.json/);
  assert.match(loaderSource, /morph-metadata\.json/);
  assert.match(loaderSource, /locales\/fr\.json/);
  const indexSource = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
  assert.match(indexSource, /campaign-metadata-loader\.js/);
  assert.match(indexSource, /threadline-filters\/metadata-runtime\.js/);
  assert.match(indexSource, /threadline-filters\/factory\.js/);
  const serviceWorkerSource = fs.readFileSync(path.join(__dirname, "../service-worker.js"), "utf8");
  assert.match(serviceWorkerSource, /campaign-metadata-loader\.js/);
  assert.match(serviceWorkerSource, /threadline-filters\/metadata-runtime\.js/);
  assert.match(serviceWorkerSource, /threadline-filters\/factory\.js/);
  assert.match(serviceWorkerSource, /locales\/de\.json/);
  assert.match(serviceWorkerSource, /corrections-metadata\.json/);
  assert.match(serviceWorkerSource, /styles-metadata\.json/);
  assert.match(serviceWorkerSource, /fx-metadata\.json/);
  assert.match(serviceWorkerSource, /morphology-metadata\.json/);
  assert.match(serviceWorkerSource, /patterns-metadata\.json/);
  assert.match(serviceWorkerSource, /materials-metadata\.json/);
  assert.match(serviceWorkerSource, /atmosphere-metadata\.json/);
  assert.match(serviceWorkerSource, /art-metadata\.json/);
  assert.match(serviceWorkerSource, /artists-metadata\.json/);
  assert.match(serviceWorkerSource, /graphics-metadata\.json/);
  assert.match(serviceWorkerSource, /word-art-metadata\.json/);
  assert.match(serviceWorkerSource, /fragment-metadata\.json/);
  assert.match(serviceWorkerSource, /cut-metadata\.json/);
  assert.match(serviceWorkerSource, /morph-metadata\.json/);
  const versionInfo = require("../version.json");
  assert.equal(packageDefinition.version, "0.34.0");
  assert.equal(versionInfo.appVersion, "0.2.73");
  assert.equal(versionInfo.cacheVersion, "v176");
}

/** Runs the campaign metadata contract as a Node test.
 * @returns {void} Does not return a value; reports the assertion results to the test runner.
 */
function testCampaignMetadataContract() {
  assertCampaignMetadataContract();
}

test("campaign metadata preserves existing controls and resolves in all locales", testCampaignMetadataContract);
