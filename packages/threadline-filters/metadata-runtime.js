(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineFilterMetadata = library;
  }
})(globalThis, function () {
  "use strict";

  /** Flattens a filter-group manifest into reusable, control-level metadata.
   * @param {object} manifest - Versioned manifest containing filters and their controls.
   * @returns {Array<object>} Frozen controls with filter IDs, state keys, ranges, labels, and performance levels.
   */
  function flattenFilterControls(manifest) {
    if (!manifest || !Array.isArray(manifest.filters)) {
      throw new TypeError("Filter metadata must contain a filters array.");
    }

    const controls = [];
    for (const filter of manifest.filters) {
      if (!filter || typeof filter.id !== "string" || !Array.isArray(filter.controls)) {
        throw new TypeError("Each filter must contain an ID and a controls array.");
      }
      let performance = filter.performance;
      if (!performance) {
        performance = "normal";
      }

      for (const control of filter.controls) {
        if (!control || typeof control.stateKey !== "string") {
          throw new TypeError("Each filter control must contain a state key.");
        }
        controls.push(Object.freeze({
          controlId: control.id,
          filterId: filter.id,
          stateKey: control.stateKey,
          labelKey: control.labelKey,
          min: control.min,
          max: control.max,
          step: control.step,
          defaultValue: control.defaultValue,
          performance,
        }));
      }
    }

    return Object.freeze(controls);
  }

  return Object.freeze({ flattenFilterControls });
});
