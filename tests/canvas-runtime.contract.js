const assert = require("node:assert/strict");
const test = require("node:test");
const runtimeModule = require("../packages/threadline-filters/canvas-runtime");

/** Creates a canvas test double that records copy operations.
 * @returns {{width: number, height: number, copies: Array, getContext: function(string): object}} Canvas-like test double.
 */
function createTestCanvas() {
  const canvas = {
    width: 0,
    height: 0,
    copies: [],
    resetCount: 0,
    getContext(contextType) {
      assert.equal(contextType, "2d");
      return {
        reset() {
          canvas.resetCount += 1;
        },
        drawImage(source, x, y) {
          canvas.copies.push({ source, x, y });
        },
      };
    },
  };
  return canvas;
}

/** Constructs the runtime with a deterministic test canvas factory and random provider.
 * @param {function(): number} randomProvider - Random-value provider to inject.
 * @param {Array<object>} createdCanvases - Receives each canvas created by the runtime.
 * @returns {object} Configured canvas runtime.
 */
function createRuntime(randomProvider, createdCanvases) {
  return runtimeModule.createCanvasRuntime({
    createCanvas() {
      const canvas = createTestCanvas();
      createdCanvases.push(canvas);
      return canvas;
    },
    random: randomProvider,
  });
}

/** Verifies scratch canvases are reused by slot and resized on demand. */
test("scratch canvases are reused after reset and resized safely", () => {
  const canvases = [];
  const runtime = createRuntime(() => 0.25, canvases);
  const first = runtime.getScratchCanvas(20, 10);
  assert.equal(first.resetCount, 1);
  assert.equal(first.width, 20);
  assert.equal(first.height, 10);
  runtime.getScratchCanvas(8, 5);
  runtime.reset();
  const reused = runtime.getScratchCanvas(7, 4);
  assert.equal(reused, first);
  assert.equal(reused.width, 7);
  assert.equal(reused.height, 4);
  assert.equal(reused.resetCount, 2);
  assert.equal(canvases.length, 2);
});

/** Verifies cloning uses a scratch canvas and draws the source at its origin. */
test("cloneCanvas copies into a correctly sized scratch canvas", () => {
  const canvases = [];
  const runtime = createRuntime(() => 0.5, canvases);
  const source = createTestCanvas();
  source.width = 13;
  source.height = 9;
  const copy = runtime.cloneCanvas(source);
  assert.equal(copy.width, 13);
  assert.equal(copy.height, 9);
  assert.deepEqual(copy.copies, [{ source, x: 0, y: 0 }]);
});

/** Ensures release clears retained canvases and a later request creates a fresh one. */
test("release clears scratch canvases and resets the pool", () => {
  const canvases = [];
  const runtime = createRuntime(() => 0.75, canvases);
  const oldCanvas = runtime.getScratchCanvas(4, 6);
  runtime.release();
  assert.equal(oldCanvas.width, 0);
  assert.equal(oldCanvas.height, 0);
  const newCanvas = runtime.getScratchCanvas(4, 6);
  assert.notEqual(newCanvas, oldCanvas);
  assert.equal(canvases.length, 2);
});

/** Confirms the injected random provider is used and validates its output range. */
test("random values come from the injected provider and invalid values are rejected", () => {
  const runtime = createRuntime(() => 0.375, []);
  assert.equal(runtime.random(), 0.375);
  const invalidRuntime = createRuntime(() => 1, []);
  assert.throws(() => invalidRuntime.random(), RangeError);
});

/** Rejects missing dependencies and invalid scratch dimensions at the module boundary. */
test("invalid runtime dependencies and dimensions are rejected", () => {
  assert.throws(() => runtimeModule.createCanvasRuntime({ createCanvas() {} }), TypeError);
  const runtime = createRuntime(() => 0, []);
  assert.throws(() => runtime.getScratchCanvas(0, 1), RangeError);
  assert.throws(() => runtime.getScratchCanvas(1, 1.5), RangeError);
  assert.throws(() => runtime.cloneCanvas({ width: 0, height: 1 }), RangeError);
});
