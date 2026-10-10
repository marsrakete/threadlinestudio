const assert = require("node:assert/strict");
const test = require("node:test");
const morphologyModule = require("../packages/threadline-filters/morphology-effects");

/** Creates a minimal ImageData-compatible object for isolated morphology tests.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @returns {{width: number, height: number, data: Uint8ClampedArray}} Image-data test object.
 */
function createImageData(width, height) {
  return { width, height, data: new Uint8ClampedArray(width * height * 4) };
}

/** Creates a morphology instance with deterministic allocation and channel helpers.
 * @returns {{applyMorphology: function(object, number, number, string, number): object}} Morphology API.
 */
function createEffects() {
  return morphologyModule.createMorphologyEffects({
    createImageData,
    clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    },
    mix(original, target, amount) {
      return original + (target - original) * amount;
    },
  });
}

/** Confirms morphology output has fresh storage and retains source alpha values. */
test("dilation returns a new image buffer and preserves alpha", () => {
  const effects = createEffects();
  const source = createImageData(3, 3);
  for (let index = 3; index < source.data.length; index += 4) source.data[index] = 77;
  const center = (1 * source.width + 1) * 4;
  source.data[center] = 255;
  source.data[center + 1] = 255;
  source.data[center + 2] = 255;

  const result = effects.applyMorphology(source, 3, 3, "dilate", 1);
  assert.notEqual(result, source);
  assert.notEqual(result.data, source.data);
  assert.equal(source.data[0], 0);
  assert.equal(result.data[0], 128);
  assert.equal(result.data[3], 77);
});

/** Exercises the operation-family boundary and a zero-strength morphology pass. */
test("supports opening, closing, top-hat and black-hat operations", () => {
  const effects = createEffects();
  const source = createImageData(2, 2);
  source.data.set([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160]);
  for (const mode of ["open", "close", "tophat", "blackhat"]) {
    const result = effects.applyMorphology(source, 2, 2, mode, 0);
    assert.equal(result.width, 2);
    assert.equal(result.height, 2);
    assert.deepEqual([...result.data.filter((value, index) => index % 4 === 3)], [40, 80, 120, 160]);
  }
});

/** Rejects mismatched dimensions, unsupported modes and out-of-range strengths. */
test("rejects invalid morphology inputs", () => {
  const effects = createEffects();
  const source = createImageData(2, 2);
  assert.throws(() => effects.applyMorphology(source, 1, 2, "dilate", 0.5), RangeError);
  assert.throws(() => effects.applyMorphology(source, 2, 2, "unknown", 0.5), RangeError);
  assert.throws(() => effects.applyMorphology(source, 2, 2, "erode", 1.1), RangeError);
  assert.throws(() => morphologyModule.createMorphologyEffects({}), TypeError);
});
