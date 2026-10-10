(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();

  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }

  if (root) {
    root.ThreadlineFilters = library;
  }
})(globalThis, function () {
  "use strict";

  /** Validates an RGBA pixel buffer and returns the same buffer for chaining. */
  function validatePixelData(data) {
    if (!(data instanceof Uint8ClampedArray)) {
      throw new TypeError("Pixel data must be a Uint8ClampedArray.");
    }
    if (data.length % 4 !== 0) {
      throw new RangeError("Pixel data length must be divisible by four.");
    }
    return data;
  }

  /** Validates a finite numeric option within the supplied inclusive range. */
  function validateRange(value, name, minimum, maximum) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`${name} must be a finite number.`);
    }
    if (value < minimum || value > maximum) {
      throw new RangeError(`${name} must be between ${minimum} and ${maximum}.`);
    }
  }

  /** Requires integer options where fractional settings have no defined meaning. */
  function validateInteger(value, name) {
    if (!Number.isInteger(value)) {
      throw new RangeError(`${name} must be an integer.`);
    }
  }

  /** Validates positive integer image dimensions and matching RGBA buffer size. */
  function validateDimensions(data, width, height) {
    validatePixelData(data);
    if (!Number.isInteger(width) || width <= 0) {
      throw new RangeError("width must be a positive integer.");
    }
    if (!Number.isInteger(height) || height <= 0) {
      throw new RangeError("height must be a positive integer.");
    }
    if (data.length !== width * height * 4) {
      throw new RangeError("Pixel data length must match the image dimensions.");
    }
  }

  /** Clamps a channel value to the byte range using the app's prior semantics. */
  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  /** Blends two channel values by a normalized amount. */
  function mix(original, target, amount) {
    return original + (target - original) * amount;
  }

  /** Parses a #RGB or #RRGGBB color string into RGB channels. */
  function parseHexColor(hex, name) {
    if (typeof hex !== "string") {
      throw new TypeError(`${name} must be a hex color string.`);
    }

    let value = hex.trim();
    if (/^#[0-9a-f]{3}$/i.test(value)) {
      value = `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }
    if (!/^#[0-9a-f]{6}$/i.test(value)) {
      throw new RangeError(`${name} must use #RGB or #RRGGBB format.`);
    }

    return {
      r: parseInt(value.slice(1, 3), 16),
      g: parseInt(value.slice(3, 5), 16),
      b: parseInt(value.slice(5, 7), 16),
    };
  }

  /** Converts RGB byte channels to HSL using the app's existing channel semantics. */
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;
    if (max === min) {
      h = 0;
      s = 0;
    } else {
      const d = max - min;
      if (l > 0.5) {
        s = d / (2 - max - min);
      } else {
        s = d / (max + min);
      }
      switch (max) {
        case r:
          h = (g - b) / d;
          if (g < b) {
            h += 6;
          }
          break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    return [h, s, l];
  }

  /** Shifts RGB hue by degrees and returns rounded RGB byte channels. */
  function shiftHue(r, g, b, degrees) {
    const [h, s, l] = rgbToHsl(r, g, b);
    const shiftedHue = (h + degrees + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((shiftedHue / 60) % 2) - 1));
    const m = l - c / 2;
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;
    if (shiftedHue < 60) {
      r1 = c;
      g1 = x;
    } else if (shiftedHue < 120) {
      r1 = x;
      g1 = c;
    } else if (shiftedHue < 180) {
      g1 = c;
      b1 = x;
    } else if (shiftedHue < 240) {
      g1 = x;
      b1 = c;
    } else if (shiftedHue < 300) {
      r1 = x;
      b1 = c;
    } else {
      r1 = c;
      b1 = x;
    }
    return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
  }

  /** Returns the shortest angular distance between two hue angles in degrees. */
  function getHueDistance(first, second) {
    const delta = Math.abs(first - second) % 360;
    if (delta > 180) {
      return 360 - delta;
    }
    return delta;
  }

  /** Smoothly interpolates between two edges and returns a value from zero to one. */
  function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /** Parses a palette and interpolates between its three colors at normalized position. */
  function sampleThreeColorGradient(colors, value) {
    const amount = clamp(value, 0, 1);
    if (amount <= 0.5) {
      return {
        r: mix(colors[0].r, colors[1].r, amount * 2),
        g: mix(colors[0].g, colors[1].g, amount * 2),
        b: mix(colors[0].b, colors[1].b, amount * 2),
      };
    }
    return {
      r: mix(colors[1].r, colors[2].r, (amount - 0.5) * 2),
      g: mix(colors[1].g, colors[2].g, (amount - 0.5) * 2),
      b: mix(colors[1].b, colors[2].b, (amount - 0.5) * 2),
    };
  }

  /** Validates palette colors and amount before running a supplied pixel operation. */
  function preparePaletteFilter(data, amount, paletteHexes, operationName) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    if (!Array.isArray(paletteHexes) || paletteHexes.length !== 3) {
      throw new RangeError(`${operationName} requires exactly three palette colors.`);
    }
    return paletteHexes.map(function parsePaletteColor(hex, index) {
      return parseHexColor(hex, `paletteHexes[${index}]`);
    });
  }

  /** Converts pixels toward luminance; amount is normalized from 0 to 1. */
  function applyGrayscale(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = mix(data[i], gray, amount);
      data[i + 1] = mix(data[i + 1], gray, amount);
      data[i + 2] = mix(data[i + 2], gray, amount);
    }
    return data;
  }

  /** Applies brightness, contrast, saturation, and hue shift to an RGBA buffer.
   * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
   * @param {{brightness: number, contrast: number, saturation: number}} corrections - Correction values in app slider units.
   * @param {number} hueShift - Hue rotation in degrees.
   * @returns {Uint8ClampedArray} The mutated pixel buffer.
   */
  function applyBasicAdjustments(data, corrections, hueShift) {
    validatePixelData(data);
    if (!corrections || typeof corrections !== "object" || Array.isArray(corrections)) {
      throw new TypeError("corrections must be an object.");
    }
    const correctionNames = ["brightness", "contrast", "saturation"];
    for (const name of correctionNames) {
      if (typeof corrections[name] !== "number" || !Number.isFinite(corrections[name])) {
        throw new TypeError("corrections." + name + " must be a finite number.");
      }
    }
    if (typeof hueShift !== "number" || !Number.isFinite(hueShift)) {
      throw new TypeError("hueShift must be a finite number.");
    }

    const brightness = corrections.brightness * 2.55;
    const contrastFactor = (259 * (corrections.contrast + 255)) / (255 * (259 - corrections.contrast));
    const saturation = 1 + corrections.saturation / 100;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] + brightness;
      let g = data[i + 1] + brightness;
      let b = data[i + 2] + brightness;

      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * saturation;
      g = gray + (g - gray) * saturation;
      b = gray + (b - gray) * saturation;

      if (hueShift !== 0) {
        [r, g, b] = shiftHue(r, g, b, hueShift);
      }

      data[i] = clamp(r, 0, 255);
      data[i + 1] = clamp(g, 0, 255);
      data[i + 2] = clamp(b, 0, 255);
    }
    return data;
  }

  /** Adds shared per-pixel monochrome grain using an injected random provider.
   * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
   * @param {number} amount - Grain strength from zero to one.
   * @param {Function} random - Provider returning values in the half-open range [0, 1).
   * @returns {Uint8ClampedArray} The mutated pixel buffer.
   */
  function applyGrain(data, amount, random) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    if (typeof random !== "function") {
      throw new TypeError("random must be a function.");
    }
    for (let i = 0; i < data.length; i += 4) {
      const randomValue = random();
      if (typeof randomValue !== "number" || !Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
        throw new RangeError("random must return a number in the range [0, 1).");
      }
      const noise = (randomValue - 0.5) * 90 * amount;
      data[i] = clamp(data[i] + noise, 0, 255);
      data[i + 1] = clamp(data[i + 1] + noise, 0, 255);
      data[i + 2] = clamp(data[i + 2] + noise, 0, 255);
    }
    return data;
  }

  /** Thresholds pixels to black or white; threshold is from 0 to 255. */
  function applyBlackWhite(data, threshold) {
    validatePixelData(data);
    validateRange(threshold, "threshold", 0, 255);
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      let value = 0;
      if (gray > threshold) {
        value = 255;
      }
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
    return data;
  }

  /** Blends the classic sepia transform; amount is normalized from 0 to 1. */
  function applySepia(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const nr = clamp(r * 0.393 + g * 0.769 + b * 0.189, 0, 255);
      const ng = clamp(r * 0.349 + g * 0.686 + b * 0.168, 0, 255);
      const nb = clamp(r * 0.272 + g * 0.534 + b * 0.131, 0, 255);
      data[i] = mix(r, nr, amount);
      data[i + 1] = mix(g, ng, amount);
      data[i + 2] = mix(b, nb, amount);
    }
    return data;
  }

  /** Reduces channel levels; amount is an integer from 0 to 14. */
  function applyPosterize(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 14);
    validateInteger(amount, "amount");
    const levels = Math.max(2, 16 - amount);
    const step = 255 / levels;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / step) * step;
      data[i + 1] = Math.round(data[i + 1] / step) * step;
      data[i + 2] = Math.round(data[i + 2] / step) * step;
    }
    return data;
  }

  /** Applies the warm/cool vintage channel shift; amount is normalized 0 to 1. */
  function applyVintage(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] + 18 * amount, 0, 255);
      data[i + 1] = clamp(data[i + 1] + 8 * amount, 0, 255);
      data[i + 2] = clamp(data[i + 2] - 20 * amount, 0, 255);
    }
    return data;
  }

  /** Maps luminance between dark and light colors and blends by normalized amount. */
  function applyDuotone(data, amount, darkColor, lightColor) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    const dark = parseHexColor(darkColor, "darkColor");
    const light = parseHexColor(lightColor, "lightColor");
    for (let i = 0; i < data.length; i += 4) {
      const gray = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      const nr = dark.r + (light.r - dark.r) * gray;
      const ng = dark.g + (light.g - dark.g) * gray;
      const nb = dark.b + (light.b - dark.b) * gray;
      data[i] = mix(data[i], nr, amount);
      data[i + 1] = mix(data[i + 1], ng, amount);
      data[i + 2] = mix(data[i + 2], nb, amount);
    }
    return data;
  }

  /** Preserves pixels near a target hue while desaturating the rest; mutates and returns RGBA data. */
  function applyColorFocus(data, amount, targetHex, tolerance) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    validateRange(tolerance, "tolerance", 0, 1);
    const rgb = parseHexColor(targetHex, "targetHex");
    const [targetHue, targetSat, targetLight] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hueTolerance = 4 + tolerance * 58;
    const satThreshold = 0.05 + tolerance * 0.14;
    const softRange = 6 + tolerance * 24;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const [h, s, l] = rgbToHsl(r, g, b);
      const hueDistance = getHueDistance(h, targetHue);
      let satFactor = 1;
      if (s > satThreshold) {
        satFactor = 1 - s * 0.55;
      }
      const focusDistance = hueDistance + satFactor * 44 + Math.abs(l - targetLight) * 18 + Math.abs(s - targetSat) * 12;
      const preserve = 1 - smoothstep(hueTolerance, hueTolerance + softRange, focusDistance);
      const targetR = mix(gray, r, preserve);
      const targetG = mix(gray, g, preserve);
      const targetB = mix(gray, b, preserve);
      data[i] = mix(r, targetR, amount);
      data[i + 1] = mix(g, targetG, amount);
      data[i + 2] = mix(b, targetB, amount);
    }
    return data;
  }

  /** Recolors source- or target-hue pixels toward the opposite palette color; returns mutated RGBA data. */
  function applyColorSwap(data, amount, sourceHex, targetHex, tolerance) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    validateRange(tolerance, "tolerance", 0, 1);
    const sourceRgb = parseHexColor(sourceHex, "sourceHex");
    const targetRgb = parseHexColor(targetHex, "targetHex");
    const [sourceHue, sourceSat, sourceLight] = rgbToHsl(sourceRgb.r, sourceRgb.g, sourceRgb.b);
    const [targetHue, targetSat, targetLight] = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
    const hueTolerance = 6 + tolerance * 84;
    const softRange = 8 + tolerance * 42;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const sourceDistance = getHueDistance(h, sourceHue) + Math.abs(s - sourceSat) * 30 + Math.abs(l - sourceLight) * 18;
      const targetDistance = getHueDistance(h, targetHue) + Math.abs(s - targetSat) * 30 + Math.abs(l - targetLight) * 18;
      const sourceMask = 1 - smoothstep(hueTolerance, hueTolerance + softRange, sourceDistance);
      const targetMask = 1 - smoothstep(hueTolerance, hueTolerance + softRange, targetDistance);
      const sourceBlend = clamp(sourceMask * amount, 0, 1);
      const targetBlend = clamp(targetMask * amount, 0, 1);
      const keepLum = 0.4 + l * 0.6;
      const swapToTarget = {
        r: clamp(targetRgb.r * keepLum, 0, 255),
        g: clamp(targetRgb.g * keepLum, 0, 255),
        b: clamp(targetRgb.b * keepLum, 0, 255),
      };
      const swapToSource = {
        r: clamp(sourceRgb.r * keepLum, 0, 255),
        g: clamp(sourceRgb.g * keepLum, 0, 255),
        b: clamp(sourceRgb.b * keepLum, 0, 255),
      };
      let nr;
      let ng;
      let nb;
      if (sourceBlend >= targetBlend) {
        nr = mix(r, swapToTarget.r, sourceBlend);
        ng = mix(g, swapToTarget.g, sourceBlend);
        nb = mix(b, swapToTarget.b, sourceBlend);
      } else {
        nr = mix(r, swapToSource.r, targetBlend);
        ng = mix(g, swapToSource.g, targetBlend);
        nb = mix(b, swapToSource.b, targetBlend);
      }
      data[i] = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
    }
    return data;
  }

  /** Mutes hues outside a warm or cool target range; signed amount is from -1 to 1. */
  function applyWarmCoolFocus(data, signedAmount) {
    validatePixelData(data);
    validateRange(signedAmount, "signedAmount", -1, 1);
    const amount = Math.abs(signedAmount);
    if (amount < 0.001) {
      return data;
    }
    let targetHue = 214;
    if (signedAmount >= 0) {
      targetHue = 28;
    }
    const hueTolerance = mix(48, 20, amount);
    const softRange = mix(52, 26, amount);
    const muteStrength = mix(0.18, 0.78, amount);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const [h, s] = rgbToHsl(r, g, b);
      const hueDistance = getHueDistance(h, targetHue);
      const preserve = 1 - smoothstep(hueTolerance, hueTolerance + softRange, hueDistance + (1 - s) * 24);
      const muteAmount = clamp((1 - preserve) * muteStrength, 0, 1);
      data[i] = mix(r, gray, muteAmount);
      data[i + 1] = mix(g, gray, muteAmount);
      data[i + 2] = mix(b, gray, muteAmount);
    }
    return data;
  }

  /** Applies shadow/highlight colors according to luminance; mutates and returns RGBA data. */
  function applySplitTone(data, amount, shadowHex, highlightHex) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    const shadow = parseHexColor(shadowHex, "shadowHex");
    const highlight = parseHexColor(highlightHex, "highlightHex");
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const shadowWeight = clamp((0.58 - luma) / 0.5, 0, 1) * amount;
      const highlightWeight = clamp((luma - 0.42) / 0.5, 0, 1) * amount;
      data[i] = mix(mix(r, shadow.r, shadowWeight), highlight.r, highlightWeight);
      data[i + 1] = mix(mix(g, shadow.g, shadowWeight), highlight.g, highlightWeight);
      data[i + 2] = mix(mix(b, shadow.b, shadowWeight), highlight.b, highlightWeight);
    }
    return data;
  }

  /** Retains chroma above an adjustable threshold while desaturating weaker colors. */
  function applySaturationMask(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    const threshold = mix(0.18, 0.62, amount);
    const softRange = mix(0.28, 0.12, amount);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const [, s] = rgbToHsl(r, g, b);
      const preserve = smoothstep(threshold - softRange, threshold + softRange, s);
      const keepAmount = clamp(preserve * amount, 0, 1);
      data[i] = mix(gray, r, keepAmount);
      data[i + 1] = mix(gray, g, keepAmount);
      data[i + 2] = mix(gray, b, keepAmount);
    }
    return data;
  }

  /** Maps luminance through a three-color palette and blends by normalized amount. */
  function applyGradientMap(data, amount, paletteHexes) {
    const palette = preparePaletteFilter(data, amount, paletteHexes, "Gradient map");
    for (let i = 0; i < data.length; i += 4) {
      const luma = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      const mapped = sampleThreeColorGradient(palette, luma);
      data[i] = mix(data[i], mapped.r, amount);
      data[i + 1] = mix(data[i + 1], mapped.g, amount);
      data[i + 2] = mix(data[i + 2], mapped.b, amount);
    }
    return data;
  }

  /** Maps combined hue, saturation and lightness through a palette with a hue-shifted blend. */
  function applyFalseColor(data, amount, paletteHexes) {
    const palette = preparePaletteFilter(data, amount, paletteHexes, "False color");
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const mapped = sampleThreeColorGradient(palette, clamp((l * 0.75) + (s * 0.25), 0, 1));
      const shifted = shiftHue(mapped.r, mapped.g, mapped.b, (h - 180) * 0.18);
      data[i] = mix(r, shifted[0], amount);
      data[i + 1] = mix(g, shifted[1], amount);
      data[i + 2] = mix(b, shifted[2], amount);
    }
    return data;
  }

  /** Applies a cross-processed channel curve; amount is normalized from 0 to 1. */
  function applyCrossProcess(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = clamp(r * (1 - 0.08 * amount) + g * 0.04 * amount + 10 * amount, 0, 255);
      data[i + 1] = clamp(g * (1 - 0.04 * amount) + b * 0.08 * amount + 4 * amount, 0, 255);
      data[i + 2] = clamp(b * (1 + 0.12 * amount) - r * 0.05 * amount + 16 * amount, 0, 255);
    }
    return data;
  }

  /** Maps luminance through a fixed four-stop thermal palette and blends the result. */
  function applyHeatmap(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    const stops = [
      { r: 18, g: 22, b: 84 },
      { r: 37, g: 164, b: 196 },
      { r: 255, g: 214, b: 10 },
      { r: 221, g: 52, b: 44 },
    ];
    for (let i = 0; i < data.length; i += 4) {
      const luma = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      const segment = luma * 3;
      let index = Math.floor(segment);
      if (index > 2) {
        index = 2;
      }
      const local = segment - index;
      const mapped = {
        r: mix(stops[index].r, stops[index + 1].r, local),
        g: mix(stops[index].g, stops[index + 1].g, local),
        b: mix(stops[index].b, stops[index + 1].b, local),
      };
      data[i] = mix(data[i], mapped.r, amount);
      data[i + 1] = mix(data[i + 1], mapped.g, amount);
      data[i + 2] = mix(data[i + 2], mapped.b, amount);
    }
    return data;
  }

  /** Quantizes RGB channels and boosts the leading color for a poster-block look. */
  function applyPosterBlocks(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    const levels = Math.max(2, Math.round(mix(7, 3, amount)));
    for (let i = 0; i < data.length; i += 4) {
      const step = 255 / (levels - 1);
      const r = Math.round(data[i] / step) * step;
      const g = Math.round(data[i + 1] / step) * step;
      const b = Math.round(data[i + 2] / step) * step;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const spread = max - min;
      const push = mix(0.06, 0.2, amount) * spread;
      let redOffset = -push * 0.35;
      let greenOffset = -push * 0.35;
      let blueOffset = -push * 0.35;
      if (r === max) redOffset = push;
      if (g === max) greenOffset = push;
      if (b === max) blueOffset = push;
      const boosted = {
        r: clamp(r + redOffset, 0, 255),
        g: clamp(g + greenOffset, 0, 255),
        b: clamp(b + blueOffset, 0, 255),
      };
      data[i] = mix(data[i], boosted.r, amount);
      data[i + 1] = mix(data[i + 1], boosted.g, amount);
      data[i + 2] = mix(data[i + 2], boosted.b, amount);
    }
    return data;
  }

  /** Applies signed highlight/shadow color bias while preserving luminance detail. */
  function applyLuminanceColor(data, signedAmount) {
    validatePixelData(data);
    validateRange(signedAmount, "signedAmount", -1, 1);
    const amount = Math.abs(signedAmount);
    if (amount < 0.001) {
      return data;
    }
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const luma = gray / 255;
      const biasToHighlights = signedAmount >= 0;
      let preserve;
      if (biasToHighlights) {
        preserve = smoothstep(0.32, 0.88, luma);
      } else {
        preserve = 1 - smoothstep(0.12, 0.68, luma);
      }
      const keepAmount = clamp(preserve * amount, 0, 1);
      data[i] = mix(gray, r, keepAmount);
      data[i + 1] = mix(gray, g, keepAmount);
      data[i + 2] = mix(gray, b, keepAmount);
    }
    return data;
  }

  /** Separates red and blue channels horizontally by a strength-scaled pixel offset. */
  function applyColorSeparation(data, width, height, amount) {
    validateDimensions(data, width, height);
    validateRange(amount, "amount", 0, 1);
    if (amount < 0.001) {
      return data;
    }
    const copy = new Uint8ClampedArray(data);
    const shift = Math.max(1, Math.round(amount * 8));
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const redX = Math.max(0, Math.min(width - 1, x - shift));
        const blueX = Math.max(0, Math.min(width - 1, x + shift));
        const redIndex = (y * width + redX) * 4;
        const blueIndex = (y * width + blueX) * 4;
        data[index] = mix(copy[index], copy[redIndex], amount);
        data[index + 1] = copy[index + 1];
        data[index + 2] = mix(copy[index + 2], copy[blueIndex + 2], amount);
      }
    }
    return data;
  }

  /** Blends RGB channels toward their inverse while preserving alpha. */
  function applyInvert(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = mix(data[i], 255 - data[i], amount);
      data[i + 1] = mix(data[i + 1], 255 - data[i + 1], amount);
      data[i + 2] = mix(data[i + 2], 255 - data[i + 2], amount);
    }
    return data;
  }

  /** Blends pixels toward a black-or-white luminance silhouette. */
  function applySilhouette(data, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    for (let i = 0; i < data.length; i += 4) {
      const gray = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      let target = 20;
      if (gray > 0.55) {
        target = 255;
      }
      data[i] = mix(data[i], target, amount);
      data[i + 1] = mix(data[i + 1], target, amount);
      data[i + 2] = mix(data[i + 2], target, amount);
    }
    return data;
  }

  /** Darkens image corners based on normalized distance from the image center. */
  function applyVignette(data, width, height, amount) {
    validateDimensions(data, width, height);
    validateRange(amount, "amount", 0, 1);
    const cx = width / 2;
    const cy = height / 2;
    const maxDistance = Math.hypot(cx, cy);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const distance = Math.hypot(x - cx, y - cy) / maxDistance;
        const factor = 1 - Math.max(0, distance - 0.25) * amount * 1.2;
        data[index] *= factor;
        data[index + 1] *= factor;
        data[index + 2] *= factor;
      }
    }
    return data;
  }

  /** Darkens every other row to create horizontal scanlines. */
  function applyScanlines(data, width, height, amount) {
    validateDimensions(data, width, height);
    validateRange(amount, "amount", 0, 1);
    const factor = 1 - amount * 0.22;
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        data[index] *= factor;
        data[index + 1] *= factor;
        data[index + 2] *= factor;
      }
    }
    return data;
  }

  /** Blends every pixel toward a specified hex color at a reduced overlay strength. */
  function applyOverlay(data, colorHex, amount) {
    validatePixelData(data);
    validateRange(amount, "amount", 0, 1);
    const color = parseHexColor(colorHex, "colorHex");
    for (let i = 0; i < data.length; i += 4) {
      data[i] = mix(data[i], color.r, amount * 0.45);
      data[i + 1] = mix(data[i + 1], color.g, amount * 0.45);
      data[i + 2] = mix(data[i + 2], color.b, amount * 0.45);
    }
    return data;
  }

  /** Blends image-edge pixels toward the app's warm off-white frame color. */
  function applyFrame(data, width, height, amount) {
    validateDimensions(data, width, height);
    validateRange(amount, "amount", 0, 1);
    const frameSize = Math.round(Math.min(width, height) * 0.18 * amount);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (x < frameSize || x > width - frameSize || y < frameSize || y > height - frameSize) {
          const index = (y * width + x) * 4;
          data[index] = mix(data[index], 245, 0.9);
          data[index + 1] = mix(data[index + 1], 240, 0.9);
          data[index + 2] = mix(data[index + 2], 232, 0.9);
        }
      }
    }
    return data;
  }

  return Object.freeze({
    applyBasicAdjustments,
    applyGrain,
    applyGrayscale,
    applyBlackWhite,
    applySepia,
    applyPosterize,
    applyVintage,
    applyDuotone,
    applyColorFocus,
    applyColorSwap,
    applyWarmCoolFocus,
    applySplitTone,
    applySaturationMask,
    applyGradientMap,
    applyFalseColor,
    applyCrossProcess,
    applyHeatmap,
    applyPosterBlocks,
    applyLuminanceColor,
    applyColorSeparation,
    applyInvert,
    applySilhouette,
    applyVignette,
    applyScanlines,
    applyOverlay,
    applyFrame,
  });
});
