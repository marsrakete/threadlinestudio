const I18N = window.THREADLINE_STUDIO_I18N || {};
const FILTER_METADATA = window.THREADLINE_FILTER_METADATA;
if (!FILTER_METADATA || !FILTER_METADATA.campaigns || !FILTER_METADATA.corrections || !FILTER_METADATA.styles || !FILTER_METADATA.fx || !FILTER_METADATA.morphology || !FILTER_METADATA.patterns || !FILTER_METADATA.materials || !FILTER_METADATA.atmosphere || !FILTER_METADATA.art || !FILTER_METADATA.artists || !FILTER_METADATA.graphics || !FILTER_METADATA.wordArt || !FILTER_METADATA.fragment || !FILTER_METADATA.cut || !FILTER_METADATA.morph || !FILTER_METADATA.locales) {
  throw new Error("Threadline Filter Metadata is not loaded.");
}
const FILTER_METADATA_LOCALES = FILTER_METADATA.locales;
const THREADLINE_FILTERS = window.ThreadlineFilters;
const THREADLINE_FILTER_METADATA_RUNTIME = window.ThreadlineFilterMetadata;
const THREADLINE_FILTER_FACTORY = window.ThreadlineFilterFactory;

if (!THREADLINE_FILTERS) {
  throw new Error("Threadline Filters Library is not loaded.");
}
if (!THREADLINE_FILTER_METADATA_RUNTIME) {
  throw new Error("Threadline Filter Metadata Runtime is not loaded.");
}
if (!THREADLINE_FILTER_FACTORY) {
  throw new Error("Threadline Filter Factory is not loaded.");
}
const STORAGE_KEY = "threadline-studio-project";
const PROJECT_STATE_KEY = "threadline-studio-project-state";
const PROJECT_SOURCE_KEY = "threadline-studio-project-source";
const SETTINGS_KEY = "threadline-studio-settings";
const LOCAL_SAVE_DEBOUNCE_MS = 320;
const APP_SHARE_TITLE = "Threadline Studio";
const APP_SHARE_URL = "https://marsrakete.github.io/threadlinestudio/";
const APP_SHARE_QR_ASSET = "./assets/threadline-studio-share-qr.svg";
const FALLBACK_VERSION_INFO = Object.freeze({
  appVersion: "0.2.73",
  cacheVersion: "v176",
  label: "Filterlibrary bleibt im Repository",
});
const DEFAULT_VERSION = Object.freeze(normalizeVersionInfo(globalThis.APP_VERSION_INFO || FALLBACK_VERSION_INFO));
const CURRENT_VERSION_INFO = DEFAULT_VERSION;

/** Converts a filter-group manifest to the app's existing slider configuration shape.
 * @param {object} manifest - Versioned group manifest with filter controls.
 * @returns {Array<object>} Control definitions with project state keys and defaults.
 */
function buildControlsFromMetadata(manifest) {
  const controls = [];
  const metadataControls = THREADLINE_FILTER_METADATA_RUNTIME.flattenFilterControls(manifest);
  for (const control of metadataControls) {
    controls.push({
      filterId: control.filterId,
      key: control.stateKey,
      min: control.min,
      max: control.max,
      step: control.step,
      value: control.defaultValue,
      label: control.labelKey,
      i18nKey: control.labelKey,
      performance: control.performance,
    });
  }
  return controls;
}

const CONTROL_GROUPS = {
  corrections: buildControlsFromMetadata(FILTER_METADATA.corrections),
  styles: buildControlsFromMetadata(FILTER_METADATA.styles),
  campaigns: buildControlsFromMetadata(FILTER_METADATA.campaigns),
  fx: buildControlsFromMetadata(FILTER_METADATA.fx),
  morphology: buildControlsFromMetadata(FILTER_METADATA.morphology),
  patterns: buildControlsFromMetadata(FILTER_METADATA.patterns),
  materials: buildControlsFromMetadata(FILTER_METADATA.materials),
  atmosphere: buildControlsFromMetadata(FILTER_METADATA.atmosphere),
  art: buildControlsFromMetadata(FILTER_METADATA.art),
  artists: buildControlsFromMetadata(FILTER_METADATA.artists),
  graphics: buildControlsFromMetadata(FILTER_METADATA.graphics),
  wordArt: buildControlsFromMetadata(FILTER_METADATA.wordArt),
  fragment: buildControlsFromMetadata(FILTER_METADATA.fragment),
  cut: buildControlsFromMetadata(FILTER_METADATA.cut),
  morph: buildControlsFromMetadata(FILTER_METADATA.morph),
};

const state = {
  versionInfo: { ...CURRENT_VERSION_INFO },
  settings: {
    languagePreference: "auto",
    themeMode: "dark",
    collapsiblePanels: {},
  },
  project: createDefaultProject(),
  deferredPrompt: null,
  sourceImage: null,
  sourceStorageDirty: false,
  saveTimer: 0,
  focusColorPickingTarget: "",
  renderQueued: false,
  previewWorkingCanvas: null,
  readmeText: "",
  updateInProgress: false,
  reloadInProgress: false,
};

/** Creates a canvas element for the injected rendering runtime.
 * @returns {HTMLCanvasElement} A detached canvas element.
 */
function createRuntimeCanvas() {
  return document.createElement("canvas");
}

/** Reads the current application random source so deterministic test overrides remain effective.
 * @returns {number} Random value in the half-open range from zero to one.
 */
function getRuntimeRandomValue() {
  return Math.random();
}

/** Creates a browser ImageData buffer for morphology results.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @returns {ImageData} Newly allocated RGBA image buffer.
 */
function createMorphologyImageData(width, height) {
  return new ImageData(width, height);
}

const threadlineLibrary = THREADLINE_FILTER_FACTORY.createThreadlineFilters({
  schemaVersion: 1,
  capabilities: {
    campaigns: true,
    canvas: true,
    atmosphere: true,
    patterns: true,
    materials: true,
    graphics: true,
    composition: true,
    morphs: true,
    text: true,
    artists: true,
    art: true,
  },
  canvas: { createCanvas: createRuntimeCanvas },
  random: getRuntimeRandomValue,
  adapters: {
    imageData: { createImageData: createMorphologyImageData },
  },
});
const canvasRuntime = threadlineLibrary.runtime;
const canvasSampling = threadlineLibrary.sampling;
const morphologyEffects = threadlineLibrary.morphology;
const canvasEffects = threadlineLibrary.canvas;
const campaignEffects = threadlineLibrary.campaigns;
const atmosphereEffects = threadlineLibrary.atmosphere;
const patternEffects = threadlineLibrary.patterns;
const materialEffects = threadlineLibrary.materials;
const graphicEffects = threadlineLibrary.graphics;
const compositionEffects = threadlineLibrary.composition;
const morphEffects = threadlineLibrary.morphs;
const textEffects = threadlineLibrary.text;
const artistEffects = threadlineLibrary.artists;
const artEffects = threadlineLibrary.art;

const els = {
  previewCanvas: document.getElementById("previewCanvas"),
  emptyState: document.getElementById("emptyState"),
  emptyBodyText: document.getElementById("emptyBodyText"),
  imageInput: document.getElementById("imageInput"),
  resetImageButton: document.getElementById("resetImageButton"),
  fitButton: document.getElementById("fitButton"),
  centerButton: document.getElementById("centerButton"),
  zoomInput: document.getElementById("zoomInput"),
  panXInput: document.getElementById("panXInput"),
  panYInput: document.getElementById("panYInput"),
  rotationInput: document.getElementById("rotationInput"),
  zoomValue: document.getElementById("zoomValue"),
  panXValue: document.getElementById("panXValue"),
  panYValue: document.getElementById("panYValue"),
  rotationValue: document.getElementById("rotationValue"),
  rotateLeftButton: document.getElementById("rotateLeftButton"),
  rotateRightButton: document.getElementById("rotateRightButton"),
  flipXButton: document.getElementById("flipXButton"),
  flipYButton: document.getElementById("flipYButton"),
  correctionFields: document.getElementById("correctionFields"),
  styleFields: document.getElementById("styleFields"),
  colorFocusFields: document.getElementById("colorFocusFields"),
  campaignPinkFields: document.getElementById("campaignPinkFields"),
  campaignPrideFields: document.getElementById("campaignPrideFields"),
  campaignColorFields: document.getElementById("campaignColorFields"),
  campaignMovemberFields: document.getElementById("campaignMovemberFields"),
  campaignRibbonFields: document.getElementById("campaignRibbonFields"),
  fxFields: document.getElementById("fxFields"),
  morphologyFields: document.getElementById("morphologyFields"),
  patternFields: document.getElementById("patternFields"),
  materialFields: document.getElementById("materialFields"),
  atmosphereFields: document.getElementById("atmosphereFields"),
  artFields: document.getElementById("artFields"),
  fragmentFields: document.getElementById("fragmentFields"),
  cutFields: document.getElementById("cutFields"),
  morphFields: document.getElementById("morphFields"),
  artistsFields: document.getElementById("artistsFields"),
  graphicsFields: document.getElementById("graphicsFields"),
  wordArtFields: document.getElementById("wordArtFields"),
  duotoneDarkInput: document.getElementById("duotoneDarkInput"),
  duotoneLightInput: document.getElementById("duotoneLightInput"),
  overlayColorInput: document.getElementById("overlayColorInput"),
  focusColorInput: document.getElementById("focusColorInput"),
  focusColor2Input: document.getElementById("focusColor2Input"),
  focusColorPickerButton: document.getElementById("focusColorPickerButton"),
  focusColor2PickerButton: document.getElementById("focusColor2PickerButton"),
  exportFormatSelect: document.getElementById("exportFormatSelect"),
  exportWidthSelect: document.getElementById("exportWidthSelect"),
  qualityInput: document.getElementById("qualityInput"),
  qualityValue: document.getElementById("qualityValue"),
  exportButton: document.getElementById("exportButton"),
  shareImageButton: document.getElementById("shareImageButton"),
  settingsButton: document.getElementById("settingsButton"),
  settingsDialog: document.getElementById("settingsDialog"),
  languageSelect: document.getElementById("languageSelect"),
  downloadBackupButton: document.getElementById("downloadBackupButton"),
  downloadBackupButtonDesktop: document.getElementById("downloadBackupButtonDesktop"),
  backupInput: document.getElementById("backupInput"),
  clearProjectButton: document.getElementById("clearProjectButton"),
  clearProjectButtonDesktop: document.getElementById("clearProjectButtonDesktop"),
  checkUpdateButton: document.getElementById("checkUpdateButton"),
  reloadAppButton: document.getElementById("reloadAppButton"),
  updateCheckStatus: document.getElementById("updateCheckStatus"),
  shareAppButton: document.getElementById("shareAppButton"),
  shareAppUrl: document.getElementById("shareAppUrl"),
  shareAppStatus: document.getElementById("shareAppStatus"),
  shareAppQr: document.getElementById("shareAppQr"),
  projectMetaText: document.getElementById("projectMetaText"),
  versionText: document.getElementById("versionText"),
  autosaveBadge: document.getElementById("autosaveBadge"),
  installButton: document.getElementById("installButton"),
  canvasFrame: document.getElementById("canvasFrame"),
  themeToggleButton: document.getElementById("themeToggleButton"),
  themeStatusNote: document.getElementById("themeStatusNote"),
  helpDialog: document.getElementById("helpDialog"),
  readmeStatus: document.getElementById("readmeStatus"),
  readmeContent: document.getElementById("readmeContent"),
  openReadmeButton: document.getElementById("openReadmeButton"),
  resetImageButtonDesktop: document.getElementById("resetImageButtonDesktop"),
  fitButtonDesktop: document.getElementById("fitButtonDesktop"),
  centerButtonDesktop: document.getElementById("centerButtonDesktop"),
  confirmDialog: document.getElementById("confirmDialog"),
  confirmDialogTitle: document.getElementById("confirmDialogTitle"),
  confirmDialogMessage: document.getElementById("confirmDialogMessage"),
  confirmCancelButton: document.getElementById("confirmCancelButton"),
  confirmAcceptButton: document.getElementById("confirmAcceptButton"),
};

