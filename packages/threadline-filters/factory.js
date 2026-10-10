(function (root, createLibrary) {
  "use strict";

  let modules;
  if (typeof module === "object" && module.exports) {
    modules = require("./effects");
    module.exports = createLibrary(modules);
  } else if (root) {
    modules = root.ThreadlineFilterEffects;
    root.ThreadlineFilterFactory = createLibrary(modules);
  }
})(globalThis, function (modules) {
  "use strict";

  const capabilityNames = Object.freeze([
    "campaigns",
    "canvas",
    "atmosphere",
    "patterns",
    "materials",
    "graphics",
    "composition",
    "morphs",
    "text",
    "artists",
    "art",
  ]);

  /** Clamps a finite numeric value to the inclusive range.
   * @param {number} value - Value to clamp.
   * @param {number} minimum - Inclusive lower bound.
   * @param {number} maximum - Inclusive upper bound.
   * @returns {number} Clamped value.
   */
  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  /** Linearly interpolates between two numbers.
   * @param {number} first - Starting value.
   * @param {number} second - Ending value.
   * @param {number} amount - Interpolation amount.
   * @returns {number} Interpolated value.
   */
  function mix(first, second, amount) {
    return first + (second - first) * amount;
  }

  /** Smoothly maps a value between two edges to zero through one.
   * @param {number} edge0 - Lower edge.
   * @param {number} edge1 - Upper edge.
   * @param {number} value - Value to map.
   * @returns {number} Smooth interpolation amount.
   */
  function smoothstep(edge0, edge1, value) {
    const amount = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return amount * amount * (3 - 2 * amount);
  }

  /** Converts RGB byte channels to hue, saturation, and lightness.
   * @param {number} red - Red channel from zero to 255.
   * @param {number} green - Green channel from zero to 255.
   * @param {number} blue - Blue channel from zero to 255.
   * @returns {[number, number, number]} Hue degrees and normalized saturation/lightness.
   */
  function rgbToHsl(red, green, blue) {
    const redUnit = red / 255;
    const greenUnit = green / 255;
    const blueUnit = blue / 255;
    const maximum = Math.max(redUnit, greenUnit, blueUnit);
    const minimum = Math.min(redUnit, greenUnit, blueUnit);
    let hue = 0;
    let saturation = 0;
    const lightness = (maximum + minimum) / 2;
    if (maximum !== minimum) {
      const delta = maximum - minimum;
      if (lightness > 0.5) {
        saturation = delta / (2 - maximum - minimum);
      } else {
        saturation = delta / (maximum + minimum);
      }
      if (maximum === redUnit) {
        hue = (greenUnit - blueUnit) / delta;
        if (greenUnit < blueUnit) {
          hue += 6;
        }
      } else if (maximum === greenUnit) {
        hue = (blueUnit - redUnit) / delta + 2;
      } else {
        hue = (redUnit - greenUnit) / delta + 4;
      }
      hue *= 60;
    }
    return [hue, saturation, lightness];
  }

  /** Converts hue, saturation, and lightness to rounded RGB byte channels.
   * @param {number} hue - Hue angle in degrees.
   * @param {number} saturation - Normalized saturation.
   * @param {number} lightness - Normalized lightness.
   * @returns {[number, number, number]} Rounded red, green, and blue channels.
   */
  function hslToRgb(hue, saturation, lightness) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const second = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
    const offset = lightness - chroma / 2;
    let red = 0;
    let green = 0;
    let blue = 0;
    if (hue < 60) {
      red = chroma;
      green = second;
    } else if (hue < 120) {
      red = second;
      green = chroma;
    } else if (hue < 180) {
      green = chroma;
      blue = second;
    } else if (hue < 240) {
      green = second;
      blue = chroma;
    } else if (hue < 300) {
      red = second;
      blue = chroma;
    } else {
      red = chroma;
      blue = second;
    }
    return [
      Math.round((red + offset) * 255),
      Math.round((green + offset) * 255),
      Math.round((blue + offset) * 255),
    ];
  }

  /** Produces deterministic normalized noise for a coordinate and seed.
   * @param {number} x - Horizontal coordinate.
   * @param {number} y - Vertical coordinate.
   * @param {number} seed - Optional seed offset.
   * @returns {number} Deterministic value in the half-open range zero to one.
   */
  function seededNoise(x, y, seed) {
    let salt = seed;
    if (typeof salt !== "number") {
      salt = 0;
    }
    const value = Math.sin(x * 127.1 + y * 311.7 + salt * 91.3) * 43758.5453123;
    return value - Math.floor(value);
  }

  /** Applies the project's strength curve to a normalized slider value.
   * @param {number} value - Normalized value.
   * @param {number} exponent - Curve exponent.
   * @param {number} maximum - Maximum output value.
   * @returns {number} Curved value.
   */
  function curveThousand(value, exponent, maximum) {
    let curve = exponent;
    let scale = maximum;
    if (typeof curve !== "number") {
      curve = 1.4;
    }
    if (typeof scale !== "number") {
      scale = 1;
    }
    return Math.pow(clamp(value / 10, 0, 1), curve) * scale;
  }

  /** Parses a short or full hexadecimal color into RGB channels.
   * @param {string} color - Hex color in #RGB or #RRGGBB form.
   * @returns {{r:number,g:number,b:number}} Parsed RGB channels.
   */
  function parseHexColor(color) {
    if (typeof color !== "string") {
      throw new TypeError("color must be a #RGB or #RRGGBB string.");
    }
    let normalized = color.trim();
    if (/^#[0-9a-f]{3}$/i.test(normalized)) {
      normalized = "#" + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3];
    }
    if (!/^#[0-9a-f]{6}$/i.test(normalized)) {
      throw new RangeError("color must use #RGB or #RRGGBB format.");
    }
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16),
    };
  }

  /** Formats RGB channels as a CSS rgba() color.
   * @param {{r:number,g:number,b:number}} color - RGB color object.
   * @param {number} alpha - Alpha value.
   * @returns {string} CSS rgba() color string.
   */
  function rgbaString(color, alpha) {
    return "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + alpha + ")";
  }

  /** Parses a hex color and formats it with the supplied alpha.
   * @param {string} color - Hex color in #RGB or #RRGGBB form.
   * @param {number} alpha - Alpha value.
   * @returns {string} CSS rgba() color string.
   */
  function rgbaFromHex(color, alpha) {
    return rgbaString(parseHexColor(color), alpha);
  }

  /** Calculates the byte offset of a pixel in a packed RGBA buffer.
   * @param {number} x - Horizontal pixel coordinate.
   * @param {number} y - Vertical pixel coordinate.
   * @param {number} width - Image width in pixels.
   * @returns {number} Byte offset of the pixel's red channel.
   */
  function getPixelIndex(x, y, width) {
    return (y * width + x) * 4;
  }

  /** Calculates saturation as the normalized RGB channel spread.
   * @param {number} red - Red channel from zero to 255.
   * @param {number} green - Green channel from zero to 255.
   * @param {number} blue - Blue channel from zero to 255.
   * @returns {number} Saturation from zero to one.
   */
  function getRgbSaturation(red, green, blue) {
    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    if (maximum <= 0) {
      return 0;
    }
    return (maximum - minimum) / maximum;
  }

  /** Validates and normalizes the selected optional effect capabilities.
   * @param {object} host - Factory configuration.
   * @returns {string[]} Enabled capability names.
   */
  function readCapabilities(host) {
    const enabled = [];
    const capabilities = host.capabilities;
    if (capabilities === undefined) {
      return enabled;
    }
    if (!capabilities || typeof capabilities !== "object" || Array.isArray(capabilities)) {
      throw new TypeError("capabilities must be an object of boolean flags.");
    }
    for (const name of Object.keys(capabilities)) {
      if (!capabilityNames.includes(name)) {
        throw new RangeError("Unknown Threadline filter capability: " + name);
      }
      if (typeof capabilities[name] !== "boolean") {
        throw new TypeError("capabilities." + name + " must be a boolean.");
      }
      if (capabilities[name]) {
        enabled.push(name);
      }
    }
    return enabled;
  }

  /** Creates enabled effect families from validated host adapters.
   * @param {object} host - Versioned host configuration with optional capabilities and adapters.
   * @returns {object} Frozen filter API and enabled effect-family instances.
   */
  function createThreadlineFilters(host) {
    if (!modules || !modules.filters) {
      throw new Error("Threadline filter modules must be loaded before the factory.");
    }
    if (!host || typeof host !== "object" || Array.isArray(host)) {
      throw new TypeError("Threadline filter host configuration is required.");
    }
    if (host.schemaVersion !== 1) {
      throw new RangeError("schemaVersion 1 is required.");
    }
    if (host.adapters !== undefined && (!host.adapters || typeof host.adapters !== "object" || Array.isArray(host.adapters))) {
      throw new TypeError("adapters must be an object keyed by capability name.");
    }

    const enabled = readCapabilities(host);
    const geometry = modules.geometry.createCanvasGeometry({ seededNoise });
    const capabilityStatus = { pixel: true };
    for (const name of capabilityNames) {
      capabilityStatus[name] = enabled.includes(name);
    }
    const result = {
      filters: modules.filters,
      capabilities: Object.freeze(capabilityStatus),
      geometry,
    };
    let runtime = null;
    let sampling = null;
    if (host.canvas !== undefined) {
      if (!host.canvas || typeof host.canvas !== "object" || typeof host.canvas.createCanvas !== "function") {
        throw new TypeError("canvas.createCanvas must be a function.");
      }
      runtime = modules.canvasRuntime.createCanvasRuntime({
        createCanvas: host.canvas.createCanvas,
        random: createRandomProvider(host),
      });
      sampling = modules.sampling.createCanvasSampling({
        getScratchCanvas: runtime.getScratchCanvas,
        clamp,
      });
      result.runtime = runtime;
      result.sampling = sampling;
    }
    const canvasCapabilities = ["canvas", "atmosphere", "materials", "graphics", "composition", "morphs", "text", "artists", "art"];
    for (const name of canvasCapabilities) {
      if (enabled.includes(name) && !runtime) {
        throw new TypeError("capabilities." + name + " requires canvas.createCanvas.");
      }
    }
    let random = createRandomProvider(host);
    if (runtime) {
      random = runtime.random;
    }
    const shared = {
      clamp,
      mix,
      smoothstep,
      seededNoise,
      curveThousand,
      parseHexColor,
      rgbaString,
      rgbaFromHex,
      getPixelIndex,
      getRgbSaturation,
      random,
      rgbToHsl,
      hslToRgb,
      filters: modules.filters,
      applyBasicAdjustments: modules.filters.applyBasicAdjustments,
      buildRoundedRectPath: geometry.buildRoundedRectPath,
      buildDieCutPath: geometry.buildDieCutPath,
      drawRoundedRectPath: geometry.drawRoundedRectPath,
      drawOrganicBlobPath: geometry.drawOrganicBlobPath,
    };
    if (runtime && sampling) {
      shared.cloneCanvas = runtime.cloneCanvas;
      shared.getScratchCanvas = runtime.getScratchCanvas;
      shared.createSampleSource = sampling.createSampleSource;
      shared.getSampleSourceIndex = sampling.getSampleSourceIndex;
      shared.getSampleSourceChannel = sampling.getSampleSourceChannel;
      shared.getPixelChannel = sampling.getPixelChannel;
    }

    let canvasEffectsInstance = null;
    let morphologyInstance = null;
    let patternEffectsInstance = null;

    /** Creates the shared pattern renderer used by pattern and material families.
     * @returns {object} Frozen pattern renderer API.
     */
    function createPatternEffectsInstance() {
      if (!patternEffectsInstance) {
        patternEffectsInstance = modules.patterns.createPatternEffects(Object.assign({}, shared, {
          primitives: modules.primitives,
        }));
      }
      return patternEffectsInstance;
    }

    /** Creates the shared Canvas and morphology APIs for enabled Canvas families.
     * @returns {object} Canvas effects API with the morphology API stored for exposure.
     */
    function createCanvasEffectsInstance() {
      if (canvasEffectsInstance) {
        return canvasEffectsInstance;
      }
      if (!runtime) {
        throw new TypeError("Canvas effect families require canvas.createCanvas.");
      }
      let createImageData = null;
      if (host.adapters && host.adapters.imageData && typeof host.adapters.imageData.createImageData === "function") {
        createImageData = host.adapters.imageData.createImageData;
      } else {
        createImageData = function createImageData(width, height) {
          const scratch = runtime.getScratchCanvas(width, height);
          const context = scratch.getContext("2d", { willReadFrequently: true });
          if (!context || typeof context.createImageData !== "function") {
            throw new TypeError("canvas.createCanvas must provide a 2D context with createImageData.");
          }
          return context.createImageData(width, height);
        };
      }
      morphologyInstance = modules.morphology.createMorphologyEffects({ createImageData, clamp, mix });
      canvasEffectsInstance = modules.canvas.createCanvasEffects(Object.assign({}, shared, {
        runtime,
        morphology: morphologyInstance,
      }));
      return canvasEffectsInstance;
    }

    for (const name of enabled) {
      let module;
      let createName;
      if (name === "campaigns") {
        module = modules.campaigns;
        createName = "createCampaignEffects";
      } else if (name === "canvas") {
        module = modules.canvas;
        createName = "createCanvasEffects";
      } else if (name === "atmosphere") {
        module = modules.atmosphere;
        createName = "createAtmosphereEffects";
      } else if (name === "patterns") {
        module = modules.patterns;
        createName = "createPatternEffects";
      } else if (name === "materials") {
        module = modules.materials;
        createName = "createMaterialEffects";
      } else if (name === "graphics") {
        module = modules.graphics;
        createName = "createGraphicEffects";
      } else if (name === "composition") {
        module = modules.composition;
        createName = "createCompositionEffects";
      } else if (name === "morphs") {
        module = modules.morphs;
        createName = "createMorphEffects";
      } else if (name === "text") {
        module = modules.text;
        createName = "createTextEffects";
      } else if (name === "artists") {
        module = modules.artists;
        createName = "createArtistEffects";
      } else if (name === "art") {
        module = modules.art;
        createName = "createArtEffects";
      }

      if (!module || typeof module[createName] !== "function") {
        throw new Error("Filter capability '" + name + "' is unavailable in the loaded library.");
      }
      let adapters = {};
      if (host.adapters && host.adapters[name]) {
        adapters = host.adapters[name];
      }
      if (!adapters || typeof adapters !== "object" || Array.isArray(adapters)) {
        throw new TypeError("adapters." + name + " must be an object.");
      }
      let dependencies = Object.assign({}, shared, adapters);
      if (name === "campaigns") {
        dependencies = Object.assign(dependencies, { clamp, mix });
      } else if (name === "patterns") {
        result.patterns = createPatternEffectsInstance();
        continue;
      } else if (name === "canvas") {
        result.canvas = createCanvasEffectsInstance();
        result.morphology = morphologyInstance;
        continue;
      } else if (name === "atmosphere") {
        const canvasEffects = createCanvasEffectsInstance();
        dependencies = Object.assign(dependencies, {
          getScratchCanvas: runtime.getScratchCanvas,
          applyPixelate: canvasEffects.applyPixelate,
          drawLinePattern: modules.primitives.drawLinePattern,
          drawScratches: modules.primitives.drawScratches,
          getPixelChannel: sampling.getPixelChannel,
          random: runtime.random,
        });
      } else if (name === "materials") {
        const canvasEffects = createCanvasEffectsInstance();
        const patterns = createPatternEffectsInstance();
        dependencies = Object.assign(dependencies, {
          random: runtime.random,
          getScratchCanvas: runtime.getScratchCanvas,
          cloneCanvas: runtime.cloneCanvas,
          drawLinePattern: modules.primitives.drawLinePattern,
          drawScratches: modules.primitives.drawScratches,
          drawPerforatedPattern: patterns.drawPerforatedPattern,
          applyGrayscale: modules.filters.applyGrayscale,
          applyScanlines: modules.filters.applyScanlines,
          applyPixelate: canvasEffects.applyPixelate,
        });
      } else if (name === "graphics") {
        const canvasEffects = createCanvasEffectsInstance();
        dependencies = Object.assign(dependencies, {
          cloneCanvas: runtime.cloneCanvas,
          createSampleSource: sampling.createSampleSource,
          getSampleSourceIndex: sampling.getSampleSourceIndex,
          applyCannyLikeEdges: canvasEffects.applyCannyLikeEdges,
          random: runtime.random,
          rgbToHsl,
          hslToRgb,
        });
      } else if (name === "composition") {
        dependencies = Object.assign(dependencies, {
          cloneCanvas: runtime.cloneCanvas,
          createSampleSource: sampling.createSampleSource,
          getSampleSourceIndex: sampling.getSampleSourceIndex,
          buildRoundedRectPath: geometry.buildRoundedRectPath,
          buildDieCutPath: geometry.buildDieCutPath,
        });
      } else if (name === "morphs") {
        dependencies = Object.assign(dependencies, {
          cloneCanvas: runtime.cloneCanvas,
          createSampleSource: sampling.createSampleSource,
          getSampleSourceIndex: sampling.getSampleSourceIndex,
        });
      } else if (name === "text") {
        const canvasEffects = createCanvasEffectsInstance();
        dependencies = Object.assign(dependencies, {
          cloneCanvas: runtime.cloneCanvas,
          createSampleSource: sampling.createSampleSource,
          getSampleSourceIndex: sampling.getSampleSourceIndex,
          getSampleSourceChannel: sampling.getSampleSourceChannel,
          getScratchCanvas: runtime.getScratchCanvas,
          applyCannyLikeEdges: canvasEffects.applyCannyLikeEdges,
          buildRoundedRectPath: geometry.buildRoundedRectPath,
          buildDieCutPath: geometry.buildDieCutPath,
        });
      } else if (name === "artists") {
        dependencies = Object.assign(dependencies, {
          cloneCanvas: runtime.cloneCanvas,
          createSampleSource: sampling.createSampleSource,
          getSampleSourceIndex: sampling.getSampleSourceIndex,
          getSampleSourceChannel: sampling.getSampleSourceChannel,
          getPixelChannel: sampling.getPixelChannel,
          getScratchCanvas: runtime.getScratchCanvas,
          drawOrganicBlobPath: geometry.drawOrganicBlobPath,
        });
      } else if (name === "art") {
        const canvasEffects = createCanvasEffectsInstance();
        dependencies = Object.assign(dependencies, {
          cloneCanvas: runtime.cloneCanvas,
          createSampleSource: sampling.createSampleSource,
          getSampleSourceIndex: sampling.getSampleSourceIndex,
          getScratchCanvas: runtime.getScratchCanvas,
          buildRoundedRectPath: geometry.buildRoundedRectPath,
          buildDieCutPath: geometry.buildDieCutPath,
          drawRoundedRectPath: geometry.drawRoundedRectPath,
          applyCannyLikeEdges: canvasEffects.applyCannyLikeEdges,
          convolveCanvas: canvasEffects.convolveCanvas,
          applyGrayscale: modules.filters.applyGrayscale,
          applyPosterize: modules.filters.applyPosterize,
        });
      }
      result[name] = module[createName](dependencies);
    }

    return Object.freeze(result);
  }

  /** Creates a checked random-number provider from host configuration.
   * @param {object} host - Factory host configuration.
   * @returns {function():number} Random provider returning values in [0, 1).
   */
  function createRandomProvider(host) {
    let randomProvider = Math.random;
    if (host.random !== undefined) {
      if (typeof host.random !== "function") {
        throw new TypeError("random must be a function when provided.");
      }
      randomProvider = host.random;
    }
    return function random() {
      const value = randomProvider();
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value >= 1) {
        throw new RangeError("random provider must return a finite number in [0, 1).");
      }
      return value;
    };
  }

  return Object.freeze({ createThreadlineFilters });
});
