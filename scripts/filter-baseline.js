const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("@playwright/test");
const sharp = require("sharp");

const ROOT_DIR = path.resolve(__dirname, "..");
const CASES_PATH = path.join(ROOT_DIR, "tests", "filter-baseline-cases.json");
const BASELINE_PATH = path.join(ROOT_DIR, "tests", "fixtures", "filter-baseline.json");
const FIXTURE_PATH = "/tests/fixtures/filter-baseline-source.svg";
const FIXTURE_WIDTH = 256;
const FIXTURE_HEIGHT = 192;
const RANDOM_SEED = 87431;

/**
 * Returns the content type for a file served to the browser test.
 * @param {string} filePath - Absolute file path whose type is requested.
 * @returns {string} HTTP content type including a UTF-8 charset when applicable.
 */
function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  };
  let contentType = contentTypes[extension];
  if (!contentType) {
    contentType = "application/octet-stream";
  }
  return contentType;
}

/**
 * Serves files from the repository root to a local browser test.
 * @param {import('node:http').IncomingMessage} request - Incoming HTTP request.
 * @param {import('node:http').ServerResponse} response - HTTP response to populate.
 * @returns {Promise<void>} Resolves after a response has been sent.
 */
async function handleHttpRequest(request, response) {
  let requestUrl;
  try {
    requestUrl = new URL(request.url, "http://127.0.0.1");
  } catch (error) {
    response.writeHead(400);
    response.end("Invalid request URL");
    return;
  }

  let requestedPath;
  try {
    requestedPath = decodeURIComponent(requestUrl.pathname);
  } catch (error) {
    response.writeHead(400);
    response.end("Invalid request path");
    return;
  }

  let relativePath = requestedPath;
  if (relativePath === "/") {
    relativePath = "/index.html";
  }

  const filePath = path.resolve(ROOT_DIR, `.${relativePath}`);
  const isInsideRoot = filePath === ROOT_DIR || filePath.startsWith(`${ROOT_DIR}${path.sep}`);
  if (!isInsideRoot) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": getContentType(filePath) });
    response.end(content);
  } catch (error) {
    response.writeHead(404);
    response.end("Not found");
  }
}

/**
 * Starts an ephemeral HTTP server rooted at the project directory.
 * @returns {Promise<import('node:http').Server>} Listening server with an assigned port.
 */
async function startStaticServer() {
  const server = http.createServer(handleHttpRequest);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return server;
}

/**
 * Returns the local URL for the root page served by the test server.
 * @param {import('node:http').Server} server - Listening static server.
 * @returns {string} Root page URL.
 */
function getApplicationUrl(server) {
  const address = server.address();
  assert.ok(address && typeof address === "object", "Expected the test server to have a TCP address");
  return `http://127.0.0.1:${address.port}/`;
}

/**
 * Renders one configured effect scenario through the application's current effect pipeline.
 * @param {import('@playwright/test').Page} page - Initialized application page.
 * @param {{id: string, groups: Record<string, Record<string, number>>}} scenario - Group values to apply.
 * @returns {Promise<{width: number, height: number, pngDataUrl: string}>} Rendered canvas dimensions and PNG data URL.
 */
async function renderScenario(page, scenario) {
  return await page.evaluate(async function renderFilterScenario(input) {
    const { scenario: filterScenario, fixtureUrl, randomSeed } = input;
    const project = createDefaultProject();
    for (const [groupKey, values] of Object.entries(filterScenario.groups)) {
      if (!Object.prototype.hasOwnProperty.call(project, groupKey)) {
        throw new Error(`Unknown filter group in baseline case ${filterScenario.id}: ${groupKey}`);
      }
      for (const controlKey of Object.keys(values)) {
        if (!Object.prototype.hasOwnProperty.call(project[groupKey], controlKey)) {
          throw new Error(`Unknown filter control in baseline case ${filterScenario.id}: ${groupKey}.${controlKey}`);
        }
      }
      Object.assign(project[groupKey], values);
    }
    state.project = project;

    const sourceImage = new Image();
    sourceImage.src = fixtureUrl;
    await sourceImage.decode();

    const canvas = document.createElement("canvas");
    canvas.width = sourceImage.naturalWidth;
    canvas.height = sourceImage.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(sourceImage, 0, 0);

    const originalRandom = Math.random;
    let randomState = randomSeed >>> 0;

    /**
     * Produces deterministic pseudo-random values for filters that use Math.random.
     * @returns {number} Pseudo-random number in the half-open range from zero to one.
     */
    function seededRandom() {
      randomState = (randomState * 1664525 + 1013904223) >>> 0;
      return randomState / 4294967296;
    }

    try {
      Math.random = seededRandom;
      applyEffects(canvas, context);
    } finally {
      Math.random = originalRandom;
    }

    return {
      width: canvas.width,
      height: canvas.height,
      pngDataUrl: canvas.toDataURL("image/png"),
    };
  }, { scenario, fixtureUrl: FIXTURE_PATH, randomSeed: RANDOM_SEED });
}

