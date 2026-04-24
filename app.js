const I18N = window.THREADLINE_STUDIO_I18N || {};
const STORAGE_KEY = "threadline-studio-project";
const SETTINGS_KEY = "threadline-studio-settings";
const DEFAULT_VERSION = Object.freeze({
  appVersion: "0.1.0",
  cacheVersion: "v1",
  label: "Initialer mobiler Browser-Editor",
});

const CONTROL_GROUPS = {
  corrections: [
    { key: "brightness", min: -100, max: 100, step: 1, value: 0, label: "Helligkeit" },
    { key: "contrast", min: -100, max: 100, step: 1, value: 0, label: "Kontrast" },
    { key: "saturation", min: -100, max: 100, step: 1, value: 0, label: "Saettigung" },
    { key: "blur", min: 0, max: 18, step: 0.2, value: 0, label: "Unschaerfe" },
    { key: "sharpen", min: 0, max: 4, step: 0.1, value: 0, label: "Schaerfen" },
  ],
  styles: [
    { key: "grayscale", min: 0, max: 100, step: 1, value: 0, label: "Graustufen" },
    { key: "blackwhite", min: 0, max: 255, step: 1, value: 0, label: "Schwarzweiss" },
    { key: "sepia", min: 0, max: 100, step: 1, value: 0, label: "Sepia" },
    { key: "duotone", min: 0, max: 100, step: 1, value: 0, label: "Duotone" },
    { key: "vintage", min: 0, max: 100, step: 1, value: 0, label: "Vintage" },
    { key: "posterize", min: 0, max: 12, step: 1, value: 0, label: "Posterize" },
    { key: "halftone", min: 0, max: 18, step: 1, value: 0, label: "Halftone" },
  ],
  fx: [
    { key: "pixelate", min: 0, max: 60, step: 1, value: 0, label: "Pixelate" },
    { key: "glitch", min: 0, max: 100, step: 1, value: 0, label: "Glitch" },
    { key: "edges", min: 0, max: 100, step: 1, value: 0, label: "Konturen" },
    { key: "emboss", min: 0, max: 100, step: 1, value: 0, label: "Relief" },
    { key: "pencil", min: 0, max: 100, step: 1, value: 0, label: "Bleistift" },
    { key: "charcoal", min: 0, max: 100, step: 1, value: 0, label: "Kohle" },
    { key: "hueShift", min: -180, max: 180, step: 1, value: 0, label: "Farbton" },
    { key: "invert", min: 0, max: 100, step: 1, value: 0, label: "Invertieren" },
    { key: "vignette", min: 0, max: 100, step: 1, value: 0, label: "Vignette" },
    { key: "grain", min: 0, max: 100, step: 1, value: 0, label: "Filmkorn" },
    { key: "comic", min: 0, max: 100, step: 1, value: 0, label: "Comic" },
    { key: "silhouette", min: 0, max: 100, step: 1, value: 0, label: "Silhouette" },
    { key: "scanlines", min: 0, max: 100, step: 1, value: 0, label: "Scanlines" },
    { key: "focusCenter", min: 0, max: 100, step: 1, value: 0, label: "Fokus Mitte" },
    { key: "backgroundBlur", min: 0, max: 32, step: 1, value: 0, label: "Hintergrund weich" },
    { key: "overlayOpacity", min: 0, max: 100, step: 1, value: 0, label: "Overlay" },
    { key: "frame", min: 0, max: 100, step: 1, value: 0, label: "Rahmen" },
  ],
};

const state = {
  versionInfo: { ...DEFAULT_VERSION },
  settings: {
    languagePreference: "auto",
  },
  project: createDefaultProject(),
  deferredPrompt: null,
  sourceImage: null,
  renderQueued: false,
};