init();

function init() {
  loadLocalState();
  buildControlFields();
  initializeCollapsiblePanels();
  bindEvents();
  loadVersionInfo();
  applyTranslations();
  syncUiFromState();
  restoreSourceImage();
  registerServiceWorker();
  render();
  window.setTimeout(() => checkForUpdates(false), 1200);
}

function markProjectSourceDirty() {
  state.sourceStorageDirty = true;
}

function initializeCollapsiblePanels() {
  applyResponsiveLayout();
  document.querySelectorAll(".collapsible").forEach((panel) => {
    const panelKey = getPanelStorageKey(panel);
    const savedState = state.settings.collapsiblePanels?.[panelKey];
    panel.open = typeof savedState === "boolean" ? savedState : !isMobileLayout();
    panel.addEventListener("toggle", () => {
      state.settings.collapsiblePanels[panelKey] = panel.open;
      scheduleLocalStateSave();
    });
  });
}

function getPanelStorageKey(panel) {
  return panel.id || panel.dataset.panelKey || panel.querySelector("h2")?.dataset?.i18n || "panel";
}

function applyResponsiveLayout() {
  document.body.classList.toggle("mobile-layout", isMobileLayout());
  document.body.classList.toggle("mobile-landscape", isMobileLandscape());
}

function isMobileLayout() {
  return window.innerWidth <= 1180 && window.innerHeight >= window.innerWidth;
}

function isMobileLandscape() {
  return window.innerWidth <= 1180 && window.innerWidth > window.innerHeight;
}

/** Creates the initial project state and defaults for each control group. Expects no parameters and returns a project object. */
function createDefaultProject() {
  return {
    meta: {
      name: "Untitled",
      revision: 0,
      updatedAt: new Date().toISOString(),
    },
    source: {
      dataUrl: "",
      fileName: "",
      mimeType: "",
    },
    transform: {
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
    },
    corrections: Object.fromEntries(CONTROL_GROUPS.corrections.map((control) => [control.key, control.value])),
    styles: Object.fromEntries(CONTROL_GROUPS.styles.map((control) => [control.key, control.value])),
    campaigns: Object.fromEntries(CONTROL_GROUPS.campaigns.map((control) => [control.key, control.value])),
    fx: Object.fromEntries(CONTROL_GROUPS.fx.map((control) => [control.key, control.value])),
    morphology: Object.fromEntries(CONTROL_GROUPS.morphology.map((control) => [control.key, control.value])),
    patterns: Object.fromEntries(CONTROL_GROUPS.patterns.map((control) => [control.key, control.value])),
    materials: Object.fromEntries(CONTROL_GROUPS.materials.map((control) => [control.key, control.value])),
    atmosphere: Object.fromEntries(CONTROL_GROUPS.atmosphere.map((control) => [control.key, control.value])),
    art: Object.fromEntries(CONTROL_GROUPS.art.map((control) => [control.key, control.value])),
    artists: Object.fromEntries(CONTROL_GROUPS.artists.map((control) => [control.key, control.value])),
    graphics: Object.fromEntries(CONTROL_GROUPS.graphics.map((control) => [control.key, control.value])),
    wordArt: Object.fromEntries(CONTROL_GROUPS.wordArt.map((control) => [control.key, control.value])),
    fragment: Object.fromEntries(CONTROL_GROUPS.fragment.map((control) => [control.key, control.value])),
    cut: Object.fromEntries(CONTROL_GROUPS.cut.map((control) => [control.key, control.value])),
    morph: Object.fromEntries(CONTROL_GROUPS.morph.map((control) => [control.key, control.value])),
    colors: {
      duotoneDark: "#111111",
      duotoneLight: "#f8d48f",
      overlayColor: "#ff6a3d",
      focusColor: "#ff3b30",
      focusColor2: "#ffd400",
    },
    export: {
      format: "png",
      width: 2400,
      quality: 0.92,
    },
  };
}

function buildControlFields() {
  renderControls(els.correctionFields, CONTROL_GROUPS.corrections, "corrections");
  const colorFocusFilterIds = ["color-focus-one", "color-focus-two", "color-swap"];
  renderControls(els.styleFields, CONTROL_GROUPS.styles.filter((control) => !colorFocusFilterIds.includes(control.filterId)), "styles");
  renderControls(els.colorFocusFields, getControlsByFilterIds(CONTROL_GROUPS.styles, colorFocusFilterIds), "styles");
  renderControls(els.campaignPinkFields, getControlsByFilterIds(CONTROL_GROUPS.campaigns, ["pinktober"]), "campaigns");
  renderControls(els.campaignPrideFields, getControlsByFilterIds(CONTROL_GROUPS.campaigns, ["pride"]), "campaigns");
  renderControls(els.campaignColorFields, getControlsByFilterIds(CONTROL_GROUPS.campaigns, ["earth-day", "orange-day"]), "campaigns");
  renderControls(els.campaignMovemberFields, getControlsByFilterIds(CONTROL_GROUPS.campaigns, ["movember"]), "campaigns");
  renderControls(els.campaignRibbonFields, getControlsByFilterIds(CONTROL_GROUPS.campaigns, ["awareness-ribbon"]), "campaigns");
  renderControls(els.fxFields, CONTROL_GROUPS.fx, "fx");
  renderControls(els.morphologyFields, CONTROL_GROUPS.morphology, "morphology");
  renderControls(els.patternFields, CONTROL_GROUPS.patterns, "patterns");
  renderControls(els.materialFields, CONTROL_GROUPS.materials, "materials");
  renderControls(els.atmosphereFields, CONTROL_GROUPS.atmosphere, "atmosphere");
  renderControls(els.artFields, CONTROL_GROUPS.art, "art");
  renderControls(els.wordArtFields, CONTROL_GROUPS.wordArt, "wordArt");
  renderControls(els.fragmentFields, CONTROL_GROUPS.fragment, "fragment");
  renderControls(els.cutFields, CONTROL_GROUPS.cut, "cut");
  renderControls(els.morphFields, CONTROL_GROUPS.morph, "morph");
  renderControls(els.artistsFields, CONTROL_GROUPS.artists, "artists");
  renderControls(els.graphicsFields, CONTROL_GROUPS.graphics, "graphics");
}

/** Renders controls from the shared HTML template. Expects a container, control definitions, and group key; returns nothing. */
function renderControls(container, controls, groupKey) {
  container.innerHTML = "";
  const template = document.getElementById("rangeControlTemplate");
  for (const control of controls) {
    const fragment = template.content.cloneNode(true);
    const label = fragment.querySelector("label");
    const intensityClass = getControlIntensityClass(control.performance);
    if (intensityClass) {
      label.classList.add(intensityClass);
    }
    const title = label.querySelector("span");
    title.dataset.controlI18n = control.i18nKey || "";
    title.dataset.controlFallback = control.label;
    title.textContent = control.i18nKey ? t(control.i18nKey) : control.label;
    const input = label.querySelector("input");
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
    input.value = String(control.value);
    input.dataset.group = groupKey;
    input.dataset.key = control.key;
    const output = label.querySelector("strong");
    output.id = `${groupKey}-${control.key}-value`;
    output.textContent = formatControlValue(control, control.value);
    container.append(fragment);
  }
}

/** Maps a filter performance level to its optional UI marker class.
 * @param {string} performance - Filter cost classification from its metadata.
 * @returns {string} CSS class for strong levels, or an empty string for normal filters.
 */
function getControlIntensityClass(performance) {
  if (performance === "veryStrong") {
    return "field-very-strong";
  }
  if (performance === "strong") {
    return "field-strong";
  }
  return "";
}

/** Selects app-layout controls by their stable manifest filter IDs.
 * @param {Array<object>} controls - Flattened controls from one metadata group.
 * @param {Array<string>} filterIds - Manifest filter IDs assigned to a UI fieldset.
 * @returns {Array<object>} Controls belonging to the requested filter IDs.
 */
function getControlsByFilterIds(controls, filterIds) {
  return controls.filter((control) => filterIds.includes(control.filterId));
}

function bindEvents() {
  els.imageInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (file) await loadImageFile(file);
    event.target.value = "";
  });

  els.canvasFrame.addEventListener("click", () => {
    if (!state.sourceImage && isMobileLayout()) {
      els.imageInput.click();
    }
  });

  document.querySelectorAll('input[type="range"][data-group]').forEach((input) => {
    input.addEventListener("input", handleControlInput);
  });

  [els.duotoneDarkInput, els.duotoneLightInput, els.overlayColorInput, els.focusColorInput, els.focusColor2Input].forEach((input) => {
    input.addEventListener("input", () => {
      state.project.colors.duotoneDark = els.duotoneDarkInput.value;
      state.project.colors.duotoneLight = els.duotoneLightInput.value;
      state.project.colors.overlayColor = els.overlayColorInput.value;
      state.project.colors.focusColor = els.focusColorInput.value;
      state.project.colors.focusColor2 = els.focusColor2Input.value;
      touchProject();
    });
  });

  els.focusColorPickerButton.addEventListener("click", () => {
    void activateFocusColorPicker("focusColor");
  });

  els.focusColor2PickerButton.addEventListener("click", () => {
    void activateFocusColorPicker("focusColor2");
  });

  [els.zoomInput, els.panXInput, els.panYInput, els.rotationInput].forEach((input) => {
    input.addEventListener("input", updateTransformFromInputs);
  });

  els.qualityInput.addEventListener("input", () => {
    state.project.export.quality = Number(els.qualityInput.value);
    syncUiFromState();
    scheduleLocalStateSave();
  });
  els.exportFormatSelect.addEventListener("change", () => {
    state.project.export.format = els.exportFormatSelect.value;
    scheduleLocalStateSave();
  });
  els.exportWidthSelect.addEventListener("change", () => {
    state.project.export.width = Number(els.exportWidthSelect.value);
    scheduleLocalStateSave();
  });

  els.rotateLeftButton.addEventListener("click", () => nudgeRotation(-90));
  els.rotateRightButton.addEventListener("click", () => nudgeRotation(90));
  els.flipXButton.addEventListener("click", () => {
    state.project.transform.flipX = !state.project.transform.flipX;
    touchProject();
  });
  els.flipYButton.addEventListener("click", () => {
    state.project.transform.flipY = !state.project.transform.flipY;
    touchProject();
  });
  els.fitButton.addEventListener("click", fitToFrame);
  els.fitButtonDesktop?.addEventListener("click", fitToFrame);
  els.centerButton.addEventListener("click", () => {
    state.project.transform.panX = 0;
    state.project.transform.panY = 0;
    touchProject();
  });
  els.centerButtonDesktop?.addEventListener("click", () => {
    state.project.transform.panX = 0;
    state.project.transform.panY = 0;
    touchProject();
  });
  els.resetImageButton.addEventListener("click", resetEffects);
  els.resetImageButtonDesktop?.addEventListener("click", resetEffects);
  els.exportButton.addEventListener("click", exportCurrentImage);
  els.shareImageButton.addEventListener("click", shareCurrentImage);
  els.settingsButton.addEventListener("click", () => {
    syncUiFromState();
    els.settingsDialog.showModal();
  });
  els.languageSelect.addEventListener("change", () => {
    state.settings.languagePreference = els.languageSelect.value;
    scheduleLocalStateSave();
    applyTranslations();
  });
  els.themeToggleButton.addEventListener("click", () => {
    state.settings.themeMode = state.settings.themeMode === "dark" ? "light" : "dark";
    applyTheme();
    scheduleLocalStateSave();
  });
  els.downloadBackupButton.addEventListener("click", downloadBackup);
  els.downloadBackupButtonDesktop?.addEventListener("click", downloadBackup);
  els.backupInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    importBackup(await file.text());
    event.target.value = "";
  });
  els.clearProjectButton.addEventListener("click", clearProject);
  els.clearProjectButtonDesktop?.addEventListener("click", clearProject);
  els.checkUpdateButton.addEventListener("click", () => checkForUpdates(true));
  els.shareAppButton?.addEventListener("click", () => {
    void shareAppRecommendation();
  });
  els.reloadAppButton.addEventListener("click", () => {
    void performAppReload();
  });
  els.openReadmeButton.addEventListener("click", () => {
    els.helpDialog.showModal();
    void loadReadmeContent();
  });
  els.installButton.addEventListener("click", async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    els.installButton.hidden = true;
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    els.installButton.hidden = false;
  });

  window.addEventListener("resize", () => {
    applyResponsiveLayout();
    syncUiFromState();
    queueRender();
  });

  window.addEventListener("pagehide", () => {
    flushLocalStateSave(true);
    releaseRenderBuffers();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushLocalStateSave(true);
      releaseRenderBuffers();
    }
  });

  bindCanvasGestures();
}

