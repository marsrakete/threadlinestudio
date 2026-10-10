(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineCanvasPrimitives = library;
  }
})(globalThis, function () {
  "use strict";

  /** Validates canvas dimensions and finite positive drawing dimensions.
   * @param {HTMLCanvasElement} canvas - Canvas whose dimensions are used for drawing.
   * @param {object} options - Renderer options to inspect.
   * @param {string[]} positiveKeys - Option keys that must contain positive finite numbers.
   * @returns {void} Nothing.
   */
  function validateDrawingOptions(canvas, options, positiveKeys) {
    if (!canvas || !Number.isFinite(canvas.width) || canvas.width <= 0 || !Number.isFinite(canvas.height) || canvas.height <= 0) {
      throw new TypeError("canvas must have positive finite dimensions.");
    }
    if (!options || typeof options !== "object") {
      throw new TypeError("drawing options must be an object.");
    }
    for (const key of positiveKeys) {
      const value = options[key];
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new RangeError(`${key} must be a positive finite number.`);
      }
    }
  }

  /** Draws parallel lines rotated around the canvas center.
   * @param {CanvasRenderingContext2D} context - Canvas drawing context.
   * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
   * @param {{spacing: number, lineWidth: number, angle: number, color: string}} options - Line spacing, width, angle in degrees, and stroke color.
   * @returns {void} Nothing.
   */
  function drawLinePattern(context, canvas, options) {
    validateDrawingOptions(canvas, options, ["spacing", "lineWidth"]);
    if (typeof options.angle !== "number" || !Number.isFinite(options.angle) || typeof options.color !== "string") {
      throw new TypeError("angle must be finite and color must be a string.");
    }
    const { spacing, lineWidth, angle, color } = options;
    const radians = (angle * Math.PI) / 180;
    const diagonal = Math.hypot(canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(radians);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    for (let offset = -diagonal; offset <= diagonal; offset += spacing) {
      context.beginPath();
      context.moveTo(offset, -diagonal);
      context.lineTo(offset, diagonal);
      context.stroke();
    }
    context.restore();
  }

  /** Draws a repeating two-color checker pattern.
   * @param {CanvasRenderingContext2D} context - Canvas drawing context.
   * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
   * @param {{size: number, colorA: string, colorB: string}} options - Cell size and alternating fill colors.
   * @returns {void} Nothing.
   */
  function drawCheckerPattern(context, canvas, options) {
    validateDrawingOptions(canvas, options, ["size"]);
    if (typeof options.colorA !== "string" || typeof options.colorB !== "string") {
      throw new TypeError("checker colors must be strings.");
    }
    const { size, colorA, colorB } = options;
    context.save();
    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          context.fillStyle = colorA;
        } else {
          context.fillStyle = colorB;
        }
        context.fillRect(x, y, size, size);
      }
    }
    context.restore();
  }

  /** Draws a regular grid of circular dots.
   * @param {CanvasRenderingContext2D} context - Canvas drawing context.
   * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
   * @param {{spacing: number, radius: number, color: string}} options - Dot spacing, radius, and fill color.
   * @returns {void} Nothing.
   */
  function drawDotPattern(context, canvas, options) {
    validateDrawingOptions(canvas, options, ["spacing", "radius"]);
    if (typeof options.color !== "string") {
      throw new TypeError("dot color must be a string.");
    }
    const { spacing, radius, color } = options;
    context.save();
    context.fillStyle = color;
    for (let y = spacing / 2; y < canvas.height; y += spacing) {
      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }

  /** Draws evenly spaced sinusoidal horizontal lines.
   * @param {CanvasRenderingContext2D} context - Canvas drawing context.
   * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
   * @param {{spacing: number, amplitude: number, color: string, lineWidth: number}} options - Wave spacing, amplitude, stroke color, and width.
   * @returns {void} Nothing.
   */
  function drawWavePattern(context, canvas, options) {
    validateDrawingOptions(canvas, options, ["spacing", "lineWidth"]);
    if (typeof options.amplitude !== "number" || !Number.isFinite(options.amplitude) || options.amplitude < 0 || typeof options.color !== "string") {
      throw new TypeError("amplitude must be a finite non-negative number and color must be a string.");
    }
    const { spacing, amplitude, color, lineWidth } = options;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    for (let baseY = spacing / 2; baseY < canvas.height + spacing; baseY += spacing) {
      context.beginPath();
      for (let x = 0; x <= canvas.width; x += 12) {
        const y = baseY + Math.sin((x / canvas.width) * Math.PI * 4) * amplitude;
        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.stroke();
    }
    context.restore();
  }

  /** Draws randomly placed fine scratches using an injected random provider.
   * @param {CanvasRenderingContext2D} context - Canvas drawing context.
   * @param {HTMLCanvasElement} canvas - Target canvas dimensions.
   * @param {number} amount - Scratch density and strength from zero to one.
   * @param {function(): number} random - Random value provider returning values in [0, 1).
   * @returns {void} Nothing.
   */
  function drawScratches(context, canvas, amount, random) {
    if (!context || !canvas || typeof random !== "function") {
      throw new TypeError("context, canvas, and random provider are required.");
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 1) {
      throw new RangeError("amount must be a finite number from zero to one.");
    }
    context.save();
    context.strokeStyle = "rgba(255,255,255," + (0.04 + amount * 0.18) + ")";
    context.lineWidth = 0.6 + amount * 1.4;
    const count = Math.round(10 + amount * 80);
    for (let i = 0; i < count; i += 1) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const length = 14 + random() * (canvas.height * 0.22);
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (random() - 0.5) * 12, y + length);
      context.stroke();
    }
    context.restore();
  }

  return Object.freeze({ drawLinePattern, drawCheckerPattern, drawDotPattern, drawWavePattern, drawScratches });
});
