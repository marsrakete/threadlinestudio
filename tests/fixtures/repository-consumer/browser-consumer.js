"use strict";

const libraryScriptNames = [
  "index.js",
  "canvas-runtime.js",
  "morphology-effects.js",
  "canvas-effects.js",
  "campaign-effects.js",
  "atmosphere-effects.js",
  "canvas-primitives.js",
  "pattern-effects.js",
  "material-effects.js",
  "graphic-effects.js",
  "composition-effects.js",
  "morph-effects.js",
  "text-effects.js",
  "artist-effects.js",
  "art-effects.js",
  "canvas-sampling.js",
  "canvas-geometry.js",
  "effects.js",
  "factory.js",
];

/** Loads a classic script and resolves after it has executed.
 * @param {string} source - Absolute script URL.
 * @returns {Promise<void>} Resolves when the script loads; rejects on network or execution load failure.
 */
function loadScript(source) {
  return new Promise(function loadScriptPromise(resolve, reject) {
    const script = document.createElement("script");
    script.src = source;
    script.onload = resolve;
    script.onerror = function handleScriptError() {
      reject(new Error("Could not load library script: " + source));
    };
    document.head.append(script);
  });
}

/** Resolves the configured external checkout base URL.
 * @returns {URL} URL ending at the filter-library directory.
 */
function getLibraryBaseUrl() {
  const parameters = new URLSearchParams(window.location.search);
  let configuredBase = parameters.get("libraryBase");
  if (!configuredBase) {
    configuredBase = "../../../packages/threadline-filters/";
  }
  return new URL(configuredBase, window.location.href);
}

/** Creates an independent library configuration for this browser consumer.
 * @returns {object} Factory instance with this example's selected capabilities.
 */
function createBrowserConsumerLibrary() {
  return window.ThreadlineFilterFactory.createThreadlineFilters({
    schemaVersion: 1,
    capabilities: {
      campaigns: true,
    },
  });
}

/** Draws a sample image, applies the consumer-selected pixel and campaign effects, and displays the output.
 * @param {object} library - Configured filter library.
 * @returns {void} Updates the canvas, result output, and status text.
 */
function renderBrowserConsumerSample(library) {
  const canvas = document.getElementById("preview");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#e56b58");
  gradient.addColorStop(1, "#325f91");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  library.filters.applySepia(imageData.data, 0.35);
  library.campaigns.applyRainbow(imageData.data, canvas.width, canvas.height, 6, 0.32);
  context.putImageData(imageData, 0, 0);

  const template = document.getElementById("result-template");
  const output = template.content.firstElementChild.cloneNode(true);
  output.textContent = "Pixel-Filter und Pride-Overlay aus externem Git-Checkout geladen.";
  document.getElementById("result").replaceChildren(output);
  document.getElementById("status").textContent = "Bereit. Aktiv: " + Object.keys(library.capabilities).filter(function isEnabled(name) {
    return library.capabilities[name];
  }).join(", ");
}

/** Loads the external checkout scripts in dependency order and runs the consumer demo.
 * @returns {Promise<void>} Resolves after rendering or reports a visible loading error.
 */
async function startBrowserConsumer() {
  const baseUrl = getLibraryBaseUrl();
  try {
    for (const scriptName of libraryScriptNames) {
      await loadScript(new URL(scriptName, baseUrl).href);
    }
    renderBrowserConsumerSample(createBrowserConsumerLibrary());
  } catch (error) {
    document.getElementById("status").textContent = error.message;
    throw error;
  }
}

startBrowserConsumer();
