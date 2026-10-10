const assert = require("node:assert/strict");
const test = require("node:test");
const primitives = require("../packages/threadline-filters/canvas-primitives");

/** Creates a recording canvas context for drawing primitive tests.
 * @returns {{canvas: object, calls: object[]}} Test canvas and recorded drawing operations.
 */
function createCanvasDouble() {
  const calls = [];
  const context = {};
  const methods = ["save", "restore", "translate", "rotate", "beginPath", "moveTo", "lineTo", "stroke", "fill", "arc", "fillRect"];
  for (const method of methods) {
    context[method] = function recordCall(...args) {
      calls.push({ method, args });
    };
  }
  const canvas = { width: 48, height: 36 };
  return { canvas, calls, context };
}

test("exports a frozen set of documented drawing primitives", () => {
  assert.deepEqual(Object.keys(primitives).sort(), ["drawCheckerPattern", "drawDotPattern", "drawLinePattern", "drawScratches", "drawWavePattern"]);
  assert.equal(Object.isFrozen(primitives), true);
});

test("scratch primitive draws deterministic strokes through its random provider", () => {
  const { canvas, calls, context } = createCanvasDouble();
  let randomCalls = 0;
  primitives.drawScratches(context, canvas, 0, function random() {
    randomCalls += 1;
    return 0.5;
  });
  assert.equal(randomCalls, 40);
  assert.equal(calls.filter((call) => call.method === "stroke").length, 10);
});

test("line, checker, dot, and wave primitives draw within the canvas", () => {
  const { canvas, calls, context } = createCanvasDouble();
  primitives.drawLinePattern(context, canvas, { spacing: 12, lineWidth: 1, angle: 15, color: "#000" });
  primitives.drawCheckerPattern(context, canvas, { size: 12, colorA: "#000", colorB: "#fff" });
  primitives.drawDotPattern(context, canvas, { spacing: 12, radius: 2, color: "#000" });
  primitives.drawWavePattern(context, canvas, { spacing: 12, amplitude: 4, color: "#000", lineWidth: 1 });

  assert.ok(calls.filter((call) => call.method === "stroke").length >= 8);
  assert.ok(calls.filter((call) => call.method === "fillRect").length >= 12);
  assert.ok(calls.filter((call) => call.method === "arc").length >= 4);
});

test("rejects zero spacing, invalid canvas bounds, and malformed colors", () => {
  const { canvas, context } = createCanvasDouble();
  assert.throws(() => primitives.drawLinePattern(context, canvas, { spacing: 0, lineWidth: 1, angle: 0, color: "#000" }), /spacing/);
  assert.throws(() => primitives.drawDotPattern(context, { width: 0, height: 12 }, { spacing: 4, radius: 1, color: "#000" }), /canvas/);
  assert.throws(() => primitives.drawCheckerPattern(context, canvas, { size: 4, colorA: null, colorB: "#fff" }), /colors/);
  assert.throws(() => primitives.drawWavePattern(context, canvas, { spacing: 4, amplitude: -1, color: "#000", lineWidth: 1 }), /amplitude/);
  assert.throws(() => primitives.drawScratches(context, canvas, 1.1, Math.random), /amount/);
  assert.throws(() => primitives.drawScratches(context, canvas, 0.5, null), /random provider/);
});