const els = {
  previewCanvas: document.getElementById("previewCanvas"),
  emptyState: document.getElementById("emptyState"),
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
  fxFields: document.getElementById("fxFields"),
  duotoneDarkInput: document.getElementById("duotoneDarkInput"),
  duotoneLightInput: document.getElementById("duotoneLightInput"),
  overlayColorInput: document.getElementById("overlayColorInput"),
  exportFormatSelect: document.getElementById("exportFormatSelect"),
  exportWidthSelect: document.getElementById("exportWidthSelect"),
  qualityInput: document.getElementById("qualityInput"),
  qualityValue: document.getElementById("qualityValue"),
  exportButton: document.getElementById("exportButton"),
  shareImageButton: document.getElementById("shareImageButton"),
  shareProjectButton: document.getElementById("shareProjectButton"),
  settingsButton: document.getElementById("settingsButton"),
  settingsDialog: document.getElementById("settingsDialog"),
  languageSelect: document.getElementById("languageSelect"),
  downloadBackupButton: document.getElementById("downloadBackupButton"),
  backupInput: document.getElementById("backupInput"),
  clearProjectButton: document.getElementById("clearProjectButton"),
  checkUpdateButton: document.getElementById("checkUpdateButton"),
  projectMetaText: document.getElementById("projectMetaText"),
  versionText: document.getElementById("versionText"),
  versionBadge: document.getElementById("versionBadge"),
  footerVersionLabel: document.getElementById("footerVersionLabel"),
  projectRevisionBadge: document.getElementById("projectRevisionBadge"),
  autosaveBadge: document.getElementById("autosaveBadge"),
  installButton: document.getElementById("installButton"),
  canvasFrame: document.getElementById("canvasFrame"),
};

const previewCtx = els.previewCanvas.getContext("2d", { willReadFrequently: true });

init();

function init() {
  buildControlFields();
  loadLocalState();
  bindEvents();
  loadVersionInfo();
  applyTranslations();
  syncUiFromState();
  restoreSourceImage();
  registerServiceWorker();
  render();
}

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
    fx: Object.fromEntries(CONTROL_GROUPS.fx.map((control) => [control.key, control.value])),
    colors: {
      duotoneDark: "#111111",
      duotoneLight: "#f8d48f",
      overlayColor: "#ff6a3d",
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
  renderControls(els.styleFields, CONTROL_GROUPS.styles, "styles");
  renderControls(els.fxFields, CONTROL_GROUPS.fx, "fx");
}

function renderControls(container, controls, groupKey) {
  container.innerHTML = "";
  for (const control of controls) {
    const label = document.createElement("label");
    label.className = "field";
    const title = document.createElement("span");
    title.textContent = control.label;
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
    input.value = String(control.value);
    input.dataset.group = groupKey;
    input.dataset.key = control.key;
    const output = document.createElement("strong");
    output.id = `${groupKey}-${control.key}-value`;
    output.textContent = formatControlValue(control, control.value);
    label.append(title, input, output);
    container.append(label);
  }
}

function bindEvents() {
  els.imageInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (file) await loadImageFile(file);
    event.target.value = "";
  });

  document.querySelectorAll('input[type="range"][data-group]').forEach((input) => {
    input.addEventListener("input", handleControlInput);
  });

  [els.duotoneDarkInput, els.duotoneLightInput, els.overlayColorInput].forEach((input) => {
    input.addEventListener("input", () => {
      state.project.colors.duotoneDark = els.duotoneDarkInput.value;
      state.project.colors.duotoneLight = els.duotoneLightInput.value;
      state.project.colors.overlayColor = els.overlayColorInput.value;
      touchProject();
    });
  });

  [els.zoomInput, els.panXInput, els.panYInput, els.rotationInput].forEach((input) => {
    input.addEventListener("input", updateTransformFromInputs);
  });

  els.qualityInput.addEventListener("input", () => {
    state.project.export.quality = Number(els.qualityInput.value);
    syncUiFromState();
    saveLocalState();
  });
  els.exportFormatSelect.addEventListener("change", () => {
    state.project.export.format = els.exportFormatSelect.value;
    saveLocalState();
  });
  els.exportWidthSelect.addEventListener("change", () => {
    state.project.export.width = Number(els.exportWidthSelect.value);
    saveLocalState();
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
  els.centerButton.addEventListener("click", () => {
    state.project.transform.panX = 0;
    state.project.transform.panY = 0;
    touchProject();
  });
  els.resetImageButton.addEventListener("click", resetEffects);
  els.exportButton.addEventListener("click", exportCurrentImage);
  els.shareImageButton.addEventListener("click", shareCurrentImage);
  els.shareProjectButton.addEventListener("click", shareProjectBackup);
  els.settingsButton.addEventListener("click", () => {
    syncUiFromState();
    els.settingsDialog.showModal();
  });
  els.languageSelect.addEventListener("change", () => {
    state.settings.languagePreference = els.languageSelect.value;
    saveLocalState();
    applyTranslations();
  });
  els.downloadBackupButton.addEventListener("click", downloadBackup);
  els.backupInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    importBackup(await file.text());
    event.target.value = "";
  });
  els.clearProjectButton.addEventListener("click", clearProject);
  els.checkUpdateButton.addEventListener("click", () => checkForUpdates(true));
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

  bindCanvasGestures();
}

