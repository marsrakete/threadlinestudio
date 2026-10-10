"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const libraryDirectory = path.resolve(__dirname, "../packages/threadline-filters");
const consumerDirectory = path.resolve(__dirname, "fixtures/repository-consumer");

/** Executes a consumer example outside the repository checkout.
 * @param {string} source - JavaScript program to run in a separate Node process.
 * @returns {string} Trimmed stdout from the consumer process.
 */
function runExternalConsumer(source) {
  const output = execFileSync(process.execPath, ["-e", source], {
    cwd: os.tmpdir(),
    encoding: "utf8",
    env: {
      ...process.env,
      THREADLINE_FILTERS_PATH: libraryDirectory,
    },
  });
  return output.trim();
}

/** Confirms consumers can load filter effects directly from the repository checkout.
 * @returns {void} Does not return a value; throws when the local checkout API is unavailable.
 */
function assertExternalEffectConsumerContract() {
  const output = runExternalConsumer([
    'const path = require("node:path");',
    'const filtersPath = process.env.THREADLINE_FILTERS_PATH;',
    'const filters = require(filtersPath);',
    'const effects = require(path.join(filtersPath, "effects.js"));',
    'const pixels = new Uint8ClampedArray([20, 60, 100, 255]);',
    'filters.applyGrayscale(pixels, 1);',
    'if (pixels[0] !== pixels[1] || typeof effects.patterns.createPatternEffects !== "function") process.exit(1);',
    'process.stdout.write("local effect imports ok");',
  ].join("\n"));

  assert.equal(output, "local effect imports ok");
}

/** Confirms consumers can load filter metadata, locale dictionaries, and the metadata runtime locally.
 * @returns {void} Does not return a value; throws when a documented checkout path fails.
 */
function assertExternalMetadataConsumerContract() {
  const output = runExternalConsumer([
    'const path = require("node:path");',
    'const filtersPath = process.env.THREADLINE_FILTERS_PATH;',
    'const metadataRuntime = require(path.join(filtersPath, "metadata-runtime.js"));',
    'const manifest = require(path.join(filtersPath, "fragment-metadata.json"));',
    'const german = require(path.join(filtersPath, "locales", "de.json"));',
    'const controls = metadataRuntime.flattenFilterControls(manifest);',
    'if (controls.length !== 4 || german[controls[0].labelKey] !== "Kacheln vertauschen") process.exit(1);',
    'process.stdout.write("local metadata imports ok");',
  ].join("\n"));

  assert.equal(output, "local metadata imports ok");
}

test("a separate project can require effects directly from a repository checkout", assertExternalEffectConsumerContract);
test("a separate project can require manifests and locales directly from a repository checkout", assertExternalMetadataConsumerContract);

/** Runs the standalone consumer fixture from outside the Threadline checkout.
 * @returns {void} Does not return a value; throws when the fixture cannot consume the checkout.
 */
function assertStandaloneConsumerProjectContract() {
  const output = execFileSync(process.execPath, [path.join(consumerDirectory, "consumer.js")], {
    cwd: os.tmpdir(),
    encoding: "utf8",
    env: {
      ...process.env,
      THREADLINE_FILTERS_PATH: path.resolve(__dirname, "../"),
    },
  }).trim();
  const result = JSON.parse(output);
  assert.equal(result.capabilities.pixel, true);
  assert.equal(result.capabilities.campaigns, true);
  assert.equal(result.capabilities.art, false);
  assert.equal(result.pixel.length, 4);
  assert.equal(result.pixel[3], 255);
}

test("standalone consumer project loads and uses library from a separate checkout", assertStandaloneConsumerProjectContract);
