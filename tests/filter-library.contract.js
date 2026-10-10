const assert = require("node:assert/strict");
const test = require("node:test");
const filters = require("../packages/threadline-filters");

/** Creates a fresh one-pixel RGBA buffer for isolated filter assertions.
 * @param {number} r - Red channel from 0 to 255.
 * @param {number} g - Green channel from 0 to 255.
 * @param {number} b - Blue channel from 0 to 255.
 * @param {number} a - Alpha channel from 0 to 255.
 * @returns {Uint8ClampedArray} A new one-pixel RGBA buffer.
 */
function pixel(r, g, b, a) {
  return new Uint8ClampedArray([r, g, b, a]);
}

/** Verifies the package's public API remains frozen and exposes all operations. */
test("exports documented pixel operations", () => {
  assert.deepEqual(Object.keys(filters).sort(), [
    "applyBasicAdjustments",
    "applyBlackWhite",
    "applyColorFocus",
    "applyColorSeparation",
    "applyColorSwap",
    "applyCrossProcess",
    "applyDuotone",
    "applyFalseColor",
    "applyFrame",
    "applyGradientMap",
    "applyGrain",
    "applyGrayscale",
    "applyHeatmap",
    "applyInvert",
    "applyLuminanceColor",
    "applyOverlay",
    "applyPosterBlocks",
    "applyPosterize",
    "applySaturationMask",
    "applyScanlines",
    "applySepia",
    "applySilhouette",
    "applySplitTone",
    "applyVignette",
    "applyVintage",
    "applyWarmCoolFocus",
  ]);
  assert.equal(Object.isFrozen(filters), true);
});

test("grain uses injected deterministic values and preserves alpha", () => {
  const data = new Uint8ClampedArray([100, 150, 200, 73, 40, 80, 120, 91]);
  const values = [0, 0.75];
  let index = 0;
  const random = function random() {
    const value = values[index];
    index += 1;
    return value;
  };
  assert.equal(filters.applyGrain(data, 1, random), data);
  assert.deepEqual([...data], [55, 105, 155, 73, 62, 102, 142, 91]);
});

test("grain validates pixel input, amount, and random provider", () => {
  assert.throws(() => filters.applyGrain([1, 2, 3, 4], 1, Math.random), TypeError);
  assert.throws(() => filters.applyGrain(pixel(1, 2, 3, 4), 1.1, Math.random), RangeError);
  assert.throws(() => filters.applyGrain(pixel(1, 2, 3, 4), 1, null), TypeError);
  assert.throws(() => filters.applyGrain(pixel(1, 2, 3, 4), 1, () => 1), RangeError);
});

test("basic adjustments preserve zero boundaries and alpha while changing RGB", () => {
  const original = pixel(100, 150, 200, 73);
  const unchanged = new Uint8ClampedArray(original);
  filters.applyBasicAdjustments(unchanged, { brightness: 0, contrast: 0, saturation: 0 }, 0);
  assert.deepEqual(unchanged, original);

  const adjusted = new Uint8ClampedArray(original);
  assert.equal(filters.applyBasicAdjustments(adjusted, { brightness: 10, contrast: 5, saturation: 20 }, 30), adjusted);
  assert.notDeepEqual(adjusted.slice(0, 3), original.slice(0, 3));
  assert.equal(adjusted[3], original[3]);
});

test("basic adjustments reject malformed buffers and correction values", () => {
  const corrections = { brightness: 0, contrast: 0, saturation: 0 };
  assert.throws(() => filters.applyBasicAdjustments([1, 2, 3, 4], corrections, 0), TypeError);
  assert.throws(() => filters.applyBasicAdjustments(pixel(1, 2, 3, 4), null, 0), TypeError);
  assert.throws(() => filters.applyBasicAdjustments(pixel(1, 2, 3, 4), { ...corrections, contrast: NaN }, 0), TypeError);
  assert.throws(() => filters.applyBasicAdjustments(pixel(1, 2, 3, 4), corrections, Infinity), TypeError);
});

