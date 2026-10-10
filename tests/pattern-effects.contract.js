const assert = require("node:assert/strict");
const test = require("node:test");
const { createPatternEffects } = require("../packages/threadline-filters/pattern-effects");

/** Creates a Canvas test double that counts drawing operations.
 * @returns {{canvas: object, calls: object, context: object}} Canvas, operation counts, and context.
 */
function createCanvasDouble() {
  const calls = { fillRect: 0, stroke: 0, fill: 0, arc: 0, lineTo: 0, moveTo: 0 };
  const context = {};
  const methodNames = ["save", "restore", "translate", "rotate", "beginPath"];
  for (const methodName of methodNames) {
    context[methodName] = function noop() {};
  }
  for (const methodName of Object.keys(calls)) {
    context[methodName] = function countCall() {
      calls[methodName] += 1;
    };
  }
  const gradient = { addColorStop() {} };
  context.createLinearGradient = function createGradient() {
    return gradient;
  };
  const canvas = {
    width: 96,
    height: 64,
    getContext(type) {
      assert.equal(type, "2d");
      return context;
    },
  };
  return { canvas, calls, context };
}

/** Creates pattern effects with instrumented shared primitives.
 * @returns {{effects: object, calls: object}} Renderer API and primitive call counts.
 */
function createEffects() {
  const calls = { lines: 0, checker: 0, dots: 0, waves: 0 };
  const primitives = {
    drawLinePattern() { calls.lines += 1; },
    drawCheckerPattern() { calls.checker += 1; },
    drawDotPattern() { calls.dots += 1; },
    drawWavePattern() { calls.waves += 1; },
  };
  const dependencies = {
    clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    },
    seededNoise() {
      return 0.5;
    },
    rgbaString(color, alpha) {
      return `rgba(${color.r},${color.g},${color.b},${alpha})`;
    },
    rgbaFromHex(color, alpha) {
      return `${color}:${alpha}`;
    },
    parseHexColor(color) {
      assert.match(color, /^#[0-9a-f]{6}$/i);
      return { r: 100, g: 120, b: 140 };
    },
    primitives,
  };
  return { effects: createPatternEffects(dependencies), calls };
}

test("exports the documented pattern renderers", () => {
  const { effects } = createEffects();
  assert.deepEqual(Object.keys(effects).sort(), [
    "applyPatternEffects", "drawBlueprintGrid", "drawDiamondMesh", "drawFingerprint",
    "drawPerforatedPattern", "drawStaffLines", "drawTestPattern", "drawTireTracks",
    "drawTopoLines", "drawZebraPattern",
  ]);
  assert.equal(Object.isFrozen(effects), true);
});

test("disabled pattern sliders leave the Canvas untouched", () => {
  const { effects } = createEffects();
  const { canvas, calls } = createCanvasDouble();
  effects.applyPatternEffects(canvas, {}, {
    overlayColor: "#112233",
    duotoneLight: "#445566",
    duotoneDark: "#778899",
  });
  assert.deepEqual(calls, { fillRect: 0, stroke: 0, fill: 0, arc: 0, lineTo: 0, moveTo: 0 });
});

test("basic pattern controls delegate to shared Canvas primitives", () => {
  const { effects, calls } = createEffects();
  const { canvas } = createCanvasDouble();
  effects.applyPatternEffects(canvas, {
    stripes: 30,
    diagonalLines: 30,
    crosshatch: 30,
    checker: 30,
    dots: 30,
    waves: 30,
  }, {
    overlayColor: "#112233",
    duotoneLight: "#445566",
    duotoneDark: "#778899",
  });
  assert.deepEqual(calls, { lines: 4, checker: 1, dots: 1, waves: 1 });
});

test("specialized patterns render geometry and preserve deterministic variation", () => {
  const { effects } = createEffects();
  const { canvas, calls } = createCanvasDouble();
  effects.applyPatternEffects(canvas, {
    testPattern: 25,
    meshFence: 25,
    tireTracks: 25,
    fingerprint: 25,
    topoLines: 25,
    staffLines: 25,
    blueprintGrid: 25,
    zebra: 25,
  }, {
    overlayColor: "#112233",
    duotoneLight: "#445566",
    duotoneDark: "#778899",
  });
  assert.ok(calls.fillRect > 10);
  assert.ok(calls.stroke > 10);
  assert.ok(calls.lineTo > 10);
});

test("rejects incomplete pattern dependencies", () => {
  assert.throws(() => createPatternEffects(), /color helpers, and primitives are required/);
  assert.throws(() => createPatternEffects({ clamp() {} }), /color helpers, and primitives are required/);
});