function bindCanvasGestures() {
  let dragStart = null;
  const activePointers = new Map();
  let pinchStart = null;

  const onPointerDown = (event) => {
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
      queueRender(true);
    } else if (activePointers.size === 2 && pinchStart) {
      const points = [...activePointers.values()];
      const nextDistance = getDistance(points[0], points[1]);
      state.project.transform.zoom = clamp(pinchStart.zoom * (nextDistance / Math.max(10, pinchStart.distance)), 0.5, 3);
      syncUiFromState();
      queueRender(true);
    }
  };

  const onPointerUp = (event) => {
    activePointers.delete(event.pointerId);
    if (activePointers.size === 0) {
      dragStart = null;
      pinchStart = null;
      saveLocalState();
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
  const dataUrl = await readFileAsDataUrl(file);
  state.project.source = {
    dataUrl,
    fileName: file.name,
    mimeType: file.type || "image/png",
  };
  await restoreSourceImage();
  fitToFrame();
}

async function restoreSourceImage() {
  if (!state.project.source.dataUrl) {
    state.sourceImage = null;
    syncUiFromState();
    render();
    return;
  }
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
  saveLocalState();
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
  saveLocalState();
  queueRender();
}

function queueRender(skipSave = false) {
  if (state.renderQueued) return;
  state.renderQueued = true;
  requestAnimationFrame(() => {
    state.renderQueued = false;
    render();
    if (!skipSave) saveLocalState();
  });
}

function render() {
  const canvas = els.previewCanvas;
  const ctx = previewCtx;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!state.sourceImage) {
    els.emptyState.hidden = false;
    ctx.fillStyle = "#090a0c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  els.emptyState.hidden = true;
  const workingCanvas = document.createElement("canvas");
  workingCanvas.width = canvas.width;
  workingCanvas.height = canvas.height;
  const workingCtx = workingCanvas.getContext("2d", { willReadFrequently: true });
  drawBaseImage(workingCtx, workingCanvas.width, workingCanvas.height);
  applyEffects(workingCanvas, workingCtx);
  ctx.drawImage(workingCanvas, 0, 0);
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
  const { corrections, styles, fx, colors } = state.project;
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;

  applyBasicAdjustments(data, corrections, fx.hueShift);
  if (styles.grayscale > 0) applyGrayscale(data, styles.grayscale / 100);
  if (styles.blackwhite > 0) applyBlackWhite(data, styles.blackwhite);
  if (styles.sepia > 0) applySepia(data, styles.sepia / 100);
  if (styles.posterize > 0) applyPosterize(data, styles.posterize);
  if (styles.vintage > 0) applyVintage(data, styles.vintage / 100);
  if (styles.duotone > 0) applyDuotone(data, styles.duotone / 100, colors.duotoneDark, colors.duotoneLight);
  if (fx.invert > 0) applyInvert(data, fx.invert / 100);
  if (fx.silhouette > 0) applySilhouette(data, fx.silhouette / 100);

  ctx.putImageData(imageData, 0, 0);

  if (corrections.blur > 0) applyCanvasBlur(canvas, corrections.blur);
  if (fx.backgroundBlur > 0) applyFocusBlur(canvas, fx.focusCenter / 100 || 0.65, fx.backgroundBlur);
  if (corrections.sharpen > 0) {
    convolveCanvas(canvas, [0, -1, 0, -1, 5 + corrections.sharpen, -1, 0, -1, 0], 0.28 * corrections.sharpen);
  }
  if (fx.edges > 0) convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], fx.edges / 100);
  if (fx.emboss > 0) convolveCanvas(canvas, [-2, -1, 0, -1, 1, 1, 0, 1, 2], fx.emboss / 100);
  if (fx.pencil > 0) applyPencilSketch(canvas, fx.pencil / 100);
  if (fx.charcoal > 0) applyCharcoal(canvas, fx.charcoal / 100);
  if (fx.comic > 0) applyComic(canvas, fx.comic / 100);
  if (styles.halftone > 0) applyHalftone(canvas, styles.halftone);
  if (fx.pixelate > 0) applyPixelate(canvas, fx.pixelate);
  if (fx.glitch > 0) applyGlitch(canvas, fx.glitch / 100);

  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  data = imageData.data;

  if (fx.grain > 0) applyGrain(data, fx.grain / 100);
  if (fx.vignette > 0) applyVignette(data, canvas.width, canvas.height, fx.vignette / 100);
  if (fx.scanlines > 0) applyScanlines(data, canvas.width, canvas.height, fx.scanlines / 100);
  if (fx.overlayOpacity > 0) applyOverlay(data, colors.overlayColor, fx.overlayOpacity / 100);
  if (fx.frame > 0) applyFrame(data, canvas.width, canvas.height, fx.frame / 100);

  ctx.putImageData(imageData, 0, 0);
}

