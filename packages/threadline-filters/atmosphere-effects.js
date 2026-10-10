(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineAtmosphereEffects = library;
  }
})(globalThis, function () {
  "use strict";

  /** Creates atmosphere renderers with explicit drawing and randomness dependencies.
   * @param {{clamp: function(number, number, number): number, getScratchCanvas: function(number, number): HTMLCanvasElement, applyPixelate: function(HTMLCanvasElement, number): void, drawLinePattern: function(CanvasRenderingContext2D, HTMLCanvasElement, object): void, drawScratches: function(CanvasRenderingContext2D, HTMLCanvasElement, number, function(): number): void, rgbaString: function(object, number): string, getPixelChannel: function(Uint8ClampedArray, number, number, number, number, number): number, seededNoise: function(number, number, number=): number, random: function(): number}} dependencies - Canvas and numeric helpers supplied by the consuming project.
   * @returns {object} Frozen public atmosphere API.
   */
  function createAtmosphereEffects(dependencies) {
    if (!dependencies || typeof dependencies.clamp !== "function" || typeof dependencies.getScratchCanvas !== "function" || typeof dependencies.applyPixelate !== "function" || typeof dependencies.drawLinePattern !== "function" || typeof dependencies.drawScratches !== "function" || typeof dependencies.rgbaString !== "function" || typeof dependencies.getPixelChannel !== "function" || typeof dependencies.seededNoise !== "function" || typeof dependencies.random !== "function") {
      throw new TypeError("All atmosphere renderer dependencies are required.");
    }

    /** Applies all configured atmosphere effects in the established app order.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {object} atmosphere - Atmosphere slider values.
     * @param {{accent: object, soft: object, dark: object}} colors - Pre-parsed RGB palette.
     * @returns {void} Nothing.
     */
    function applyAtmosphereEffects(canvas, atmosphere, colors) {
      const context = canvas.getContext("2d");
      if (atmosphere.tvNoise > 0) {
        applyTvNoise(canvas, curveThousand(atmosphere.tvNoise / 100, 1.35, 1));
      }
      if (atmosphere.crtDrift > 0) {
        applyCrtDrift(canvas, curveThousand(atmosphere.crtDrift / 100, 1.4, 1));
      }
      if (atmosphere.jpegArtifacts > 0) {
        applyJpegArtifacts(canvas, curveThousand(atmosphere.jpegArtifacts / 100, 1.32, 1));
      }
      if (atmosphere.printMisregister > 0) {
        applyPrintMisregister(canvas, curveThousand(atmosphere.printMisregister / 100, 1.45, 1));
      }
      if (atmosphere.overexposure > 0) {
        applyOverexposure(canvas, curveThousand(atmosphere.overexposure / 100, 1.4, 1));
      }
      if (atmosphere.lightLeak > 0) {
        drawLightLeak(context, canvas, curveThousand(atmosphere.lightLeak / 100, 1.35, 1), colors.accent, colors.soft);
      }
      if (atmosphere.dustScratches > 0) {
        drawDustAndScratches(context, canvas, curveThousand(atmosphere.dustScratches / 100, 1.45, 1));
      }
      if (atmosphere.haze > 0) {
        drawHaze(context, canvas, curveThousand(atmosphere.haze / 100, 1.35, 1), colors.soft);
      }
      if (atmosphere.shadowCast > 0) {
        drawShadowCast(context, canvas, curveThousand(atmosphere.shadowCast / 100, 1.4, 1));
      }
      if (atmosphere.reflections > 0) {
        drawReflections(context, canvas, curveThousand(atmosphere.reflections / 100, 1.35, 1), colors.soft);
      }
      if (atmosphere.moire > 0) {
        drawMoire(context, canvas, curveThousand(atmosphere.moire / 100, 1.45, 1), colors.dark);
      }
      if (atmosphere.doubleExposure > 0) {
        applyDoubleExposure(canvas, curveThousand(atmosphere.doubleExposure / 100, 1.35, 1));
      }
    }

    /** Applies random monochrome static to canvas pixels.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized static intensity.
     * @returns {void} Nothing.
     */
    function applyTvNoise(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (dependencies.random() - 0.5) * (50 + amount * 120);
        data[i] = dependencies.clamp(data[i] + noise, 0, 255);
        data[i + 1] = dependencies.clamp(data[i + 1] + noise, 0, 255);
        data[i + 2] = dependencies.clamp(data[i + 2] + noise, 0, 255);
      }
      context.putImageData(imageData, 0, 0);
    }

    /** Adds horizontally offset screen copies for CRT color drift.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized drift strength.
     * @returns {void} Nothing.
     */
    function applyCrtDrift(canvas, amount) {
      const context = canvas.getContext("2d");
      const copy = dependencies.getScratchCanvas(canvas.width, canvas.height);
      copy.getContext("2d").drawImage(canvas, 0, 0);
      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = 0.14 + amount * 0.18;
      context.drawImage(copy, -amount * 8, 0);
      context.drawImage(copy, amount * 6, 0);
      context.restore();
    }

    /** Applies block artifacts and seeded color corruption.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Artifact density; values above one increase block density.
     * @returns {void} Nothing.
     */
    function applyJpegArtifacts(canvas, amount) {
      const density = Math.max(0, amount);
      const strength = dependencies.clamp(amount, 0, 1);
      const block = Math.max(6, Math.round(8 + density * 10));
      dependencies.applyPixelate(canvas, block);

      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const corruptionChance = 0.02 + strength * 0.08;
      const macro = Math.max(4, Math.round(10 + density * 8));

      for (let y = 0; y < canvas.height; y += macro) {
        for (let x = 0; x < canvas.width; x += macro) {
          if (dependencies.seededNoise(x, y, 0.73) > corruptionChance) {
            continue;
          }
          const tintMode = dependencies.seededNoise(x, y, 1.91);
          for (let blockY = y; blockY < Math.min(canvas.height, y + macro); blockY += 1) {
            for (let blockX = x; blockX < Math.min(canvas.width, x + macro); blockX += 1) {
              const index = (blockY * canvas.width + blockX) * 4;
              if (tintMode > 0.68) {
                data[index] = dependencies.clamp(data[index] * 0.4, 0, 255);
                data[index + 1] = dependencies.clamp(data[index + 1] + 70 + strength * 70, 0, 255);
                data[index + 2] = dependencies.clamp(data[index + 2] * 0.45, 0, 255);
              } else if (tintMode > 0.4) {
                data[index] = dependencies.clamp(data[index] + 40 + strength * 40, 0, 255);
                data[index + 1] = dependencies.clamp(data[index + 1] * 0.55, 0, 255);
                data[index + 2] = dependencies.clamp(data[index + 2] + 18, 0, 255);
              } else {
                let direction = -1;
                if ((blockX + blockY) % 2 === 0) {
                  direction = 1;
                }
                const shift = direction * (12 + strength * 18);
                data[index] = dependencies.clamp(data[index] + shift, 0, 255);
                data[index + 1] = dependencies.clamp(data[index + 1] + shift * 0.4, 0, 255);
                data[index + 2] = dependencies.clamp(data[index + 2] - shift * 0.5, 0, 255);
              }
            }
          }
        }
      }
      context.putImageData(imageData, 0, 0);
    }

    /** Shifts red and blue channels in opposite directions.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized channel displacement strength.
     * @returns {void} Nothing.
     */
    function applyPrintMisregister(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const source = context.getImageData(0, 0, canvas.width, canvas.height);
      const output = context.createImageData(canvas.width, canvas.height);
      const shift = Math.max(1, Math.round(amount * 8));
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const index = (y * canvas.width + x) * 4;
          output.data[index] = dependencies.getPixelChannel(source.data, canvas.width, canvas.height, x - shift, y, 0);
          output.data[index + 1] = dependencies.getPixelChannel(source.data, canvas.width, canvas.height, x, y, 1);
          output.data[index + 2] = dependencies.getPixelChannel(source.data, canvas.width, canvas.height, x + shift, y, 2);
          output.data[index + 3] = source.data[index + 3];
        }
      }
      context.putImageData(output, 0, 0);
    }

    /** Increases exposure by lifting each RGB channel.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized exposure strength.
     * @returns {void} Nothing.
     */
    function applyOverexposure(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = dependencies.clamp(data[i] + 28 + amount * 70, 0, 255);
        data[i + 1] = dependencies.clamp(data[i + 1] + 28 + amount * 70, 0, 255);
        data[i + 2] = dependencies.clamp(data[i + 2] + 22 + amount * 56, 0, 255);
      }
      context.putImageData(imageData, 0, 0);
    }

    /** Draws a warm radial light leak.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Target canvas dimensions.
     * @param {number} amount - Normalized leak strength.
     * @param {object} accent - Primary RGB color.
     * @param {object} soft - Secondary RGB color.
     * @returns {void} Nothing.
     */
    function drawLightLeak(context, canvas, amount, accent, soft) {
      context.save();
      const gradient = context.createRadialGradient(
        canvas.width * (0.08 + amount * 0.25),
        canvas.height * 0.18,
        0,
        canvas.width * 0.18,
        canvas.height * 0.2,
        canvas.width * (0.2 + amount * 0.34)
      );
      gradient.addColorStop(0, dependencies.rgbaString(accent, 0.16 + amount * 0.28));
      gradient.addColorStop(0.6, dependencies.rgbaString(soft, 0.1 + amount * 0.18));
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }

    /** Draws random scratches and dust particles.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Target canvas dimensions.
     * @param {number} amount - Normalized dust density.
     * @returns {void} Nothing.
     */
    function drawDustAndScratches(context, canvas, amount) {
      dependencies.drawScratches(context, canvas, amount * 0.8, dependencies.random);
      context.save();
      const count = Math.round(80 + amount * 220);
      context.fillStyle = `rgba(255,255,255,${0.04 + amount * 0.14})`;
      for (let i = 0; i < count; i += 1) {
        const x = dependencies.random() * canvas.width;
        const y = dependencies.random() * canvas.height;
        const size = dependencies.random() * (1.5 + amount * 3.2);
        context.fillRect(x, y, size, size);
      }
      context.restore();
    }

    /** Draws a soft vertical haze gradient.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Target canvas dimensions.
     * @param {number} amount - Normalized haze strength.
     * @param {object} soft - RGB haze color.
     * @returns {void} Nothing.
     */
    function drawHaze(context, canvas, amount, soft) {
      context.save();
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, dependencies.rgbaString(soft, 0.04 + amount * 0.14));
      gradient.addColorStop(1, dependencies.rgbaString(soft, 0.14 + amount * 0.22));
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }

    /** Draws a directional shadow gradient.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Target canvas dimensions.
     * @param {number} amount - Normalized shadow strength.
     * @returns {void} Nothing.
     */
    function drawShadowCast(context, canvas, amount) {
      context.save();
      const gradient = context.createLinearGradient(canvas.width * 0.2, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${0.12 + amount * 0.28})`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }

    /** Draws reflective vertical light bands.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Target canvas dimensions.
     * @param {number} amount - Normalized reflection strength.
     * @param {object} soft - RGB reflection color.
     * @returns {void} Nothing.
     */
    function drawReflections(context, canvas, amount, soft) {
      context.save();
      const count = Math.round(2 + amount * 4);
      for (let i = 0; i < count; i += 1) {
        const x = canvas.width * (0.1 + i * 0.18);
        const gradient = context.createLinearGradient(x, 0, x + canvas.width * 0.18, canvas.height);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.45, dependencies.rgbaString(soft, 0.06 + amount * 0.14));
        gradient.addColorStop(0.55, dependencies.rgbaString(soft, 0.12 + amount * 0.2));
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = gradient;
        context.fillRect(x, 0, canvas.width * 0.2, canvas.height);
      }
      context.restore();
    }

    /** Draws two crossing line fields to create a moire pattern.
     * @param {CanvasRenderingContext2D} context - Canvas drawing context.
     * @param {HTMLCanvasElement} canvas - Target canvas dimensions.
     * @param {number} amount - Normalized moire strength.
     * @param {object} dark - RGB line color.
     * @returns {void} Nothing.
     */
    function drawMoire(context, canvas, amount, dark) {
      dependencies.drawLinePattern(context, canvas, {
        spacing: Math.max(6, 16 - amount * 6),
        lineWidth: 1,
        angle: 12,
        color: dependencies.rgbaString(dark, 0.03 + amount * 0.08),
      });
      dependencies.drawLinePattern(context, canvas, {
        spacing: Math.max(6, 15 - amount * 5),
        lineWidth: 1,
        angle: 15,
        color: dependencies.rgbaString(dark, 0.02 + amount * 0.06),
      });
    }

    /** Adds a shifted screen blend of the source canvas.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Normalized exposure displacement.
     * @returns {void} Nothing.
     */
    function applyDoubleExposure(canvas, amount) {
      const context = canvas.getContext("2d");
      const copy = dependencies.getScratchCanvas(canvas.width, canvas.height);
      copy.getContext("2d").drawImage(canvas, 0, 0);
      context.save();
      context.globalAlpha = 0.12 + amount * 0.28;
      context.globalCompositeOperation = "screen";
      context.drawImage(copy, canvas.width * (0.03 + amount * 0.05), -canvas.height * (0.02 + amount * 0.04));
      context.restore();
    }

    /** Maps a slider value through the app's eased 0-to-10 intensity curve.
     * @param {number} value - Normalized slider value.
     * @param {number} exponent - Curve exponent.
     * @param {number} maximum - Maximum output intensity.
     * @returns {number} Eased intensity value.
     */
    function curveThousand(value, exponent, maximum) {
      return Math.pow(dependencies.clamp(value / 10, 0, 1), exponent) * maximum;
    }

    return Object.freeze({ applyAtmosphereEffects });
  }

  return Object.freeze({ createAtmosphereEffects });
});
