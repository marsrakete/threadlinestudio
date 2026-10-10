(function (root, createLibrary) {
  "use strict";

  const library = createLibrary();
  if (typeof module === "object" && module.exports) {
    module.exports = library;
  }
  if (root) {
    root.ThreadlineCanvasEffects = library;
  }
})(globalThis, function () {
  "use strict";

  /** Creates canvas filters with explicit runtime and pixel-helper dependencies.
   * @param {{runtime: object, clamp: function(number, number, number): number, mix: function(number, number, number): number, smoothstep: function(number, number, number): number, morphology: object, filters: object, parseHexColor: function(string): object}} dependencies - Canvas runtime and reusable image helpers.
   * @returns {object} Frozen canvas-effect API.
   */
  function createCanvasEffects(dependencies) {
    if (!dependencies || !dependencies.runtime || typeof dependencies.clamp !== "function" || typeof dependencies.mix !== "function" || typeof dependencies.smoothstep !== "function" || !dependencies.morphology || !dependencies.filters || typeof dependencies.parseHexColor !== "function") {
      throw new TypeError("runtime, clamp, mix, smoothstep, morphology, filters, and parseHexColor dependencies are required.");
    }

    /** Applies a browser blur through a reusable scratch canvas.
     * @param {HTMLCanvasElement} canvas - Canvas to blur in place.
     * @param {number} strength - Blur radius in pixels.
     * @returns {void} Nothing.
     */
    function applyCanvasBlur(canvas, strength) {
      const copy = dependencies.runtime.getScratchCanvas(canvas.width, canvas.height);
      const copyContext = copy.getContext("2d");
      copyContext.filter = `blur(${strength}px)`;
      copyContext.clearRect(0, 0, copy.width, copy.height);
      copyContext.drawImage(canvas, 0, 0);
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(copy, 0, 0);
    }

    /** Convolves an image with a square kernel and blends the result in place.
     * @param {HTMLCanvasElement} canvas - Canvas whose pixels are convolved.
     * @param {number[]} kernel - Flat square convolution kernel.
     * @param {number} amount - Convolution blend amount.
     * @returns {void} Nothing.
     */
    function convolveCanvas(canvas, kernel, amount) {
      if (amount <= 0) {
        return;
      }
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = context.createImageData(canvas.width, canvas.height);
      const source = imageData.data;
      const destination = result.data;
      const side = Math.round(Math.sqrt(kernel.length));
      if (side * side !== kernel.length) {
        throw new RangeError("kernel must contain a square number of values.");
      }
      const half = Math.floor(side / 2);
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const destinationIndex = (y * canvas.width + x) * 4;
          for (let channel = 0; channel < 3; channel += 1) {
            let sum = 0;
            for (let kernelY = 0; kernelY < side; kernelY += 1) {
              for (let kernelX = 0; kernelX < side; kernelX += 1) {
                const pixelX = dependencies.clamp(x + kernelX - half, 0, canvas.width - 1);
                const pixelY = dependencies.clamp(y + kernelY - half, 0, canvas.height - 1);
                const sourceIndex = (pixelY * canvas.width + pixelX) * 4 + channel;
                sum += source[sourceIndex] * kernel[kernelY * side + kernelX];
              }
            }
            destination[destinationIndex + channel] = dependencies.clamp(
              dependencies.mix(source[destinationIndex + channel], sum, amount),
              0,
              255
            );
          }
          destination[destinationIndex + 3] = source[destinationIndex + 3];
        }
      }
      context.putImageData(result, 0, 0);
    }

    /** Blends grayscale pixels into a thresholded charcoal drawing.
     * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
     * @param {number} amount - Charcoal effect strength from zero to one.
     * @returns {void} Nothing.
     */
    function applyCharcoal(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      dependencies.filters.applyGrayscale(data, 1);
      for (let i = 0; i < data.length; i += 4) {
        const randomValue = dependencies.runtime.random();
        const gray = data[i];
        const noisy = dependencies.clamp(gray + (randomValue - 0.5) * (24 + amount * 48), 0, 255);
        let value = 18;
        if (noisy > 164) {
          value = 245;
        } else if (noisy > 112) {
          value = 132;
        } else if (noisy > 64) {
          value = 62;
        }
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }
      context.putImageData(imageData, 0, 0);
    }

    /** Posterizes pixels and emphasizes edges to create a comic-book look.
     * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
     * @param {number} amount - Comic effect strength from zero to one.
     * @returns {void} Nothing.
     */
    function applyComic(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      dependencies.filters.applyPosterize(imageData.data, Math.round(4 + amount * 6));
      context.putImageData(imageData, 0, 0);
      convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], amount);
    }

    /** Smooths neighboring colors by selecting each pixel's dominant intensity bucket.
     * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
     * @param {number} amount - Oil-paint effect strength from zero to one.
     * @returns {void} Nothing.
     */
    function applyOilPaint(canvas, amount) {
      const source = dependencies.runtime.cloneCanvas(canvas);
      const sourceContext = source.getContext("2d", { willReadFrequently: true });
      const sourceData = sourceContext.getImageData(0, 0, canvas.width, canvas.height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const destinationData = context.createImageData(canvas.width, canvas.height);
      const radius = Math.max(1, Math.round(1 + amount * 3));
      const levels = Math.max(4, Math.round(10 - amount * 4));

      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const buckets = new Array(levels).fill(null).map(function createBucket() {
            return { count: 0, r: 0, g: 0, b: 0 };
          });
          for (let kernelY = -radius; kernelY <= radius; kernelY += 1) {
            for (let kernelX = -radius; kernelX <= radius; kernelX += 1) {
              const pixelX = dependencies.clamp(x + kernelX, 0, canvas.width - 1);
              const pixelY = dependencies.clamp(y + kernelY, 0, canvas.height - 1);
              const index = (pixelY * canvas.width + pixelX) * 4;
              const gray = (sourceData.data[index] + sourceData.data[index + 1] + sourceData.data[index + 2]) / 3;
              const bucketIndex = dependencies.clamp(Math.floor((gray / 255) * (levels - 1)), 0, levels - 1);
              const bucket = buckets[bucketIndex];
              bucket.count += 1;
              bucket.r += sourceData.data[index];
              bucket.g += sourceData.data[index + 1];
              bucket.b += sourceData.data[index + 2];
            }
          }

          let dominant = buckets[0];
          for (const bucket of buckets) {
            if (bucket.count > dominant.count) {
              dominant = bucket;
            }
          }
          const outputIndex = (y * canvas.width + x) * 4;
          let red = sourceData.data[outputIndex];
          let green = sourceData.data[outputIndex + 1];
          let blue = sourceData.data[outputIndex + 2];
          if (dominant.count > 0) {
            red = dominant.r / dominant.count;
            green = dominant.g / dominant.count;
            blue = dominant.b / dominant.count;
          }
          destinationData.data[outputIndex] = dependencies.mix(sourceData.data[outputIndex], red, 0.22 + amount * 0.62);
          destinationData.data[outputIndex + 1] = dependencies.mix(sourceData.data[outputIndex + 1], green, 0.22 + amount * 0.62);
          destinationData.data[outputIndex + 2] = dependencies.mix(sourceData.data[outputIndex + 2], blue, 0.22 + amount * 0.62);
          destinationData.data[outputIndex + 3] = sourceData.data[outputIndex + 3];
        }
      }
      context.putImageData(destinationData, 0, 0);
    }

    /** Maps image luminance to a fixed pop-art palette and optionally emphasizes edges.
     * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
     * @param {number} amount - Pop-art effect strength from zero to one.
     * @param {string} overlayHex - Accent color in hexadecimal notation.
     * @returns {void} Nothing.
     */
    function applyPopArt(canvas, amount, overlayHex) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const accent = dependencies.parseHexColor(overlayHex);
      const palette = [
        { r: 18, g: 26, b: 31 },
        { r: 255, g: 241, b: 86 },
        { r: accent.r, g: accent.g, b: accent.b },
        { r: 60, g: 170, b: 255 },
        { r: 255, g: 113, b: 163 },
      ];

      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const band = dependencies.clamp(Math.floor((gray / 255) * palette.length), 0, palette.length - 1);
        const tone = palette[band];
        const mixAmount = 0.35 + amount * 0.55;
        data[i] = dependencies.mix(data[i], tone.r, mixAmount);
        data[i + 1] = dependencies.mix(data[i + 1], tone.g, mixAmount);
        data[i + 2] = dependencies.mix(data[i + 2], tone.b, mixAmount);
      }

      context.putImageData(imageData, 0, 0);
      if (amount > 0.18) {
        convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 0.12 + amount * 0.18);
      }
    }

    /** Reduces then enlarges the canvas to create pixelation.
     * @param {HTMLCanvasElement} canvas - Canvas to pixelate in place.
     * @param {number} amount - Integer pixelation scale requested by the UI.
     * @returns {void} Nothing.
     */
    function applyPixelate(canvas, amount) {
      const scale = dependencies.clamp(Math.round(amount), 1, 60);
      if (scale <= 1) {
        return;
      }
      const small = dependencies.runtime.getScratchCanvas(
        Math.max(1, Math.round(canvas.width / scale)),
        Math.max(1, Math.round(canvas.height / scale))
      );
      const smallContext = small.getContext("2d");
      smallContext.clearRect(0, 0, small.width, small.height);
      smallContext.imageSmoothingEnabled = true;
      smallContext.drawImage(canvas, 0, 0, small.width, small.height);
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(small, 0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
    }

    /** Offsets random horizontal slices using the injected runtime random source.
     * @param {HTMLCanvasElement} canvas - Canvas to glitch in place.
     * @param {number} amount - Glitch strength from zero to one.
     * @returns {void} Nothing.
     */
    function applyGlitch(canvas, amount) {
      const context = canvas.getContext("2d");
      const slices = Math.max(2, Math.round(12 * amount));
      for (let i = 0; i < slices; i += 1) {
        const y = dependencies.runtime.random() * canvas.height;
        const height = Math.max(4, dependencies.runtime.random() * canvas.height * 0.08);
        const offset = (dependencies.runtime.random() - 0.5) * canvas.width * 0.1 * amount;
        context.drawImage(canvas, 0, y, canvas.width, height, offset, y, canvas.width, height);
      }
    }

    /** Replaces the canvas with a monochrome halftone dot rendering.
     * @param {HTMLCanvasElement} canvas - Canvas to render in place.
     * @param {number} step - Slider value controlling dot spacing.
     * @returns {void} Nothing.
     */
    function applyHalftone(canvas, step) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const source = context.getImageData(0, 0, canvas.width, canvas.height);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#f4efe6";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const size = Math.max(4, 22 - step);
      for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
          const index = (y * canvas.width + x) * 4;
          const gray = (source.data[index] + source.data[index + 1] + source.data[index + 2]) / 3;
          const radius = (1 - gray / 255) * (size * 0.45);
          context.beginPath();
          context.fillStyle = "#101010";
          context.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
    }

    /** Converts the image to a paper-like contour drawing.
     * @param {HTMLCanvasElement} canvas - Canvas to trace in place.
     * @param {number} amount - Contour effect strength from zero to one.
     * @returns {void} Nothing.
     */
    function applyContourTracing(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const source = context.getImageData(0, 0, canvas.width, canvas.height);
      const output = context.createImageData(canvas.width, canvas.height);
      const gray = new Float32Array(canvas.width * canvas.height);
      for (let i = 0, pixel = 0; i < source.data.length; i += 4, pixel += 1) {
        gray[pixel] = 0.299 * source.data[i] + 0.587 * source.data[i + 1] + 0.114 * source.data[i + 2];
      }
      const paper = 250 - amount * 8;
      const lineStrength = 0.18 + amount * 0.58;
      const shadeStrength = 0.02 + amount * 0.14;
      const softThreshold = 18 - amount * 10;
      const edgeCeiling = 96 + amount * 84;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const index = y * canvas.width + x;
          const left = gray[y * canvas.width + Math.max(0, x - 1)];
          const right = gray[y * canvas.width + Math.min(canvas.width - 1, x + 1)];
          const top = gray[Math.max(0, y - 1) * canvas.width + x];
          const bottom = gray[Math.min(canvas.height - 1, y + 1) * canvas.width + x];
          const gradientX = right - left;
          const gradientY = bottom - top;
          const gradient = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
          const edge = dependencies.smoothstep(softThreshold, edgeCeiling, gradient);
          const luminanceShade = (255 - gray[index]) / 255;
          const tracedBase = dependencies.clamp(paper - edge * 205 * lineStrength - luminanceShade * 52 * shadeStrength, 18, 252);
          const traced = dependencies.clamp(dependencies.mix(gray[index], tracedBase, 0.22 + amount * 0.78), 18, 252);
          const outputIndex = index * 4;
          output.data[outputIndex] = traced;
          output.data[outputIndex + 1] = traced;
          output.data[outputIndex + 2] = traced;
          output.data[outputIndex + 3] = source.data[outputIndex + 3];
        }
      }
      context.putImageData(output, 0, 0);
      if (amount > 0.45) {
        convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], Math.min(0.06, amount * 0.03));
      }
    }

    /** Converts the image to grayscale blended linework using Sobel gradients.
     * @param {HTMLCanvasElement} canvas - Canvas to render in place.
     * @param {number} amount - Line blend strength; values above one add turbo intensity.
     * @returns {void} Nothing.
     */
    function applyLineBlend(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const base = context.getImageData(0, 0, canvas.width, canvas.height);
      const progress = dependencies.clamp(amount, 0, 1);
      const turbo = Math.max(0, amount - 1);
      const gray = toGrayscaleArray(base.data);
      let blurRadius = 2;
      if (amount < 0.5) {
        blurRadius = 1;
      }
      const blurred = boxBlurGray(gray, canvas.width, canvas.height, blurRadius);
      const gradient = computeSobelGradient(blurred, canvas.width, canvas.height);
      const softThreshold = 12 + progress * 28 + turbo * 6;
      const edgeCeiling = 58 + progress * 110 + turbo * 34;
      const low = 16 + (0.24 + progress * 0.7 + turbo * 0.16) * 22;
      const high = 48 + (0.24 + progress * 0.7 + turbo * 0.16) * 84;
      const paper = 246 - progress * 10 - turbo * 6;
      const lineStrength = 0.74 + progress * 0.5 + turbo * 0.14;
      const shadeStrength = 0.12 + progress * 0.18 + turbo * 0.06;
      for (let i = 0; i < base.data.length; i += 4) {
        const pixel = i / 4;
        const x = pixel % canvas.width;
        const y = Math.floor(pixel / canvas.width);
        const baseGray = (base.data[i] + base.data[i + 1] + base.data[i + 2]) / 3;
        const left = blurred[y * canvas.width + Math.max(0, x - 1)];
        const right = blurred[y * canvas.width + Math.min(canvas.width - 1, x + 1)];
        const top = blurred[Math.max(0, y - 1) * canvas.width + x];
        const bottom = blurred[Math.min(canvas.height - 1, y + 1) * canvas.width + x];
        const gradientX = right - left;
        const gradientY = bottom - top;
        const edgeMask = dependencies.smoothstep(softThreshold, edgeCeiling, gradient[pixel]);
        const edgeGray = dependencies.clamp(255 - edgeMask * 255, 0, 255);
        const embossGray = dependencies.clamp(128 + gradientX * 0.9 + gradientY * 0.7, 0, 255);
        const luminanceShade = (255 - gray[pixel]) / 255;
        const traceGray = dependencies.clamp(paper - edgeMask * 205 * lineStrength - luminanceShade * 52 * shadeStrength, 18, 252);
        const cannyMask = dependencies.smoothstep(low, high, gradient[pixel]);
        const cannyGray = dependencies.clamp(255 - cannyMask * 255, 0, 255);
        const composite = dependencies.clamp(
          traceGray * (0.64 + turbo * 0.08)
          + edgeGray * (0.11 + turbo * 0.02)
          + embossGray * (0.15 + turbo * 0.06)
          + cannyGray * (0.1 + turbo * 0.05),
          0,
          255
        );
        const mixed = dependencies.clamp(dependencies.mix(baseGray, composite, 0.22 + progress * 0.72 + turbo * 0.08), 0, 255);
        base.data[i] = mixed;
        base.data[i + 1] = mixed;
        base.data[i + 2] = mixed;
      }
      context.putImageData(base, 0, 0);
    }

    /** Applies Canny-like edge emphasis and blends it with the source image.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} amount - Edge strength from zero to one.
     * @returns {void} Nothing.
     */
    function applyCannyLikeEdges(canvas, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const source = context.getImageData(0, 0, canvas.width, canvas.height);
      const gray = toGrayscaleArray(source.data);
      let blurRadius = 2;
      if (amount < 0.45) {
        blurRadius = 1;
      }
      const blurred = boxBlurGray(gray, canvas.width, canvas.height, blurRadius);
      const gradient = computeSobelGradient(blurred, canvas.width, canvas.height);
      const output = source.data.slice();
      const low = 16 + amount * 22;
      const high = 48 + amount * 84;
      const mixAmount = 0.1 + amount * 0.5;
      for (let i = 0, pixel = 0; i < output.length; i += 4, pixel += 1) {
        const edge = dependencies.smoothstep(low, high, gradient[pixel]);
        const value = dependencies.clamp(255 - edge * 255, 0, 255);
        const mixed = dependencies.mix((output[i] + output[i + 1] + output[i + 2]) / 3, value, mixAmount);
        output[i] = mixed;
        output[i + 1] = mixed;
        output[i + 2] = mixed;
      }
      const result = context.createImageData(canvas.width, canvas.height);
      result.data.set(output);
      context.putImageData(result, 0, 0);
    }

    /** Applies a focus-centered circular sharp region over a blurred canvas.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {number} focusAmount - Normalized focus radius control.
     * @param {number} blurAmount - Blur radius in pixels.
     * @returns {void} Nothing.
     */
    function applyFocusBlur(canvas, focusAmount, blurAmount) {
      const context = canvas.getContext("2d");
      const sharpCopy = dependencies.runtime.getScratchCanvas(canvas.width, canvas.height);
      sharpCopy.getContext("2d").drawImage(canvas, 0, 0);
      const blurred = dependencies.runtime.getScratchCanvas(canvas.width, canvas.height);
      const blurredContext = blurred.getContext("2d");
      blurredContext.filter = `blur(${blurAmount}px)`;
      blurredContext.clearRect(0, 0, blurred.width, blurred.height);
      blurredContext.drawImage(canvas, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(blurred, 0, 0);
      const radius = Math.min(canvas.width, canvas.height) * dependencies.clamp(0.18 + focusAmount * 0.34, 0.2, 0.55);
      context.save();
      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      context.clip();
      context.drawImage(sharpCopy, 0, 0);
      context.restore();
    }

    /** Applies the configured morphology mode through the injected pixel processor.
     * @param {HTMLCanvasElement} canvas - Canvas to process in place.
     * @param {string} mode - Morphology operation name.
     * @param {number} amount - Effect strength from zero to one.
     * @returns {void} Nothing.
     */
    function applyMorphology(canvas, mode, amount) {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const source = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = dependencies.morphology.applyMorphology(source, canvas.width, canvas.height, mode, amount);
      context.putImageData(result, 0, 0);
    }

    /** Converts RGBA data into a floating-point luminance buffer.
     * @param {Uint8ClampedArray} data - RGBA pixel channels.
     * @returns {Float32Array} One luminance value per pixel.
     */
    function toGrayscaleArray(data) {
      const gray = new Float32Array(data.length / 4);
      for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
        gray[pixel] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      return gray;
    }

    /** Applies a square box blur to a single-channel image buffer.
     * @param {Float32Array} gray - Luminance values, one per pixel.
     * @param {number} width - Image width in pixels.
     * @param {number} height - Image height in pixels.
     * @param {number} radius - Neighborhood radius in pixels.
     * @returns {Float32Array} Blurred luminance values.
     */
    function boxBlurGray(gray, width, height, radius) {
      const output = new Float32Array(gray.length);
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          let sum = 0;
          let count = 0;
          for (let kernelY = -radius; kernelY <= radius; kernelY += 1) {
            for (let kernelX = -radius; kernelX <= radius; kernelX += 1) {
              const pixelX = dependencies.clamp(x + kernelX, 0, width - 1);
              const pixelY = dependencies.clamp(y + kernelY, 0, height - 1);
              sum += gray[pixelY * width + pixelX];
              count += 1;
            }
          }
          output[y * width + x] = sum / count;
        }
      }
      return output;
    }

    /** Calculates Sobel gradient magnitudes for a single-channel image.
     * @param {Float32Array} gray - Luminance values, one per pixel.
     * @param {number} width - Image width in pixels.
     * @param {number} height - Image height in pixels.
     * @returns {Float32Array} Gradient magnitude per pixel.
     */
    function computeSobelGradient(gray, width, height) {
      const gradient = new Float32Array(gray.length);
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const topLeft = gray[dependencies.clamp(y - 1, 0, height - 1) * width + dependencies.clamp(x - 1, 0, width - 1)];
          const topCenter = gray[dependencies.clamp(y - 1, 0, height - 1) * width + x];
          const topRight = gray[dependencies.clamp(y - 1, 0, height - 1) * width + dependencies.clamp(x + 1, 0, width - 1)];
          const middleLeft = gray[y * width + dependencies.clamp(x - 1, 0, width - 1)];
          const middleRight = gray[y * width + dependencies.clamp(x + 1, 0, width - 1)];
          const bottomLeft = gray[dependencies.clamp(y + 1, 0, height - 1) * width + dependencies.clamp(x - 1, 0, width - 1)];
          const bottomCenter = gray[dependencies.clamp(y + 1, 0, height - 1) * width + x];
          const bottomRight = gray[dependencies.clamp(y + 1, 0, height - 1) * width + dependencies.clamp(x + 1, 0, width - 1)];
          const gradientX = -topLeft + topRight - 2 * middleLeft + 2 * middleRight - bottomLeft + bottomRight;
          const gradientY = -topLeft - 2 * topCenter - topRight + bottomLeft + 2 * bottomCenter + bottomRight;
          gradient[y * width + x] = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
        }
      }
      return gradient;
    }

    return Object.freeze({
      applyCanvasBlur,
      convolveCanvas,
      applyCharcoal,
      applyComic,
      applyOilPaint,
      applyPopArt,
      applyPixelate,
      applyGlitch,
      applyHalftone,
      applyContourTracing,
      applyLineBlend,
      applyCannyLikeEdges,
      applyFocusBlur,
      applyMorphology,
    });
  }

  return Object.freeze({ createCanvasEffects });
});
