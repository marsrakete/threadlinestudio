"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { createCanvasGeometry } = require("../packages/threadline-filters/canvas-geometry");

/** Creates a geometry API with deterministic seeded variation and recorded path commands.
 * @returns {{geometry:object,commands:Array<object>}} Geometry API and command recorder.
 */
function createGeometry() {
  const commands = [];
  const context = {};
  for (const method of ["beginPath", "moveTo", "lineTo", "quadraticCurveTo", "closePath", "ellipse", "arcTo"]) {
    context[method] = function recordCommand() {
      commands.push({ method, arguments: Array.from(arguments) });
    };
  }
  const geometry = createCanvasGeometry({
    seededNoise(x, y, seed) {
      const value = Math.sin(x * 127.1 + y * 311.7 + seed * 91.3) * 43758.5453123;
      return value - Math.floor(value);
    },
  });
  return { geometry, context, commands };
}

test("rounded rectangle builders preserve their distinct path primitives", function () {
  const { geometry, context, commands } = createGeometry();
  geometry.buildRoundedRectPath(context, 2, 3, 20, 10, 8);
  assert.equal(commands[0].method, "beginPath");
  assert.equal(commands.filter(function isQuadratic(command) { return command.method === "quadraticCurveTo"; }).length, 4);
  assert.equal(commands.at(-1).method, "closePath");
  commands.length = 0;
  geometry.drawRoundedRectPath(context, 2, 3, 20, 10, 8);
  assert.equal(commands.filter(function isArcTo(command) { return command.method === "arcTo"; }).length, 4);
});

test("die-cut builders support ellipse, hexagon, and notched variants", function () {
  const { geometry, context, commands } = createGeometry();
  geometry.buildDieCutPath(context, 20, 15, 40, 30, 0);
  assert.equal(commands.some(function isEllipse(command) { return command.method === "ellipse"; }), true);
  commands.length = 0;
  geometry.buildDieCutPath(context, 20, 15, 40, 30, 1);
  assert.equal(commands.filter(function isLine(command) { return command.method === "lineTo"; }).length, 5);
  commands.length = 0;
  geometry.buildDieCutPath(context, 20, 15, 40, 30, 2);
  assert.equal(commands.filter(function isQuadratic(command) { return command.method === "quadraticCurveTo"; }).length, 4);
});

test("organic blob path uses deterministic seeded control points", function () {
  const { geometry, context, commands } = createGeometry();
  geometry.drawOrganicBlobPath(context, 10, 12, 7, 5, 6, 42);
  const firstPath = commands.map(function serializeCommand(command) {
    return JSON.stringify(command);
  });
  commands.length = 0;
  geometry.drawOrganicBlobPath(context, 10, 12, 7, 5, 6, 42);
  assert.deepEqual(commands.map(function serializeCommand(command) {
    return JSON.stringify(command);
  }), firstPath);
  assert.equal(commands.filter(function isCurve(command) { return command.method === "quadraticCurveTo"; }).length, 6);
});

test("geometry API rejects a missing noise dependency", function () {
  assert.throws(function missingDependency() {
    createCanvasGeometry({});
  }, /seededNoise dependency is required/);
});