test("grayscale blends luminance and preserves alpha", () => {
  const data = pixel(100, 150, 200, 73);
  assert.equal(filters.applyGrayscale(data, 1), data);
  assert.deepEqual([...data], [141, 141, 141, 73]);
});

test("black and white uses a strict luminance threshold", () => {
  const data = pixel(255, 255, 255, 91);
  filters.applyBlackWhite(data, 254);
  assert.deepEqual([...data], [255, 255, 255, 91]);
  filters.applyBlackWhite(data, 255);
  assert.deepEqual([...data], [0, 0, 0, 91]);
});

test("sepia amount zero is unchanged and full amount applies classic transform", () => {
  const unchanged = pixel(100, 150, 200, 42);
  filters.applySepia(unchanged, 0);
  assert.deepEqual([...unchanged], [100, 150, 200, 42]);
  const transformed = pixel(100, 150, 200, 42);
  filters.applySepia(transformed, 1);
  assert.deepEqual([...transformed], [192, 171, 134, 42]);
});

test("posterize covers minimum and maximum reduction levels", () => {
  const data = pixel(128, 80, 240, 33);
  filters.applyPosterize(data, 14);
  assert.deepEqual([...data], [128, 128, 255, 33]);
});

test("vintage preserves original channels at zero intensity", () => {
  const data = pixel(100, 150, 200, 12);
  filters.applyVintage(data, 0);
  assert.deepEqual([...data], [100, 150, 200, 12]);
  filters.applyVintage(data, 1);
  assert.deepEqual([...data], [118, 158, 180, 12]);
});

test("duotone maps black and white to endpoints and accepts shorthand colors", () => {
  const data = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 128]);
  filters.applyDuotone(data, 1, "#123", "#abcdef");
  assert.deepEqual([...data], [17, 34, 51, 255, 171, 205, 239, 128]);
});

/** Checks that hue and luminance filters mutate valid RGBA buffers without affecting alpha. */
test("color-selection and tone filters preserve alpha and support no-op boundaries", () => {
  const original = pixel(220, 40, 30, 117);
  const unchanged = new Uint8ClampedArray(original);
  filters.applyColorFocus(unchanged, 0, "#dc281e", 0.4);
  filters.applyColorSwap(unchanged, 0, "#dc281e", "#1428dc", 0.4);
  filters.applyWarmCoolFocus(unchanged, 0);
  filters.applySplitTone(unchanged, 0, "#123456", "#abcdef");
  filters.applyLuminanceColor(unchanged, 0);
  assert.deepEqual(unchanged, original);

  const saturationMask = new Uint8ClampedArray(original);
  filters.applySaturationMask(saturationMask, 0);
  assert.equal(saturationMask[3], 117);

  const selected = new Uint8ClampedArray(original);
  filters.applyColorFocus(selected, 1, "#dc281e", 1);
  assert.equal(selected[3], 117);
  const swapped = new Uint8ClampedArray(original);
  filters.applyColorSwap(swapped, 1, "#dc281e", "#1428dc", 1);
  assert.equal(swapped[3], 117);
  const warmCool = new Uint8ClampedArray(original);
  filters.applyWarmCoolFocus(warmCool, -1);
  assert.equal(warmCool[3], 117);
});

/** Checks color palette operations at zero and full application strengths. */
test("palette and channel-map filters honor endpoints and preserve alpha", () => {
  const palette = ["#000000", "#808080", "#ffffff"];
  const original = pixel(128, 128, 128, 83);
  const unchanged = new Uint8ClampedArray(original);
  filters.applyGradientMap(unchanged, 0, palette);
  filters.applyFalseColor(unchanged, 0, palette);
  filters.applyCrossProcess(unchanged, 0);
  filters.applyHeatmap(unchanged, 0);
  filters.applyPosterBlocks(unchanged, 0);
  assert.deepEqual(unchanged, original);

  const mapped = new Uint8ClampedArray(original);
  filters.applyGradientMap(mapped, 1, palette);
  assert.deepEqual([...mapped], [128, 128, 128, 83]);
  const falseColor = new Uint8ClampedArray(original);
  filters.applyFalseColor(falseColor, 1, palette);
  assert.equal(falseColor[3], 83);
  const heatmap = new Uint8ClampedArray(original);
  filters.applyHeatmap(heatmap, 1);
  assert.equal(heatmap[3], 83);
  const poster = new Uint8ClampedArray(original);
  filters.applyPosterBlocks(poster, 1);
  assert.equal(poster[3], 83);
  const crossProcessed = new Uint8ClampedArray(original);
  filters.applyCrossProcess(crossProcessed, 1);
  assert.equal(crossProcessed[3], 83);
});