/**
 * Computes a SHA-256 digest of decoded RGBA pixels, ignoring PNG encoder metadata.
 * @param {string} pngDataUrl - PNG data URL returned by the browser canvas.
 * @returns {Promise<{width: number, height: number, sha256: string}>} Pixel dimensions and digest.
 */
async function getPixelDigest(pngDataUrl) {
  const prefix = "data:image/png;base64,";
  assert.ok(pngDataUrl.startsWith(prefix), "Expected a PNG data URL from the filter canvas");
  const pngBuffer = Buffer.from(pngDataUrl.slice(prefix.length), "base64");
  const decoded = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const sha256 = createHash("sha256").update(decoded.data).digest("hex");
  return {
    width: decoded.info.width,
    height: decoded.info.height,
    sha256,
  };
}

/** Verifies campaign controls are created from metadata and translated in each shipped locale.
 * @param {import('@playwright/test').Page} page - Initialized application page.
 * @returns {Promise<void>} Resolves when campaign controls and translations match their contracts.
 */
async function verifyCampaignMetadataUi(page) {
  const result = await page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll('input[data-group="campaigns"]'));
    const pinktober = document.querySelector('input[data-group="campaigns"][data-key="pinktober"]');
    const movemberPosition = document.querySelector('input[data-group="campaigns"][data-key="movemberPositionX"]');
    const correctionControls = Array.from(document.querySelectorAll('input[data-group="corrections"]'));
    const brightness = document.querySelector('input[data-group="corrections"][data-key="brightness"]');
    const blur = document.querySelector('input[data-group="corrections"][data-key="blur"]');
    const styleControls = Array.from(document.querySelectorAll('input[data-group="styles"]'));
    const hueShift = document.querySelector('input[data-group="styles"][data-key="hueShift"]');
    const falseColor = document.querySelector('input[data-group="styles"][data-key="falseColor"]');
    const blackwhite = document.querySelector('input[data-group="styles"][data-key="blackwhite"]');
    const fxControls = Array.from(document.querySelectorAll('input[data-group="fx"]'));
    const lineBlend = document.querySelector('input[data-group="fx"][data-key="lineBlend"]');
    const morphologyControls = Array.from(document.querySelectorAll('input[data-group="morphology"]'));
    const dilation = document.querySelector('input[data-group="morphology"][data-key="dilation"]');
    const patternControls = Array.from(document.querySelectorAll('input[data-group="patterns"]'));
    const tireTracks = document.querySelector('input[data-group="patterns"][data-key="tireTracks"]');
    const materialControls = Array.from(document.querySelectorAll('input[data-group="materials"]'));
    const glassBottle = document.querySelector('input[data-group="materials"][data-key="bottleGlass"]');
    const perforatedMetal = document.querySelector('input[data-group="materials"][data-key="perforatedMetal"]');
    const atmosphereControls = Array.from(document.querySelectorAll('input[data-group="atmosphere"]'));
    const tvNoise = document.querySelector('input[data-group="atmosphere"][data-key="tvNoise"]');
    const filmGrain = document.querySelector('input[data-group="atmosphere"][data-key="grain"]');
    const artControls = Array.from(document.querySelectorAll('input[data-group="art"]'));
    const gridDecay = document.querySelector('input[data-group="art"][data-key="gridDecay"]');
    const artistsControls = Array.from(document.querySelectorAll('input[data-group="artists"]'));
    const mondriaan = document.querySelector('input[data-group="artists"][data-key="mondriaan"]');
    const graphicsControls = Array.from(document.querySelectorAll('input[data-group="graphics"]'));
    const roentgen = document.querySelector('input[data-group="graphics"][data-key="roentgen"]');
    const wordArtControls = Array.from(document.querySelectorAll('input[data-group="wordArt"]'));
    const textMosaic = document.querySelector('input[data-group="wordArt"][data-key="textMosaic"]');
    const fragmentControls = Array.from(document.querySelectorAll('input[data-group="fragment"]'));
    const tileSwap = document.querySelector('input[data-group="fragment"][data-key="tileSwap"]');
    const cutControls = Array.from(document.querySelectorAll('input[data-group="cut"]'));
    const punchCard = document.querySelector('input[data-group="cut"][data-key="punchCard"]');
    const morphControls = Array.from(document.querySelectorAll('input[data-group="morph"]'));
    const swirlMorph = document.querySelector('input[data-group="morph"][data-key="swirlMorph"]');
    if (!pinktober || !movemberPosition || !brightness || !blur || !hueShift || !falseColor || !blackwhite || !lineBlend || !dilation || !tireTracks || !glassBottle || !perforatedMetal || !tvNoise || !filmGrain || !gridDecay || !mondriaan || !roentgen || !textMosaic || !tileSwap || !punchCard || !swirlMorph) {
      throw new Error("Metadata-driven controls are missing.");
    }

    const originalPreference = state.settings.languagePreference;
    const labels = {};
    const correctionLabels = {};
    const styleLabels = {};
    const fxLabels = {};
    const morphologyLabels = {};
    const patternLabels = {};
    const materialLabels = {};
    const atmosphereLabels = {};
    const artLabels = {};
    const artistsLabels = {};
    const graphicsLabels = {};
    const wordArtLabels = {};
    const fragmentLabels = {};
    const cutLabels = {};
    const morphLabels = {};
    for (const language of ["de", "en", "fr"]) {
      state.settings.languagePreference = language;
      applyTranslations();
      labels[language] = pinktober.parentElement.querySelector("span").textContent.trim();
      correctionLabels[language] = brightness.parentElement.querySelector("span").textContent.trim();
      styleLabels[language] = hueShift.parentElement.querySelector("span").textContent.trim();
      fxLabels[language] = lineBlend.parentElement.querySelector("span").textContent.trim();
      morphologyLabels[language] = dilation.parentElement.querySelector("span").textContent.trim();
      patternLabels[language] = tireTracks.parentElement.querySelector("span").textContent.trim();
      materialLabels[language] = glassBottle.parentElement.querySelector("span").textContent.trim();
      atmosphereLabels[language] = tvNoise.parentElement.querySelector("span").textContent.trim();
      artLabels[language] = gridDecay.parentElement.querySelector("span").textContent.trim();
      artistsLabels[language] = mondriaan.parentElement.querySelector("span").textContent.trim();
      graphicsLabels[language] = roentgen.parentElement.querySelector("span").textContent.trim();
      wordArtLabels[language] = textMosaic.parentElement.querySelector("span").textContent.trim();
      fragmentLabels[language] = tileSwap.parentElement.querySelector("span").textContent.trim();
      cutLabels[language] = punchCard.parentElement.querySelector("span").textContent.trim();
      morphLabels[language] = swirlMorph.parentElement.querySelector("span").textContent.trim();
    }
    state.settings.languagePreference = originalPreference;
    applyTranslations();

    return {
      count: controls.length,
      correctionCount: correctionControls.length,
      styleCount: styleControls.length,
      fxCount: fxControls.length,
      morphologyCount: morphologyControls.length,
      patternCount: patternControls.length,
      materialCount: materialControls.length,
      atmosphereCount: atmosphereControls.length,
      artCount: artControls.length,
      artistsCount: artistsControls.length,
      graphicsCount: graphicsControls.length,
      wordArtCount: wordArtControls.length,
      fragmentCount: fragmentControls.length,
      cutCount: cutControls.length,
      morphCount: morphControls.length,
      styleMainFieldCount: document.querySelectorAll("#styleFields input[type=range]").length,
      colorFocusFieldCount: document.querySelectorAll("#colorFocusFields input[type=range]").length,
      campaignFieldCounts: {
        pinktober: document.querySelectorAll("#campaignPinkFields input[type=range]").length,
        pride: document.querySelectorAll("#campaignPrideFields input[type=range]").length,
        colors: document.querySelectorAll("#campaignColorFields input[type=range]").length,
        movember: document.querySelectorAll("#campaignMovemberFields input[type=range]").length,
        ribbon: document.querySelectorAll("#campaignRibbonFields input[type=range]").length,
      },
      pinktoberMin: pinktober.min,
      pinktoberMax: pinktober.max,
      pinktoberDefault: pinktober.value,
      movemberPositionMin: movemberPosition.min,
      movemberPositionMax: movemberPosition.max,
      blurMax: blur.max,
      hueShiftMin: hueShift.min,
      hueShiftMax: hueShift.max,
      blackwhiteMax: blackwhite.max,
      lineBlendMax: lineBlend.max,
      lineBlendMarkerClass: Array.from(lineBlend.parentElement.classList).find((className) => className === "field-very-strong") || "",
      falseColorMarkerClass: Array.from(falseColor.parentElement.classList).find((className) => className === "field-strong") || "",
      dilationMin: dilation.min,
      dilationMax: dilation.max,
      tireTracksMax: tireTracks.max,
      glassBottleMax: glassBottle.max,
      materialMarkerClass: Array.from(glassBottle.parentElement.classList).find((className) => className === "field-strong") || "",
      perforatedMetalMax: perforatedMetal.max,
      tvNoiseMax: tvNoise.max,
      atmosphereMarkerClass: Array.from(tvNoise.parentElement.classList).find((className) => className === "field-strong") || "",
      filmGrainMax: filmGrain.max,
      gridDecayMax: gridDecay.max,
      artMarkerClass: Array.from(gridDecay.parentElement.classList).find((className) => className === "field-very-strong") || "",
      artistsMarkerClass: Array.from(mondriaan.parentElement.classList).find((className) => className === "field-very-strong") || "",
      graphicsMarkerClass: Array.from(roentgen.parentElement.classList).find((className) => className === "field-very-strong") || "",
      wordArtMarkerClass: Array.from(textMosaic.parentElement.classList).find((className) => className === "field-very-strong") || "",
      fragmentMarkerClass: Array.from(tileSwap.parentElement.classList).find((className) => className === "field-very-strong") || "",
      cutMarkerClass: Array.from(punchCard.parentElement.classList).find((className) => className === "field-very-strong") || "",
      morphMarkerClass: Array.from(swirlMorph.parentElement.classList).find((className) => className === "field-very-strong") || "",
      labels,
      correctionLabels,
      styleLabels,
      fxLabels,
      morphologyLabels,
      patternLabels,
      materialLabels,
      atmosphereLabels,
      artLabels,
      artistsLabels,
      graphicsLabels,
      wordArtLabels,
      fragmentLabels,
      cutLabels,
      morphLabels,
    };
  });

  assert.equal(result.count, 11, "Expected all 11 campaign controls from the manifest");
  assert.equal(result.correctionCount, 7, "Expected all seven corrections controls from the manifest");
  assert.equal(result.styleCount, 25, "Expected all 25 style controls from the manifest");
  assert.equal(result.fxCount, 10, "Expected all ten FX controls from the manifest");
  assert.equal(result.morphologyCount, 7, "Expected all seven morphology controls from the manifest");
  assert.equal(result.patternCount, 17, "Expected all 17 pattern controls from the manifest");
  assert.equal(result.materialCount, 16, "Expected all 16 material controls from the manifest");
  assert.equal(result.atmosphereCount, 15, "Expected all 15 atmosphere controls from the manifest");
  assert.equal(result.artCount, 20, "Expected all 20 art controls from the manifest");
  assert.equal(result.artistsCount, 32, "Expected all 32 artist controls from the manifest");
  assert.equal(result.graphicsCount, 8, "Expected all eight graphics controls from the manifest");
  assert.equal(result.wordArtCount, 12, "Expected all twelve word-art controls from the manifest");
  assert.equal(result.fragmentCount, 4, "Expected all four fragment controls from the manifest");
  assert.equal(result.cutCount, 4, "Expected all four cut controls from the manifest");
  assert.equal(result.morphCount, 8, "Expected all eight morph controls from the manifest");
  assert.equal(result.styleMainFieldCount, 20, "Expected the non-focus style controls in the main fieldset");
  assert.equal(result.colorFocusFieldCount, 5, "Expected all five color-focus controls in their fieldset");
  assert.deepEqual(result.campaignFieldCounts, { pinktober: 1, pride: 2, colors: 2, movember: 4, ribbon: 2 });
  assert.equal(result.pinktoberMin, "0");
  assert.equal(result.pinktoberMax, "100");
  assert.equal(result.pinktoberDefault, "0");
  assert.equal(result.movemberPositionMin, "-100");
  assert.equal(result.movemberPositionMax, "100");
  assert.equal(result.blurMax, "18");
  assert.equal(result.hueShiftMin, "-180");
  assert.equal(result.hueShiftMax, "180");
  assert.equal(result.blackwhiteMax, "255");
  assert.equal(result.lineBlendMax, "1000");
  assert.equal(result.lineBlendMarkerClass, "field-very-strong");
  assert.equal(result.falseColorMarkerClass, "field-strong");
  assert.equal(result.dilationMin, "0");
  assert.equal(result.dilationMax, "100");
  assert.equal(result.tireTracksMax, "1000");
  assert.equal(result.glassBottleMax, "1000");
  assert.equal(result.materialMarkerClass, "field-strong");
  assert.equal(result.perforatedMetalMax, "100");
  assert.equal(result.tvNoiseMax, "1000");
  assert.equal(result.atmosphereMarkerClass, "field-strong");
  assert.equal(result.filmGrainMax, "100");
  assert.equal(result.gridDecayMax, "1000");
  assert.equal(result.artMarkerClass, "field-very-strong");
  assert.equal(result.artistsMarkerClass, "field-very-strong");
  assert.equal(result.graphicsMarkerClass, "field-very-strong");
  assert.equal(result.wordArtMarkerClass, "field-very-strong");
  assert.equal(result.fragmentMarkerClass, "field-very-strong");
  assert.equal(result.cutMarkerClass, "field-very-strong");
  assert.equal(result.morphMarkerClass, "field-very-strong");
  assert.equal(result.labels.de, "Pinktober · Brustkrebs-Awareness");
  assert.equal(result.labels.en, "Pinktober · Breast cancer awareness");
  assert.equal(result.labels.fr, "Octobre rose · Sensibilisation au cancer du sein");
  assert.equal(result.correctionLabels.de, "Helligkeit");
  assert.equal(result.correctionLabels.en, "Brightness");
  assert.equal(result.correctionLabels.fr, "Luminosité");
  assert.equal(result.styleLabels.de, "Farbton");
  assert.equal(result.styleLabels.en, "Hue");
  assert.equal(result.styleLabels.fr, "Teinte");
  assert.equal(result.fxLabels.de, "Bleistiftpause");
  assert.equal(result.fxLabels.en, "Pencil tracing");
  assert.equal(result.fxLabels.fr, "Calque au crayon");
  assert.equal(result.morphologyLabels.de, "Dilatation");
  assert.equal(result.morphologyLabels.en, "Dilation");
  assert.equal(result.morphologyLabels.fr, "Dilatation");
  assert.equal(result.patternLabels.de, "Reifenspuren");
  assert.equal(result.patternLabels.en, "Tire tracks");
  assert.equal(result.patternLabels.fr, "Traces de pneus");
  assert.equal(result.materialLabels.de, "Glasflasche");
  assert.equal(result.materialLabels.en, "Glass bottle");
  assert.equal(result.materialLabels.fr, "Bouteille en verre");
  assert.equal(result.atmosphereLabels.de, "Fernsehrauschen");
  assert.equal(result.atmosphereLabels.en, "TV noise");
  assert.equal(result.atmosphereLabels.fr, "Parasites TV");
  assert.equal(result.artLabels.de, "Rasterzerfall");
  assert.equal(result.artLabels.en, "Grid decay");
  assert.equal(result.artLabels.fr, "Désintégration de grille");
  assert.equal(result.artistsLabels.de, "Mondriaan");
  assert.equal(result.artistsLabels.en, "Mondriaan");
  assert.equal(result.artistsLabels.fr, "Mondriaan");
  assert.equal(result.graphicsLabels.de, "Röntgen");
  assert.equal(result.graphicsLabels.en, "X-ray");
  assert.equal(result.graphicsLabels.fr, "Rayons X");
  assert.equal(result.wordArtLabels.de, "Textmosaik");
  assert.equal(result.wordArtLabels.en, "Text mosaic");
  assert.equal(result.wordArtLabels.fr, "Mosaïque de texte");
  assert.equal(result.fragmentLabels.de, "Kacheln vertauschen");
  assert.equal(result.fragmentLabels.en, "Swap tiles");
  assert.equal(result.fragmentLabels.fr, "Échanger les tuiles");
  assert.equal(result.cutLabels.de, "Lochkarte");
  assert.equal(result.cutLabels.en, "Punch card");
  assert.equal(result.cutLabels.fr, "Carte perforée");
  assert.equal(result.morphLabels.de, "Wirbel");
  assert.equal(result.morphLabels.en, "Swirl");
  assert.equal(result.morphLabels.fr, "Tourbillon");
}

