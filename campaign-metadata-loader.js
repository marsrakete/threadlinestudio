(function (root) {
  "use strict";

  const currentScript = document.currentScript;
  if (!currentScript || !currentScript.src) {
    throw new Error("Campaign metadata loader must be loaded as a script element.");
  }
  const baseUrl = currentScript.src;

  /** Fetches and parses one JSON resource relative to the loader script.
   * @param {string} relativePath - Resource path relative to this script.
   * @returns {Promise<object>} Parsed JSON resource.
   */
  async function loadJson(relativePath) {
    const resourceUrl = new URL(relativePath, baseUrl);
    const response = await fetch(resourceUrl);
    if (!response.ok) {
      throw new Error(`Could not load filter metadata resource: ${relativePath}`);
    }
    return response.json();
  }

  /** Loads filter manifests and locale dictionaries before app.js starts.
   * @returns {Promise<void>} Resolves after app.js has been added to the document.
   */
  async function loadFilterMetadata() {
    const results = await Promise.all([
      loadJson("./packages/threadline-filters/campaign-metadata.json"),
      loadJson("./packages/threadline-filters/corrections-metadata.json"),
      loadJson("./packages/threadline-filters/styles-metadata.json"),
      loadJson("./packages/threadline-filters/fx-metadata.json"),
      loadJson("./packages/threadline-filters/morphology-metadata.json"),
      loadJson("./packages/threadline-filters/patterns-metadata.json"),
      loadJson("./packages/threadline-filters/materials-metadata.json"),
      loadJson("./packages/threadline-filters/atmosphere-metadata.json"),
      loadJson("./packages/threadline-filters/art-metadata.json"),
      loadJson("./packages/threadline-filters/artists-metadata.json"),
      loadJson("./packages/threadline-filters/graphics-metadata.json"),
      loadJson("./packages/threadline-filters/word-art-metadata.json"),
      loadJson("./packages/threadline-filters/fragment-metadata.json"),
      loadJson("./packages/threadline-filters/cut-metadata.json"),
      loadJson("./packages/threadline-filters/morph-metadata.json"),
      loadJson("./packages/threadline-filters/locales/de.json"),
      loadJson("./packages/threadline-filters/locales/en.json"),
      loadJson("./packages/threadline-filters/locales/fr.json"),
    ]);

    root.THREADLINE_FILTER_METADATA = Object.freeze({
      campaigns: results[0],
      corrections: results[1],
      styles: results[2],
      fx: results[3],
      morphology: results[4],
      patterns: results[5],
      materials: results[6],
      atmosphere: results[7],
      art: results[8],
      artists: results[9],
      graphics: results[10],
      wordArt: results[11],
      fragment: results[12],
      cut: results[13],
      morph: results[14],
      locales: Object.freeze({
        de: results[15],
        en: results[16],
        fr: results[17],
      }),
    });

    const appScript = document.createElement("script");
    appScript.src = new URL("./app.js", baseUrl).href;
    document.body.append(appScript);
  }

  loadFilterMetadata().catch(function reportMetadataLoadError(error) {
    document.body.dataset.startupError = "filter-metadata";
    console.error("Threadline filter metadata could not be initialized.", error);
  });
})(globalThis);