/** Ensures the extracted color operations reject invalid ranges and palettes. */
test("color-effects API rejects malformed colors and options", () => {
  assert.throws(() => filters.applyColorFocus(pixel(1, 2, 3, 4), 1, "red", 0.5), RangeError);
  assert.throws(() => filters.applyColorSwap(pixel(1, 2, 3, 4), 1, "#fff", "bad", 0.5), RangeError);
  assert.throws(() => filters.applyWarmCoolFocus(pixel(1, 2, 3, 4), 2), RangeError);
  assert.throws(() => filters.applyGradientMap(pixel(1, 2, 3, 4), 0.5, ["#000", "#fff"]), RangeError);
  assert.throws(() => filters.applyFalseColor(pixel(1, 2, 3, 4), -0.1, ["#000", "#888", "#fff"]), RangeError);
});

/** Exercises the extracted geometric pixel filters at full and zero strength. */
test("geometric pixel filters preserve RGBA shape and honor boundaries", () => {
  const twoPixels = new Uint8ClampedArray([255, 0, 0, 31, 0, 0, 255, 63]);
  const separated = new Uint8ClampedArray(twoPixels);
  filters.applyColorSeparation(separated, 2, 1, 0);
  assert.deepEqual(separated, twoPixels);
  filters.applyColorSeparation(separated, 2, 1, 1);
  assert.equal(separated[3], 31);
  assert.equal(separated[7], 63);

  const inverted = pixel(10, 100, 240, 45);
  filters.applyInvert(inverted, 1);
  assert.deepEqual([...inverted], [245, 155, 15, 45]);
  const silhouette = pixel(255, 0, 0, 52);
  filters.applySilhouette(silhouette, 1);
  assert.deepEqual([...silhouette], [20, 20, 20, 52]);

  const base = new Uint8ClampedArray(16).fill(100);
  for (let i = 3; i < base.length; i += 4) base[i] = 255;
  const scanlines = new Uint8ClampedArray(base);
  filters.applyScanlines(scanlines, 2, 2, 1);
  assert.equal(scanlines[0], Math.round(100 * 0.78));
  assert.equal(scanlines[8], 100);
  assert.equal(scanlines[3], 255);

  const overlaid = pixel(0, 0, 0, 81);
  filters.applyOverlay(overlaid, "#ffffff", 1);
  assert.deepEqual([...overlaid], [115, 115, 115, 81]);
  const framed = new Uint8ClampedArray(4 * 4 * 4).fill(0);
  for (let i = 3; i < framed.length; i += 4) framed[i] = 255;
  filters.applyFrame(framed, 4, 4, 1);
  assert.deepEqual([...framed.slice(0, 4)], [220, 216, 209, 255]);
  assert.throws(() => filters.applyVignette(new Uint8ClampedArray(4), 2, 2, 1), RangeError);
});

/** Verifies package operations reject non-RGBA buffers and invalid settings. */
test("rejects malformed pixel data and out-of-range options", () => {
  assert.throws(() => filters.applyGrayscale([1, 2, 3, 4], 1), TypeError);
  assert.throws(() => filters.applyGrayscale(new Uint8ClampedArray(3), 1), RangeError);
  assert.throws(() => filters.applyGrayscale(pixel(1, 2, 3, 4), 1.1), RangeError);
  assert.throws(() => filters.applyBlackWhite(pixel(1, 2, 3, 4), -1), RangeError);
  assert.throws(() => filters.applyPosterize(pixel(1, 2, 3, 4), 1.5), RangeError);
  assert.throws(() => filters.applyDuotone(pixel(1, 2, 3, 4), 1, "pink", "#ffffff"), RangeError);
});
