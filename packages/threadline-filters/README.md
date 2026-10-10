# Threadline Studio Filter Library

Reusable, dependency-free RGBA pixel filters extracted from Threadline Studio.
Licensed under Apache-2.0; see [LICENSE](./LICENSE).

## Use in a browser

Load `index.js` before the application code for the standalone pixel API. It is
exposed as `globalThis.ThreadlineFilters` (or `window.ThreadlineFilters`) and
works with `Uint8ClampedArray` pixel buffers such as `ImageData.data`.

For the complete filter library, load the module scripts in the order used by
`index.html`, ending with `effects.js`. It publishes the frozen aggregate as
`globalThis.ThreadlineFilterEffects`, with the pixel API at `.filters` and the
Canvas renderer factories grouped by domain. Individual modules can be loaded
directly by their paths inside this repository.

## Use in Node.js

The pixel API includes `applyBasicAdjustments(data, corrections, hueShift)` for
in-place brightness, contrast, saturation, and hue changes, and
`applyGrain(data, amount, random)` for host-controlled grain.

```js
const filters = require("./packages/threadline-filters");
const metadata = require("./packages/threadline-filters/metadata-runtime");
```

These paths assume the Threadline Studio repository is the current project. From
another project, clone this repository and require the corresponding paths within
that checkout. For a sibling checkout named `threadlinestudio`, for example:

```js
const filters = require("../threadlinestudio/packages/threadline-filters");
const metadata = require("../threadlinestudio/packages/threadline-filters/metadata-runtime");
```

The library is intentionally private and is not published to npm.
An executable independent consumer example lives in
[`tests/fixtures/repository-consumer`](../../tests/fixtures/repository-consumer/README.md).

## Unified factory (initial API)

`factory.js` exports `createThreadlineFilters({ schemaVersion: 1, capabilities, adapters })`.
Pixel filters are always available as `.filters`. Campaigns and patterns need
no project-specific adapters. Atmosphere, materials, graphic styles,
composition, morphs, text, artist looks, and illustrative art are also wired
internally when the host provides a Canvas factory:

```js
const { createThreadlineFilters } = require("../threadlinestudio/packages/threadline-filters/factory");
const threadline = createThreadlineFilters({
  schemaVersion: 1,
  capabilities: {
    campaigns: true,
    patterns: true,
    atmosphere: true,
    materials: true,
    graphics: true,
    composition: true,
    morphs: true,
    text: true,
    artists: true,
    art: true,
  },
  canvas: { createCanvas: function createCanvas() { return document.createElement("canvas"); } },
});
```

For Canvas core, provide a Canvas factory and optionally a deterministic random
source. The library creates its runtime and morphology renderer internally:

```js
const threadline = createThreadlineFilters({
  schemaVersion: 1,
  capabilities: { canvas: true },
  canvas: { createCanvas: function createCanvas() { return document.createElement("canvas"); } },
  random: Math.random,
});
```

The factory supplies runtime, sampling, geometry, Canvas effects, primitives,
pixel operations, and color helpers internally for every family. Family
adapters remain optional overrides for host-specific behavior. The browser
build exposes the same factory as `ThreadlineFilterFactory` after `effects.js`
and `factory.js` have been loaded.

The returned object always contains `.filters` and a frozen `.capabilities`
map. `capabilities.pixel` is always `true`; optional families are `true` only
when enabled and successfully initialized. A disabled family has no renderer
property and its capability flag is `false`.

### Renderer call conventions

There is deliberately no universal `apply(image, filterId, values)` call yet:
the filter domains have distinct drawing semantics and input contracts. Hosts
should keep their UI/state mapping outside this library and call the matching
renderer API directly:

| API | Call shape | Behavior |
| --- | --- | --- |
| Pixel filters | `filters.applyGrayscale(imageData.data, amount)` | Mutates and returns the RGBA `Uint8ClampedArray`; alpha is preserved. |
| Campaign effects | `campaigns.applyRainbow(imageData.data, width, height, bandWidth, intensity)`; `applyMoustache(canvas, size, shape, offsetX, offsetY)`; `applyRibbon(canvas, ...)` | Pride mutates RGBA data; moustache/ribbon draw onto Canvas. See source JSDoc for each overlay's full arguments. |
| Pattern renderers | `patterns.applyPatternEffects(canvas, patternValues, palette)` | Draws enabled pattern controls in the established domain order. |
| Canvas effects | `canvas.applyPixelate(canvas, amount)` and related methods | Processes the provided canvas in place; the runtime is available as `.runtime`. |
| Other renderer families | `family.apply...(...)` | Use the family's documented method signature; its controller accepts a canvas, domain slider values, and palette where applicable. Required host helpers belong under `adapters.<family>`. |

Metadata manifests and locale dictionaries remain optional UI resources. The
factory does not read application settings, translate labels, select filter
order across domains, or persist slider values. Applications map their own
controls to manifest IDs/state keys and decide which domain renderers to call.

## Filter metadata contract

`metadata.schema.json` defines version 1 of the UI-neutral filter metadata
format. Load it from `./packages/threadline-filters/metadata.schema.json`.
Manifests describe a group and its filters; each filter has a stable ID,
translation keys, an optional performance classification, and one or more
range controls. Controls have stable IDs, a `stateKey` for mapping to existing
project settings, translation keys, minimum/maximum/step/default values, and an
optional unit. The metadata carries keys, not localized display text. Filter-level
`performance` values (`normal`, `strong`, or `veryStrong`) let consumers show
consistent cost hints without maintaining separate UI-side classification lists.
`metadata-runtime.js` exports `flattenFilterControls(manifest)` from
`./packages/threadline-filters/metadata-runtime` and as the browser global
`ThreadlineFilterMetadata`. It returns frozen, control-level records while
preserving filter IDs, persisted state keys, ranges, labels, and performance.
Consumers must also reject a maximum that is not greater than the minimum, a
default outside the inclusive range, and duplicate filter/control IDs.

The group manifests live beside the runtime in `packages/threadline-filters/`;
the German, English, and French dictionaries are in its `locales/` directory.
Each manifest maps controls to existing project setting keys.

Threadline Studio currently builds its campaign, correction, style, FX,
morphology, pattern, material, atmosphere, art, artist, graphics, word-art, fragment, cut, and morph controls from these manifests.

Each operation mutates and returns the input buffer. Alpha values are
preserved. Buffers must contain complete RGBA pixels. Amounts are normalized
to `0..1`, except posterize (`0..14`) and black/white threshold (`0..255`).
Duotone colors accept `#RGB` and `#RRGGBB`.

Pixel effects: `applyGrayscale`, `applyBlackWhite`, `applySepia`,
`applyPosterize`, `applyVintage`, `applyDuotone`, `applyColorFocus`,
`applyColorSwap`, `applyWarmCoolFocus`, `applySplitTone`,
`applySaturationMask`, `applyGradientMap`, `applyFalseColor`,
`applyCrossProcess`, `applyHeatmap`, `applyPosterBlocks`, and
`applyLuminanceColor`, `applyColorSeparation`, `applyInvert`,
`applySilhouette`, `applyVignette`, `applyScanlines`, `applyOverlay`, and
`applyFrame`.

Color focus/swap and signed warm-cool/luminance options accept normalized
values; signed values range from `-1..1`. Palette filters require exactly three
valid hex colors.

Dimension-aware operations accept the RGBA buffer followed by width and height;
the buffer length must equal `width * height * 4`.

See [MODULARIZATION-ROADMAP.md](./MODULARIZATION-ROADMAP.md) for extraction
history, known verification limits, and release-readiness notes.

## Canvas runtime

`canvas-runtime.js` exports `createCanvasRuntime({ createCanvas, random })` for
reusable scratch-canvas allocation, canvas cloning, pool reset/release, and an
injected random source. The browser app provides its own DOM canvas factory;
other projects can provide `document.createElement`, `OffscreenCanvas`, or a
test double. The runtime itself does not read DOM or global application state.

`canvas-sampling.js` exports `createCanvasSampling({ getScratchCanvas, clamp })`.
It creates downsampled RGBA sources with original dimensions, maps original
canvas coordinates to sampled byte indices/channels, and reads a clamped
full-resolution pixel channel. When a host supplies
`canvas.createCanvas`, the unified factory creates this sampling API and exposes
it as `.sampling`, also injecting its helpers into enabled renderer families.

