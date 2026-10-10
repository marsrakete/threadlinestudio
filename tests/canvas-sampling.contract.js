"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { createCanvasSampling } = require("../packages/threadline-filters/canvas-sampling");

/** Creates a sampling helper with a deterministic scratch canvas.
 * @param {Uint8ClampedArray} pixels - Pixel data returned from the sample canvas.
 * @param {number} width - Sample canvas width.
 * @param {number} height - Sample canvas height.
 * @returns {object} Sampling API and captured sample canvas dimensions.
 */
function createSampling(pixels, width, height) {
  const captured = {};
  const scratchCanvas = {
    getContext() {
      return {
        clearRect() {},
        drawImage(source, x, y, targetWidth, targetHeight) {
          captured.draw = { source, x, y, targetWidth, targetHeight };
        },
        getImageData() {
          let imagePixels = pixels;
          if (imagePixels.length !== captured.width * captured.height * 4) {
            imagePixels = new Uint8ClampedArray(captured.width * captured.height * 4);
            imagePixels.set(pixels.subarray(0, imagePixels.length));
          }
          return { data: imagePixels };
        },
      };
    },
  };
  const api = createCanvasSampling({
    getScratchCanvas(sampleWidth, sampleHeight) {
      captured.width = sampleWidth;
      captured.height = sampleHeight;
      return scratchCanvas;
    },
    clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    },
  });
  return { api, captured, width, height };
}

test("sampling scales the source and maps edge coordinates to RGBA pixels", function () {
  const pixels = new Uint8ClampedArray(32 * 16 * 4);
  pixels.set([50, 60, 70, 80], pixels.length - 4);
  const { api, captured } = createSampling(pixels, 2, 1);
  const sourceCanvas = { width: 100, height: 50 };
  const sample = api.createSampleSource(sourceCanvas, 32);
  assert.equal(sample.width, 32);
  assert.equal(sample.height, 16);
  assert.equal(sample.originWidth, 100);
  assert.equal(captured.draw.source, sourceCanvas);
  assert.equal(api.getSampleSourceIndex(sample, 99, 49), pixels.length - 4);
  assert.equal(api.getSampleSourceIndex(sample, -10, -1), 0);
  assert.equal(api.getSampleSourceChannel(sample, 99, 49, 2), 70);
});

test("sampling honors the default maximum dimension and a minimum requested size", function () {
  const data = new Uint8ClampedArray(4 * 4 * 4);
  const { api, captured } = createSampling(data, 1, 1);
  api.createSampleSource({ width: 840, height: 420 });
  assert.equal(captured.width, 420);
  assert.equal(captured.height, 210);
  api.createSampleSource({ width: 64, height: 40 }, 1);
  assert.equal(captured.width, 32);
  assert.equal(captured.height, 20);
});

test("full-resolution channel sampling rounds coordinates and clamps image edges", function () {
  const data = new Uint8ClampedArray([10, 20, 30, 40, 50, 60, 70, 80]);
  const { api } = createSampling(data, 2, 1);
  assert.equal(api.getPixelChannel(data, 2, 1, 0.6, 0, 2), 70);
  assert.equal(api.getPixelChannel(data, 2, 1, 20, -5, 3), 80);
  assert.throws(() => api.getPixelChannel(data, 2, 1, 0, 0, 4), /channel/);
  assert.throws(() => api.getPixelChannel(data, 1, 1, 0, 0, 0), /data length/);
});

test("sampling rejects invalid providers, dimensions, channels, and coordinate values", function () {
  assert.throws(function missingDependencies() {
    createCanvasSampling({});
  }, /getScratchCanvas and clamp/);
  const { api } = createSampling(new Uint8ClampedArray(4), 1, 1);
  assert.throws(function invalidCanvas() {
    api.createSampleSource({ width: 0, height: 1 });
  }, /positive finite dimensions/);
  assert.throws(function invalidSampleSize() {
    api.createSampleSource({ width: 1, height: 1 }, Number.NaN);
  }, /maxDimension must be a finite number/);
  assert.throws(function invalidSampleShape() {
    api.getSampleSourceIndex({ data: new Uint8ClampedArray(8), width: 1, height: 1, originWidth: 1, originHeight: 1 }, 0, 0);
  }, /data length must match/);
  assert.throws(function invalidCoordinates() {
    api.getSampleSourceIndex({ data: new Uint8ClampedArray(4), width: 1, height: 1, originWidth: 1, originHeight: 1 }, Infinity, 0);
  }, /coordinates must be finite/);
  assert.throws(function invalidChannel() {
    api.getSampleSourceChannel({ data: new Uint8ClampedArray(4), width: 1, height: 1, originWidth: 1, originHeight: 1 }, 0, 0, 4);
  }, /channel must be an integer/);
});