function bindCanvasGestures() {
  let dragStart = null;
  const activePointers = new Map();
  let pinchStart = null;

  const onPointerDown = (event) => {
      if (state.focusColorPickingTarget && state.sourceImage) {
        event.preventDefault();
        pickFocusColorFromPoint(event.clientX, event.clientY);
        return;
    }
    els.canvasFrame.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 1) {
      dragStart = {
        x: event.clientX,
        y: event.clientY,
        panX: state.project.transform.panX,
        panY: state.project.transform.panY,
      };
    } else if (activePointers.size === 2) {
      const points = [...activePointers.values()];
      pinchStart = {
        distance: getDistance(points[0], points[1]),
        zoom: state.project.transform.zoom,
      };
    }
  };

  const onPointerMove = (event) => {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (activePointers.size === 1 && dragStart) {
      const rect = els.canvasFrame.getBoundingClientRect();
      state.project.transform.panX = clamp(dragStart.panX + (event.clientX - dragStart.x) / rect.width, -1.25, 1.25);
      state.project.transform.panY = clamp(dragStart.panY + (event.clientY - dragStart.y) / rect.height, -1.25, 1.25);
      syncUiFromState();
      queueRender();
    } else if (activePointers.size === 2 && pinchStart) {
      const points = [...activePointers.values()];
      const nextDistance = getDistance(points[0], points[1]);
      state.project.transform.zoom = clamp(pinchStart.zoom * (nextDistance / Math.max(10, pinchStart.distance)), 0.5, 3);
      syncUiFromState();
      queueRender();
    }
  };

  const onPointerUp = (event) => {
    activePointers.delete(event.pointerId);
    if (activePointers.size === 0) {
      dragStart = null;
      pinchStart = null;
      scheduleLocalStateSave();
      render();
    } else if (activePointers.size === 1) {
      const [point] = [...activePointers.values()];
      dragStart = {
        x: point.x,
        y: point.y,
        panX: state.project.transform.panX,
        panY: state.project.transform.panY,
      };
      pinchStart = null;
    }
  };

  els.canvasFrame.addEventListener("pointerdown", onPointerDown);
  els.canvasFrame.addEventListener("pointermove", onPointerMove);
  els.canvasFrame.addEventListener("pointerup", onPointerUp);
  els.canvasFrame.addEventListener("pointercancel", onPointerUp);
  els.canvasFrame.addEventListener("wheel", (event) => {
    event.preventDefault();
    state.project.transform.zoom = clamp(state.project.transform.zoom - event.deltaY * 0.0015, 0.5, 3);
    syncUiFromState();
    touchProject();
  }, { passive: false });
}

async function loadImageFile(file) {
  releaseSourceImage();
  releaseRenderBuffers();
  const dataUrl = await readFileAsDataUrl(file);
  state.project.source = {
    dataUrl,
    fileName: file.name,
    mimeType: file.type || "image/png",
  };
  markProjectSourceDirty();
  await restoreSourceImage();
  fitToFrame();
}

async function restoreSourceImage() {
  if (!state.project.source.dataUrl) {
    releaseSourceImage();
    releaseRenderBuffers();
    syncUiFromState();
    render();
    return;
  }
  releaseSourceImage();
  const image = await loadImage(state.project.source.dataUrl);
  state.sourceImage = image;
  syncUiFromState();
  render();
}

function handleControlInput(event) {
  const input = event.currentTarget;
  const group = input.dataset.group;
  const key = input.dataset.key;
  state.project[group][key] = Number(input.value);
  const config = CONTROL_GROUPS[group].find((item) => item.key === key);
  document.getElementById(`${group}-${key}-value`).textContent = formatControlValue(config, Number(input.value));
  touchProject();
}

function pickFocusColorFromPoint(clientX, clientY) {
  const targetKey = state.focusColorPickingTarget || "focusColor";
  const rect = els.previewCanvas.getBoundingClientRect();
  const x = clamp(Math.round(((clientX - rect.left) / Math.max(1, rect.width)) * els.previewCanvas.width), 0, els.previewCanvas.width - 1);
  const y = clamp(Math.round(((clientY - rect.top) / Math.max(1, rect.height)) * els.previewCanvas.height), 0, els.previewCanvas.height - 1);
  const ctx = els.previewCanvas.getContext("2d", { willReadFrequently: true });
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  state.project.colors[targetKey] = rgbToHex(pixel[0], pixel[1], pixel[2]);
  state.focusColorPickingTarget = "";
  syncUiFromState();
  touchProject();
}

async function activateFocusColorPicker(targetKey) {
  if (shouldUseNativeEyeDropper()) {
    const picked = await openNativeEyeDropper(targetKey);
    if (picked) return;
  }
  toggleFocusColorPicker(targetKey);
}

function toggleFocusColorPicker(targetKey) {
  state.focusColorPickingTarget = state.focusColorPickingTarget === targetKey ? "" : targetKey;
  syncUiFromState();
}

function shouldUseNativeEyeDropper() {
  return typeof window.EyeDropper === "function" && window.isSecureContext && window.innerWidth <= 1180;
}

async function openNativeEyeDropper(targetKey) {
  try {
    state.focusColorPickingTarget = "";
    syncUiFromState();
    const eyeDropper = new window.EyeDropper();
    const result = await eyeDropper.open();
    if (!result?.sRGBHex) return false;
    state.project.colors[targetKey] = result.sRGBHex;
    syncUiFromState();
    touchProject();
    return true;
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.warn("EyeDropper fallback", error);
    }
    return false;
  }
}

function updateTransformFromInputs() {
  state.project.transform.zoom = Number(els.zoomInput.value);
  state.project.transform.panX = Number(els.panXInput.value);
  state.project.transform.panY = Number(els.panYInput.value);
  state.project.transform.rotation = Number(els.rotationInput.value);
  touchProject();
}

function fitToFrame() {
  state.project.transform.zoom = 1;
  state.project.transform.panX = 0;
  state.project.transform.panY = 0;
  state.project.transform.rotation = 0;
  state.project.transform.flipX = false;
  state.project.transform.flipY = false;
  touchProject();
}

function resetEffects() {
  const next = createDefaultProject();
  next.source = { ...state.project.source };
  next.meta.revision = state.project.meta.revision + 1;
  next.meta.updatedAt = new Date().toISOString();
  state.project = next;
  syncUiFromState();
  restoreSourceImage();
  scheduleLocalStateSave();
}

function nudgeRotation(delta) {
  state.project.transform.rotation = normalizeDegrees(state.project.transform.rotation + delta);
  touchProject();
}

function touchProject(skipRevision = false) {
  if (!skipRevision) {
    state.project.meta.revision += 1;
  }
  state.project.meta.updatedAt = new Date().toISOString();
  syncUiFromState();
  scheduleLocalStateSave();
  queueRender();
}

function queueRender() {
  if (state.renderQueued) return;
  state.renderQueued = true;
  requestAnimationFrame(() => {
    state.renderQueued = false;
    render();
  });
}

function getReusableCanvas(stateKey, width, height) {
  let canvas = state[stateKey];
  if (!canvas) {
    canvas = document.createElement("canvas");
    state[stateKey] = canvas;
  }
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  return canvas;
}

function releaseCanvas(canvas) {
  if (!canvas) return;
  canvas.width = 0;
  canvas.height = 0;
}

function releaseRenderBuffers() {
  releaseCanvas(state.previewWorkingCanvas);
  state.previewWorkingCanvas = null;
  canvasRuntime.release();
}

function releaseSourceImage() {
  if (!state.sourceImage) return;
  try {
    state.sourceImage.src = "";
  } catch {}
  state.sourceImage = null;
}

function resetScratchCanvases() {
  canvasRuntime.reset();
}

function getScratchCanvas(width, height) {
  return canvasRuntime.getScratchCanvas(width, height);
}

function render() {
  const canvas = els.previewCanvas;
  updateCanvasFrameAspectRatio();
  ensurePreviewCanvasSize();
  resetScratchCanvases();
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!state.sourceImage) {
    els.emptyState.hidden = false;
    ctx.fillStyle = "#090a0c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  els.emptyState.hidden = true;
  const workingCanvas = getReusableCanvas("previewWorkingCanvas", canvas.width, canvas.height);
  const workingCtx = workingCanvas.getContext("2d", { willReadFrequently: true });
  workingCtx.clearRect(0, 0, workingCanvas.width, workingCanvas.height);
  drawBaseImage(workingCtx, workingCanvas.width, workingCanvas.height);
  applyEffects(workingCanvas, workingCtx);
  ctx.drawImage(workingCanvas, 0, 0);
}

function ensurePreviewCanvasSize() {
  const canvas = els.previewCanvas;
  const rect = canvas.getBoundingClientRect();
  const aspect = getFrameAspectRatio();
  const displayWidth = Math.max(320, Math.round(rect.width || canvas.clientWidth || 800));
  const heavyFxActive = hasHeavyPreviewEffects();
  const isMobile = window.innerWidth <= 820;
  const deviceScale = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  const maxDimension = isMobile
    ? (heavyFxActive ? 640 : 840)
    : (heavyFxActive ? 900 : 1280);

  let targetWidth = Math.round(displayWidth * deviceScale);
  targetWidth = Math.min(targetWidth, maxDimension);
  const targetHeight = Math.round(targetWidth / aspect);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
}

function updateCanvasFrameAspectRatio() {
  els.canvasFrame.style.aspectRatio = state.sourceImage
    ? `${state.sourceImage.width} / ${state.sourceImage.height}`
    : "4 / 3";
}

function getFrameAspectRatio() {
  if (!state.sourceImage) return 4 / 3;
  return Math.max(0.3, state.sourceImage.width / Math.max(1, state.sourceImage.height));
}

function hasHeavyPreviewEffects() {
  const { styles, campaigns, fx, corrections } = state.project;
  return (
    fx.pencil > 0
    || fx.charcoal > 0
    || fx.comic > 0
    || fx.edges > 0
    || fx.emboss > 0
    || styles.halftone > 0
    || campaigns.pinktober > 0
    || hasCampaignOverlays(campaigns)
    || fx.backgroundBlur > 0
    || corrections.blur > 0
    || corrections.sharpen > 0
  );
}

function drawBaseImage(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = "#050607";
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);

  const { zoom, panX, panY, rotation, flipX, flipY } = state.project.transform;
  ctx.translate(panX * width * 0.45, panY * height * 0.45);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

  const image = state.sourceImage;
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  let drawWidth;
  let drawHeight;

  if (imageRatio > canvasRatio) {
    drawHeight = height * zoom;
    drawWidth = drawHeight * imageRatio;
  } else {
    drawWidth = width * zoom;
    drawHeight = drawWidth / imageRatio;
  }

  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