/**
 * Captures baseline digests for every configured representative filter scenario.
 * @param {import('@playwright/test').Page} page - Initialized application page.
 * @param {{id: string, groups: Record<string, Record<string, number>>}[]} scenarios - Scenario definitions.
 * @returns {Promise<{id: string, width: number, height: number, sha256: string}[]>} Ordered baseline entries.
 */
async function captureScenarios(page, scenarios) {
  const results = [];
  for (const scenario of scenarios) {
    const rendered = await renderScenario(page, scenario);
    const digest = await getPixelDigest(rendered.pngDataUrl);
    results.push({ id: scenario.id, ...digest });
    process.stdout.write(`Captured ${scenario.id}: ${digest.width}x${digest.height} ${digest.sha256}\n`);
  }

  const neutralResult = results.find((result) => result.id === "neutral");
  assert.ok(neutralResult, "Filter baseline must include the neutral scenario");
  for (const scenario of scenarios) {
    if (scenario.id !== "art") {
      continue;
    }
    const repeatedRender = await renderScenario(page, scenario);
    const repeatedDigest = await getPixelDigest(repeatedRender.pngDataUrl);
    const firstArtResult = results.find((result) => result.id === "art");
    assert.equal(repeatedDigest.sha256, firstArtResult.sha256, "Art filter output must be deterministic for identical inputs");
  }
  for (const result of results) {
    if (result.id === "neutral") {
      continue;
    }
    assert.notEqual(result.sha256, neutralResult.sha256, `Scenario ${result.id} did not change any output pixels`);
  }

  return results;
}