`canvas-geometry.js` exports `createCanvasGeometry({ seededNoise })` with
quadratic and `arcTo` rounded rectangles, ellipse/hexagon/notched die-cut paths,
and deterministic organic blob paths. The factory exposes these shared helpers
as `.geometry` and injects them into effect families that use them.

`morphology-effects.js` exports `createMorphologyEffects({ createImageData,
clamp, mix })`. Its `applyMorphology(imageData, width, height, mode, amount)`
supports dilation, erosion, opening, closing, top-hat, and black-hat operations
without depending on browser globals.

`canvas-effects.js` exports `createCanvasEffects({ runtime, clamp, mix,
smoothstep, morphology, filters, parseHexColor })`. It contains reusable blur,
convolution, pixelation, glitch, halftone, contour, line-blend, focus-blur,
Canny-like edge, charcoal, comic, oil-paint, pop-art, and canvas morphology
operations. Canvas creation, scratch allocation, randomness, pixel operations,
color parsing, and the morphology pixel core are injected; project state and DOM
wiring remain outside.

`campaign-effects.js` exports `createCampaignEffects({ clamp, mix })` for the
Movember moustache, Pride rainbow pixel blend, awareness ribbon, and campaign
overlay availability check. It does not depend on project state or DOM globals.

`atmosphere-effects.js` exports `createAtmosphereEffects(...)` for TV noise,
CRT drift, JPEG artifacts, print misregistration, overexposure, light leaks,
dust/scratches, haze, shadows, reflections, moire, and double exposure. The
unified factory wires its Canvas, sampling, primitive, color, and random helpers
internally; hosts only provide `canvas.createCanvas`.

`canvas-primitives.js` provides reusable line, checker, dot, wave, and
randomized scratch drawing operations used across pattern, material, and
atmosphere renderers. It validates drawing dimensions and options before use.

`pattern-effects.js` exports `createPatternEffects(...)` for the pattern control
group and its specialized mesh, tire-track, fingerprint, topographic, staff,
blueprint, zebra, and test-pattern renderers. Shared line/checker/dot/wave
primitives and deterministic noise/color helpers are injected. Its perforation
renderer is also reused by the material controls.

`material-effects.js` exports `createMaterialEffects(...)` for glass, paper,
metal, and fabric renderers. It accepts canvas helpers, shared pattern drawing,
pixel operations, color parsing, and random generation through explicit
dependencies; `applyMaterialEffects(canvas, sliders, colors)` processes the
configured material controls in the application order.

`graphic-effects.js` exports `createGraphicEffects(...)` for Bauhaus, Brutalist,
Swiss poster, Kodachrome, daguerreotype, risograph, screenprint, and X-ray
looks. Sampling, color conversion, edge detection, Canvas copying, and random
generation are supplied by the host project.

`composition-effects.js` exports `createCompositionEffects(...)` for tile/strip
rearrangement, shards, patchwork, punch-card, perforation, die-cut, and paper-cut
renderers. Canvas copying, sampling, geometry paths, seeded noise, and color
helpers are injected by the consuming project.

`morph-effects.js` exports `createMorphEffects(...)` for swirl, melt, rubber
sheet, wave pull, pinch, bulge, crease, and crumple transforms. Its bilinear
pixel warp core and image sampling helpers are encapsulated in the module.

`text-effects.js` exports `createTextEffects(...)` for ASCII, text mosaic,
contour typography, relief/halftone lettering, line poetry, stamps, magazine
collage, slogans, matrix text, and word silhouettes. It accepts canvas sampling,
path, color, and scratch-canvas helpers from the host application.

`artist-effects.js` exports `createArtistEffects(...)` for the 34 painter- and
artist-inspired renderers. Canvas, sampling, color conversion, seeded noise,
scratch allocation, and organic path drawing remain host-injected.

`art-effects.js` exports `createArtEffects(...)` for collage, illustration,
ASCII, mosaic, marker, print, and other stylized art renderers. It uses injected
geometry, pixel, canvas, and deterministic random helpers.