function applyEffects(canvas, ctx) {
  resetScratchCanvases();
  const { corrections, styles, campaigns, fx, morphology, patterns, materials, atmosphere, art, wordArt, fragment, cut, morph, artists, graphics, colors } = state.project;
  const edgeAmount = curveAmount(fx.edges / 100, isMobileLayout() ? 1.9 : 1.55, 0.34);
  const embossAmount = curveAmount(fx.emboss / 100, isMobileLayout() ? 1.95 : 1.6, 0.3);
  const pencilAmount = curveAmount(fx.pencil / 100, isMobileLayout() ? 1.55 : 1.35, 1);
  const lineBlendAmount = curveThousand(fx.lineBlend / 100, isMobileLayout() ? 1.45 : 1.25, 1);
  const charcoalAmount = curveAmount(fx.charcoal / 100, isMobileLayout() ? 2.25 : 1.8, 0.72);
  const comicAmount = curveAmount(fx.comic / 100, isMobileLayout() ? 2.25 : 1.85, 0.32);
  const focusBlurAmount = curveAmount(corrections.backgroundBlur / 32, isMobileLayout() ? 1.7 : 1.35, 1) * 18;
  const needsInitialPixelPass = (
    corrections.brightness !== 0
    || corrections.contrast !== 0
    || corrections.saturation !== 0
    || (styles.hueShift || 0) !== 0
    || styles.colorFocus1 > 0
    || styles.colorFocus2 > 0
    || styles.colorSwap > 0
    || styles.warmCool !== 0
    || styles.grayscale > 0
    || styles.blackwhite > 0
    || styles.sepia > 0
    || styles.posterize > 0
    || styles.vintage > 0
    || styles.duotone > 0
    || campaigns.pinktober > 0
    || campaigns.prideIntensity > 0
    || campaigns.earthDay > 0
    || campaigns.orangeDay > 0
    || styles.splitTone > 0
    || styles.saturationMask > 0
    || styles.gradientMap > 0
    || styles.falseColor > 0
    || styles.crossProcess > 0
    || styles.heatmap > 0
    || styles.posterBlocks > 0
    || styles.luminanceColor !== 0
    || fx.invert > 0
    || fx.silhouette > 0
  );

  if (needsInitialPixelPass) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    THREADLINE_FILTERS.applyBasicAdjustments(data, corrections, styles.hueShift || 0);
    if (styles.colorFocus1 > 0) {
      applyColorFocus(data, styles.colorFocus1 / 100, colors.focusColor, styles.colorFocusTolerance1 / 100);
    }
    if (styles.colorFocus2 > 0) {
      applyColorFocus(data, styles.colorFocus2 / 100, colors.focusColor2, styles.colorFocusTolerance2 / 100);
    }
    if (styles.colorSwap > 0) {
      applyColorSwap(data, styles.colorSwap / 100, colors.focusColor, colors.focusColor2, styles.colorFocusTolerance1 / 100);
    }
    if (styles.warmCool !== 0) {
      applyWarmCoolFocus(data, styles.warmCool / 100);
    }
    if (styles.grayscale > 0) THREADLINE_FILTERS.applyGrayscale(data, styles.grayscale / 100);
    if (styles.blackwhite > 0) THREADLINE_FILTERS.applyBlackWhite(data, styles.blackwhite);
    if (styles.sepia > 0) THREADLINE_FILTERS.applySepia(data, styles.sepia / 100);
    if (styles.posterize > 0) THREADLINE_FILTERS.applyPosterize(data, styles.posterize);
    if (styles.vintage > 0) THREADLINE_FILTERS.applyVintage(data, styles.vintage / 100);
    if (styles.duotone > 0) THREADLINE_FILTERS.applyDuotone(data, styles.duotone / 100, colors.duotoneDark, colors.duotoneLight);
    if (campaigns.pinktober > 0) THREADLINE_FILTERS.applyDuotone(data, campaigns.pinktober / 100, "#46152f", "#ff8fbd");
    if (campaigns.prideIntensity > 0) {
      applyCampaignRainbow(data, canvas.width, canvas.height, campaigns.prideWidth / 100, campaigns.prideIntensity / 100);
    }
    if (campaigns.earthDay > 0) THREADLINE_FILTERS.applyDuotone(data, campaigns.earthDay / 100, "#123d50", "#7ecb78");
    if (campaigns.orangeDay > 0) THREADLINE_FILTERS.applyDuotone(data, campaigns.orangeDay / 100, "#4a2418", "#ff9b32");
    if (styles.splitTone > 0) applySplitTone(data, styles.splitTone / 100, colors.duotoneDark, colors.duotoneLight);
    if (styles.saturationMask > 0) applySaturationMask(data, styles.saturationMask / 100);
    if (styles.gradientMap > 0) applyGradientMap(data, styles.gradientMap / 100, [colors.duotoneDark, colors.overlayColor, colors.duotoneLight]);
    if (styles.falseColor > 0) applyFalseColor(data, styles.falseColor / 100, [colors.duotoneDark, colors.overlayColor, colors.duotoneLight]);
    if (styles.crossProcess > 0) applyCrossProcess(data, styles.crossProcess / 100);
    if (styles.heatmap > 0) applyHeatmap(data, styles.heatmap / 100);
    if (styles.posterBlocks > 0) applyPosterBlocks(data, styles.posterBlocks / 100);
    if (styles.luminanceColor !== 0) applyLuminanceColor(data, styles.luminanceColor / 100);
    if (fx.invert > 0) applyInvert(data, fx.invert / 100);
    if (fx.silhouette > 0) applySilhouette(data, fx.silhouette / 100);

    ctx.putImageData(imageData, 0, 0);
  }

  if (corrections.blur > 0) applyCanvasBlur(canvas, corrections.blur);
  if (focusBlurAmount > 0.1) applyFocusBlur(canvas, corrections.focusCenter / 100 || 0.65, focusBlurAmount);
  if (corrections.sharpen > 0) {
    convolveCanvas(canvas, [0, -1, 0, -1, 5 + corrections.sharpen, -1, 0, -1, 0], 0.28 * corrections.sharpen);
  }
  if (edgeAmount > 0.001) convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], edgeAmount);
  if (embossAmount > 0.001) convolveCanvas(canvas, [-2, -1, 0, -1, 1, 1, 0, 1, 2], embossAmount);
  if (pencilAmount > 0.001) applyContourTracing(canvas, pencilAmount);
  if (lineBlendAmount > 0.001) applyLineBlend(canvas, lineBlendAmount);
  if (charcoalAmount > 0.001) applyCharcoal(canvas, charcoalAmount);
  if (comicAmount > 0.001) applyComic(canvas, comicAmount);
  if (styles.oilPaint > 0) applyOilPaint(canvas, styles.oilPaint / 100);
  if (styles.popArt > 0) applyPopArt(canvas, styles.popArt / 100, colors.overlayColor);

  if (campaigns.movemberSize > 0) {
    applyCampaignMoustache(
      canvas,
      campaigns.movemberSize / 100,
      campaigns.movemberShape / 100,
      campaigns.movemberPositionX / 100,
      campaigns.movemberPositionY / 100,
    );
  }
  if (campaigns.ribbonSize > 0) applyCampaignRibbon(canvas, campaigns.ribbonSize / 100, campaigns.ribbonShape / 100);
  if (styles.halftone > 0) applyHalftone(canvas, styles.halftone);
  if (fx.pixelate > 0) applyPixelate(canvas, fx.pixelate);
  if (fx.glitch > 0) applyGlitch(canvas, fx.glitch / 100);
  applyMorphologyEffects(canvas, morphology);
  applyPatternEffects(canvas, patterns, colors);
  applyMaterialEffects(canvas, materials, colors);
  applyAtmosphereEffects(canvas, atmosphere, colors);
  applyArtEffects(canvas, art, colors);
  applyWordArtEffects(canvas, wordArt, colors);
  applyFragmentEffects(canvas, fragment, colors);
  applyCutEffects(canvas, cut, colors);
  applyMorphEffects(canvas, morph, colors);
  applyArtistEffects(canvas, artists, colors);
  applyGraphicStyleEffects(canvas, graphics, colors);

  const needsFinalPixelPass = (
    atmosphere.grain > 0
    || atmosphere.vignette > 0
    || atmosphere.scanlines > 0
    || styles.colorSeparation > 0
    || patterns.overlayOpacity > 0
    || patterns.frame > 0
  );

  if (needsFinalPixelPass) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (atmosphere.grain > 0) THREADLINE_FILTERS.applyGrain(data, atmosphere.grain / 100, canvasRuntime.random);
    if (atmosphere.vignette > 0) applyVignette(data, canvas.width, canvas.height, atmosphere.vignette / 100);
    if (atmosphere.scanlines > 0) applyScanlines(data, canvas.width, canvas.height, atmosphere.scanlines / 100);
    if (styles.colorSeparation > 0) applyColorSeparation(data, canvas.width, canvas.height, styles.colorSeparation / 100);
    if (patterns.overlayOpacity > 0) applyOverlay(data, colors.overlayColor, patterns.overlayOpacity / 100);
    if (patterns.frame > 0) applyFrame(data, canvas.width, canvas.height, patterns.frame / 100);

    ctx.putImageData(imageData, 0, 0);
  }
}

/** Draws the campaign moustache through the reusable campaign library.
 * @param {HTMLCanvasElement} canvas - Canvas to draw into.
 * @param {number} size - Normalized moustache size.
 * @param {number} shape - Normalized moustache shape.
 * @param {number} offsetX - Normalized horizontal offset from the center.
 * @param {number} offsetY - Normalized vertical offset from the default position.
 * @returns {void} Nothing.
 */
function applyCampaignMoustache(canvas, size, shape, offsetX, offsetY) {
  return campaignEffects.applyMoustache(canvas, size, shape, offsetX, offsetY);
}

/** Blends Pride rainbow bands through the reusable campaign library.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @param {number} bandWidth - Normalized width of each rainbow band.
 * @param {number} intensity - Normalized rainbow blend strength.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyCampaignRainbow(data, width, height, bandWidth, intensity) {
  return campaignEffects.applyRainbow(data, width, height, bandWidth, intensity);
}

/** Draws the awareness ribbon through the reusable campaign library.
 * @param {HTMLCanvasElement} canvas - Canvas to draw into.
 * @param {number} size - Normalized ribbon size.
 * @param {number} shape - Normalized ribbon style selector.
 * @returns {void} Nothing.
 */
function applyCampaignRibbon(canvas, size, shape) {
  return campaignEffects.applyRibbon(canvas, size, shape);
}

/** Checks whether an awareness overlay is active.
 * @param {{movemberSize: number, ribbonSize: number}} campaigns - Campaign slider values.
 * @returns {boolean} True when a moustache or ribbon is active.
 */
function hasCampaignOverlays(campaigns) {
  return campaignEffects.hasOverlays(campaigns);
}

/** Applies the reusable color-focus filter to pixel data.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @param {string} targetHex - Hex color whose hue should remain saturated.
 * @param {number} tolerance - Hue tolerance from zero to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyColorFocus(data, amount, targetHex, tolerance) {
  if (!targetHex || amount <= 0) return data;
  return THREADLINE_FILTERS.applyColorFocus(data, amount, targetHex, tolerance);
}

/** Applies the reusable source/target color-swap filter to pixel data.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @param {string} sourceHex - Source color in hex format.
 * @param {string} targetHex - Replacement color in hex format.
 * @param {number} tolerance - Hue tolerance from zero to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyColorSwap(data, amount, sourceHex, targetHex, tolerance) {
  if (!sourceHex || !targetHex) return;
  return THREADLINE_FILTERS.applyColorSwap(data, amount, sourceHex, targetHex, tolerance);
}

/** Applies the reusable warm/cool selective-color effect.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} signedAmount - Signed strength from minus one to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyWarmCoolFocus(data, signedAmount) {
  return THREADLINE_FILTERS.applyWarmCoolFocus(data, signedAmount);
}

/** Applies the reusable split-tone effect using shadow and highlight colors.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @param {string} shadowHex - Shadow color in hex format.
 * @param {string} highlightHex - Highlight color in hex format.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applySplitTone(data, amount, shadowHex, highlightHex) {
  return THREADLINE_FILTERS.applySplitTone(data, amount, shadowHex, highlightHex);
}

/** Applies the reusable saturation mask to pixel data.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applySaturationMask(data, amount) {
  return THREADLINE_FILTERS.applySaturationMask(data, amount);
}

/** Applies the reusable three-color gradient map to pixel data.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @param {string[]} paletteHexes - Three hex colors for shadows, midtones and highlights.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyGradientMap(data, amount, paletteHexes) {
  return THREADLINE_FILTERS.applyGradientMap(data, amount, paletteHexes);
}

/** Applies the reusable false-color palette effect to pixel data.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @param {string[]} paletteHexes - Three hex colors used by the palette map.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyFalseColor(data, amount, paletteHexes) {
  return THREADLINE_FILTERS.applyFalseColor(data, amount, paletteHexes);
}

/** Applies the reusable cross-processing channel curve.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyCrossProcess(data, amount) {
  return THREADLINE_FILTERS.applyCrossProcess(data, amount);
}

/** Applies the reusable thermal heatmap to pixel data.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyHeatmap(data, amount) {
  return THREADLINE_FILTERS.applyHeatmap(data, amount);
}

/** Applies the reusable poster-block quantization effect.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyPosterBlocks(data, amount) {
  return THREADLINE_FILTERS.applyPosterBlocks(data, amount);
}

/** Preserves chroma in selected tonal ranges using the reusable luminance filter.
 * @param {Uint8ClampedArray} data - Mutable RGBA pixel buffer.
 * @param {number} signedAmount - Signed tonal bias from minus one to one.
 * @returns {Uint8ClampedArray} The mutated pixel buffer.
 */
