(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlinePatternEffects = library;
  }
})(globalThis, function () {
  "use strict";

  /** Creates pattern renderers with explicit color, noise, and Canvas dependencies.
   * @param {{clamp: function(number, number, number): number, seededNoise: function(number, number, number=): number, rgbaString: function(object, number): string, rgbaFromHex: function(string, number): string, parseHexColor: function(string): object, primitives: object}} dependencies - Shared pure helpers and Canvas primitives.
   * @returns {object} Frozen public pattern renderer API.
   */
  function createPatternEffects(dependencies) {
    if (!dependencies || typeof dependencies.clamp !== "function" || typeof dependencies.seededNoise !== "function" || typeof dependencies.rgbaString !== "function" || typeof dependencies.rgbaFromHex !== "function" || typeof dependencies.parseHexColor !== "function" || !dependencies.primitives) {
      throw new TypeError("clamp, seededNoise, color helpers, and primitives are required.");
    }

    /** Renders the configured pattern layers in the established application order.
     * @param {HTMLCanvasElement} canvas - Canvas to draw into.
     * @param {object} patterns - Pattern slider values.
     * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colorSettings - Project palette settings.
     * @returns {void} Nothing.
     */
    function applyPatternEffects(canvas, patterns, colorSettings) {
      const context = canvas.getContext("2d");
      const accent = dependencies.parseHexColor(colorSettings.overlayColor);
      const soft = dependencies.parseHexColor(colorSettings.duotoneLight);
      const dark = dependencies.parseHexColor(colorSettings.duotoneDark);

      if (patterns.testPattern > 0) {
        drawTestPattern(context, canvas, patterns.testPattern / 100);
      }
      if (patterns.gradientWash > 0) {
        const amount = patterns.gradientWash / 100;
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, dependencies.rgbaString(soft, 0.08 + amount * 0.18));
        gradient.addColorStop(0.52, dependencies.rgbaString(accent, 0.03 + amount * 0.12));
        gradient.addColorStop(1, dependencies.rgbaString(dark, 0.02 + amount * 0.16));
        context.save();
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
      }
      if (patterns.stripes > 0) {
        const amount = patterns.stripes / 100;
        dependencies.primitives.drawLinePattern(context, canvas, {
          spacing: Math.max(8, Math.round(28 - amount * 18)),
          lineWidth: Math.max(1, 1 + amount * 3),
          angle: 0,
          color: dependencies.rgbaString(accent, 0.08 + amount * 0.18),
        });
      }
      if (patterns.diagonalLines > 0) {
        const amount = patterns.diagonalLines / 100;
        dependencies.primitives.drawLinePattern(context, canvas, {
          spacing: Math.max(10, Math.round(34 - amount * 20)),
          lineWidth: Math.max(1, 1 + amount * 2.5),
          angle: -35,
          color: dependencies.rgbaString(soft, 0.08 + amount * 0.18),
        });
      }
      if (patterns.crosshatch > 0) {
        const amount = patterns.crosshatch / 100;
        dependencies.primitives.drawLinePattern(context, canvas, {
          spacing: Math.max(10, Math.round(36 - amount * 20)),
          lineWidth: Math.max(1, 0.8 + amount * 2),
          angle: 35,
          color: dependencies.rgbaString(accent, 0.06 + amount * 0.14),
        });
        dependencies.primitives.drawLinePattern(context, canvas, {
          spacing: Math.max(10, Math.round(36 - amount * 20)),
          lineWidth: Math.max(1, 0.8 + amount * 2),
          angle: -35,
          color: dependencies.rgbaString(dark, 0.04 + amount * 0.12),
        });
      }
      if (patterns.checker > 0) {
        const amount = patterns.checker / 100;
        dependencies.primitives.drawCheckerPattern(context, canvas, {
          size: Math.max(10, Math.round(42 - amount * 24)),
          colorA: dependencies.rgbaString(accent, 0.04 + amount * 0.12),
          colorB: dependencies.rgbaString(soft, 0.03 + amount * 0.08),
        });
      }
      if (patterns.dots > 0) {
        const amount = patterns.dots / 100;
        dependencies.primitives.drawDotPattern(context, canvas, {
          spacing: Math.max(12, Math.round(34 - amount * 18)),
          radius: Math.max(1.5, 1.2 + amount * 4),
          color: dependencies.rgbaString(accent, 0.08 + amount * 0.16),
        });
      }
      if (patterns.waves > 0) {
        const amount = patterns.waves / 100;
        dependencies.primitives.drawWavePattern(context, canvas, {
          spacing: Math.max(18, Math.round(46 - amount * 22)),
          amplitude: 4 + amount * 12,
          color: dependencies.rgbaString(soft, 0.06 + amount * 0.14),
          lineWidth: Math.max(1, 1 + amount * 2),
        });
      }
      if (patterns.meshFence > 0) {
        const amount = patterns.meshFence / 100;
        drawDiamondMesh(context, canvas, {
          size: Math.max(18, Math.round(46 - amount * 24)),
          lineWidth: Math.max(1.2, 1 + amount * 2.4),
          color: dependencies.rgbaString(dark, 0.08 + amount * 0.2),
        });
      }
      if (patterns.tireTracks > 0) {
        drawTireTracks(context, canvas, patterns.tireTracks / 100, accent);
      }
      if (patterns.fingerprint > 0) {
        drawFingerprint(context, canvas, patterns.fingerprint / 100, dark);
      }
      if (patterns.topoLines > 0) {
        drawTopoLines(context, canvas, patterns.topoLines / 100, soft);
      }
      if (patterns.staffLines > 0) {
        drawStaffLines(context, canvas, patterns.staffLines / 100, dark);
      }
      if (patterns.blueprintGrid > 0) {
        drawBlueprintGrid(context, canvas, patterns.blueprintGrid / 100, soft, dark);
      }
      if (patterns.zebra > 0) {
        drawZebraPattern(context, canvas, patterns.zebra / 100);
      }
    }

    /** Draws the multi-bar color test pattern.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Normalized opacity strength.
     * @returns {void} Nothing.
     */
    function drawTestPattern(context, canvas, amount) {
      context.save();
      const height = canvas.height;
      const bars = ["#f7f7f7", "#f5d84c", "#62e0e5", "#6edb7c", "#ff7aa7", "#ff5d4f", "#4a7dff"];
      const barWidth = canvas.width / bars.length;
      bars.forEach(function drawBar(color, index) {
        context.fillStyle = dependencies.rgbaFromHex(color, 0.2 + amount * 0.65);
        context.fillRect(index * barWidth, 0, barWidth + 1, height * 0.38);
      });
      const blocks = ["#1d1d1d", "#f1f1f1", "#2e53ff", "#101010", "#0f8f65", "#ff3535"];
      const blockWidth = canvas.width / blocks.length;
      blocks.forEach(function drawBlock(color, index) {
        context.fillStyle = dependencies.rgbaFromHex(color, 0.18 + amount * 0.62);
        context.fillRect(index * blockWidth, height * 0.7, blockWidth + 1, height * 0.18);
      });
      context.restore();
    }

    /** Draws a diamond-shaped mesh grid.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {{size: number, lineWidth: number, color: string}} options - Mesh spacing, width, and color.
     * @returns {void} Nothing.
     */
    function drawDiamondMesh(context, canvas, options) {
      const { size, lineWidth, color } = options;
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(Math.PI / 4);
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      const span = Math.hypot(canvas.width, canvas.height);
      for (let x = -span; x <= span; x += size) {
        context.beginPath();
        context.moveTo(x, -span);
        context.lineTo(x, span);
        context.stroke();
      }
      for (let y = -span; y <= span; y += size) {
        context.beginPath();
        context.moveTo(-span, y);
        context.lineTo(span, y);
        context.stroke();
      }
      context.restore();
    }

    /** Draws deterministic tire tread tracks with varied profiles.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Slider amount; values above one increase track density.
     * @param {object} accent - Parsed RGB accent color (reserved for palette consistency).
     * @returns {void} Nothing.
     */
    function drawTireTracks(context, canvas, amount, accent) {
      const progress = dependencies.clamp(amount / 10, 0, 1);
      const trackCount = Math.max(4, Math.round(6 + progress * 28));
      context.save();
      const treadInk = `rgba(18,18,18,${0.18 + progress * 0.34})`;
      for (let band = 0; band < trackCount; band += 1) {
        const tireWidth = 12 + dependencies.seededNoise(band, 12, 0.21) * 18 + progress * 28;
        const treadStep = 8 + dependencies.seededNoise(band, 15, 0.31) * 8 + progress * 9;
        const trackGap = tireWidth * (0.56 + dependencies.seededNoise(band, 18, 0.41) * 0.3);
        const margin = tireWidth * 1.2;
        const centerBase = margin + dependencies.seededNoise(band, 91, 0.31) * Math.max(margin, canvas.width - margin * 2);
        const verticalShift = (dependencies.seededNoise(band, 77, 0.18) - 0.5) * canvas.height * 0.32;
        const profileType = Math.floor(dependencies.seededNoise(band, 66, 0.52) * 4);
        const trackOffsets = [-trackGap / 2, trackGap / 2];
        for (let trackIndex = 0; trackIndex < trackOffsets.length; trackIndex += 1) {
          const xBase = centerBase + trackOffsets[trackIndex];
          for (let y = -treadStep; y <= canvas.height + treadStep; y += treadStep) {
            const sweep = y + verticalShift;
            const sway = (
              Math.sin((sweep + trackIndex * 23 + band * 17) * (0.012 + dependencies.seededNoise(band, 22, 0.44) * 0.012))
              + Math.cos((sweep + band * 11) * (0.007 + dependencies.seededNoise(band, 24, 0.62) * 0.008)) * 0.9
            ) * (3 + progress * 15);
            const centerX = xBase + sway;
            const blockWidth = tireWidth * (0.18 + dependencies.seededNoise(band, y, 0.17) * 0.08);
            const blockHeight = treadStep * 0.84;
            context.fillStyle = treadInk;
            if (profileType === 0) {
              for (let lane = -1; lane <= 1; lane += 2) {
                const laneCenter = centerX + lane * tireWidth * 0.22;
                let lean = lane;
                if (trackIndex !== 0) {
                  lean *= -1;
                }
                context.save();
                context.translate(laneCenter, y + treadStep * 0.48);
                context.rotate((lean * 30 * Math.PI) / 180);
                context.fillRect(-blockWidth / 2, -blockHeight / 2, blockWidth, blockHeight);
                context.restore();
              }
              context.fillRect(centerX - tireWidth * 0.04, y + treadStep * 0.08, tireWidth * 0.08, treadStep * 0.74);
            } else if (profileType === 1) {
              for (let lane = -1; lane <= 1; lane += 1) {
                const laneCenter = centerX + lane * tireWidth * 0.16;
                let rotationDegrees = 0;
                if (lane !== 0) {
                  rotationDegrees = lane * 18;
                }
                context.save();
                context.translate(laneCenter, y + treadStep * 0.5);
                context.rotate((rotationDegrees * Math.PI) / 180);
                context.fillRect(-blockWidth * 0.42, -blockHeight / 2, blockWidth * 0.84, blockHeight);
                context.restore();
              }
            } else if (profileType === 2) {
              for (let lane = -2; lane <= 2; lane += 1) {
                const laneCenter = centerX + lane * tireWidth * 0.11;
                let rotationDegrees = 12;
                if (lane % 2 !== 0) {
                  rotationDegrees = -12;
                }
                context.save();
                context.translate(laneCenter, y + treadStep * 0.5);
                context.rotate((rotationDegrees * Math.PI) / 180);
                context.fillRect(-blockWidth * 0.18, -blockHeight / 2, blockWidth * 0.36, blockHeight);
                context.restore();
              }
            } else {
              for (let lane = -1; lane <= 1; lane += 2) {
                const laneCenter = centerX + lane * tireWidth * 0.24;
                context.save();
                context.translate(laneCenter, y + treadStep * 0.5);
                context.rotate((lane * 42 * Math.PI) / 180);
                context.fillRect(-blockWidth * 0.62, -blockHeight * 0.4, blockWidth * 1.24, blockHeight * 0.8);
                context.restore();
              }
              context.fillRect(centerX - tireWidth * 0.06, y + treadStep * 0.14, tireWidth * 0.12, treadStep * 0.64);
            }
            if ((Math.floor(y / treadStep) + trackIndex + band) % 3 === 0) {
              context.fillStyle = "rgba(18,18,18,0.04)";
              context.fillRect(centerX - tireWidth * 0.46, y + treadStep * 0.28, tireWidth * 0.92, treadStep * 0.14);
              context.fillStyle = treadInk;
            }
            if (dependencies.seededNoise(band, Math.floor(y / treadStep), trackIndex * 0.71) > 0.68) {
              context.fillStyle = "rgba(18,18,18,0.03)";
              context.fillRect(centerX - tireWidth * 0.5, y + treadStep * 0.04, tireWidth * 0.16, treadStep * 0.2);
              context.fillStyle = treadInk;
            }
          }
        }
      }
      context.restore();
    }

    /** Draws deterministic spiral fingerprint contours.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Slider amount for print count and line strength.
     * @param {object} dark - Parsed RGB line color.
     * @returns {void} Nothing.
     */
    function drawFingerprint(context, canvas, amount, dark) {
      const progress = dependencies.clamp(amount / 10, 0, 1);
      context.save();
      const printCount = Math.max(2, Math.round(3 + progress * 18));
      for (let print = 0; print < printCount; print += 1) {
        const anchorX = 0.16 + dependencies.seededNoise(print, 14, 0.21) * 0.68;
        const anchorY = 0.16 + dependencies.seededNoise(print, 28, 0.49) * 0.68;
        context.save();
        context.translate(canvas.width * anchorX, canvas.height * anchorY);
        context.rotate((dependencies.seededNoise(print, 35, 0.73) - 0.5) * Math.PI * 0.8);
        context.strokeStyle = dependencies.rgbaString(dark, 0.08 + progress * 0.18);
        context.lineWidth = 0.7 + progress * 1.25;
        const sizeBias = 0.045 + dependencies.seededNoise(print, 42, 0.93) * 0.1;
        const maxRadius = Math.min(canvas.width, canvas.height) * (sizeBias + progress * 0.08);
        for (let radius = 10; radius < maxRadius; radius += 4.2) {
          context.beginPath();
          for (let angle = 0; angle <= Math.PI * 3.6; angle += 0.055) {
            const spiral = angle * (2.8 + progress * 1.8);
            const wobble = Math.sin(angle * 3.2) * (2.8 + progress * 9) + Math.cos(angle * 1.8) * (1.4 + progress * 5);
            const x = Math.cos(angle) * (radius + wobble) + Math.cos(spiral) * (2.8 + progress * 6);
            const y = Math.sin(angle) * (radius * 0.84 + wobble * 0.5) + Math.sin(spiral) * (2.2 + progress * 5.5);
            if (angle === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }
          }
          context.stroke();
        }
        context.restore();
      }
      context.restore();
    }

    /** Draws topographic sinusoidal contour lines.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Slider amount for line spacing and amplitude.
     * @param {object} soft - Parsed RGB line color.
     * @returns {void} Nothing.
     */
    function drawTopoLines(context, canvas, amount, soft) {
      context.save();
      context.strokeStyle = dependencies.rgbaString(soft, 0.05 + amount * 0.14);
      context.lineWidth = 1 + amount * 1.5;
      const spacing = 26 - amount * 10;
      for (let baseY = spacing; baseY < canvas.height + spacing; baseY += spacing) {
        context.beginPath();
        for (let x = 0; x <= canvas.width; x += 18) {
          const y = baseY + Math.sin(x * 0.018 + baseY * 0.03) * (6 + amount * 14);
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

    /** Draws grouped five-line musical staff rows.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Slider amount controlling spacing and weight.
     * @param {object} dark - Parsed RGB line color.
     * @returns {void} Nothing.
     */
    function drawStaffLines(context, canvas, amount, dark) {
      context.save();
      context.strokeStyle = dependencies.rgbaString(dark, 0.05 + amount * 0.14);
      context.lineWidth = 1 + amount * 1.4;
      const groupGap = 64 + amount * 28;
      for (let start = 30; start < canvas.height; start += groupGap) {
        for (let line = 0; line < 5; line += 1) {
          const y = start + line * (8 + amount * 4);
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(canvas.width, y);
          context.stroke();
        }
      }
      context.restore();
    }

    /** Draws a tinted blueprint grid with horizontal and vertical lines.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Slider amount controlling grid spacing and tint.
     * @param {object} soft - Parsed RGB grid color.
     * @param {object} dark - Parsed RGB background tint.
     * @returns {void} Nothing.
     */
    function drawBlueprintGrid(context, canvas, amount, soft, dark) {
      context.save();
      context.fillStyle = dependencies.rgbaString(dark, 0.04 + amount * 0.1);
      context.fillRect(0, 0, canvas.width, canvas.height);
      dependencies.primitives.drawLinePattern(context, canvas, {
        spacing: Math.max(14, 42 - amount * 20),
        lineWidth: 1,
        angle: 0,
        color: dependencies.rgbaString(soft, 0.05 + amount * 0.12),
      });
      dependencies.primitives.drawLinePattern(context, canvas, {
        spacing: Math.max(14, 42 - amount * 20),
        lineWidth: 1,
        angle: 90,
        color: dependencies.rgbaString(soft, 0.05 + amount * 0.12),
      });
      context.restore();
    }

    /** Draws diagonal alternating zebra bands.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Slider amount controlling band spacing.
     * @returns {void} Nothing.
     */
    function drawZebraPattern(context, canvas, amount) {
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((-18 * Math.PI) / 180);
      const spacing = 26 + amount * 28;
      context.fillStyle = `rgba(255,255,255,${0.05 + amount * 0.14})`;
      for (let x = -canvas.width; x < canvas.width * 1.5; x += spacing) {
        context.fillRect(x, -canvas.height, spacing * 0.55, canvas.height * 2);
      }
      context.restore();
    }

    /** Draws circular perforations used by metallic and paper materials.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
     * @param {number} amount - Slider strength for spacing and hole radius.
     * @param {object} dark - Parsed RGB hole color.
     * @returns {void} Nothing.
     */
    function drawPerforatedPattern(context, canvas, amount, dark) {
      context.save();
      context.fillStyle = dependencies.rgbaString(dark, 0.05 + amount * 0.14);
      const spacing = Math.max(10, 28 - amount * 10);
      const radius = Math.max(2.2, 2 + amount * 4);
      for (let y = spacing / 2; y < canvas.height; y += spacing) {
        for (let x = spacing / 2; x < canvas.width; x += spacing) {
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.restore();
    }

    return Object.freeze({
      applyPatternEffects,
      drawTestPattern,
      drawDiamondMesh,
      drawTireTracks,
      drawFingerprint,
      drawTopoLines,
      drawStaffLines,
      drawBlueprintGrid,
      drawZebraPattern,
      drawPerforatedPattern,
    });
  }

  return Object.freeze({ createPatternEffects });
});