function applyBasicAdjustments(data, corrections, hueShift) {
  const brightness = corrections.brightness * 2.55;
  const contrastFactor = (259 * (corrections.contrast + 255)) / (255 * (259 - corrections.contrast));
  const saturation = 1 + corrections.saturation / 100;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] + brightness;
    let g = data[i + 1] + brightness;
    let b = data[i + 2] + brightness;

    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;

    if (hueShift !== 0) [r, g, b] = shiftHue(r, g, b, hueShift);

    data[i] = clamp(r, 0, 255);
    data[i + 1] = clamp(g, 0, 255);
    data[i + 2] = clamp(b, 0, 255);
  }
}

function applyGrayscale(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = mix(data[i], gray, amount);
    data[i + 1] = mix(data[i + 1], gray, amount);
    data[i + 2] = mix(data[i + 2], gray, amount);
  }
}

function applyBlackWhite(data, threshold) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const value = gray > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}

function applySepia(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const nr = clamp(r * 0.393 + g * 0.769 + b * 0.189, 0, 255);
    const ng = clamp(r * 0.349 + g * 0.686 + b * 0.168, 0, 255);
    const nb = clamp(r * 0.272 + g * 0.534 + b * 0.131, 0, 255);
    data[i] = mix(r, nr, amount);
    data[i + 1] = mix(g, ng, amount);
    data[i + 2] = mix(b, nb, amount);
  }
}

function applyPosterize(data, amount) {
  const levels = Math.max(2, 16 - amount);
  const step = 255 / levels;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;
  }
}

function applyVintage(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + 18 * amount, 0, 255);
    data[i + 1] = clamp(data[i + 1] + 8 * amount, 0, 255);
    data[i + 2] = clamp(data[i + 2] - 20 * amount, 0, 255);
  }
}

function applyDuotone(data, amount, darkColor, lightColor) {
  const dark = hexToRgb(darkColor);
  const light = hexToRgb(lightColor);
  for (let i = 0; i < data.length; i += 4) {
    const gray = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const nr = dark.r + (light.r - dark.r) * gray;
    const ng = dark.g + (light.g - dark.g) * gray;
    const nb = dark.b + (light.b - dark.b) * gray;
    data[i] = mix(data[i], nr, amount);
    data[i + 1] = mix(data[i + 1], ng, amount);
    data[i + 2] = mix(data[i + 2], nb, amount);
  }
}

