"use strict";

const path = require("node:path");

/** Loads the filter factory from a separately checked-out Threadline repository.
 * @returns {object} Initialized library API configured by this consumer project.
 */
function createConsumerLibrary() {
  const repositoryPath = process.env.THREADLINE_FILTERS_PATH;
  if (!repositoryPath) {
    throw new Error("Set THREADLINE_FILTERS_PATH to the Threadline Studio checkout.");
  }
  const factoryPath = path.join(repositoryPath, "packages", "threadline-filters", "factory.js");
  const factory = require(factoryPath);
  return factory.createThreadlineFilters({
    schemaVersion: 1,
    capabilities: {
      campaigns: true,
    },
  });
}

/** Applies this consumer's selected filters and returns the transformed sample pixel.
 * @param {object} library - Configured Threadline filter library.
 * @returns {number[]} Resulting RGBA channels.
 */
function renderConsumerSample(library) {
  const pixel = new Uint8ClampedArray([220, 80, 40, 255]);
  library.filters.applySepia(pixel, 0.25);
  library.campaigns.applyRainbow(pixel, 1, 1, 1, 1);
  return Array.from(pixel);
}

/** Runs the independent consumer example and prints its own configured output.
 * @returns {void} Writes one JSON array to stdout.
 */
function main() {
  const library = createConsumerLibrary();
  const result = renderConsumerSample(library);
  process.stdout.write(JSON.stringify({
    capabilities: library.capabilities,
    pixel: result,
  }) + "\n");
}

main();