/**
 * Verifies current filter pixels against the committed baseline or rewrites it on explicit request.
 * @returns {Promise<void>} Resolves after validation or baseline update.
 */
async function main() {
  const scenarios = JSON.parse(await fs.readFile(CASES_PATH, "utf8"));
  assert.ok(Array.isArray(scenarios) && scenarios.length > 0, "Expected at least one filter baseline scenario");
  const scenarioIds = scenarios.map((scenario) => scenario.id);
  assert.equal(new Set(scenarioIds).size, scenarioIds.length, "Filter baseline scenario IDs must be unique");

  const fixtureMetadata = await sharp(path.join(ROOT_DIR, "tests", "fixtures", "filter-baseline-source.svg")).metadata();
  assert.equal(fixtureMetadata.width, FIXTURE_WIDTH, "Filter fixture width changed unexpectedly");
  assert.equal(fixtureMetadata.height, FIXTURE_HEIGHT, "Filter fixture height changed unexpectedly");

  const server = await startStaticServer();
  let browser;
  try {
    browser = await chromium.launch({ cwd: os.tmpdir(), headless: true });
    const context = await browser.newContext({
      serviceWorkers: "block",
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.route("https://**/*", (route) => route.abort());
    await page.goto(getApplicationUrl(server), { waitUntil: "load" });
    await page.waitForFunction(() => typeof applyEffects === "function" && typeof createDefaultProject === "function");
    await verifyCampaignMetadataUi(page);

    const cases = await captureScenarios(page, scenarios);
    assert.deepEqual(pageErrors, [], "The app raised browser page errors during filter baseline capture");

    const baseline = {
      schemaVersion: 1,
      platform: `${process.platform}-${process.arch}`,
      browser: await browser.version(),
      fixture: {
        path: "tests/fixtures/filter-baseline-source.svg",
        width: FIXTURE_WIDTH,
        height: FIXTURE_HEIGHT,
        randomSeed: RANDOM_SEED,
      },
      cases,
    };

    if (process.argv.includes("--update")) {
      await fs.writeFile(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
      process.stdout.write(`Updated ${path.relative(ROOT_DIR, BASELINE_PATH)}\n`);
      return;
    }

    const expected = JSON.parse(await fs.readFile(BASELINE_PATH, "utf8"));
    assert.equal(expected.platform, baseline.platform, "Baseline platform differs; review and explicitly update the references on this platform");
    assert.equal(expected.browser, baseline.browser, "Baseline Chromium version differs; review and explicitly update the references");
    assert.deepEqual(expected.fixture, baseline.fixture, "Filter baseline fixture configuration changed");
    assert.deepEqual(expected.cases, baseline.cases, "Filter output pixels changed; review the change before updating the baseline");
    process.stdout.write(`Filter baseline passed (${cases.length} scenarios, Chromium ${baseline.browser})\n`);
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