function applyLuminanceColor(data, signedAmount) {
  return THREADLINE_FILTERS.applyLuminanceColor(data, signedAmount);
}

/** Applies horizontal RGB channel separation to the RGBA image buffer.
 * @param {Uint8ClampedArray} data - Mutable RGBA buffer.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @param {number} amount - Normalized separation strength.
 * @returns {Uint8ClampedArray} The mutated buffer.
 */
function applyColorSeparation(data, width, height, amount) {
  return THREADLINE_FILTERS.applyColorSeparation(data, width, height, amount);
}

/** Applies a partial or full RGB inversion.
 * @param {Uint8ClampedArray} data - Mutable RGBA buffer.
 * @param {number} amount - Inversion strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated buffer.
 */
function applyInvert(data, amount) {
  return THREADLINE_FILTERS.applyInvert(data, amount);
}

/** Blends pixels toward black or white according to luminance.
 * @param {Uint8ClampedArray} data - Mutable RGBA buffer.
 * @param {number} amount - Effect strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated buffer.
 */
function applySilhouette(data, amount) {
  return THREADLINE_FILTERS.applySilhouette(data, amount);
}

/** Darkens pixels progressively toward image corners.
 * @param {Uint8ClampedArray} data - Mutable RGBA buffer.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @param {number} amount - Vignette strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated buffer.
 */
function applyVignette(data, width, height, amount) {
  return THREADLINE_FILTERS.applyVignette(data, width, height, amount);
}

/** Darkens every other image row to create scanlines.
 * @param {Uint8ClampedArray} data - Mutable RGBA buffer.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @param {number} amount - Scanline strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated buffer.
 */
function applyScanlines(data, width, height, amount) {
  return THREADLINE_FILTERS.applyScanlines(data, width, height, amount);
}

/** Blends a hex color into every pixel.
 * @param {Uint8ClampedArray} data - Mutable RGBA buffer.
 * @param {string} colorHex - Overlay color in hex format.
 * @param {number} amount - Overlay strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated buffer.
 */
function applyOverlay(data, colorHex, amount) {
  return THREADLINE_FILTERS.applyOverlay(data, colorHex, amount);
}

/** Adds a warm off-white frame around the image edges.
 * @param {Uint8ClampedArray} data - Mutable RGBA buffer.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @param {number} amount - Frame size strength from zero to one.
 * @returns {Uint8ClampedArray} The mutated buffer.
 */
function applyFrame(data, width, height, amount) {
  return THREADLINE_FILTERS.applyFrame(data, width, height, amount);
}

/** Applies the reusable blur effect to a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to blur in place.
 * @param {number} strength - Blur radius in pixels.
 * @returns {void} Nothing.
 */
function applyCanvasBlur(canvas, strength) {
  return canvasEffects.applyCanvasBlur(canvas, strength);
}

/** Applies a convolution kernel to a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to convolve in place.
 * @param {number[]} kernel - Flat square convolution kernel.
 * @param {number} amount - Convolution blend amount.
 * @returns {void} Nothing.
 */
function convolveCanvas(canvas, kernel, amount) {
  return canvasEffects.convolveCanvas(canvas, kernel, amount);
}

/** Applies pixelation to a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to pixelate in place.
 * @param {number} amount - Pixelation scale requested by the UI.
 * @returns {void} Nothing.
 */
function applyPixelate(canvas, amount) {
  return canvasEffects.applyPixelate(canvas, amount);
}

/** Applies a randomized slice displacement to a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to glitch in place.
 * @param {number} amount - Glitch strength from zero to one.
 * @returns {void} Nothing.
 */
function applyGlitch(canvas, amount) {
  return canvasEffects.applyGlitch(canvas, amount);
}

/** Renders a monochrome halftone version of a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to halftone in place.
 * @param {number} step - Slider value controlling dot spacing.
 * @returns {void} Nothing.
 */
function applyHalftone(canvas, step) {
  return canvasEffects.applyHalftone(canvas, step);
}

/** Renders a paper-like contour tracing of a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to trace in place.
 * @param {number} amount - Contour strength from zero to one.
 * @returns {void} Nothing.
 */
function applyContourTracing(canvas, amount) {
  return canvasEffects.applyContourTracing(canvas, amount);
}

/** Blends Sobel-based linework into a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {number} amount - Line strength; values above one add turbo intensity.
 * @returns {void} Nothing.
 */
function applyLineBlend(canvas, amount) {
  return canvasEffects.applyLineBlend(canvas, amount);
}

/** Applies the configured morphology filters to a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {object} morphology - Morphology settings from the current project.
 * @returns {void} Nothing.
 */
function applyMorphologyEffects(canvas, morphology) {
  const cannyAmount = curveAmount(morphology.canny / 100, isMobileLayout() ? 1.35 : 1.15, 1);
  const dilationAmount = curveAmount(morphology.dilation / 100, 1.1, 1);
  const erosionAmount = curveAmount(morphology.erosion / 100, 1.1, 1);
  const openingAmount = curveAmount(morphology.opening / 100, 1.15, 1);
  const closingAmount = curveAmount(morphology.closing / 100, 1.15, 1);
  const topHatAmount = curveAmount(morphology.topHat / 100, 1.05, 1);
  const blackHatAmount = curveAmount(morphology.blackHat / 100, 1.05, 1);

  if (cannyAmount > 0.001) applyCannyLikeEdges(canvas, cannyAmount);
  if (dilationAmount > 0.001) applyMorphologyMix(canvas, "dilate", dilationAmount);
  if (erosionAmount > 0.001) applyMorphologyMix(canvas, "erode", erosionAmount);
  if (openingAmount > 0.001) applyMorphologyMix(canvas, "open", openingAmount);
  if (closingAmount > 0.001) applyMorphologyMix(canvas, "close", closingAmount);
  if (topHatAmount > 0.001) applyMorphologyMix(canvas, "tophat", topHatAmount);
  if (blackHatAmount > 0.001) applyMorphologyMix(canvas, "blackhat", blackHatAmount);
}

/** Delegates charcoal rendering to the reusable Canvas effects library.
 * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
 * @param {number} amount - Charcoal effect strength from zero to one.
 * @returns {void} Nothing.
 */
function applyCharcoal(canvas, amount) {
  return canvasEffects.applyCharcoal(canvas, amount);
}

/** Delegates comic rendering to the reusable Canvas effects library.
 * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
 * @param {number} amount - Comic effect strength from zero to one.
 * @returns {void} Nothing.
 */
function applyComic(canvas, amount) {
  return canvasEffects.applyComic(canvas, amount);
}

/** Delegates oil-paint rendering to the reusable Canvas effects library.
 * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
 * @param {number} amount - Oil-paint effect strength from zero to one.
 * @returns {void} Nothing.
 */
function applyOilPaint(canvas, amount) {
  return canvasEffects.applyOilPaint(canvas, amount);
}

/** Delegates pop-art rendering to the reusable Canvas effects library.
 * @param {HTMLCanvasElement} canvas - Canvas to transform in place.
 * @param {number} amount - Pop-art effect strength from zero to one.
 * @param {string} overlayHex - Accent color in hexadecimal notation.
 * @returns {void} Nothing.
 */
function applyPopArt(canvas, amount, overlayHex) {
  return canvasEffects.applyPopArt(canvas, amount, overlayHex);
}

/** Applies Canny-like edge emphasis to a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {number} amount - Edge strength from zero to one.
 * @returns {void} Nothing.
 */
function applyCannyLikeEdges(canvas, amount) {
  return canvasEffects.applyCannyLikeEdges(canvas, amount);
}

/** Applies one morphology operation to a canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {string} mode - Morphology operation name.
 * @param {number} amount - Effect strength from zero to one.
 * @returns {void} Nothing.
 */
function applyMorphologyMix(canvas, mode, amount) {
  return canvasEffects.applyMorphology(canvas, mode, amount);
}

/** Applies focus-centered sharpness over a blurred canvas.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {number} focusAmount - Normalized focus-radius setting.
 * @param {number} blurAmount - Blur radius in pixels.
 * @returns {void} Nothing.
 */
function applyFocusBlur(canvas, focusAmount, blurAmount) {
  return canvasEffects.applyFocusBlur(canvas, focusAmount, blurAmount);
}

/** Delegates pattern rendering while keeping project state in the app layer.
 * @param {HTMLCanvasElement} canvas - Canvas to draw into.
 * @param {object} patterns - Pattern slider values.
 * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette settings.
 * @returns {void} Nothing.
 */
function applyPatternEffects(canvas, patterns, colors) {
  return patternEffects.applyPatternEffects(canvas, patterns, colors);
}

/** Delegates material rendering while keeping slider state in the application layer.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {object} materials - Material slider values.
 * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project palette settings.
 * @returns {void} Nothing.
 */
function applyMaterialEffects(canvas, materials, colors) {
  return materialEffects.applyMaterialEffects(canvas, materials, colors);
}

/** Delegates atmosphere rendering while translating project colors to RGB.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {object} atmosphere - Atmosphere slider values from the active project.
 * @param {{overlayColor: string, duotoneLight: string, duotoneDark: string}} colors - Project color settings.
 * @returns {void} Nothing.
 */
function applyAtmosphereEffects(canvas, atmosphere, colors) {
  return atmosphereEffects.applyAtmosphereEffects(canvas, atmosphere, {
    accent: hexToRgb(colors.overlayColor),
    soft: hexToRgb(colors.duotoneLight),
    dark: hexToRgb(colors.duotoneDark),
  });
}

/** Delegates illustrative art rendering to the reusable art-effects module.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {object} art - Art effect slider values.
 * @param {object} colors - Project palette settings.
 * @returns {void} Nothing.
 */
function applyArtEffects(canvas, art, colors) {
  return artEffects.applyArtEffects(canvas, art, colors);
}

function applyWordArtEffects(canvas, wordArt, colors) {
  return textEffects.applyWordArtEffects(canvas, wordArt, colors);
}

function applyFragmentEffects(canvas, fragment, colors) {
  return compositionEffects.applyFragmentEffects(canvas, fragment, colors);
}

/** Delegates cut rendering to the reusable composition module.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {object} cut - Cut slider values.
 * @param {object} colors - Project palette settings.
 * @returns {void} Nothing.
 */
function applyCutEffects(canvas, cut, colors) {
  return compositionEffects.applyCutEffects(canvas, cut, colors);
}

/** Delegates morph rendering to the reusable morph module.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {object} morph - Morph slider values.
 * @param {object} colors - Project palette settings.
 * @returns {void} Nothing.
 */
function applyMorphEffects(canvas, morph, colors) {
  return morphEffects.applyMorphEffects(canvas, morph, colors);
}

/** Delegates artist-look rendering to the reusable artist-effects module.
 * @param {HTMLCanvasElement} canvas - Canvas to process in place.
 * @param {object} artists - Artist-style slider values.
 * @param {object} colors - Project palette settings.
 * @returns {void} Nothing.
 */
function applyArtistEffects(canvas, artists, colors) {
  return artistEffects.applyArtistEffects(canvas, artists, colors);
}

