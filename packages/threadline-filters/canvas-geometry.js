(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineCanvasGeometry = library;
  }
})(globalThis, function () {
  "use strict";

  /** Creates reusable Canvas path builders with an injected deterministic noise source.
   * @param {{seededNoise:function(number,number,number):number}} dependencies - Seeded noise provider.
   * @returns {object} Frozen Canvas geometry API.
   */
  function createCanvasGeometry(dependencies) {
    if (!dependencies || typeof dependencies.seededNoise !== "function") {
      throw new TypeError("seededNoise dependency is required.");
    }

    /** Builds a rounded rectangle path with quadratic corners.
     * @param {CanvasRenderingContext2D} context - Context whose current path is replaced.
     * @param {number} x - Left coordinate.
     * @param {number} y - Top coordinate.
     * @param {number} width - Rectangle width.
     * @param {number} height - Rectangle height.
     * @param {number} radius - Corner radius, capped at half the smaller side.
     * @returns {void} Leaves the completed path on the context.
     */
    function buildRoundedRectPath(context, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      context.beginPath();
      context.moveTo(x + r, y);
      context.lineTo(x + width - r, y);
      context.quadraticCurveTo(x + width, y, x + width, y + r);
      context.lineTo(x + width, y + height - r);
      context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      context.lineTo(x + r, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - r);
      context.lineTo(x, y + r);
      context.quadraticCurveTo(x, y, x + r, y);
      context.closePath();
    }

    /** Builds an ellipse, hexagon, or notched die-cut path.
     * @param {CanvasRenderingContext2D} context - Context whose current path is replaced.
     * @param {number} centerX - Shape center x coordinate.
     * @param {number} centerY - Shape center y coordinate.
     * @param {number} width - Shape width.
     * @param {number} height - Shape height.
     * @param {number} shape - Variant index: zero ellipse, one hexagon, otherwise notched rectangle.
     * @returns {void} Leaves the completed path on the context.
     */
    function buildDieCutPath(context, centerX, centerY, width, height, shape) {
      context.beginPath();
      if (shape === 0) {
        context.ellipse(centerX, centerY, width * 0.5, height * 0.5, 0, 0, Math.PI * 2);
      } else if (shape === 1) {
        const radius = Math.min(width, height) * 0.48;
        for (let index = 0; index < 6; index += 1) {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 6;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
      } else {
        drawNotchedRectangle(context, centerX, centerY, width, height);
      }
    }

    /** Draws the notched rectangle used by the die-cut path variant.
     * @param {CanvasRenderingContext2D} context - Context receiving the path commands.
     * @param {number} centerX - Shape center x coordinate.
     * @param {number} centerY - Shape center y coordinate.
     * @param {number} width - Shape width.
     * @param {number} height - Shape height.
     * @returns {void} Leaves the closed notched path on the context.
     */
    function drawNotchedRectangle(context, centerX, centerY, width, height) {
      const notch = Math.min(width, height) * 0.18;
      context.moveTo(centerX - width * 0.5 + notch, centerY - height * 0.5);
      context.lineTo(centerX + width * 0.5 - notch, centerY - height * 0.5);
      context.quadraticCurveTo(centerX + width * 0.5, centerY - height * 0.5, centerX + width * 0.5, centerY - height * 0.5 + notch);
      context.lineTo(centerX + width * 0.5, centerY + height * 0.5 - notch);
      context.quadraticCurveTo(centerX + width * 0.5, centerY + height * 0.5, centerX + width * 0.5 - notch, centerY + height * 0.5);
      context.lineTo(centerX - width * 0.5 + notch, centerY + height * 0.5);
      context.quadraticCurveTo(centerX - width * 0.5, centerY + height * 0.5, centerX - width * 0.5, centerY + height * 0.5 - notch);
      context.lineTo(centerX - width * 0.5, centerY - height * 0.5 + notch);
      context.quadraticCurveTo(centerX - width * 0.5, centerY - height * 0.5, centerX - width * 0.5 + notch, centerY - height * 0.5);
      context.closePath();
    }

    /** Builds a rounded rectangle path using the Canvas arcTo primitive.
     * @param {CanvasRenderingContext2D} context - Context whose current path is replaced.
     * @param {number} x - Left coordinate.
     * @param {number} y - Top coordinate.
     * @param {number} width - Rectangle width.
     * @param {number} height - Rectangle height.
     * @param {number} radius - Corner radius, capped at half the smaller side.
     * @returns {void} Leaves the completed path on the context.
     */
    function drawRoundedRectPath(context, x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      context.beginPath();
      context.moveTo(x + r, y);
      context.arcTo(x + width, y, x + width, y + height, r);
      context.arcTo(x + width, y + height, x, y + height, r);
      context.arcTo(x, y + height, x, y, r);
      context.arcTo(x, y, x + width, y, r);
      context.closePath();
    }

    /** Builds a deterministic organic blob path from seeded radial variations.
     * @param {CanvasRenderingContext2D} context - Context whose current path is replaced.
     * @param {number} centerX - Shape center x coordinate.
     * @param {number} centerY - Shape center y coordinate.
     * @param {number} radiusX - Base horizontal radius.
     * @param {number} radiusY - Base vertical radius.
     * @param {number} points - Number of perimeter segments; defaults to six.
     * @param {number} seed - Seed offset for repeatable shape variation.
     * @returns {void} Leaves the completed organic path on the context.
     */
    function drawOrganicBlobPath(context, centerX, centerY, radiusX, radiusY, points, seed) {
      let pointCount = points;
      let seedValue = seed;
      if (pointCount === undefined) {
        pointCount = 6;
      }
      if (seedValue === undefined) {
        seedValue = 0;
      }
      context.beginPath();
      for (let index = 0; index < pointCount; index += 1) {
        const angle = (index / pointCount) * Math.PI * 2;
        const nextAngle = ((index + 1) / pointCount) * Math.PI * 2;
        const pointRadiusX = radiusX * (0.72 + dependencies.seededNoise(seedValue, index, 0.7) * 0.5);
        const pointRadiusY = radiusY * (0.72 + dependencies.seededNoise(seedValue, index, 1.3) * 0.5);
        const x = centerX + Math.cos(angle) * pointRadiusX;
        const y = centerY + Math.sin(angle) * pointRadiusY;
        const nextRadiusX = radiusX * (0.72 + dependencies.seededNoise(seedValue, index + 1, 0.7) * 0.5);
        const nextRadiusY = radiusY * (0.72 + dependencies.seededNoise(seedValue, index + 1, 1.3) * 0.5);
        const nextX = centerX + Math.cos(nextAngle) * nextRadiusX;
        const nextY = centerY + Math.sin(nextAngle) * nextRadiusY;
        const controlAngle = angle + (nextAngle - angle) * 0.5;
        const controlX = centerX + Math.cos(controlAngle) * radiusX * (0.78 + dependencies.seededNoise(seedValue, index, 2.1) * 0.45);
        const controlY = centerY + Math.sin(controlAngle) * radiusY * (0.78 + dependencies.seededNoise(seedValue, index, 2.9) * 0.45);
        if (index === 0) {
          context.moveTo(x, y);
        }
        context.quadraticCurveTo(controlX, controlY, nextX, nextY);
      }
      context.closePath();
    }

    return Object.freeze({
      buildRoundedRectPath,
      buildDieCutPath,
      drawRoundedRectPath,
      drawOrganicBlobPath,
    });
  }

  return Object.freeze({ createCanvasGeometry });
});