function applyInvert(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = mix(data[i], 255 - data[i], amount);
    data[i + 1] = mix(data[i + 1], 255 - data[i + 1], amount);
    data[i + 2] = mix(data[i + 2], 255 - data[i + 2], amount);
  }
}

function applySilhouette(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const target = gray > 0.55 ? 255 : 20;
    data[i] = mix(data[i], target, amount);
    data[i + 1] = mix(data[i + 1], target, amount);
    data[i + 2] = mix(data[i + 2], target, amount);
  }
}

function applyGrain(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 90 * amount;
    data[i] = clamp(data[i] + noise, 0, 255);
    data[i + 1] = clamp(data[i + 1] + noise, 0, 255);
    data[i + 2] = clamp(data[i + 2] + noise, 0, 255);
  }
}

function applyVignette(data, width, height, amount) {
  const cx = width / 2;
  const cy = height / 2;
  const maxDistance = Math.hypot(cx, cy);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const distance = Math.hypot(x - cx, y - cy) / maxDistance;
      const factor = 1 - Math.max(0, distance - 0.25) * amount * 1.2;
      data[idx] *= factor;
      data[idx + 1] *= factor;
      data[idx + 2] *= factor;
    }
  }
}

function applyScanlines(data, width, height, amount) {
  for (let y = 0; y < height; y += 2) {
    const factor = 1 - amount * 0.22;
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      data[idx] *= factor;
      data[idx + 1] *= factor;
      data[idx + 2] *= factor;
    }
  }
}

function applyOverlay(data, colorHex, amount) {
  const color = hexToRgb(colorHex);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = mix(data[i], color.r, amount * 0.45);
    data[i + 1] = mix(data[i + 1], color.g, amount * 0.45);
    data[i + 2] = mix(data[i + 2], color.b, amount * 0.45);
  }
}

function applyFrame(data, width, height, amount) {
  const frameSize = Math.round(Math.min(width, height) * 0.18 * amount);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x < frameSize || x > width - frameSize || y < frameSize || y > height - frameSize) {
        const idx = (y * width + x) * 4;
        data[idx] = mix(data[idx], 245, 0.9);
        data[idx + 1] = mix(data[idx + 1], 240, 0.9);
        data[idx + 2] = mix(data[idx + 2], 232, 0.9);
      }
    }
  }
}

function applyCanvasBlur(canvas, strength) {
  const copy = document.createElement("canvas");
  copy.width = canvas.width;
  copy.height = canvas.height;
  const copyCtx = copy.getContext("2d");
  copyCtx.filter = `blur(${strength}px)`;
  copyCtx.drawImage(canvas, 0, 0);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(copy, 0, 0);
}

function convolveCanvas(canvas, kernel, amount) {
  if (amount <= 0) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = ctx.createImageData(canvas.width, canvas.height);
  const src = imageData.data;
  const dst = result.data;
  const side = Math.round(Math.sqrt(kernel.length));
  const half = Math.floor(side / 2);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const dstIndex = (y * canvas.width + x) * 4;
      for (let c = 0; c < 3; c += 1) {
        let sum = 0;
        for (let ky = 0; ky < side; ky += 1) {
          for (let kx = 0; kx < side; kx += 1) {
            const px = clamp(x + kx - half, 0, canvas.width - 1);
            const py = clamp(y + ky - half, 0, canvas.height - 1);
            const srcIndex = (py * canvas.width + px) * 4 + c;
            sum += src[srcIndex] * kernel[ky * side + kx];
          }
        }
        dst[dstIndex + c] = clamp(mix(src[dstIndex + c], sum, amount), 0, 255);
      }
      dst[dstIndex + 3] = src[dstIndex + 3];
    }
  }
  ctx.putImageData(result, 0, 0);
}