function applyGraphicStyleEffects(canvas, graphics, colors) {
  return graphicEffects.applyGraphicStyleEffects(canvas, graphics, colors);
}

function invertImageData(data) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

/** Delegates reusable line drawing to the shared Canvas primitives module.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {{spacing: number, lineWidth: number, angle: number, color: string}} options - Line rendering settings.
 * @returns {void} Nothing.
 */
/** Delegates checkerboard drawing to the shared Canvas primitives module.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {{size: number, colorA: string, colorB: string}} options - Cell size and colors.
 * @returns {void} Nothing.
 */
function drawCheckerPattern(ctx, canvas, options) {
  return threadlineLibrary.primitives.drawCheckerPattern(ctx, canvas, options);
}

/** Delegates dot-grid drawing to the shared Canvas primitives module.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {{spacing: number, radius: number, color: string}} options - Dot spacing, radius, and color.
 * @returns {void} Nothing.
 */
function drawDotPattern(ctx, canvas, options) {
  return threadlineLibrary.primitives.drawDotPattern(ctx, canvas, options);
}

/** Delegates wave drawing to the shared Canvas primitives module.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {{spacing: number, amplitude: number, color: string, lineWidth: number}} options - Wave rendering settings.
 * @returns {void} Nothing.
 */
function drawWavePattern(ctx, canvas, options) {
  return threadlineLibrary.primitives.drawWavePattern(ctx, canvas, options);
}

/** Delegates the color test pattern to the reusable pattern module.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Normalized opacity strength.
 * @returns {void} Nothing.
 */
function drawTestPattern(ctx, canvas, amount) {
  return patternEffects.drawTestPattern(ctx, canvas, amount);
}

/** Delegates diamond mesh drawing to the reusable pattern module.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {{size: number, lineWidth: number, color: string}} options - Mesh rendering settings.
 * @returns {void} Nothing.
 */
function drawDiamondMesh(ctx, canvas, options) {
  return patternEffects.drawDiamondMesh(ctx, canvas, options);
}

/** Delegates deterministic tire tread rendering to the pattern library.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Slider amount for track density and variation.
 * @param {object} accent - Parsed RGB accent color.
 * @returns {void} Nothing.
 */
function drawTireTracks(ctx, canvas, amount, accent) {
  return patternEffects.drawTireTracks(ctx, canvas, amount, accent);
}

/** Delegates fingerprint contour drawing to the pattern library.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Slider amount for count and line strength.
 * @param {object} dark - Parsed RGB line color.
 * @returns {void} Nothing.
 */
function drawFingerprint(ctx, canvas, amount, dark) {
  return patternEffects.drawFingerprint(ctx, canvas, amount, dark);
}

/** Delegates topographic contour rendering to the pattern library.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Slider amount for contour spacing and amplitude.
 * @param {object} soft - Parsed RGB line color.
 * @returns {void} Nothing.
 */
function drawTopoLines(ctx, canvas, amount, soft) {
  return patternEffects.drawTopoLines(ctx, canvas, amount, soft);
}

/** Delegates musical staff-line rendering to the pattern library.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Slider amount for line spacing and width.
 * @param {object} dark - Parsed RGB line color.
 * @returns {void} Nothing.
 */
function drawStaffLines(ctx, canvas, amount, dark) {
  return patternEffects.drawStaffLines(ctx, canvas, amount, dark);
}

/** Delegates blueprint grid drawing to the pattern library.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Slider amount for grid spacing and tint.
 * @param {object} soft - Parsed RGB grid color.
 * @param {object} dark - Parsed RGB background tint.
 * @returns {void} Nothing.
 */
function drawBlueprintGrid(ctx, canvas, amount, soft, dark) {
  return patternEffects.drawBlueprintGrid(ctx, canvas, amount, soft, dark);
}

/** Delegates zebra band drawing to the pattern library.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Slider amount controlling band spacing.
 * @returns {void} Nothing.
 */
function drawZebraPattern(ctx, canvas, amount) {
  return patternEffects.drawZebraPattern(ctx, canvas, amount);
}

/** Delegates reusable perforation rendering to the pattern library.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {HTMLCanvasElement} canvas - Canvas bounds for drawing.
 * @param {number} amount - Slider strength for spacing and radius.
 * @param {object} dark - Parsed RGB hole color.
 * @returns {void} Nothing.
 */
function drawPerforatedPattern(ctx, canvas, amount, dark) {
  return patternEffects.drawPerforatedPattern(ctx, canvas, amount, dark);
}

/** Applies a morphology mode through the reusable RGBA morphology module.
 * @param {ImageData} sourceData - Source pixels to process.
 * @param {number} width - Source width in pixels.
 * @param {number} height - Source height in pixels.
 * @param {string} mode - Morphology operation name.
 * @param {number} amount - Effect strength from zero to one.
 * @returns {ImageData} Newly processed image data.
 */
function applyMorphologyToImageData(sourceData, width, height, mode, amount) {
  return morphologyEffects.applyMorphology(sourceData, width, height, mode, amount);
}

function mixImageData(base, effect, amount) {
  const output = new ImageData(base.width, base.height);
  for (let i = 0; i < base.data.length; i += 4) {
    output.data[i] = clamp(mix(base.data[i], effect.data[i], amount), 0, 255);
    output.data[i + 1] = clamp(mix(base.data[i + 1], effect.data[i + 1], amount), 0, 255);
    output.data[i + 2] = clamp(mix(base.data[i + 2], effect.data[i + 2], amount), 0, 255);
    output.data[i + 3] = base.data[i + 3];
  }
  return output;
}

function cloneCanvas(canvas) {
  return canvasRuntime.cloneCanvas(canvas);
}

/** Creates a sampled canvas source through the reusable filter-library helper.
 * @param {HTMLCanvasElement} canvas - Source canvas.
 * @param {number} maxDimension - Maximum sampled side length.
 * @returns {object} Sampled RGBA data and source dimensions.
 */
function createSampleSource(canvas, maxDimension = 420) {
  return canvasSampling.createSampleSource(canvas, maxDimension);
}

/** Maps original canvas coordinates to a sampled RGBA byte index.
 * @param {object} sampleSource - Sampled pixel source.
 * @param {number} x - Horizontal source coordinate.
 * @param {number} y - Vertical source coordinate.
 * @returns {number} Byte index for the mapped sample pixel.
 */
function getSampleSourceIndex(sampleSource, x, y) {
  return canvasSampling.getSampleSourceIndex(sampleSource, x, y);
}

/** Reads one sampled color channel at original canvas coordinates.
 * @param {object} sampleSource - Sampled pixel source.
 * @param {number} x - Horizontal source coordinate.
 * @param {number} y - Vertical source coordinate.
 * @param {number} channel - RGBA channel index.
 * @returns {number} Sampled channel value.
 */
function getSampleSourceChannel(sampleSource, x, y, channel) {
  return canvasSampling.getSampleSourceChannel(sampleSource, x, y, channel);
}

async function exportCurrentImage() {
  if (!state.sourceImage) return;
  try {
    const blob = await createExportBlob();
    downloadBlob(blob, makeExportFilename());
  } catch (error) {
    console.error(error);
    alert(t("exportFailed"));
  }
}

async function shareCurrentImage() {
  if (!state.sourceImage) return;
  if (!navigator.share) {
    alert(t("shareUnsupported"));
    return;
  }
  try {
    const blob = await createExportBlob();
    const format = state.project.export.format === "pdf" ? "pdf" : normalizeMimeExt(state.project.export.format);
    const file = new File([blob], makeExportFilename(format), { type: blob.type });
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      downloadBlob(blob, file.name);
      return;
    }
    await navigator.share({
      title: "Threadline Studio",
      text: t("imageShareText"),
      files: [file],
    });
  } catch (error) {
    if (error?.name !== "AbortError") console.error(error);
  }
}

function setShareAppStatus(message = "") {
  if (!els.shareAppStatus) return;
  els.shareAppStatus.textContent = message;
  els.shareAppStatus.hidden = !message;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!succeeded) {
    throw new Error("Clipboard not available");
  }
}

async function shareAppRecommendation() {
  const payload = {
    title: APP_SHARE_TITLE,
    text: t("recommendShareText"),
    url: APP_SHARE_URL,
  };
  setShareAppStatus("");
  try {
    if (navigator.share) {
      await navigator.share(payload);
      setShareAppStatus(t("recommendShared"));
      return;
    }
    const shareText = `${payload.text}\n${APP_SHARE_URL}`;
    await copyTextToClipboard(shareText);
    setShareAppStatus(t("recommendCopied"));
  } catch (error) {
    if (error?.name === "AbortError") return;
    console.error(error);
    setShareAppStatus(t("recommendUnavailable"));
  }
}

async function createExportBlob() {
  if (!state.sourceImage) {
    throw new Error("No image loaded");
  }
  flushLocalStateSave();
  const requestedWidth = state.project.export.width;
  const aspect = getFrameAspectRatio();
  const attemptScales = [1, 0.82, 0.66, 0.5];
  let lastError = null;
  for (const scale of attemptScales) {
    const width = Math.max(320, Math.min(requestedWidth, Math.round(requestedWidth * scale)));
    const height = Math.round(width / aspect);
    const exportCanvas = document.createElement("canvas");
    try {
      exportCanvas.width = width;
      exportCanvas.height = height;
      const exportCtx = exportCanvas.getContext("2d", { willReadFrequently: true });
      exportCtx.clearRect(0, 0, width, height);
      drawBaseImage(exportCtx, width, height);
      applyEffects(exportCanvas, exportCtx);

      const format = state.project.export.format;
      if (format === "pdf") {
        const jpegBlob = await canvasToBlob(exportCanvas, "image/jpeg", 0.92);
        return createSimplePdfBlob(jpegBlob, width, height);
      }

      const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      return await canvasToBlob(exportCanvas, mime, state.project.export.quality);
    } catch (error) {
      lastError = error;
      console.warn("Export retry with smaller canvas", { requestedWidth, width, error });
    } finally {
      exportCanvas.width = 0;
      exportCanvas.height = 0;
    }
  }
  throw lastError || new Error("Export failed");
}

function createSimplePdfBlob(imageBlob, width, height) {
  return imageBlob.arrayBuffer().then((buffer) => {
    const imageBytes = new Uint8Array(buffer);
    const encoder = new TextEncoder();
    const mediaWidth = Math.round((width / 96) * 72);
    const mediaHeight = Math.round((height / 96) * 72);
    const content = `q\n${mediaWidth} 0 0 ${mediaHeight} 0 0 cm\n/Im0 Do\nQ`;
    const objects = [
      [encoder.encode("<< /Type /Catalog /Pages 2 0 R >>")],
      [encoder.encode("<< /Type /Pages /Count 1 /Kids [3 0 R] >>")],
      [encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${mediaWidth} ${mediaHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)],
      [
        encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`),
        imageBytes,
        encoder.encode("\nendstream"),
      ],
      [encoder.encode(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)],
    ];

    const parts = [encoder.encode("%PDF-1.3\n")];
    const offsets = ["0000000000 65535 f "];
    let byteLength = parts[0].length;

    for (let i = 0; i < objects.length; i += 1) {
      offsets.push(`${String(byteLength).padStart(10, "0")} 00000 n `);
      const objectHeader = encoder.encode(`${i + 1} 0 obj\n`);
      const objectFooter = encoder.encode("\nendobj\n");
      parts.push(objectHeader, ...objects[i], objectFooter);
      byteLength += objectHeader.length + objectFooter.length + objects[i].reduce((sum, chunk) => sum + chunk.length, 0);
    }

    const xrefStart = byteLength;
    const xrefBlock = encoder.encode(
      `xref\n0 ${objects.length + 1}\n${offsets.join("\n")}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
    );
    parts.push(xrefBlock);
    return new Blob(parts, { type: "application/pdf" });
  });
}

function createBackupBlob() {
  return new Blob([JSON.stringify({
    versionInfo: state.versionInfo,
    project: state.project,
    settings: state.settings,
  }, null, 2)], { type: "application/json" });
}

function downloadBackup() {
  downloadBlob(createBackupBlob(), "threadline-studio-project.json");
}

function importBackup(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed?.project || !parsed?.project?.source) throw new Error("Invalid backup");
    state.project = mergeProject(createDefaultProject(), parsed.project);
    state.settings = {
      languagePreference: parsed?.settings?.languagePreference || "auto",
    };
    markProjectSourceDirty();
    syncUiFromState();
    saveLocalState(true);
    restoreSourceImage();
    alert(t("backupLoaded"));
  } catch (error) {
    console.error(error);
    alert(t("backupInvalid"));
  }
}

