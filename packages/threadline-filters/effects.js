(function (root, createLibrary) {
  "use strict";

  let library;
  if (typeof module === "object" && module.exports) {
    library = createLibrary(
      require("./index"),
      require("./canvas-runtime"),
      require("./morphology-effects"),
      require("./canvas-effects"),
      require("./campaign-effects"),
      require("./atmosphere-effects"),
      require("./canvas-primitives"),
      require("./pattern-effects"),
      require("./material-effects"),
      require("./graphic-effects"),
      require("./composition-effects"),
      require("./morph-effects"),
      require("./text-effects"),
      require("./artist-effects"),
      require("./art-effects"),
      require("./canvas-sampling"),
      require("./canvas-geometry")
    );
    module.exports = library;
  } else if (root) {
    library = createLibrary(
      root.ThreadlineFilters,
      root.ThreadlineCanvasRuntime,
      root.ThreadlineMorphologyEffects,
      root.ThreadlineCanvasEffects,
      root.ThreadlineCampaignEffects,
      root.ThreadlineAtmosphereEffects,
      root.ThreadlineCanvasPrimitives,
      root.ThreadlinePatternEffects,
      root.ThreadlineMaterialEffects,
      root.ThreadlineGraphicEffects,
      root.ThreadlineCompositionEffects,
      root.ThreadlineMorphEffects,
      root.ThreadlineTextEffects,
      root.ThreadlineArtistEffects,
      root.ThreadlineArtEffects,
      root.ThreadlineCanvasSampling,
      root.ThreadlineCanvasGeometry
    );
    root.ThreadlineFilterEffects = library;
  }
})(globalThis, function (
  filters,
  canvasRuntime,
  morphology,
  canvas,
  campaigns,
  atmosphere,
  primitives,
  patterns,
  materials,
  graphics,
  composition,
  morphs,
  text,
  artists,
  art,
  sampling,
  geometry
) {
  "use strict";

  /** Validates loaded modules and returns the unified set of reusable filter APIs.
   * @param {...object} modules - Pixel and Canvas renderer modules in package order.
   * @returns {object} Frozen object containing every public module API.
   */
  function createLibrary(modules) {
    for (const currentModule of arguments) {
      if (!currentModule || typeof currentModule !== "object") {
        throw new TypeError("All Threadline filter modules must be loaded before effects.js.");
      }
    }

    return Object.freeze({
      filters,
      canvasRuntime,
      morphology,
      canvas,
      campaigns,
      atmosphere,
      primitives,
      patterns,
      materials,
      graphics,
      composition,
      morphs,
      text,
      artists,
      art,
      sampling,
      geometry,
    });
  }

  return createLibrary(
    filters,
    canvasRuntime,
    morphology,
    canvas,
    campaigns,
    atmosphere,
    primitives,
    patterns,
    materials,
    graphics,
    composition,
    morphs,
    text,
    artists,
    art
  );
});