function applyPixelate(canvas, amount) {
  const scale = clamp(Math.round(amount), 1, 60);
  if (scale <= 1) return;
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(canvas.width / scale));
  small.height = Math.max(1, Math.round(canvas.height / scale));
  const smallCtx = small.getContext("2d");
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.drawImage(canvas, 0, 0, small.width, small.height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(small, 0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
}

function applyGlitch(canvas, amount) {
  const ctx = canvas.getContext("2d");
  const slices = Math.max(2, Math.round(12 * amount));
  for (let i = 0; i < slices; i += 1) {
    const y = Math.random() * canvas.height;
    const h = Math.max(4, Math.random() * canvas.height * 0.08);
    const offset = (Math.random() - 0.5) * canvas.width * 0.1 * amount;
    ctx.drawImage(canvas, 0, y, canvas.width, h, offset, y, canvas.width, h);
  }
}

function applyHalftone(canvas, step) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f4efe6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const size = Math.max(4, 22 - step);
  for (let y = 0; y < canvas.height; y += size) {
    for (let x = 0; x < canvas.width; x += size) {
      const idx = (y * canvas.width + x) * 4;
      const gray = (source.data[idx] + source.data[idx + 1] + source.data[idx + 2]) / 3;
      const radius = (1 - gray / 255) * (size * 0.45);
      ctx.beginPath();
      ctx.fillStyle = "#101010";
      ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function applyPencilSketch(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const original = imageData.data;
  applyGrayscale(original, 1);
  invertImageData(original);
  ctx.putImageData(imageData, 0, 0);
  applyCanvasBlur(canvas, 12 * amount + 1);
  const blurred = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const blend = blurred.data;
  for (let i = 0; i < original.length; i += 4) {
    const base = 255 - original[i];
    const dodge = 255 - blend[i];
    const value = dodge <= 0 ? 255 : Math.min(255, (base * 255) / dodge);
    original[i] = value;
    original[i + 1] = value;
    original[i + 2] = value;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyCharcoal(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  applyGrayscale(data, 1);
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    const noisy = clamp(gray + (Math.random() - 0.5) * 120 * amount, 0, 255);
    const value = noisy > 140 ? 255 : noisy > 90 ? 120 : 12;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyComic(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyPosterize(imageData.data, 10);
  ctx.putImageData(imageData, 0, 0);
  convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], amount * 0.85);
}

function applyFocusBlur(canvas, focusAmount, blurAmount) {
  const ctx = canvas.getContext("2d");
  const sharpCopy = document.createElement("canvas");
  sharpCopy.width = canvas.width;
  sharpCopy.height = canvas.height;
  sharpCopy.getContext("2d").drawImage(canvas, 0, 0);

  const blurred = document.createElement("canvas");
  blurred.width = canvas.width;
  blurred.height = canvas.height;
  const blurredCtx = blurred.getContext("2d");
  blurredCtx.filter = `blur(${blurAmount}px)`;
  blurredCtx.drawImage(canvas, 0, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(blurred, 0, 0);

  const radius = Math.min(canvas.width, canvas.height) * clamp(0.18 + focusAmount * 0.34, 0.2, 0.55);
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(sharpCopy, 0, 0);
  ctx.restore();
}

function invertImageData(data) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

async function exportCurrentImage() {
  try {
    const blob = await createExportBlob();
    downloadBlob(blob, makeExportFilename());
  } catch (error) {
    console.error(error);
    alert(t("exportFailed"));
  }
}

async function shareCurrentImage() {
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

async function shareProjectBackup() {
  const blob = createBackupBlob();
  if (!navigator.share) {
    downloadBlob(blob, "threadline-studio-project.json");
    return;
  }
  try {
    const file = new File([blob], "threadline-studio-project.json", { type: "application/json" });
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      downloadBlob(blob, file.name);
      return;
    }
    await navigator.share({
      title: "Threadline Studio",
      text: t("projectShareText"),
      files: [file],
    });
  } catch (error) {
    if (error?.name !== "AbortError") console.error(error);
  }
}

async function createExportBlob() {
  const width = state.project.export.width;
  const aspect = els.previewCanvas.height / els.previewCanvas.width;
  const height = Math.round(width * aspect);
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width;
  exportCanvas.height = height;
  const exportCtx = exportCanvas.getContext("2d", { willReadFrequently: true });
  drawBaseImage(exportCtx, width, height);
  applyEffects(exportCanvas, exportCtx);

  const format = state.project.export.format;
  if (format === "pdf") {
    const jpegBlob = await canvasToBlob(exportCanvas, "image/jpeg", 0.92);
    return createSimplePdfBlob(jpegBlob, width, height);
  }

  const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  return canvasToBlob(exportCanvas, mime, state.project.export.quality);
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
    syncUiFromState();
    saveLocalState();
    restoreSourceImage();
    alert(t("backupLoaded"));
  } catch (error) {
    console.error(error);
    alert(t("backupInvalid"));
  }
}

function clearProject() {
  state.project = createDefaultProject();
  state.sourceImage = null;
  syncUiFromState();
  saveLocalState();
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
  els.duotoneDarkInput.value = state.project.colors.duotoneDark;
  els.duotoneLightInput.value = state.project.colors.duotoneLight;
  els.overlayColorInput.value = state.project.colors.overlayColor;
  els.languageSelect.value = state.settings.languagePreference;

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
  els.versionBadge.textContent = `v${state.versionInfo.appVersion}`;
  els.footerVersionLabel.textContent = `Version ${state.versionInfo.appVersion}`;
  els.projectRevisionBadge.textContent = `r${state.project.meta.revision}`;
  els.autosaveBadge.textContent = `${t("autosaveReady")} · ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function loadLocalState() {
  try {
    const savedProject = localStorage.getItem(STORAGE_KEY);
    if (savedProject) state.project = mergeProject(createDefaultProject(), JSON.parse(savedProject));
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
  } catch (error) {
    console.error(error);
  }
}

function saveLocalState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
}

function mergeProject(base, incoming) {
  return {
    ...base,
    ...incoming,
    meta: { ...base.meta, ...incoming?.meta },
    source: { ...base.source, ...incoming?.source },
    transform: { ...base.transform, ...incoming?.transform },
    corrections: { ...base.corrections, ...incoming?.corrections },
    styles: { ...base.styles, ...incoming?.styles },
    fx: { ...base.fx, ...incoming?.fx },
    colors: { ...base.colors, ...incoming?.colors },
    export: { ...base.export, ...incoming?.export },
  };
}

function applyTranslations() {
  const language = getActiveLanguage();
  document.documentElement.lang = language === "auto" ? "de" : language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  syncUiFromState();
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
  let value = dict[key] ?? fallback[key] ?? key;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    value = value.replaceAll(`{${paramKey}}`, String(paramValue));
  }
  return value;
}

async function loadVersionInfo() {
  try {
    const response = await fetch("./version.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    state.versionInfo = { ...DEFAULT_VERSION, ...data };
    syncUiFromState();
  } catch (error) {
    console.error(error);
  }
}

function checkForUpdates(showAlert = false) {
  if (showAlert) alert(t("updateChecking"));
  fetch("./version.json", { cache: "no-store" })
    .then((response) => response.json())
    .then((data) => {
      if (String(data.appVersion) !== String(state.versionInfo.appVersion)) {
        alert(t("updateAvailable", { version: data.appVersion }));
      } else if (showAlert) {
        alert(t("updateCurrent"));
      }
      state.versionInfo = { ...DEFAULT_VERSION, ...data };
      syncUiFromState();
    })
    .catch((error) => {
      console.error(error);
      if (showAlert) alert(t("updateFailed"));
    });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error(error);
    });
  });
}

function formatControlValue(control, value) {
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

function shiftHue(r, g, b, degrees) {
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToRgb((h + degrees + 360) % 360, s, l);
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

function normalizeDegrees(value) {
  let result = value % 360;
  if (result > 180) result -= 360;
  if (result < -180) result += 360;
  return result;
}