function clearProject() {
  state.project = createDefaultProject();
  releaseSourceImage();
  releaseRenderBuffers();
  markProjectSourceDirty();
  syncUiFromState();
  saveLocalState(true);
  render();
  alert(t("projectCleared"));
}

function syncUiFromState() {
  const transform = state.project.transform;
  els.zoomInput.value = String(transform.zoom);
  els.panXInput.value = String(transform.panX);
  els.panYInput.value = String(transform.panY);
  els.rotationInput.value = String(transform.rotation);
  els.zoomValue.textContent = `${transform.zoom.toFixed(2)}x`;
  els.panXValue.textContent = `${Math.round(transform.panX * 100)}%`;
  els.panYValue.textContent = `${Math.round(transform.panY * 100)}%`;
  els.rotationValue.textContent = `${Math.round(transform.rotation)}°`;
  els.qualityInput.value = String(state.project.export.quality);
  els.qualityValue.textContent = `${Math.round(state.project.export.quality * 100)}%`;
  els.exportFormatSelect.value = state.project.export.format;
  els.exportWidthSelect.value = String(state.project.export.width);
  if (els.shareAppUrl) {
    els.shareAppUrl.textContent = APP_SHARE_URL;
  }
  if (els.shareAppQr) {
    els.shareAppQr.src = APP_SHARE_QR_ASSET;
  }
  els.duotoneDarkInput.value = state.project.colors.duotoneDark;
  els.duotoneLightInput.value = state.project.colors.duotoneLight;
  els.overlayColorInput.value = state.project.colors.overlayColor;
  els.focusColorInput.value = state.project.colors.focusColor || "#ff3b30";
  els.focusColor2Input.value = state.project.colors.focusColor2 || "#ffd400";
  els.languageSelect.value = state.settings.languagePreference;
  const pickingFocusOne = state.focusColorPickingTarget === "focusColor";
  const pickingFocusTwo = state.focusColorPickingTarget === "focusColor2";
  els.focusColorPickerButton.classList.toggle("primary", pickingFocusOne);
  els.focusColorPickerButton.classList.toggle("secondary", !pickingFocusOne);
  els.focusColorPickerButton.textContent = pickingFocusOne ? t("focusColorPickerOneActive") : t("focusColorPickerOne");
  els.focusColorPickerButton.setAttribute("aria-pressed", pickingFocusOne ? "true" : "false");
  els.focusColor2PickerButton.classList.toggle("primary", pickingFocusTwo);
  els.focusColor2PickerButton.classList.toggle("secondary", !pickingFocusTwo);
  els.focusColor2PickerButton.textContent = pickingFocusTwo ? t("focusColorPickerTwoActive") : t("focusColorPickerTwo");
  els.focusColor2PickerButton.setAttribute("aria-pressed", pickingFocusTwo ? "true" : "false");

  for (const [groupKey, controls] of Object.entries(CONTROL_GROUPS)) {
    for (const control of controls) {
      const input = document.querySelector(`input[data-group="${groupKey}"][data-key="${control.key}"]`);
      if (!input) continue;
      input.value = String(state.project[groupKey][control.key] ?? control.value);
      const valueEl = document.getElementById(`${groupKey}-${control.key}-value`);
      if (valueEl) valueEl.textContent = formatControlValue(control, Number(input.value));
    }
  }

  const updated = new Date(state.project.meta.updatedAt);
  els.projectMetaText.textContent = state.sourceImage
    ? `${t("statusLoaded")} · ${state.project.source.fileName || "image"} · ${updated.toLocaleString()}`
    : t("projectMetaFallback");
  els.versionText.textContent = `App ${state.versionInfo.appVersion} · Cache ${state.versionInfo.cacheVersion} · ${state.versionInfo.label} · Revision r${state.project.meta.revision}`;
  els.autosaveBadge.textContent = `${t("autosaveReady")} · ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const hasImage = Boolean(state.sourceImage);
  const mobileLayout = isMobileLayout();
  els.exportButton.disabled = !hasImage;
  els.shareImageButton.disabled = !hasImage;
  els.downloadBackupButton.disabled = !hasImage;
  if (els.downloadBackupButtonDesktop) els.downloadBackupButtonDesktop.disabled = !hasImage;
  els.clearProjectButton.disabled = !hasImage;
  if (els.clearProjectButtonDesktop) els.clearProjectButtonDesktop.disabled = !hasImage;
  els.exportButton.hidden = mobileLayout;
  els.shareImageButton.classList.toggle("primary", mobileLayout);
  els.shareImageButton.classList.toggle("secondary", !mobileLayout);
  els.emptyBodyText.hidden = mobileLayout;
  els.canvasFrame.style.cursor = state.focusColorPickingTarget ? "crosshair" : (!hasImage && mobileLayout ? "pointer" : "");
}

function loadLocalState() {
  try {
    const savedProjectState = localStorage.getItem(PROJECT_STATE_KEY);
    const savedProjectSource = localStorage.getItem(PROJECT_SOURCE_KEY);
    if (savedProjectState) {
      state.project = mergeProject(createDefaultProject(), JSON.parse(savedProjectState));
      if (savedProjectSource) {
        state.project.source = { ...state.project.source, ...JSON.parse(savedProjectSource) };
      }
    } else {
      const legacyProject = localStorage.getItem(STORAGE_KEY);
      if (legacyProject) state.project = mergeProject(createDefaultProject(), JSON.parse(legacyProject));
    }
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
  } catch (error) {
    console.error(error);
  }
}

function serializeProjectForStorage() {
  return {
    ...state.project,
    source: {
      dataUrl: "",
      fileName: "",
      mimeType: "",
    },
  };
}

function scheduleLocalStateSave(forceSource = false) {
  if (forceSource) {
    markProjectSourceDirty();
  }
  if (state.saveTimer) {
    window.clearTimeout(state.saveTimer);
  }
  state.saveTimer = window.setTimeout(() => {
    state.saveTimer = 0;
    saveLocalState(forceSource);
  }, LOCAL_SAVE_DEBOUNCE_MS);
}

function flushLocalStateSave(forceSource = false) {
  if (forceSource) {
    markProjectSourceDirty();
  }
  if (state.saveTimer) {
    window.clearTimeout(state.saveTimer);
    state.saveTimer = 0;
  }
  saveLocalState(forceSource);
}

function saveLocalState(forceSource = false) {
  try {
    localStorage.setItem(PROJECT_STATE_KEY, JSON.stringify(serializeProjectForStorage()));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    if (forceSource || state.sourceStorageDirty) {
      localStorage.removeItem(STORAGE_KEY);
      if (state.project.source?.dataUrl) {
        localStorage.setItem(PROJECT_SOURCE_KEY, JSON.stringify(state.project.source));
      } else {
        localStorage.removeItem(PROJECT_SOURCE_KEY);
      }
      state.sourceStorageDirty = false;
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("saveLocalState failed", error);
  }
}

/** Merges saved data over defaults. Expects a default project and saved project and returns the merged project. */
function mergeProject(base, incoming) {
  const merged = {
    ...base,
    ...incoming,
    meta: { ...base.meta, ...incoming?.meta },
    source: { ...base.source, ...incoming?.source },
    transform: { ...base.transform, ...incoming?.transform },
    corrections: { ...base.corrections, ...incoming?.corrections },
    styles: { ...base.styles, ...incoming?.styles },
    campaigns: { ...base.campaigns, ...incoming?.campaigns },
    fx: { ...base.fx, ...incoming?.fx },
    morphology: { ...base.morphology, ...incoming?.morphology },
    patterns: { ...base.patterns, ...incoming?.patterns },
    materials: { ...base.materials, ...incoming?.materials },
    atmosphere: { ...base.atmosphere, ...incoming?.atmosphere },
    art: { ...base.art, ...incoming?.art },
    wordArt: { ...base.wordArt, ...incoming?.wordArt },
    fragment: { ...base.fragment, ...incoming?.fragment },
    cut: { ...base.cut, ...incoming?.cut },
    morph: { ...base.morph, ...incoming?.morph },
    artists: { ...base.artists, ...incoming?.artists },
    graphics: { ...base.graphics, ...incoming?.graphics },
    colors: { ...base.colors, ...incoming?.colors },
    export: { ...base.export, ...incoming?.export },
  };
  if (incoming?.styles?.hueShift == null && typeof incoming?.fx?.hueShift === "number") {
    merged.styles.hueShift = incoming.fx.hueShift;
  }
  if (incoming?.styles?.colorFocus1 == null && typeof incoming?.styles?.colorFocus === "number") {
    merged.styles.colorFocus1 = incoming.styles.colorFocus;
  }
  if (incoming?.styles?.colorFocusTolerance1 == null && typeof incoming?.styles?.colorFocusTolerance === "number") {
    merged.styles.colorFocusTolerance1 = incoming.styles.colorFocusTolerance;
  }
  if (incoming?.styles?.colorFocus2 == null) {
    merged.styles.colorFocus2 = 0;
  }
  if (incoming?.styles?.colorFocusTolerance2 == null) {
    merged.styles.colorFocusTolerance2 = merged.styles.colorFocusTolerance1 ?? base.styles.colorFocusTolerance2;
  }
  if (incoming?.materials?.paperTexture == null && typeof incoming?.patterns?.paperTexture === "number") {
    merged.materials.paperTexture = incoming.patterns.paperTexture;
  }
  if (incoming?.materials?.perforatedMetal == null && typeof incoming?.patterns?.perforatedMetal === "number") {
    merged.materials.perforatedMetal = incoming.patterns.perforatedMetal;
  }
  if (incoming?.atmosphere?.grain == null && typeof incoming?.fx?.grain === "number") {
    merged.atmosphere.grain = incoming.fx.grain;
  }
  if (incoming?.atmosphere?.vignette == null && typeof incoming?.fx?.vignette === "number") {
    merged.atmosphere.vignette = incoming.fx.vignette;
  }
  if (incoming?.atmosphere?.scanlines == null && typeof incoming?.fx?.scanlines === "number") {
    merged.atmosphere.scanlines = incoming.fx.scanlines;
  }
  if (incoming?.corrections?.focusCenter == null && typeof incoming?.fx?.focusCenter === "number") {
    merged.corrections.focusCenter = incoming.fx.focusCenter;
  }
  if (incoming?.corrections?.backgroundBlur == null && typeof incoming?.fx?.backgroundBlur === "number") {
    merged.corrections.backgroundBlur = incoming.fx.backgroundBlur;
  }
  if (incoming?.patterns?.overlayOpacity == null && typeof incoming?.fx?.overlayOpacity === "number") {
    merged.patterns.overlayOpacity = incoming.fx.overlayOpacity;
  }
  if (incoming?.patterns?.frame == null && typeof incoming?.fx?.frame === "number") {
    merged.patterns.frame = incoming.fx.frame;
  }
  for (const key of ["mondriaan", "vanGogh", "augustMacke", "arp", "paulKlee", "marcChagall"]) {
    if (incoming?.artists?.[key] == null && typeof incoming?.art?.[key] === "number") {
      merged.artists[key] = incoming.art[key];
      delete merged.art[key];
    }
  }
  return merged;
}

function applyTranslations() {
  const language = getActiveLanguage();
  document.documentElement.lang = language === "auto" ? "de" : language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-control-i18n]").forEach((node) => {
    node.textContent = node.dataset.controlI18n ? t(node.dataset.controlI18n) : node.dataset.controlFallback || "";
  });
  applyTheme();
  syncUiFromState();
}

function applyTheme() {
  document.body.classList.toggle("theme-light", state.settings.themeMode === "light");
  document.body.classList.toggle("theme-dark", state.settings.themeMode !== "light");
  if (els.themeToggleButton) {
    els.themeToggleButton.textContent = state.settings.themeMode === "dark" ? t("lightModeButton") : t("darkModeButton");
  }
  if (els.themeStatusNote) {
    els.themeStatusNote.textContent = state.settings.themeMode === "dark" ? t("themeDarkActive") : t("themeLightActive");
  }
}

function getActiveLanguage() {
  const preference = state.settings.languagePreference;
  if (preference !== "auto" && I18N[preference]) return preference;
  const candidate = navigator.language.slice(0, 2).toLowerCase();
  return I18N[candidate] ? candidate : "en";
}

function t(key, params = {}) {
  const language = getActiveLanguage();
  const dict = I18N[language] || I18N.en || {};
  const fallback = I18N.de || {};
  let value = dict[key];
  if (value === undefined) {
    value = FILTER_METADATA_LOCALES[language][key];
  }
  if (value === undefined) {
    value = fallback[key];
  }
  if (value === undefined) {
    value = key;
  }
  for (const [paramKey, paramValue] of Object.entries(params)) {
    value = value.replaceAll(`{${paramKey}}`, String(paramValue));
  }
  return value;
}

async function loadVersionInfo() {
  state.versionInfo = { ...CURRENT_VERSION_INFO };
  syncUiFromState();
}

function checkForUpdates(showAlert = false) {
  if (state.updateInProgress) return;
  state.updateInProgress = true;
  els.checkUpdateButton.disabled = true;
  setUpdateStatus(t("updateChecking"), true, false);
  fetchVersionInfo()
    .then(async (remote) => {
      if (versionSignature(remote) !== versionSignature(CURRENT_VERSION_INFO)) {
        setUpdateStatus(t("updateAvailable", { version: remote.appVersion }), false, false);
        const shouldReload = await showConfirmDialog({
          title: t("updateConfirmTitle"),
          message: `${t("updateAvailable", { version: remote.appVersion })} ${t("updatePromptQuestion")}`,
          confirmLabel: t("reloadApp"),
          cancelLabel: t("close"),
        });
        if (shouldReload) {
          setUpdateStatus(t("updateApplying"), false, false);
          await performAppReload();
          return;
        }
        setUpdateStatus(t("updateAvailable", { version: remote.appVersion }), false, true);
        return;
      }
      setUpdateStatus(t("updateCurrent"), false, false);
      if (showAlert) {
        await showConfirmDialog({
          title: t("checkUpdates"),
          message: t("updateCurrent"),
          confirmLabel: t("close"),
          hideCancel: true,
        });
      }
    })
    .catch((error) => {
      console.error(error);
      setUpdateStatus(t("updateFailed"), false, false);
      if (showAlert) {
        void showConfirmDialog({
          title: t("checkUpdates"),
          message: t("updateFailed"),
          confirmLabel: t("close"),
          hideCancel: true,
        });
      }
    })
    .finally(() => {
      state.updateInProgress = false;
      els.checkUpdateButton.disabled = false;
    });
}

function setUpdateStatus(message, loading = false, showReload = false) {
  els.updateCheckStatus.textContent = message;
  els.updateCheckStatus.hidden = !message;
  els.updateCheckStatus.classList.toggle("loading", loading);
  els.reloadAppButton.disabled = Boolean(loading || state.reloadInProgress);
  els.reloadAppButton.classList.toggle("primary", Boolean(showReload));
  els.reloadAppButton.classList.toggle("secondary", !showReload);
}

async function performAppReload() {
  if (state.reloadInProgress) return;
  state.reloadInProgress = true;
  els.reloadAppButton.disabled = true;
  setUpdateStatus(t("updateApplying"), false, true);
  flushLocalStateSave(true);
  releaseRenderBuffers();
  try {
    const registration = await navigator.serviceWorker?.getRegistration?.();
    await registration?.update?.().catch(() => {});
    registration?.waiting?.postMessage?.({ type: "SKIP_WAITING" });
  } catch (error) {
    console.error(error);
  }
  window.setTimeout(() => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("reload", String(Date.now()));
    window.location.replace(nextUrl.toString());
  }, 120);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("reload", String(Date.now()));
    window.location.replace(nextUrl.toString());
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error(error);
    });
  });
}

async function fetchVersionInfo() {
  const response = await fetch("./version.js", { cache: "no-cache" });
  if (!response.ok) {
    throw new Error("Version file unavailable");
  }
  const source = await response.text();
  return normalizeVersionInfo({
    appVersion: source.match(/appVersion:\s*"([^"]+)"/)?.[1] || "",
    cacheVersion: source.match(/cacheVersion:\s*"([^"]+)"/)?.[1] || "",
    label: source.match(/label:\s*"([^"]*)"/)?.[1] || "",
  });
}

function normalizeVersionInfo(info = {}) {
  return {
    appVersion: String(info.appVersion || FALLBACK_VERSION_INFO.appVersion),
    cacheVersion: String(info.cacheVersion || FALLBACK_VERSION_INFO.cacheVersion),
    label: String(info.label || FALLBACK_VERSION_INFO.label || ""),
  };
}

function versionSignature(info = {}) {
  return `${String(info.appVersion || "")}::${String(info.cacheVersion || "")}::${String(info.label || "")}`;
}

/** Formats a slider value for display. Expects a control definition and numeric value; returns localized text with a unit. */
function formatControlValue(control, value) {
  if (control.key === "movemberShape" || control.key === "ribbonShape") {
    if (value < 34) return t("campaignShapeSoft");
    if (value > 66) return t("campaignShapeBold");
    return t("campaignShapeClassic");
  }
  if (control.max <= 12 || control.key === "blur" || control.key === "sharpen") {
    return `${Number(value).toFixed(control.step < 1 ? 1 : 0)}`;
  }
  if (control.key === "hueShift") return `${Math.round(value)}°`;
  if (control.key === "blackwhite") return `${Math.round(value)}`;
  return `${Math.round(value)}%`;
}

function makeExportFilename(extOverride) {
  const ext = extOverride || normalizeMimeExt(state.project.export.format);
  const safeBase = (state.project.source.fileName || "threadline-studio")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .toLowerCase();
  return `${safeBase || "threadline-studio"}-r${state.project.meta.revision}.${ext}`;
}

function normalizeMimeExt(format) {
  return format === "jpeg" ? "jpg" : format;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("")}`;
}

function getPixelIndex(x, y, width) {
  return (y * width + x) * 4;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create blob"));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

function rgbaString(color, alpha) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${clamp(alpha, 0, 1)})`;
}

function rgbaFromHex(hex, alpha) {
  return rgbaString(hexToRgb(hex), alpha);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function hexToRgb(hex) {
  const raw = hex.replace("#", "");
  const normalized = raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw;
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;
  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return [h, s, l];
}

function getRgbSaturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max <= 0) return 0;
  return (max - min) / max;
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (h < 60) {
    r1 = c; g1 = x;
  } else if (h < 120) {
    r1 = x; g1 = c;
  } else if (h < 180) {
    g1 = c; b1 = x;
  } else if (h < 240) {
    g1 = x; b1 = c;
  } else if (h < 300) {
    r1 = x; b1 = c;
  } else {
    r1 = c; b1 = x;
  }
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

function getDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mix(a, b, amount) {
  return a + (b - a) * amount;
}

function sampleThreeColorGradient(colors, t) {
  const amount = clamp(t, 0, 1);
  if (amount <= 0.5) {
    return {
      r: mix(colors[0].r, colors[1].r, amount * 2),
      g: mix(colors[0].g, colors[1].g, amount * 2),
      b: mix(colors[0].b, colors[1].b, amount * 2),
    };
  }
  return {
    r: mix(colors[1].r, colors[2].r, (amount - 0.5) * 2),
    g: mix(colors[1].g, colors[2].g, (amount - 0.5) * 2),
    b: mix(colors[1].b, colors[2].b, (amount - 0.5) * 2),
  };
}

function sampleFourColorGradient(colors, t) {
  const amount = clamp(t, 0, 1);
  const segment = amount * 3;
  const index = Math.min(2, Math.floor(segment));
  const local = segment - index;
  return {
    r: mix(colors[index].r, colors[index + 1].r, local),
    g: mix(colors[index].g, colors[index + 1].g, local),
    b: mix(colors[index].b, colors[index + 1].b, local),
  };
}

function quantizeChannel(value, levels) {
  if (levels <= 1) return value;
  const step = 255 / (levels - 1);
  return Math.round(value / step) * step;
}

function posterBlockBoost(r, g, b, amount) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;
  const push = mix(0.06, 0.2, amount) * spread;
  return {
    r: clamp(r + (r === max ? push : -push * 0.35), 0, 255),
    g: clamp(g + (g === max ? push : -push * 0.35), 0, 255),
    b: clamp(b + (b === max ? push : -push * 0.35), 0, 255),
  };
}

function curveAmount(value, exponent = 1.5, max = 1) {
  return Math.pow(clamp(value, 0, 1), exponent) * max;
}

function curveThousand(value, exponent = 1.4, max = 1) {
  return curveAmount(value / 10, exponent, max);
}

function getHueDistance(a, b) {
  const delta = Math.abs(a - b) % 360;
  return delta > 180 ? 360 - delta : delta;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function seededNoise(a, b, salt = 0) {
  const value = Math.sin(a * 127.1 + b * 311.7 + salt * 91.3) * 43758.5453123;
  return value - Math.floor(value);
}

function normalizeDegrees(value) {
  let result = value % 360;
  if (result > 180) result -= 360;
  if (result < -180) result += 360;
  return result;
}

function showConfirmDialog(options = {}) {
  const {
    title = "Confirm",
    message = "",
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    hideCancel = false,
  } = options;

  if (!els.confirmDialog || typeof els.confirmDialog.showModal !== "function") {
    return Promise.resolve(window.confirm(message));
  }

  if (els.confirmDialog.open) {
    els.confirmDialog.close("cancel");
  }

  els.confirmDialogTitle.textContent = title;
  els.confirmDialogMessage.textContent = message;
  els.confirmCancelButton.textContent = cancelLabel;
  els.confirmAcceptButton.textContent = confirmLabel;
  els.confirmCancelButton.hidden = hideCancel;
  els.confirmAcceptButton.classList.toggle("primary", !hideCancel);
  els.confirmAcceptButton.classList.toggle("secondary", hideCancel);

  return new Promise((resolve) => {
    const onClose = () => resolve(els.confirmDialog.returnValue === "confirm");
    els.confirmDialog.addEventListener("close", onClose, { once: true });
    els.confirmDialog.showModal();
  });
}

async function loadReadmeContent() {
  if (state.readmeText) {
    els.readmeStatus.textContent = "";
    els.readmeContent.innerHTML = renderMarkdownAsHtml(state.readmeText);
    return;
  }

  els.readmeStatus.textContent = t("helpLoading");
  els.readmeStatus.classList.add("loading");
  els.readmeContent.innerHTML = "";

  try {
    const response = await fetch("./README.md", { cache: "no-cache" });
    if (!response.ok) throw new Error("README unavailable");
    const text = await response.text();
    state.readmeText = text;
    els.readmeStatus.textContent = "";
    els.readmeStatus.classList.remove("loading");
    els.readmeContent.innerHTML = renderMarkdownAsHtml(text);
  } catch (error) {
    console.error(error);
    els.readmeStatus.textContent = t("helpFailed");
    els.readmeStatus.classList.remove("loading");
    els.readmeContent.innerHTML = "";
  }
}

function renderMarkdownAsHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let inList = false;
  let inCode = false;
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${paragraph.join(" ")}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = escapeHtml(rawLine);
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      html.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      html.push(`${line}\n`);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      html.push(`<h1>${line.slice(2)}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      html.push(`<h2>${line.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      html.push(`<h3>${line.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${line.slice(2)}</li>`);
      continue;
    }
    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return linkifyInline(html.join(""));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function linkifyInline(html) {
  return html
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}
