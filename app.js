const I18N = window.THREADLINE_STUDIO_I18N || {};
const STORAGE_KEY = "threadline-studio-project";
const PROJECT_STATE_KEY = "threadline-studio-project-state";
const PROJECT_SOURCE_KEY = "threadline-studio-project-source";
const SETTINGS_KEY = "threadline-studio-settings";
const LOCAL_SAVE_DEBOUNCE_MS = 320;
const APP_SHARE_TITLE = "Threadline Studio";
const APP_SHARE_URL = "https://marsrakete.github.io/threadlinestudio/";
const APP_SHARE_QR_ASSET = "./assets/threadline-studio-share-qr.svg";
const FALLBACK_VERSION_INFO = Object.freeze({
  appVersion: "0.2.10",
  cacheVersion: "v111",
  label: "Gummituch naeher an Membranlook gebracht",
});
const DEFAULT_VERSION = Object.freeze(normalizeVersionInfo(globalThis.APP_VERSION_INFO || FALLBACK_VERSION_INFO));
const CURRENT_VERSION_INFO = DEFAULT_VERSION;

const CONTROL_GROUPS = {
  corrections: [
    { key: "brightness", min: -100, max: 100, step: 1, value: 0, label: "Helligkeit" },
    { key: "contrast", min: -100, max: 100, step: 1, value: 0, label: "Kontrast" },
    { key: "saturation", min: -100, max: 100, step: 1, value: 0, label: "Saettigung" },
    { key: "blur", min: 0, max: 18, step: 0.2, value: 0, label: "Unschaerfe" },
    { key: "sharpen", min: 0, max: 4, step: 0.1, value: 0, label: "Schaerfen" },
    { key: "focusCenter", min: 0, max: 100, step: 1, value: 0, label: "Fokus Mitte", i18nKey: "correctionFocusCenter" },
    { key: "backgroundBlur", min: 0, max: 32, step: 1, value: 0, label: "Hintergrund weich", i18nKey: "correctionBackgroundBlur" },
  ],
  styles: [
    { key: "grayscale", min: 0, max: 100, step: 1, value: 0, label: "Graustufen" },
    { key: "blackwhite", min: 0, max: 255, step: 1, value: 0, label: "Schwarzweiss" },
    { key: "sepia", min: 0, max: 100, step: 1, value: 0, label: "Sepia" },
    { key: "duotone", min: 0, max: 100, step: 1, value: 0, label: "Duotone" },
    { key: "hueShift", min: -180, max: 180, step: 1, value: 0, label: "Farbton", i18nKey: "styleHueShift" },
    { key: "colorFocus1", min: 0, max: 100, step: 1, value: 0, label: "Farbfokus 1", i18nKey: "styleColorFocusOne" },
    { key: "colorFocusTolerance1", min: 0, max: 100, step: 1, value: 24, label: "Toleranz 1", i18nKey: "styleColorFocusToleranceOne" },
    { key: "colorFocus2", min: 0, max: 100, step: 1, value: 0, label: "Farbfokus 2", i18nKey: "styleColorFocusTwo" },
    { key: "colorFocusTolerance2", min: 0, max: 100, step: 1, value: 24, label: "Toleranz 2", i18nKey: "styleColorFocusToleranceTwo" },
    { key: "colorSwap", min: 0, max: 100, step: 1, value: 0, label: "Farben tauschen", i18nKey: "styleColorSwap" },
    { key: "warmCool", min: -100, max: 100, step: 1, value: 0, label: "Warm/Kalt", i18nKey: "styleWarmCool" },
    { key: "splitTone", min: 0, max: 100, step: 1, value: 0, label: "Split Tone", i18nKey: "styleSplitTone" },
    { key: "saturationMask", min: 0, max: 100, step: 1, value: 0, label: "Saettigungsmaske", i18nKey: "styleSaturationMask" },
    { key: "gradientMap", min: 0, max: 100, step: 1, value: 0, label: "Gradient Map", i18nKey: "styleGradientMap" },
    { key: "falseColor", min: 0, max: 100, step: 1, value: 0, label: "False Color", i18nKey: "styleFalseColor" },
    { key: "crossProcess", min: 0, max: 100, step: 1, value: 0, label: "Cross Process", i18nKey: "styleCrossProcess" },
    { key: "heatmap", min: 0, max: 100, step: 1, value: 0, label: "Heatmap", i18nKey: "styleHeatmap" },
    { key: "posterBlocks", min: 0, max: 100, step: 1, value: 0, label: "Poster-Farbflaechen", i18nKey: "stylePosterBlocks" },
    { key: "colorSeparation", min: 0, max: 100, step: 1, value: 0, label: "Farbtrennung", i18nKey: "styleColorSeparation" },
    { key: "luminanceColor", min: -100, max: 100, step: 1, value: 0, label: "Luminanz-Farbe", i18nKey: "styleLuminanceColor" },
    { key: "vintage", min: 0, max: 100, step: 1, value: 0, label: "Vintage" },
    { key: "oilPaint", min: 0, max: 100, step: 1, value: 0, label: "Oelfarbe" },
    { key: "popArt", min: 0, max: 100, step: 1, value: 0, label: "Pop Art" },
    { key: "posterize", min: 0, max: 12, step: 1, value: 0, label: "Posterize" },
    { key: "halftone", min: 0, max: 18, step: 1, value: 0, label: "Halftone" },
  ],
  fx: [
    { key: "pixelate", min: 0, max: 60, step: 1, value: 0, label: "Pixelate" },
    { key: "glitch", min: 0, max: 100, step: 1, value: 0, label: "Glitch" },
    { key: "edges", min: 0, max: 100, step: 1, value: 0, label: "Konturen" },
    { key: "emboss", min: 0, max: 100, step: 1, value: 0, label: "Relief" },
    { key: "pencil", min: 0, max: 100, step: 1, value: 0, label: "Konturzeichnung" },
    { key: "lineBlend", min: 0, max: 1000, step: 1, value: 0, label: "Bleistiftpause", i18nKey: "fxLineBlend" },
    { key: "charcoal", min: 0, max: 100, step: 1, value: 0, label: "Kohle" },
    { key: "invert", min: 0, max: 100, step: 1, value: 0, label: "Invertieren" },
    { key: "comic", min: 0, max: 100, step: 1, value: 0, label: "Comic" },
    { key: "silhouette", min: 0, max: 100, step: 1, value: 0, label: "Silhouette" },
  ],
  morphology: [
    { key: "canny", min: 0, max: 100, step: 1, value: 0, label: "Canny" },
    { key: "dilation", min: 0, max: 100, step: 1, value: 0, label: "Dilatation" },
    { key: "erosion", min: 0, max: 100, step: 1, value: 0, label: "Erosion" },
    { key: "opening", min: 0, max: 100, step: 1, value: 0, label: "Opening" },
    { key: "closing", min: 0, max: 100, step: 1, value: 0, label: "Closing" },
    { key: "topHat", min: 0, max: 100, step: 1, value: 0, label: "Top Hat" },
    { key: "blackHat", min: 0, max: 100, step: 1, value: 0, label: "Black Hat" },
  ],
  patterns: [
    { key: "testPattern", min: 0, max: 100, step: 1, value: 0, label: "Testbild" },
    { key: "stripes", min: 0, max: 100, step: 1, value: 0, label: "Streifen" },
    { key: "checker", min: 0, max: 100, step: 1, value: 0, label: "Kariert" },
    { key: "dots", min: 0, max: 100, step: 1, value: 0, label: "Punkte" },
    { key: "diagonalLines", min: 0, max: 100, step: 1, value: 0, label: "Diagonal" },
    { key: "crosshatch", min: 0, max: 100, step: 1, value: 0, label: "Schraffur" },
    { key: "waves", min: 0, max: 100, step: 1, value: 0, label: "Wellen" },
    { key: "meshFence", min: 0, max: 100, step: 1, value: 0, label: "Maschendraht" },
    { key: "tireTracks", min: 0, max: 1000, step: 1, value: 0, label: "Reifenspuren" },
    { key: "fingerprint", min: 0, max: 1000, step: 1, value: 0, label: "Fingerabdruck" },
    { key: "topoLines", min: 0, max: 100, step: 1, value: 0, label: "Topografie" },
    { key: "staffLines", min: 0, max: 100, step: 1, value: 0, label: "Notenlinien" },
    { key: "blueprintGrid", min: 0, max: 100, step: 1, value: 0, label: "Blueprint" },
    { key: "zebra", min: 0, max: 100, step: 1, value: 0, label: "Zebra" },
    { key: "gradientWash", min: 0, max: 100, step: 1, value: 0, label: "Verlauf" },
    { key: "overlayOpacity", min: 0, max: 100, step: 1, value: 0, label: "Overlay", i18nKey: "patternOverlayOpacity" },
    { key: "frame", min: 0, max: 100, step: 1, value: 0, label: "Rahmen", i18nKey: "patternFrame" },
  ],
  materials: [
    { key: "bottleGlass", min: 0, max: 1000, step: 1, value: 0, label: "Glasflasche" },
    { key: "frostedGlass", min: 0, max: 1000, step: 1, value: 0, label: "Milchglas" },
    { key: "raindrops", min: 0, max: 1000, step: 1, value: 0, label: "Regentropfen" },
    { key: "scratches", min: 0, max: 1000, step: 1, value: 0, label: "Kratzer" },
    { key: "plasticWrap", min: 0, max: 1000, step: 1, value: 0, label: "Folie" },
    { key: "paperFiber", min: 0, max: 1000, step: 1, value: 0, label: "Papierfaser" },
    { key: "cardboard", min: 0, max: 1000, step: 1, value: 0, label: "Karton" },
    { key: "newsprint", min: 0, max: 1000, step: 1, value: 0, label: "Zeitung" },
    { key: "thermalFax", min: 0, max: 1000, step: 1, value: 0, label: "Thermopapier" },
    { key: "brushedMetal", min: 0, max: 1000, step: 1, value: 0, label: "Metall" },
    { key: "perforatedMetal", min: 0, max: 100, step: 1, value: 0, label: "Lochblech" },
    { key: "concrete", min: 0, max: 1000, step: 1, value: 0, label: "Beton" },
    { key: "asphalt", min: 0, max: 1000, step: 1, value: 0, label: "Asphalt" },
    { key: "paperTexture", min: 0, max: 100, step: 1, value: 0, label: "Papier" },
    { key: "linen", min: 0, max: 1000, step: 1, value: 0, label: "Leinen" },
    { key: "meshFabric", min: 0, max: 1000, step: 1, value: 0, label: "Netzstoff" },
  ],
  atmosphere: [
    { key: "tvNoise", min: 0, max: 1000, step: 1, value: 0, label: "Fernsehrauschen" },
    { key: "crtDrift", min: 0, max: 1000, step: 1, value: 0, label: "CRT Drift" },
    { key: "jpegArtifacts", min: 0, max: 1000, step: 1, value: 0, label: "JPEG Artefakte" },
    { key: "printMisregister", min: 0, max: 1000, step: 1, value: 0, label: "Druckversatz" },
    { key: "overexposure", min: 0, max: 1000, step: 1, value: 0, label: "Ueberbelichtung" },
    { key: "lightLeak", min: 0, max: 1000, step: 1, value: 0, label: "Lichtleck" },
    { key: "dustScratches", min: 0, max: 1000, step: 1, value: 0, label: "Staub & Kratzer" },
    { key: "haze", min: 0, max: 1000, step: 1, value: 0, label: "Nebel" },
    { key: "shadowCast", min: 0, max: 1000, step: 1, value: 0, label: "Schattenwurf" },
    { key: "reflections", min: 0, max: 1000, step: 1, value: 0, label: "Spiegelung" },
    { key: "moire", min: 0, max: 1000, step: 1, value: 0, label: "Moire" },
    { key: "doubleExposure", min: 0, max: 1000, step: 1, value: 0, label: "Doppelbelichtung" },
    { key: "grain", min: 0, max: 100, step: 1, value: 0, label: "Filmkorn" },
    { key: "vignette", min: 0, max: 100, step: 1, value: 0, label: "Vignette" },
    { key: "scanlines", min: 0, max: 100, step: 1, value: 0, label: "Scanlines" },
  ],
  art: [
    { key: "gridDecay", min: 0, max: 1000, step: 1, value: 0, label: "Rasterzerfall", i18nKey: "artGridDecay" },
    { key: "dadaCollage", min: 0, max: 1000, step: 1, value: 0, label: "Dada Collage", i18nKey: "artDadaCollage" },
    { key: "cubistFacets", min: 0, max: 1000, step: 1, value: 0, label: "Kubistische Facetten", i18nKey: "artCubistFacets" },
    { key: "dreamLook", min: 0, max: 1000, step: 1, value: 0, label: "Traumlook", i18nKey: "artDreamLook" },
    { key: "asciiText", min: 0, max: 1000, step: 1, value: 0, label: "ASCII Text", i18nKey: "artAsciiText" },
    { key: "carpet", min: 0, max: 1000, step: 1, value: 0, label: "Teppich", i18nKey: "artCarpet" },
    { key: "mosaic", min: 0, max: 1000, step: 1, value: 0, label: "Mosaik", i18nKey: "artMosaic" },
    { key: "matrixRain", min: 0, max: 1000, step: 1, value: 0, label: "Matrix", i18nKey: "artMatrixRain" },
    { key: "candy", min: 0, max: 1000, step: 1, value: 0, label: "Candy", i18nKey: "artCandy" },
    { key: "neonLines", min: 0, max: 1000, step: 1, value: 0, label: "Neon Linien", i18nKey: "artNeonLines" },
    { key: "icehouse", min: 0, max: 1000, step: 1, value: 0, label: "Icehouse", i18nKey: "artIcehouse" },
    { key: "sandstorm", min: 0, max: 1000, step: 1, value: 0, label: "Sandsturm", i18nKey: "artSandstorm" },
    { key: "abstracted", min: 0, max: 1000, step: 1, value: 0, label: "Abstrakt", i18nKey: "artAbstracted" },
    { key: "feltMarker", min: 0, max: 1000, step: 1, value: 0, label: "Filzstift", i18nKey: "artFeltMarker" },
    { key: "linoCut", min: 0, max: 1000, step: 1, value: 0, label: "Linol-Schnitt", i18nKey: "artLinoCut" },
    { key: "pointillism", min: 0, max: 1000, step: 1, value: 0, label: "Pointillistisch", i18nKey: "artPointillism" },
    { key: "ballpointPen", min: 0, max: 1000, step: 1, value: 0, label: "Kugelschreiber", i18nKey: "artBallpointPen" },
    { key: "squashStretch", min: 0, max: 1000, step: 1, value: 0, label: "Stauchen & Dehnen", i18nKey: "artSquashStretch" },
    { key: "randomWords", min: 0, max: 1000, step: 1, value: 0, label: "Zufallswoerter", i18nKey: "artRandomWords" },
    { key: "minecraft", min: 0, max: 1000, step: 1, value: 0, label: "Minecraft", i18nKey: "artMinecraft" },
  ],
  artists: [
    { key: "mondriaan", min: 0, max: 1000, step: 1, value: 0, label: "Mondriaan", i18nKey: "artMondriaan" },
    { key: "vanGogh", min: 0, max: 1000, step: 1, value: 0, label: "Van Gogh", i18nKey: "artVanGogh" },
    { key: "augustMacke", min: 0, max: 1000, step: 1, value: 0, label: "August Macke", i18nKey: "artAugustMacke" },
    { key: "arp", min: 0, max: 1000, step: 1, value: 0, label: "Hans Arp", i18nKey: "artArp" },
    { key: "paulKlee", min: 0, max: 1000, step: 1, value: 0, label: "Paul Klee", i18nKey: "artPaulKlee" },
    { key: "marcChagall", min: 0, max: 1000, step: 1, value: 0, label: "Marc Chagall", i18nKey: "artMarcChagall" },
    { key: "kandinsky", min: 0, max: 1000, step: 1, value: 0, label: "Kandinsky", i18nKey: "artKandinsky" },
    { key: "malevich", min: 0, max: 1000, step: 1, value: 0, label: "Kasimir Malewitsch", i18nKey: "artMalevich" },
    { key: "soniaDelaunay", min: 0, max: 1000, step: 1, value: 0, label: "Sonia Delaunay", i18nKey: "artSoniaDelaunay" },
    { key: "robertDelaunay", min: 0, max: 1000, step: 1, value: 0, label: "Robert Delaunay", i18nKey: "artRobertDelaunay" },
    { key: "cezanne", min: 0, max: 1000, step: 1, value: 0, label: "Paul Cezanne", i18nKey: "artCezanne" },
    { key: "braque", min: 0, max: 1000, step: 1, value: 0, label: "Georges Braque", i18nKey: "artBraque" },
    { key: "franzMarc", min: 0, max: 1000, step: 1, value: 0, label: "Franz Marc", i18nKey: "artFranzMarc" },
    { key: "schiele", min: 0, max: 1000, step: 1, value: 0, label: "Egon Schiele", i18nKey: "artSchiele" },
    { key: "matisse", min: 0, max: 1000, step: 1, value: 0, label: "Henri Matisse", i18nKey: "artMatisse" },
    { key: "miro", min: 0, max: 1000, step: 1, value: 0, label: "Joan Miro", i18nKey: "artMiro" },
    { key: "pollock", min: 0, max: 1000, step: 1, value: 0, label: "Jackson Pollock", i18nKey: "artPollock" },
    { key: "lichtenstein", min: 0, max: 1000, step: 1, value: 0, label: "Roy Lichtenstein", i18nKey: "artLichtenstein" },
    { key: "hokusai", min: 0, max: 1000, step: 1, value: 0, label: "Hokusai", i18nKey: "artHokusai" },
    { key: "escher", min: 0, max: 1000, step: 1, value: 0, label: "Escher", i18nKey: "artEscher" },
    { key: "klimt", min: 0, max: 1000, step: 1, value: 0, label: "Gustav Klimt", i18nKey: "artKlimt" },
    { key: "hilmaAfKlint", min: 0, max: 1000, step: 1, value: 0, label: "Hilma af Klint", i18nKey: "artHilmaAfKlint" },
    { key: "kusama", min: 0, max: 1000, step: 1, value: 0, label: "Yayoi Kusama", i18nKey: "artKusama" },
    { key: "gerhardRichter", min: 0, max: 1000, step: 1, value: 0, label: "Gerhard Richter", i18nKey: "artGerhardRichter" },
    { key: "monet", min: 0, max: 1000, step: 1, value: 0, label: "Claude Monet", i18nKey: "artMonet" },
    { key: "picasso", min: 0, max: 1000, step: 1, value: 0, label: "Picasso", i18nKey: "artPicasso" },
    { key: "ottoDix", min: 0, max: 1000, step: 1, value: 0, label: "Otto Dix", i18nKey: "artOttoDix" },
    { key: "andyWarhol", min: 0, max: 1000, step: 1, value: 0, label: "Andy Warhol", i18nKey: "artAndyWarhol" },
    { key: "botticelli", min: 0, max: 1000, step: 1, value: 0, label: "Sandro Botticelli", i18nKey: "artBotticelli" },
    { key: "munch", min: 0, max: 1000, step: 1, value: 0, label: "Edvard Munch", i18nKey: "artMunch" },
    { key: "toulouseLautrec", min: 0, max: 1000, step: 1, value: 0, label: "Henri de Toulouse-Lautrec", i18nKey: "artToulouseLautrec" },
    { key: "salvadorDali", min: 0, max: 1000, step: 1, value: 0, label: "Salvador Dali", i18nKey: "artSalvadorDali" },
  ],
  graphics: [
    { key: "bauhaus", min: 0, max: 1000, step: 1, value: 0, label: "Bauhaus", i18nKey: "graphicBauhaus" },
    { key: "brutalism", min: 0, max: 1000, step: 1, value: 0, label: "Brutalismus", i18nKey: "graphicBrutalism" },
    { key: "swissPoster", min: 0, max: 1000, step: 1, value: 0, label: "Swiss Poster", i18nKey: "graphicSwissPoster" },
    { key: "kodachrome", min: 0, max: 1000, step: 1, value: 0, label: "Kodachrome", i18nKey: "graphicKodachrome" },
    { key: "daguerreotype", min: 0, max: 1000, step: 1, value: 0, label: "Daguerreotypie", i18nKey: "graphicDaguerreotype" },
    { key: "risograph", min: 0, max: 1000, step: 1, value: 0, label: "Risograph", i18nKey: "graphicRisograph" },
    { key: "screenprint", min: 0, max: 1000, step: 1, value: 0, label: "Siebdruck", i18nKey: "graphicScreenprint" },
    { key: "roentgen", min: 0, max: 1000, step: 1, value: 0, label: "Roentgen", i18nKey: "graphicRoentgen" },
  ],
  wordArt: [
    { key: "textMosaic", min: 0, max: 1000, step: 1, value: 0, label: "Textmosaik", i18nKey: "wordArtTextMosaic" },
    { key: "asciiDeluxe", min: 0, max: 1000, step: 1, value: 0, label: "ASCII Deluxe", i18nKey: "wordArtAsciiDeluxe" },
    { key: "keywordCloud", min: 0, max: 1000, step: 1, value: 0, label: "Schlagwortwolke", i18nKey: "wordArtKeywordCloud" },
    { key: "contourText", min: 0, max: 1000, step: 1, value: 0, label: "Konturtext", i18nKey: "wordArtContourText" },
    { key: "typoHalftone", min: 0, max: 1000, step: 1, value: 0, label: "Typo-Halftone", i18nKey: "wordArtTypoHalftone" },
    { key: "typoRelief", min: 0, max: 1000, step: 1, value: 0, label: "Typo-Relief", i18nKey: "wordArtTypoRelief" },
    { key: "linePoetry", min: 0, max: 1000, step: 1, value: 0, label: "Zeilenpoesie", i18nKey: "wordArtLinePoetry" },
    { key: "stampText", min: 0, max: 1000, step: 1, value: 0, label: "Stempeltext", i18nKey: "wordArtStampText" },
    { key: "magazineCollage", min: 0, max: 1000, step: 1, value: 0, label: "Magazin-Collage", i18nKey: "wordArtMagazineCollage" },
    { key: "popSlogans", min: 0, max: 1000, step: 1, value: 0, label: "Pop-Slogans", i18nKey: "wordArtPopSlogans" },
    { key: "matrixText", min: 0, max: 1000, step: 1, value: 0, label: "Datenraster", i18nKey: "wordArtMatrixText" },
    { key: "wordSilhouette", min: 0, max: 1000, step: 1, value: 0, label: "Wort-Silhouette", i18nKey: "wordArtWordSilhouette" },
  ],
  fragment: [
    { key: "tileSwap", min: 0, max: 1000, step: 1, value: 0, label: "Kacheln vertauschen", i18nKey: "fragmentTileSwap" },
    { key: "stripShift", min: 0, max: 1000, step: 1, value: 0, label: "Streifen verschieben", i18nKey: "fragmentStripShift" },
    { key: "shards", min: 0, max: 1000, step: 1, value: 0, label: "Scherben", i18nKey: "fragmentShards" },
    { key: "patchwork", min: 0, max: 1000, step: 1, value: 0, label: "Patchwork", i18nKey: "fragmentPatchwork" },
  ],
  cut: [
    { key: "punchCard", min: 0, max: 1000, step: 1, value: 0, label: "Lochkarte", i18nKey: "cutPunchCard" },
    { key: "perforation", min: 0, max: 1000, step: 1, value: 0, label: "Perforation", i18nKey: "cutPerforation" },
    { key: "dieCut", min: 0, max: 1000, step: 1, value: 0, label: "Stanzform", i18nKey: "cutDieCut" },
    { key: "paperCut", min: 0, max: 1000, step: 1, value: 0, label: "Scherenschnitt", i18nKey: "cutPaperCut" },
  ],
  morph: [
    { key: "swirlMorph", min: 0, max: 1000, step: 1, value: 0, label: "Wirbel", i18nKey: "morphSwirl" },
    { key: "meltMorph", min: 0, max: 1000, step: 1, value: 0, label: "Schmelzen", i18nKey: "morphMelt" },
    { key: "rubberSheet", min: 0, max: 1000, step: 1, value: 0, label: "Gummituch", i18nKey: "morphRubberSheet" },
    { key: "wavePull", min: 0, max: 1000, step: 1, value: 0, label: "Wellenzug", i18nKey: "morphWavePull" },
  ],
};

const VERY_STRONG_CONTROL_KEYS = new Set([
  "lineBlend",
  "tireTracks",
  "fingerprint",
  "testPattern",
]);

const VERY_STRONG_CONTROL_GROUPS = new Set(["art", "artists", "graphics", "wordArt", "fragment", "cut", "morph"]);

const STRONG_CONTROL_KEYS = new Set([
  "backgroundBlur",
  "falseColor",
  "crossProcess",
  "heatmap",
  "posterBlocks",
  "oilPaint",
  "popArt",
  "halftone",
  "glitch",
  "edges",
  "emboss",
  "pencil",
  "charcoal",
  "comic",
  "silhouette",
  "meshFence",
  "overlayOpacity",
]);

const STRONG_CONTROL_GROUPS = new Set(["materials", "atmosphere"]);

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
  scratchCanvases: [],
  scratchCanvasIndex: 0,
  readmeText: "",
  updateInProgress: false,
  reloadInProgress: false,
};

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
  renderControls(els.styleFields, CONTROL_GROUPS.styles.filter((control) => !["colorFocus1", "colorFocusTolerance1", "colorFocus2", "colorFocusTolerance2", "colorSwap"].includes(control.key)), "styles");
  renderControls(els.colorFocusFields, CONTROL_GROUPS.styles.filter((control) => ["colorFocus1", "colorFocusTolerance1", "colorFocus2", "colorFocusTolerance2", "colorSwap"].includes(control.key)), "styles");
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

function renderControls(container, controls, groupKey) {
  container.innerHTML = "";
  for (const control of controls) {
    const label = document.createElement("label");
    label.className = "field";
    const intensityClass = getControlIntensityClass(groupKey, control.key);
    if (intensityClass) {
      label.classList.add(intensityClass);
    } else if (isStrongControl(groupKey, control.key)) {
      label.classList.add("field-strong");
    }
    const title = document.createElement("span");
    title.dataset.controlI18n = control.i18nKey || "";
    title.dataset.controlFallback = control.label;
    title.textContent = control.i18nKey ? t(control.i18nKey) : control.label;
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

function getControlIntensityClass(groupKey, controlKey) {
  if (VERY_STRONG_CONTROL_GROUPS.has(groupKey) || VERY_STRONG_CONTROL_KEYS.has(controlKey)) {
    return "field-very-strong";
  }
  if (STRONG_CONTROL_GROUPS.has(groupKey) || STRONG_CONTROL_KEYS.has(controlKey)) {
    return "field-strong";
  }
  return "";
}

function isStrongControl(groupKey, controlKey) {
  return STRONG_CONTROL_GROUPS.has(groupKey) || STRONG_CONTROL_KEYS.has(controlKey);
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
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushLocalStateSave(true);
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

function resetScratchCanvases() {
  state.scratchCanvasIndex = 0;
}

function getScratchCanvas(width, height) {
  const index = state.scratchCanvasIndex;
  let canvas = state.scratchCanvases[index];
  if (!canvas) {
    canvas = document.createElement("canvas");
    state.scratchCanvases[index] = canvas;
  }
  state.scratchCanvasIndex += 1;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  return canvas;
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
  const { styles, fx, corrections } = state.project;
  return (
    fx.pencil > 0
    || fx.charcoal > 0
    || fx.comic > 0
    || fx.edges > 0
    || fx.emboss > 0
    || styles.halftone > 0
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
  const { corrections, styles, fx, morphology, patterns, materials, atmosphere, art, wordArt, fragment, cut, morph, artists, graphics, colors } = state.project;
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

    applyBasicAdjustments(data, corrections, styles.hueShift || 0);
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
    if (styles.grayscale > 0) applyGrayscale(data, styles.grayscale / 100);
    if (styles.blackwhite > 0) applyBlackWhite(data, styles.blackwhite);
    if (styles.sepia > 0) applySepia(data, styles.sepia / 100);
    if (styles.posterize > 0) applyPosterize(data, styles.posterize);
    if (styles.vintage > 0) applyVintage(data, styles.vintage / 100);
    if (styles.duotone > 0) applyDuotone(data, styles.duotone / 100, colors.duotoneDark, colors.duotoneLight);
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

    if (atmosphere.grain > 0) applyGrain(data, atmosphere.grain / 100);
    if (atmosphere.vignette > 0) applyVignette(data, canvas.width, canvas.height, atmosphere.vignette / 100);
    if (atmosphere.scanlines > 0) applyScanlines(data, canvas.width, canvas.height, atmosphere.scanlines / 100);
    if (styles.colorSeparation > 0) applyColorSeparation(data, canvas.width, canvas.height, styles.colorSeparation / 100);
    if (patterns.overlayOpacity > 0) applyOverlay(data, colors.overlayColor, patterns.overlayOpacity / 100);
    if (patterns.frame > 0) applyFrame(data, canvas.width, canvas.height, patterns.frame / 100);

    ctx.putImageData(imageData, 0, 0);
  }
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

function applyColorFocus(data, amount, targetHex, tolerance) {
  if (!targetHex || amount <= 0) return;
  const rgb = hexToRgb(targetHex);
  const [targetHue, targetSat, targetLight] = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hueTolerance = 4 + tolerance * 58;
  const satThreshold = 0.05 + tolerance * 0.14;
  const softRange = 6 + tolerance * 24;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const [h, s, l] = rgbToHsl(r, g, b);
    const hueDistance = getHueDistance(h, targetHue);
    const satFactor = s <= satThreshold ? 1 : 1 - s * 0.55;
    const focusDistance = hueDistance + satFactor * 44 + Math.abs(l - targetLight) * 18 + Math.abs(s - targetSat) * 12;
    const preserve = 1 - smoothstep(hueTolerance, hueTolerance + softRange, focusDistance);
    const targetR = mix(gray, r, preserve);
    const targetG = mix(gray, g, preserve);
    const targetB = mix(gray, b, preserve);
    data[i] = mix(r, targetR, amount);
    data[i + 1] = mix(g, targetG, amount);
    data[i + 2] = mix(b, targetB, amount);
  }
}

function applyColorSwap(data, amount, sourceHex, targetHex, tolerance) {
  if (!sourceHex || !targetHex) return;
  const sourceRgb = hexToRgb(sourceHex);
  const targetRgb = hexToRgb(targetHex);
  const [sourceHue, sourceSat, sourceLight] = rgbToHsl(sourceRgb.r, sourceRgb.g, sourceRgb.b);
  const [targetHue, targetSat, targetLight] = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
  const hueTolerance = 6 + tolerance * 84;
  const softRange = 8 + tolerance * 42;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    const sourceDistance = getHueDistance(h, sourceHue) + Math.abs(s - sourceSat) * 30 + Math.abs(l - sourceLight) * 18;
    const targetDistance = getHueDistance(h, targetHue) + Math.abs(s - targetSat) * 30 + Math.abs(l - targetLight) * 18;
    const sourceMask = 1 - smoothstep(hueTolerance, hueTolerance + softRange, sourceDistance);
    const targetMask = 1 - smoothstep(hueTolerance, hueTolerance + softRange, targetDistance);
    const sourceBlend = clamp(sourceMask * amount, 0, 1);
    const targetBlend = clamp(targetMask * amount, 0, 1);
    const keepLum = 0.4 + l * 0.6;
    const swapToTarget = {
      r: clamp(targetRgb.r * keepLum, 0, 255),
      g: clamp(targetRgb.g * keepLum, 0, 255),
      b: clamp(targetRgb.b * keepLum, 0, 255),
    };
    const swapToSource = {
      r: clamp(sourceRgb.r * keepLum, 0, 255),
      g: clamp(sourceRgb.g * keepLum, 0, 255),
      b: clamp(sourceRgb.b * keepLum, 0, 255),
    };
    const nr = sourceBlend >= targetBlend ? mix(r, swapToTarget.r, sourceBlend) : mix(r, swapToSource.r, targetBlend);
    const ng = sourceBlend >= targetBlend ? mix(g, swapToTarget.g, sourceBlend) : mix(g, swapToSource.g, targetBlend);
    const nb = sourceBlend >= targetBlend ? mix(b, swapToTarget.b, sourceBlend) : mix(b, swapToSource.b, targetBlend);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
}

function applyWarmCoolFocus(data, signedAmount) {
  const amount = Math.abs(signedAmount);
  if (amount < 0.001) return;
  const targetHue = signedAmount >= 0 ? 28 : 214;
  const hueTolerance = mix(48, 20, amount);
  const softRange = mix(52, 26, amount);
  const muteStrength = mix(0.18, 0.78, amount);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const [h, s] = rgbToHsl(r, g, b);
    const hueDistance = getHueDistance(h, targetHue);
    const preserve = 1 - smoothstep(hueTolerance, hueTolerance + softRange, hueDistance + (1 - s) * 24);
    const muteAmount = clamp((1 - preserve) * muteStrength, 0, 1);
    data[i] = mix(r, gray, muteAmount);
    data[i + 1] = mix(g, gray, muteAmount);
    data[i + 2] = mix(b, gray, muteAmount);
  }
}

function applySplitTone(data, amount, shadowHex, highlightHex) {
  const shadow = hexToRgb(shadowHex);
  const highlight = hexToRgb(highlightHex);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const shadowWeight = clamp((0.58 - luma) / 0.5, 0, 1) * amount;
    const highlightWeight = clamp((luma - 0.42) / 0.5, 0, 1) * amount;
    const nr = mix(mix(r, shadow.r, shadowWeight), highlight.r, highlightWeight);
    const ng = mix(mix(g, shadow.g, shadowWeight), highlight.g, highlightWeight);
    const nb = mix(mix(b, shadow.b, shadowWeight), highlight.b, highlightWeight);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
}

function applySaturationMask(data, amount) {
  const threshold = mix(0.18, 0.62, amount);
  const softRange = mix(0.28, 0.12, amount);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const [, s] = rgbToHsl(r, g, b);
    const preserve = smoothstep(threshold - softRange, threshold + softRange, s);
    const keepAmount = clamp(preserve * amount, 0, 1);
    data[i] = mix(gray, r, keepAmount);
    data[i + 1] = mix(gray, g, keepAmount);
    data[i + 2] = mix(gray, b, keepAmount);
  }
}

function applyGradientMap(data, amount, paletteHexes) {
  const palette = paletteHexes.map(hexToRgb);
  for (let i = 0; i < data.length; i += 4) {
    const luma = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const mapped = sampleThreeColorGradient(palette, luma);
    data[i] = mix(data[i], mapped.r, amount);
    data[i + 1] = mix(data[i + 1], mapped.g, amount);
    data[i + 2] = mix(data[i + 2], mapped.b, amount);
  }
}

function applyFalseColor(data, amount, paletteHexes) {
  const palette = paletteHexes.map(hexToRgb);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    const mapped = sampleThreeColorGradient(palette, clamp((l * 0.75) + (s * 0.25), 0, 1));
    const shifted = shiftHue(mapped.r, mapped.g, mapped.b, (h - 180) * 0.18);
    data[i] = mix(r, shifted[0], amount);
    data[i + 1] = mix(g, shifted[1], amount);
    data[i + 2] = mix(b, shifted[2], amount);
  }
}

function applyCrossProcess(data, amount) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const nr = clamp(r * (1 - 0.08 * amount) + g * 0.04 * amount + 10 * amount, 0, 255);
    const ng = clamp(g * (1 - 0.04 * amount) + b * 0.08 * amount + 4 * amount, 0, 255);
    const nb = clamp(b * (1 + 0.12 * amount) - r * 0.05 * amount + 16 * amount, 0, 255);
    data[i] = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }
}

function applyHeatmap(data, amount) {
  const stops = [
    { r: 18, g: 22, b: 84 },
    { r: 37, g: 164, b: 196 },
    { r: 255, g: 214, b: 10 },
    { r: 221, g: 52, b: 44 },
  ];
  for (let i = 0; i < data.length; i += 4) {
    const luma = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    const mapped = sampleFourColorGradient(stops, luma);
    data[i] = mix(data[i], mapped.r, amount);
    data[i + 1] = mix(data[i + 1], mapped.g, amount);
    data[i + 2] = mix(data[i + 2], mapped.b, amount);
  }
}

function applyPosterBlocks(data, amount) {
  const levels = Math.max(2, Math.round(mix(7, 3, amount)));
  for (let i = 0; i < data.length; i += 4) {
    const r = quantizeChannel(data[i], levels);
    const g = quantizeChannel(data[i + 1], levels);
    const b = quantizeChannel(data[i + 2], levels);
    const boosted = posterBlockBoost(r, g, b, amount);
    data[i] = mix(data[i], boosted.r, amount);
    data[i + 1] = mix(data[i + 1], boosted.g, amount);
    data[i + 2] = mix(data[i + 2], boosted.b, amount);
  }
}

function applyLuminanceColor(data, signedAmount) {
  const amount = Math.abs(signedAmount);
  if (amount < 0.001) return;
  const biasToHighlights = signedAmount >= 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const luma = gray / 255;
    const preserve = biasToHighlights ? smoothstep(0.32, 0.88, luma) : 1 - smoothstep(0.12, 0.68, luma);
    const keepAmount = clamp(preserve * amount, 0, 1);
    data[i] = mix(gray, r, keepAmount);
    data[i + 1] = mix(gray, g, keepAmount);
    data[i + 2] = mix(gray, b, keepAmount);
  }
}

function applyColorSeparation(data, width, height, amount) {
  if (amount < 0.001) return;
  const copy = new Uint8ClampedArray(data);
  const shift = Math.max(1, Math.round(amount * 8));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const rIndex = getPixelIndex(clamp(x - shift, 0, width - 1), y, width);
      const gIndex = idx;
      const bIndex = getPixelIndex(clamp(x + shift, 0, width - 1), y, width);
      data[idx] = mix(copy[idx], copy[rIndex], amount);
      data[idx + 1] = copy[gIndex + 1];
      data[idx + 2] = mix(copy[idx + 2], copy[bIndex + 2], amount);
    }
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
  const copy = getScratchCanvas(canvas.width, canvas.height);
  const copyCtx = copy.getContext("2d");
  copyCtx.filter = `blur(${strength}px)`;
  copyCtx.clearRect(0, 0, copy.width, copy.height);
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
  const small = getScratchCanvas(
    Math.max(1, Math.round(canvas.width / scale)),
    Math.max(1, Math.round(canvas.height / scale))
  );
  const smallCtx = small.getContext("2d");
  smallCtx.clearRect(0, 0, small.width, small.height);
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

function applyContourTracing(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const output = ctx.createImageData(canvas.width, canvas.height);
  const gray = new Float32Array(canvas.width * canvas.height);
  for (let i = 0, p = 0; i < source.data.length; i += 4, p += 1) {
    gray[p] = 0.299 * source.data[i] + 0.587 * source.data[i + 1] + 0.114 * source.data[i + 2];
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
      const gx = right - left;
      const gy = bottom - top;
      const gradient = Math.sqrt(gx * gx + gy * gy);
      const edge = smoothstep(softThreshold, edgeCeiling, gradient);
      const luminanceShade = (255 - gray[index]) / 255;
      const tracedBase = clamp(
        paper - edge * 205 * lineStrength - luminanceShade * 52 * shadeStrength,
        18,
        252
      );
      const sourceGray = gray[index];
      const traced = clamp(mix(sourceGray, tracedBase, 0.22 + amount * 0.78), 18, 252);
      const outIndex = index * 4;
      output.data[outIndex] = traced;
      output.data[outIndex + 1] = traced;
      output.data[outIndex + 2] = traced;
      output.data[outIndex + 3] = source.data[outIndex + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
  if (amount > 0.45) {
    convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], Math.min(0.06, amount * 0.03));
  }
}

function applyLineBlend(canvas, amount) {
  const baseCtx = canvas.getContext("2d", { willReadFrequently: true });
  const base = baseCtx.getImageData(0, 0, canvas.width, canvas.height);
  const progress = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const gray = toGrayscaleArray(base.data);
  const blurred = boxBlurGray(gray, canvas.width, canvas.height, amount < 0.5 ? 1 : 2);
  const gradient = computeSobelGradient(blurred, canvas.width, canvas.height);
  const softThreshold = 12 + progress * 28 + turbo * 6;
  const edgeCeiling = 58 + progress * 110 + turbo * 34;
  const low = 16 + (0.24 + progress * 0.7 + turbo * 0.16) * 22;
  const high = 48 + (0.24 + progress * 0.7 + turbo * 0.16) * 84;
  const paper = 246 - progress * 10 - turbo * 6;
  const lineStrength = 0.74 + progress * 0.5 + turbo * 0.14;
  const shadeStrength = 0.12 + progress * 0.18 + turbo * 0.06;

  for (let i = 0; i < base.data.length; i += 4) {
    const p = i / 4;
    const x = p % canvas.width;
    const y = Math.floor(p / canvas.width);
    const baseGray = (base.data[i] + base.data[i + 1] + base.data[i + 2]) / 3;
    const left = blurred[y * canvas.width + Math.max(0, x - 1)];
    const right = blurred[y * canvas.width + Math.min(canvas.width - 1, x + 1)];
    const top = blurred[Math.max(0, y - 1) * canvas.width + x];
    const bottom = blurred[Math.min(canvas.height - 1, y + 1) * canvas.width + x];
    const gx = right - left;
    const gy = bottom - top;
    const edgeMask = smoothstep(softThreshold, edgeCeiling, gradient[p]);
    const edgeGray = clamp(255 - edgeMask * 255, 0, 255);
    const embossGray = clamp(128 + gx * 0.9 + gy * 0.7, 0, 255);
    const luminanceShade = (255 - gray[p]) / 255;
    const traceGray = clamp(
      paper - edgeMask * 205 * lineStrength - luminanceShade * 52 * shadeStrength,
      18,
      252
    );
    const cannyMask = smoothstep(low, high, gradient[p]);
    const cannyGray = clamp(255 - cannyMask * 255, 0, 255);
    const composite = clamp(
      traceGray * (0.64 + turbo * 0.08)
      + edgeGray * (0.11 + turbo * 0.02)
      + embossGray * (0.15 + turbo * 0.06)
      + cannyGray * (0.1 + turbo * 0.05),
      0,
      255
    );
    const mixed = clamp(mix(baseGray, composite, 0.22 + progress * 0.72 + turbo * 0.08), 0, 255);
    base.data[i] = mixed;
    base.data[i + 1] = mixed;
    base.data[i + 2] = mixed;
  }
  baseCtx.putImageData(base, 0, 0);
}

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

function applyCharcoal(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  applyGrayscale(data, 1);
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    const noisy = clamp(gray + (Math.random() - 0.5) * (24 + amount * 48), 0, 255);
    const value = noisy > 164 ? 245 : noisy > 112 ? 132 : noisy > 64 ? 62 : 18;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyComic(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyPosterize(imageData.data, Math.round(4 + amount * 6));
  ctx.putImageData(imageData, 0, 0);
  convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], amount);
}

function applyOilPaint(canvas, amount) {
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const src = sourceCtx.getImageData(0, 0, canvas.width, canvas.height);
  const dst = new ImageData(canvas.width, canvas.height);
  const radius = Math.max(1, Math.round(1 + amount * 3));
  const levels = Math.max(4, Math.round(10 - amount * 4));

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const buckets = new Array(levels).fill(null).map(() => ({ count: 0, r: 0, g: 0, b: 0 }));
      for (let ky = -radius; ky <= radius; ky += 1) {
        for (let kx = -radius; kx <= radius; kx += 1) {
          const px = clamp(x + kx, 0, canvas.width - 1);
          const py = clamp(y + ky, 0, canvas.height - 1);
          const index = (py * canvas.width + px) * 4;
          const gray = (src.data[index] + src.data[index + 1] + src.data[index + 2]) / 3;
          const bucketIndex = clamp(Math.floor((gray / 255) * (levels - 1)), 0, levels - 1);
          const bucket = buckets[bucketIndex];
          bucket.count += 1;
          bucket.r += src.data[index];
          bucket.g += src.data[index + 1];
          bucket.b += src.data[index + 2];
        }
      }
      const dominant = buckets.reduce((best, bucket) => (bucket.count > best.count ? bucket : best), buckets[0]);
      const out = (y * canvas.width + x) * 4;
      dst.data[out] = dominant.count ? dominant.r / dominant.count : src.data[out];
      dst.data[out + 1] = dominant.count ? dominant.g / dominant.count : src.data[out + 1];
      dst.data[out + 2] = dominant.count ? dominant.b / dominant.count : src.data[out + 2];
      dst.data[out + 3] = src.data[out + 3];
    }
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const mixed = mixImageData(src, dst, 0.22 + amount * 0.62);
  ctx.putImageData(mixed, 0, 0);
}

function applyPopArt(canvas, amount, overlayHex) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const accent = hexToRgb(overlayHex);
  const palette = [
    { r: 18, g: 26, b: 31 },
    { r: 255, g: 241, b: 86 },
    { r: accent.r, g: accent.g, b: accent.b },
    { r: 60, g: 170, b: 255 },
    { r: 255, g: 113, b: 163 },
  ];

  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const band = clamp(Math.floor((gray / 255) * palette.length), 0, palette.length - 1);
    const tone = palette[band];
    const mixAmount = 0.35 + amount * 0.55;
    data[i] = mix(data[i], tone.r, mixAmount);
    data[i + 1] = mix(data[i + 1], tone.g, mixAmount);
    data[i + 2] = mix(data[i + 2], tone.b, mixAmount);
  }

  ctx.putImageData(imageData, 0, 0);
  if (amount > 0.18) {
    convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 0.12 + amount * 0.18);
  }
}

function applyCannyLikeEdges(canvas, amount) {
  const source = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height);
  const gray = toGrayscaleArray(source.data);
  const blurred = boxBlurGray(gray, canvas.width, canvas.height, amount < 0.45 ? 1 : 2);
  const gradient = computeSobelGradient(blurred, canvas.width, canvas.height);
  const out = source.data.slice();
  const low = 16 + amount * 22;
  const high = 48 + amount * 84;
  const mixAmount = 0.1 + amount * 0.5;

  for (let i = 0, p = 0; i < out.length; i += 4, p += 1) {
    const edge = smoothstep(low, high, gradient[p]);
    const value = clamp(255 - edge * 255, 0, 255);
    const mixed = mix((out[i] + out[i + 1] + out[i + 2]) / 3, value, mixAmount);
    out[i] = mixed;
    out[i + 1] = mixed;
    out[i + 2] = mixed;
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  imageData.data.set(out);
  ctx.putImageData(imageData, 0, 0);
}

function applyMorphologyMix(canvas, mode, amount) {
  const sourceCanvas = cloneCanvas(canvas);
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const sourceData = sourceCtx.getImageData(0, 0, canvas.width, canvas.height);
  const resultData = applyMorphologyToImageData(sourceData, canvas.width, canvas.height, mode, amount);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.putImageData(resultData, 0, 0);
}

function applyFocusBlur(canvas, focusAmount, blurAmount) {
  const ctx = canvas.getContext("2d");
  const sharpCopy = getScratchCanvas(canvas.width, canvas.height);
  sharpCopy.getContext("2d").drawImage(canvas, 0, 0);

  const blurred = getScratchCanvas(canvas.width, canvas.height);
  const blurredCtx = blurred.getContext("2d");
  blurredCtx.filter = `blur(${blurAmount}px)`;
  blurredCtx.clearRect(0, 0, blurred.width, blurred.height);
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

function applyPatternEffects(canvas, patterns, colors) {
  const ctx = canvas.getContext("2d");
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (patterns.testPattern > 0) {
    drawTestPattern(ctx, canvas, patterns.testPattern / 100);
  }

  if (patterns.gradientWash > 0) {
    const amount = patterns.gradientWash / 100;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, rgbaString(soft, 0.08 + amount * 0.18));
    gradient.addColorStop(0.52, rgbaString(accent, 0.03 + amount * 0.12));
    gradient.addColorStop(1, rgbaString(dark, 0.02 + amount * 0.16));
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  if (patterns.stripes > 0) {
    const amount = patterns.stripes / 100;
    drawLinePattern(ctx, canvas, {
      spacing: Math.max(8, Math.round(28 - amount * 18)),
      lineWidth: Math.max(1, 1 + amount * 3),
      angle: 0,
      color: rgbaString(accent, 0.08 + amount * 0.18),
    });
  }

  if (patterns.diagonalLines > 0) {
    const amount = patterns.diagonalLines / 100;
    drawLinePattern(ctx, canvas, {
      spacing: Math.max(10, Math.round(34 - amount * 20)),
      lineWidth: Math.max(1, 1 + amount * 2.5),
      angle: -35,
      color: rgbaString(soft, 0.08 + amount * 0.18),
    });
  }

  if (patterns.crosshatch > 0) {
    const amount = patterns.crosshatch / 100;
    drawLinePattern(ctx, canvas, {
      spacing: Math.max(10, Math.round(36 - amount * 20)),
      lineWidth: Math.max(1, 0.8 + amount * 2),
      angle: 35,
      color: rgbaString(accent, 0.06 + amount * 0.14),
    });
    drawLinePattern(ctx, canvas, {
      spacing: Math.max(10, Math.round(36 - amount * 20)),
      lineWidth: Math.max(1, 0.8 + amount * 2),
      angle: -35,
      color: rgbaString(dark, 0.04 + amount * 0.12),
    });
  }

  if (patterns.checker > 0) {
    const amount = patterns.checker / 100;
    drawCheckerPattern(ctx, canvas, {
      size: Math.max(10, Math.round(42 - amount * 24)),
      colorA: rgbaString(accent, 0.04 + amount * 0.12),
      colorB: rgbaString(soft, 0.03 + amount * 0.08),
    });
  }

  if (patterns.dots > 0) {
    const amount = patterns.dots / 100;
    drawDotPattern(ctx, canvas, {
      spacing: Math.max(12, Math.round(34 - amount * 18)),
      radius: Math.max(1.5, 1.2 + amount * 4),
      color: rgbaString(accent, 0.08 + amount * 0.16),
    });
  }

  if (patterns.waves > 0) {
    const amount = patterns.waves / 100;
    drawWavePattern(ctx, canvas, {
      spacing: Math.max(18, Math.round(46 - amount * 22)),
      amplitude: 4 + amount * 12,
      color: rgbaString(soft, 0.06 + amount * 0.14),
      lineWidth: Math.max(1, 1 + amount * 2),
    });
  }

  if (patterns.meshFence > 0) {
    const amount = patterns.meshFence / 100;
    drawDiamondMesh(ctx, canvas, {
      size: Math.max(18, Math.round(46 - amount * 24)),
      lineWidth: Math.max(1.2, 1 + amount * 2.4),
      color: rgbaString(dark, 0.08 + amount * 0.2),
    });
  }

  if (patterns.tireTracks > 0) {
    const amount = patterns.tireTracks / 100;
    drawTireTracks(ctx, canvas, amount, accent);
  }

  if (patterns.fingerprint > 0) {
    const amount = patterns.fingerprint / 100;
    drawFingerprint(ctx, canvas, amount, dark);
  }

  if (patterns.topoLines > 0) {
    const amount = patterns.topoLines / 100;
    drawTopoLines(ctx, canvas, amount, soft);
  }

  if (patterns.staffLines > 0) {
    const amount = patterns.staffLines / 100;
    drawStaffLines(ctx, canvas, amount, dark);
  }

  if (patterns.blueprintGrid > 0) {
    const amount = patterns.blueprintGrid / 100;
    drawBlueprintGrid(ctx, canvas, amount, soft, dark);
  }

  if (patterns.zebra > 0) {
    const amount = patterns.zebra / 100;
    drawZebraPattern(ctx, canvas, amount);
  }

}

function applyMaterialEffects(canvas, materials, colors) {
  const ctx = canvas.getContext("2d");
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (materials.bottleGlass > 0) applyBottleGlass(canvas, curveThousand(materials.bottleGlass / 100, 1.3, 1));
  if (materials.frostedGlass > 0) applyFrostedGlass(canvas, curveThousand(materials.frostedGlass / 100, 1.35, 1));
  if (materials.raindrops > 0) drawRaindrops(ctx, canvas, curveThousand(materials.raindrops / 100, 1.35, 2.4));
  if (materials.scratches > 0) drawScratches(ctx, canvas, curveThousand(materials.scratches / 100, 1.5, 1));
  if (materials.plasticWrap > 0) drawPlasticWrap(ctx, canvas, curveThousand(materials.plasticWrap / 100, 1.4, 1));
  if (materials.paperFiber > 0) tintAndNoiseCanvas(canvas, curveThousand(materials.paperFiber / 100, 1.3, 1), [18, 14, 6], 18);
  if (materials.cardboard > 0) applyCardboard(canvas, curveThousand(materials.cardboard / 100, 1.28, 1));
  if (materials.newsprint > 0) applyNewsprint(canvas, curveThousand(materials.newsprint / 100, 1.18, 1));
  if (materials.thermalFax > 0) applyThermalFax(canvas, curveThousand(materials.thermalFax / 100, 1.32, 1));
  if (materials.brushedMetal > 0) drawBrushedMetal(ctx, canvas, curveThousand(materials.brushedMetal / 100, 1.35, 1));
  if (materials.perforatedMetal > 0) drawPerforatedPattern(ctx, canvas, materials.perforatedMetal / 100, dark);
  if (materials.concrete > 0) tintAndNoiseCanvas(canvas, curveThousand(materials.concrete / 100, 1.28, 1), [-10, -10, -10], 28);
  if (materials.asphalt > 0) tintAndNoiseCanvas(canvas, curveThousand(materials.asphalt / 100, 1.28, 1), [-28, -24, -18], 34);
  if (materials.paperTexture > 0) {
    const amount = materials.paperTexture / 100;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const tint = 6 + amount * 12;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * (10 + amount * 18);
      data[i] = clamp(data[i] + noise + tint, 0, 255);
      data[i + 1] = clamp(data[i + 1] + noise + tint * 0.95, 0, 255);
      data[i + 2] = clamp(data[i + 2] + noise + tint * 0.82, 0, 255);
    }
    ctx.putImageData(imageData, 0, 0);
  }
  if (materials.linen > 0) drawLinen(ctx, canvas, curveThousand(materials.linen / 100, 1.3, 1), soft);
  if (materials.meshFabric > 0) drawFabricMesh(ctx, canvas, curveThousand(materials.meshFabric / 100, 1.35, 1), accent, dark);
}

function applyAtmosphereEffects(canvas, atmosphere, colors) {
  const ctx = canvas.getContext("2d");
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (atmosphere.tvNoise > 0) applyTvNoise(canvas, curveThousand(atmosphere.tvNoise / 100, 1.35, 1));
  if (atmosphere.crtDrift > 0) applyCrtDrift(canvas, curveThousand(atmosphere.crtDrift / 100, 1.4, 1));
  if (atmosphere.jpegArtifacts > 0) applyJpegArtifacts(canvas, curveThousand(atmosphere.jpegArtifacts / 100, 1.32, 1));
  if (atmosphere.printMisregister > 0) applyPrintMisregister(canvas, curveThousand(atmosphere.printMisregister / 100, 1.45, 1));
  if (atmosphere.overexposure > 0) applyOverexposure(canvas, curveThousand(atmosphere.overexposure / 100, 1.4, 1));
  if (atmosphere.lightLeak > 0) drawLightLeak(ctx, canvas, curveThousand(atmosphere.lightLeak / 100, 1.35, 1), accent, soft);
  if (atmosphere.dustScratches > 0) drawDustAndScratches(ctx, canvas, curveThousand(atmosphere.dustScratches / 100, 1.45, 1));
  if (atmosphere.haze > 0) drawHaze(ctx, canvas, curveThousand(atmosphere.haze / 100, 1.35, 1), soft);
  if (atmosphere.shadowCast > 0) drawShadowCast(ctx, canvas, curveThousand(atmosphere.shadowCast / 100, 1.4, 1));
  if (atmosphere.reflections > 0) drawReflections(ctx, canvas, curveThousand(atmosphere.reflections / 100, 1.35, 1), soft);
  if (atmosphere.moire > 0) drawMoire(ctx, canvas, curveThousand(atmosphere.moire / 100, 1.45, 1), dark);
  if (atmosphere.doubleExposure > 0) applyDoubleExposure(canvas, curveThousand(atmosphere.doubleExposure / 100, 1.35, 1));
}

function applyArtEffects(canvas, art, colors) {
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (art.gridDecay > 0) applyGridDecay(canvas, art.gridDecay / 100, dark);
  if (art.dadaCollage > 0) applyDadaCollage(canvas, art.dadaCollage / 100, accent, soft, dark);
  if (art.cubistFacets > 0) applyCubistFacets(canvas, art.cubistFacets / 100, accent, soft, dark);
  if (art.dreamLook > 0) applyDreamLook(canvas, art.dreamLook / 100, soft);
  if (art.squashStretch > 0) applySquashStretch(canvas, art.squashStretch / 100);
  if (art.asciiText > 0) applyAsciiText(canvas, art.asciiText / 100, dark, soft);
  if (art.carpet > 0) applyCarpet(canvas, art.carpet / 100, accent, soft, dark);
  if (art.mosaic > 0) applyMosaic(canvas, art.mosaic / 100);
  if (art.matrixRain > 0) applyMatrixRain(canvas, art.matrixRain / 100);
  if (art.candy > 0) applyCandy(canvas, art.candy / 100, accent, soft, dark);
  if (art.neonLines > 0) applyNeonLines(canvas, art.neonLines / 100);
  if (art.icehouse > 0) applyIcehouse(canvas, art.icehouse / 100);
  if (art.sandstorm > 0) applySandstorm(canvas, art.sandstorm / 100);
  if (art.abstracted > 0) applyAbstracted(canvas, art.abstracted / 100, accent, soft, dark);
  if (art.feltMarker > 0) applyFeltMarker(canvas, art.feltMarker / 100);
  if (art.linoCut > 0) applyLinoCut(canvas, art.linoCut / 100, dark, soft);
  if (art.pointillism > 0) applyPointillism(canvas, art.pointillism / 100);
  if (art.ballpointPen > 0) applyBallpointPen(canvas, art.ballpointPen / 100);
  if (art.randomWords > 0) applyRandomWords(canvas, art.randomWords / 100, accent, soft, dark);
  if (art.minecraft > 0) applyMinecraft(canvas, art.minecraft / 100);
}

function applyWordArtEffects(canvas, wordArt, colors) {
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (wordArt.textMosaic > 0) applyTextMosaic(canvas, curveThousand(wordArt.textMosaic / 100, 1.12, 2.3), accent, soft, dark);
  if (wordArt.asciiDeluxe > 0) applyAsciiDeluxe(canvas, curveThousand(wordArt.asciiDeluxe / 100, 1.14, 2.35), accent, soft, dark);
  if (wordArt.keywordCloud > 0) applyKeywordCloud(canvas, curveThousand(wordArt.keywordCloud / 100, 1.12, 2.25), accent, soft, dark);
  if (wordArt.contourText > 0) applyContourText(canvas, curveThousand(wordArt.contourText / 100, 1.14, 2.4), accent, dark);
  if (wordArt.typoHalftone > 0) applyTypoHalftone(canvas, curveThousand(wordArt.typoHalftone / 100, 1.1, 2.2), accent, soft, dark);
  if (wordArt.typoRelief > 0) applyTypoRelief(canvas, curveThousand(wordArt.typoRelief / 100, 1.14, 2.4), accent, soft, dark);
  if (wordArt.linePoetry > 0) applyLinePoetry(canvas, curveThousand(wordArt.linePoetry / 100, 1.12, 2.25), accent, soft, dark);
  if (wordArt.stampText > 0) applyStampText(canvas, curveThousand(wordArt.stampText / 100, 1.14, 2.35), accent, soft, dark);
  if (wordArt.magazineCollage > 0) applyMagazineCollage(canvas, curveThousand(wordArt.magazineCollage / 100, 1.16, 2.45), accent, soft, dark);
  if (wordArt.popSlogans > 0) applyPopSlogans(canvas, curveThousand(wordArt.popSlogans / 100, 1.14, 2.4), accent, soft, dark);
  if (wordArt.matrixText > 0) applyMatrixText(canvas, curveThousand(wordArt.matrixText / 100, 1.16, 2.5), accent, soft, dark);
  if (wordArt.wordSilhouette > 0) applyWordSilhouette(canvas, curveThousand(wordArt.wordSilhouette / 100, 1.14, 2.35), accent, soft, dark);
}

function applyFragmentEffects(canvas, fragment, colors) {
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (fragment.tileSwap > 0) applyTileSwap(canvas, curveThousand(fragment.tileSwap / 100, 1.12, 2.55), dark);
  if (fragment.stripShift > 0) applyStripShift(canvas, curveThousand(fragment.stripShift / 100, 1.1, 2.45), accent, dark);
  if (fragment.shards > 0) applyShards(canvas, curveThousand(fragment.shards / 100, 1.12, 2.6), dark);
  if (fragment.patchwork > 0) applyPatchwork(canvas, curveThousand(fragment.patchwork / 100, 1.1, 2.45), accent, soft, dark);
}

function applyCutEffects(canvas, cut, colors) {
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (cut.punchCard > 0) applyPunchCard(canvas, curveThousand(cut.punchCard / 100, 1.1, 2.35), soft, dark);
  if (cut.perforation > 0) applyPerforation(canvas, curveThousand(cut.perforation / 100, 1.12, 2.45), soft, dark);
  if (cut.dieCut > 0) applyDieCut(canvas, curveThousand(cut.dieCut / 100, 1.12, 2.45), accent, soft, dark);
  if (cut.paperCut > 0) applyPaperCut(canvas, curveThousand(cut.paperCut / 100, 1.1, 2.4), soft, dark);
}

function applyMorphEffects(canvas, morph, colors) {
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);

  if (morph.swirlMorph > 0) applySwirlMorph(canvas, curveThousand(morph.swirlMorph / 100, 1.08, 2.9));
  if (morph.meltMorph > 0) applyMeltMorph(canvas, curveThousand(morph.meltMorph / 100, 1.06, 3.05), accent);
  if (morph.rubberSheet > 0) applyRubberSheet(canvas, curveThousand(morph.rubberSheet / 100, 1.08, 2.8));
  if (morph.wavePull > 0) applyWavePull(canvas, curveThousand(morph.wavePull / 100, 1.06, 2.95), soft);
}

function applyArtistEffects(canvas, artists, colors) {
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (artists.mondriaan > 0) applyMondriaan(canvas, curveThousand(artists.mondriaan / 100, 1.25, 1.85), dark);
  if (artists.vanGogh > 0) applyVanGogh(canvas, curveThousand(artists.vanGogh / 100, 1.28, 1.75), accent, soft, dark);
  if (artists.augustMacke > 0) applyAugustMacke(canvas, curveThousand(artists.augustMacke / 100, 1.24, 1.7), accent, soft, dark);
  if (artists.arp > 0) applyArp(canvas, curveThousand(artists.arp / 100, 1.26, 1.7), accent, soft, dark);
  if (artists.paulKlee > 0) applyPaulKlee(canvas, curveThousand(artists.paulKlee / 100, 1.23, 1.7), accent, soft, dark);
  if (artists.marcChagall > 0) applyMarcChagall(canvas, curveThousand(artists.marcChagall / 100, 1.26, 1.75), accent, soft, dark);
  if (artists.kandinsky > 0) applyKandinsky(canvas, curveThousand(artists.kandinsky / 100, 1.24, 1.8), accent, soft, dark);
  if (artists.malevich > 0) applyMalevich(canvas, curveThousand(artists.malevich / 100, 1.24, 1.8), dark);
  if (artists.soniaDelaunay > 0) applySoniaDelaunay(canvas, curveThousand(artists.soniaDelaunay / 100, 1.26, 1.78), accent, soft);
  if (artists.robertDelaunay > 0) applyRobertDelaunay(canvas, curveThousand(artists.robertDelaunay / 100, 1.26, 1.78), accent, soft);
  if (artists.cezanne > 0) applyCezanne(canvas, curveThousand(artists.cezanne / 100, 1.22, 1.72), accent, soft, dark);
  if (artists.braque > 0) applyBraque(canvas, curveThousand(artists.braque / 100, 1.24, 1.7), dark);
  if (artists.franzMarc > 0) applyFranzMarc(canvas, curveThousand(artists.franzMarc / 100, 1.24, 1.75), accent, soft, dark);
  if (artists.schiele > 0) applySchiele(canvas, curveThousand(artists.schiele / 100, 1.26, 1.7), dark);
  if (artists.matisse > 0) applyMatisse(canvas, curveThousand(artists.matisse / 100, 1.24, 1.76), accent, soft, dark);
  if (artists.miro > 0) applyMiro(canvas, curveThousand(artists.miro / 100, 1.24, 1.74), dark);
  if (artists.pollock > 0) applyPollock(canvas, curveThousand(artists.pollock / 100, 1.27, 1.85), accent, soft, dark);
  if (artists.lichtenstein > 0) applyLichtenstein(canvas, curveThousand(artists.lichtenstein / 100, 1.26, 1.8), accent, soft, dark);
  if (artists.hokusai > 0) applyHokusai(canvas, curveThousand(artists.hokusai / 100, 1.24, 1.78), dark);
  if (artists.escher > 0) applyEscher(canvas, curveThousand(artists.escher / 100, 1.25, 1.82), dark);
  if (artists.klimt > 0) applyKlimt(canvas, curveThousand(artists.klimt / 100, 1.26, 1.84), accent, soft, dark);
  if (artists.hilmaAfKlint > 0) applyHilmaAfKlint(canvas, curveThousand(artists.hilmaAfKlint / 100, 1.24, 1.8), accent, soft, dark);
  if (artists.kusama > 0) applyKusama(canvas, curveThousand(artists.kusama / 100, 1.26, 1.86), accent, soft, dark);
  if (artists.gerhardRichter > 0) applyGerhardRichter(canvas, curveThousand(artists.gerhardRichter / 100, 1.24, 1.86), dark);
  if (artists.monet > 0) applyMonet(canvas, curveThousand(artists.monet / 100, 1.22, 1.82), soft);
  if (artists.picasso > 0) applyPicasso(canvas, curveThousand(artists.picasso / 100, 1.08, 2.9), accent, soft, dark);
  if (artists.ottoDix > 0) applyOttoDix(canvas, curveThousand(artists.ottoDix / 100, 1.08, 2.8), dark);
  if (artists.andyWarhol > 0) applyAndyWarhol(canvas, curveThousand(artists.andyWarhol / 100, 1.24, 1.84), accent, soft, dark);
  if (artists.botticelli > 0) applyBotticelli(canvas, curveThousand(artists.botticelli / 100, 1.2, 1.8), soft, dark);
  if (artists.munch > 0) applyMunch(canvas, curveThousand(artists.munch / 100, 1.08, 2.9), accent, soft, dark);
  if (artists.toulouseLautrec > 0) applyToulouseLautrec(canvas, curveThousand(artists.toulouseLautrec / 100, 1.08, 2.8), accent, soft, dark);
  if (artists.salvadorDali > 0) applySalvadorDali(canvas, curveThousand(artists.salvadorDali / 100, 1.04, 3.35), accent, soft, dark);
}

function applyGraphicStyleEffects(canvas, graphics, colors) {
  const accent = hexToRgb(colors.overlayColor);
  const soft = hexToRgb(colors.duotoneLight);
  const dark = hexToRgb(colors.duotoneDark);

  if (graphics.bauhaus > 0) applyBauhaus(canvas, curveThousand(graphics.bauhaus / 100, 1.08, 2.8), accent, soft, dark);
  if (graphics.brutalism > 0) applyBrutalism(canvas, curveThousand(graphics.brutalism / 100, 1.08, 2.8), dark);
  if (graphics.swissPoster > 0) applySwissPoster(canvas, curveThousand(graphics.swissPoster / 100, 1.08, 2.7), accent, dark);
  if (graphics.kodachrome > 0) applyKodachrome(canvas, curveThousand(graphics.kodachrome / 100, 1.06, 2.65));
  if (graphics.daguerreotype > 0) applyDaguerreotype(canvas, curveThousand(graphics.daguerreotype / 100, 1.08, 2.7), dark);
  if (graphics.risograph > 0) applyRisograph(canvas, curveThousand(graphics.risograph / 100, 1.08, 2.8), accent, soft, dark);
  if (graphics.screenprint > 0) applyScreenprint(canvas, curveThousand(graphics.screenprint / 100, 1.08, 2.7), accent, soft, dark);
  if (graphics.roentgen > 0) applyRoentgen(canvas, curveThousand(graphics.roentgen / 100, 1.55, 1.9), soft, dark);
}

function applyGridDecay(canvas, amount, dark) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const source = cloneCanvas(canvas);
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const cols = Math.max(8, Math.round(12 + density * 4));
  const tile = Math.max(8, canvas.width / cols);
  const rows = Math.ceil(canvas.height / tile);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * tile;
      const y = row * tile;
      const progress = smoothstep(0.08, 1, y / Math.max(1, canvas.height - tile));
      const disorder = density * progress;
      const offsetX = (seededNoise(col, row, 0.31) - 0.5) * tile * 1.75 * disorder;
      const offsetY = (seededNoise(col, row, 1.17) - 0.5) * tile * 2.1 * disorder;
      const rotation = (seededNoise(col, row, 2.83) - 0.5) * (0.28 + disorder * 0.12);
      const size = tile * (0.98 + disorder * 0.14);

      ctx.save();
      ctx.translate(x + tile / 2 + offsetX, y + tile / 2 + offsetY);
      ctx.rotate(rotation);
      ctx.drawImage(source, x, y, tile, tile, -size / 2, -size / 2, size, size);
      if (strength > 0.08) {
        ctx.lineWidth = 0.4 + Math.min(1.6, disorder * 0.12);
        ctx.strokeStyle = rgbaString(dark, 0.03 + Math.min(0.24, disorder * 0.02));
        ctx.strokeRect(-size / 2, -size / 2, size, size);
      }
      ctx.restore();
    }
  }
}

function applyDadaCollage(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const progress = clamp(amount / 10, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 280 + progress * 220 + turbo * 80);
  const fragmentCount = Math.round(10 + progress * 120 + turbo * 80);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgba(246,242,234,${0.96})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = 0.18 + progress * 0.18;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (let i = 0; i < fragmentCount; i += 1) {
    const x = seededNoise(i, 1, 0.14) * canvas.width * 0.82;
    const y = seededNoise(i, 2, 0.49) * canvas.height * 0.82;
    const w = canvas.width * (0.05 + seededNoise(i, 3, 0.92) * (0.1 + progress * 0.12 + turbo * 0.03));
    const h = canvas.height * (0.035 + seededNoise(i, 4, 1.31) * (0.08 + progress * 0.09 + turbo * 0.025));
    const dx = x + (seededNoise(i, 6, 2.53) - 0.5) * canvas.width * (0.026 + progress * 0.13 + turbo * 0.03);
    const dy = y + (seededNoise(i, 7, 3.11) - 0.5) * canvas.height * (0.026 + progress * 0.13 + turbo * 0.03);
    const rotation = (seededNoise(i, 5, 1.89) - 0.5) * (0.16 + progress * 0.72 + turbo * 0.18);
    const sx = clamp(Math.round(x + w / 2), 0, canvas.width - 1);
    const sy = clamp(Math.round(y + h / 2), 0, canvas.height - 1);
    const colorIndex = getSampleSourceIndex(sampleSource, sx, sy);
    const paperColor = {
      r: mix(sampleSource.data[colorIndex], soft.r, 0.42),
      g: mix(sampleSource.data[colorIndex + 1], accent.g, 0.18),
      b: mix(sampleSource.data[colorIndex + 2], dark.b, 0.12),
    };

    ctx.save();
    ctx.translate(dx + w / 2, dy + h / 2);
    ctx.rotate(rotation);
    ctx.globalAlpha = clamp(0.16 + progress * 0.24 + turbo * 0.06, 0, 0.58);
    ctx.drawImage(source, x, y, w, h, -w / 2, -h / 2, w, h);
    ctx.fillStyle = i % 3 === 0
      ? rgbaString(paperColor, 0.04 + progress * 0.1 + turbo * 0.025)
      : i % 3 === 1
        ? rgbaString(soft, 0.05 + progress * 0.085 + turbo * 0.02)
        : rgbaString(accent, 0.03 + progress * 0.07 + turbo * 0.018);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = rgbaString(dark, 0.07 + progress * 0.09 + turbo * 0.02);
    ctx.lineWidth = 0.55 + progress * 0.6 + turbo * 0.08;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();

  if (progress > 0.45) {
    const wordCount = Math.round(2 + progress * 8 + turbo * 3);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < wordCount; i += 1) {
      const word = ["void", "echo", "clip", "noise", "paste", "cut"][i % 6];
      const size = 10 + seededNoise(i, 8, 0.9) * (10 + progress * 30);
      ctx.font = `${Math.round(size)}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = rgbaString(i % 2 === 0 ? dark : accent, 0.03 + progress * 0.045);
      ctx.fillText(word, seededNoise(i, 9, 1.2) * canvas.width, seededNoise(i, 10, 1.8) * canvas.height);
    }
    ctx.restore();
  }
}

function applyCubistFacets(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const cols = Math.max(5, Math.round(8 + density * 2.5));
  const rows = Math.max(6, Math.round(9 + density * 3));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const shiftX = (seededNoise(col, row, 3.9) - 0.5) * cellW * 0.42 * density;
      const shiftY = (seededNoise(col, row, 4.7) - 0.5) * cellH * 0.42 * density;
      const skewA = 0.14 + seededNoise(col, row, 5.1) * 0.3;
      const skewB = 0.12 + seededNoise(col, row, 5.6) * 0.32;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + cellW * skewA + shiftX, y + shiftY);
      ctx.lineTo(x + cellW + shiftX, y + cellH * skewB + shiftY);
      ctx.lineTo(x + cellW * (1 - skewA) + shiftX, y + cellH + shiftY);
      ctx.lineTo(x + shiftX, y + cellH * (1 - skewB) + shiftY);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = clamp(0.66 + strength * 0.12, 0, 0.9);
      ctx.drawImage(
        source,
        x,
        y,
        cellW,
        cellH,
        x + shiftX * (0.7 + density * 0.04),
        y + shiftY * (0.7 + density * 0.04),
        cellW * (0.98 + strength * 0.12 + density * 0.03),
        cellH * (0.98 + strength * 0.12 + density * 0.03)
      );
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + cellW * skewA + shiftX, y + shiftY);
      ctx.lineTo(x + cellW + shiftX, y + cellH * skewB + shiftY);
      ctx.lineTo(x + cellW * (1 - skewA) + shiftX, y + cellH + shiftY);
      ctx.lineTo(x + shiftX, y + cellH * (1 - skewB) + shiftY);
      ctx.closePath();
      ctx.strokeStyle = rgbaString(dark, 0.06 + strength * 0.1);
      ctx.lineWidth = 0.6 + strength * 0.5;
      ctx.stroke();
      ctx.restore();
    }
  }
}

function applyDreamLook(canvas, amount, soft) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const sampleSource = createSampleSource(source, 260 + strength * 200 + density * 40);
  const step = Math.max(10, Math.round(28 - Math.min(18, density * 1.6)));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(248, 244, 240)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const w = step * (1.12 + seededNoise(x, y, 0.8) * 0.42);
      const h = step * (1.04 + seededNoise(x, y, 1.6) * 0.42);
      const dx = x + (seededNoise(x, y, 2.3) - 0.5) * step * (0.22 + density * 0.018);
      const dy = y + (seededNoise(x, y, 3.1) - 0.5) * step * (0.22 + density * 0.018);
      ctx.save();
      ctx.translate(dx + w / 2, dy + h / 2);
      ctx.rotate((seededNoise(x, y, 4.2) - 0.5) * (0.14 + density * 0.03));
      ctx.fillStyle = `rgba(${sampleSource.data[index]},${sampleSource.data[index + 1]},${sampleSource.data[index + 2]},${0.3 + strength * 0.18})`;
      drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.28);
      ctx.fill();
      ctx.restore();
    }
  }

  const blurCanvas = cloneCanvas(canvas);
  const blurCtx = blurCanvas.getContext("2d");
  blurCtx.filter = `blur(${2 + strength * 10 + density * 1.8}px)`;
  blurCtx.drawImage(canvas, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = clamp(0.14 + strength * 0.12, 0, 0.28);
  ctx.drawImage(blurCanvas, canvas.width * 0.014, -canvas.height * 0.012, canvas.width, canvas.height);
  ctx.drawImage(blurCanvas, -canvas.width * 0.012, canvas.height * 0.01, canvas.width, canvas.height);
  ctx.restore();

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, rgbaString(soft, 0.05 + strength * 0.08));
  gradient.addColorStop(0.5, "rgba(255,255,255,0.04)");
  gradient.addColorStop(1, rgbaString(soft, 0.1 + strength * 0.14));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function applyAsciiText(canvas, amount, dark, soft) {
  const source = cloneCanvas(canvas);
  const progress = clamp(amount / 10, 0, 1);
  const step = Math.max(7, Math.round(30 - progress * 21));
  const sampleCanvas = getScratchCanvas(
    Math.max(1, Math.round(canvas.width / step)),
    Math.max(1, Math.round(canvas.height / step))
  );
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  sampleCtx.drawImage(source, 0, 0, sampleCanvas.width, sampleCanvas.height);
  const sample = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
  const ctx = canvas.getContext("2d");
  const chars = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

  ctx.save();
  ctx.fillStyle = rgbaString(soft, 0.985);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${Math.max(8, Math.round(step * 1.02))}px 'Consolas', 'Courier New', monospace`;
  ctx.textBaseline = "top";
  for (let y = 0; y < sampleCanvas.height; y += 1) {
    for (let x = 0; x < sampleCanvas.width; x += 1) {
      const index = (y * sampleCanvas.width + x) * 4;
      const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
      const darkness = 1 - gray / 255;
      const charIndex = clamp(Math.floor(darkness * (chars.length - 1)), 0, chars.length - 1);
      const color = {
        r: mix(sample[index], dark.r, 0.08 + darkness * 0.16),
        g: mix(sample[index + 1], dark.g, 0.08 + darkness * 0.16),
        b: mix(sample[index + 2], dark.b, 0.08 + darkness * 0.16),
      };
      ctx.fillStyle = rgbaString(color, 0.42 + darkness * 0.26 + progress * 0.08);
      ctx.fillText(chars[charIndex], x * step, y * step);
    }
  }
  ctx.restore();
}

function applyCarpet(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const sampleSource = createSampleSource(source, 260 + strength * 180 + density * 40);
  const step = Math.max(7, Math.round(22 - Math.min(14, density * 1.4)));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(241, 230, 214)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const baseColor = {
        r: sampleSource.data[index],
        g: sampleSource.data[index + 1],
        b: sampleSource.data[index + 2],
      };
      const warmColor = {
        r: clamp(baseColor.r * 0.86 + accent.r * 0.18 + 18, 0, 255),
        g: clamp(baseColor.g * 0.78 + soft.r * 0.1 + 10, 0, 255),
        b: clamp(baseColor.b * 0.66 + dark.b * 0.08, 0, 255),
      };
      const coolColor = {
        r: clamp(baseColor.r * 0.74 + soft.r * 0.16, 0, 255),
        g: clamp(baseColor.g * 0.82 + soft.g * 0.18, 0, 255),
        b: clamp(baseColor.b * 0.8 + accent.b * 0.12 + 8, 0, 255),
      };
      const yarnShift = (seededNoise(x, y, 0.37) - 0.5) * step * (0.18 + density * 0.01);
      const loopW = step * (0.86 + seededNoise(x, y, 1.11) * 0.34);
      const loopH = step * (0.38 + seededNoise(x, y, 1.77) * 0.18);
      const corner = Math.min(loopW, loopH) * 0.48;

      ctx.save();
      ctx.translate(x + step / 2, y + step / 2);
      ctx.rotate((seededNoise(x, y, 2.33) - 0.5) * (0.18 + density * 0.018));
      ctx.fillStyle = rgbaString(warmColor, 0.82 + strength * 0.12);
      drawRoundedRectPath(ctx, -loopW / 2, -loopH / 2 + yarnShift, loopW, loopH, corner);
      ctx.fill();
      ctx.fillStyle = rgbaString(coolColor, 0.7 + strength * 0.12);
      drawRoundedRectPath(ctx, -loopH / 2 + yarnShift, -loopW / 2, loopH, loopW, corner);
      ctx.fill();

      const shine = ctx.createLinearGradient(-loopW / 2, 0, loopW / 2, 0);
      shine.addColorStop(0, "rgba(255,255,255,0)");
      shine.addColorStop(0.45, `rgba(255,255,255,${0.08 + strength * 0.08})`);
      shine.addColorStop(0.55, `rgba(255,255,255,${0.18 + strength * 0.12})`);
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      drawRoundedRectPath(ctx, -loopW / 2, -loopH / 2 + yarnShift, loopW, loopH, corner);
      ctx.fill();
      ctx.restore();
    }
  }
}

function applyMosaic(canvas, amount) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const sampleSource = createSampleSource(source, 260 + strength * 200 + density * 40);
  const step = Math.max(7, Math.round(26 - Math.min(18, density * 1.8)));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f5f0e9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const dx = x + (seededNoise(x, y, 0.12) - 0.5) * step * (0.22 + density * 0.01);
      const dy = y + (seededNoise(x, y, 0.77) - 0.5) * step * (0.22 + density * 0.01);
      const w = step * (0.86 + seededNoise(x, y, 1.17) * (0.34 + strength * 0.12));
      const h = step * (0.72 + seededNoise(x, y, 1.73) * (0.42 + strength * 0.14));
      const r = Math.min(w, h) * (0.18 + strength * 0.18);
      ctx.fillStyle = `rgba(${sampleSource.data[index]},${sampleSource.data[index + 1]},${sampleSource.data[index + 2]},${0.84 + strength * 0.12})`;
      drawRoundedRectPath(ctx, dx, dy, w, h, r);
      ctx.fill();
    }
  }
}

function applyMatrixRain(canvas, amount) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const cols = Math.max(10, Math.round(canvas.width / Math.max(9, 22 - Math.min(12, density * 1.2))));
  const size = canvas.width / cols;
  const rows = Math.ceil(canvas.height / size);
  const glyphs = "01アイウエオカキクケコサシスセソ";
  const sampleCanvas = getScratchCanvas(cols, rows);
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  sampleCtx.drawImage(source, 0, 0, cols, rows);
  const sample = sampleCtx.getImageData(0, 0, cols, rows).data;
  ctx.save();
  ctx.fillStyle = `rgba(0,18,8,${0.12 + strength * 0.18})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${Math.round(size)}px monospace`;
  ctx.textBaseline = "top";
  for (let col = 0; col < cols; col += 1) {
    const head = Math.floor(seededNoise(col, 5, amount) * rows);
    for (let row = 0; row < rows; row += 1) {
      const sampleIndex = (row * cols + col) * 4;
      const luminance = (sample[sampleIndex] + sample[sampleIndex + 1] + sample[sampleIndex + 2]) / 3;
      const char = glyphs[Math.floor(seededNoise(col, row, 1.2) * glyphs.length)];
      const distance = Math.abs(row - head);
      const alpha = Math.max(0, 0.92 - distance * 0.15) * (0.18 + strength * 0.82) * (0.35 + (255 - luminance) / 255 * 0.65);
      if (alpha <= 0.03) continue;
      const glow = clamp(80 + (255 - luminance), 80, 255);
      ctx.fillStyle = `rgba(${distance === 0 ? `210,255,${glow}` : `64,${glow},128`},${alpha})`;
      ctx.fillText(char, col * size, row * size);
    }
  }
  ctx.restore();
}

function applyCandy(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const sampleSource = createSampleSource(source, 260 + strength * 200 + density * 40);
  const step = Math.max(8, Math.round(26 - Math.min(18, density * 1.8)));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff7fb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const hue = (sampleSource.data[index] * 0.5 + sampleSource.data[index + 1] * 0.8 + sampleSource.data[index + 2] * 1.2 + (x + y)) % 360;
      const dx = x + (seededNoise(x, y, 0.42) - 0.5) * step * (0.24 + density * 0.01);
      const dy = y + (seededNoise(x, y, 1.08) - 0.5) * step * (0.24 + density * 0.01);
      const w = step * (0.86 + seededNoise(x, y, 1.71) * 0.38);
      const h = step * (0.8 + seededNoise(x, y, 2.33) * 0.34);
      const r = Math.min(w, h) * (0.34 + strength * 0.16);
      ctx.save();
      ctx.translate(dx + w / 2, dy + h / 2);
      ctx.rotate((seededNoise(x, y, 3.11) - 0.5) * (0.6 + density * 0.04));
      const sat = 84 + seededNoise(x, y, 3.55) * 14;
      const light = 56 + seededNoise(x, y, 3.77) * 18;
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.38 + strength * 0.22})`;
      drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
      ctx.fill();
      ctx.strokeStyle = `hsla(${(hue + 24) % 360}, 100%, 92%, ${0.24 + strength * 0.16})`;
      ctx.lineWidth = 0.6 + strength * 1.2;
      ctx.stroke();
      const gloss = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      gloss.addColorStop(0, `rgba(255,255,255,${0.22 + strength * 0.18})`);
      gloss.addColorStop(0.38, "rgba(255,255,255,0.04)");
      gloss.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gloss;
      drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, r);
      ctx.fill();
      if (density > 2.2) {
        ctx.fillStyle = `rgba(255,255,255,${0.06 + strength * 0.08})`;
        ctx.beginPath();
        ctx.arc(-w * 0.14, -h * 0.14, Math.min(w, h) * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

function applyNeonLines(canvas, amount) {
  const edgeCanvas = cloneCanvas(canvas);
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  applyCannyLikeEdges(edgeCanvas, 0.22 + strength * 0.78);
  const data = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const stepY = Math.max(2, Math.round(8 - Math.min(5, density * 0.6)));
  const stepX = Math.max(2, Math.round(6 - Math.min(3, density * 0.35)));
  const lineLayers = Math.max(1, Math.round(1 + density * 0.35));
  for (let layer = 0; layer < lineLayers; layer += 1) {
    const hueShift = layer * (36 + density * 1.5);
    for (let y = 0; y < canvas.height; y += stepY) {
      let segments = 0;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += stepX) {
        const index = (y * canvas.width + x) * 4;
        const gray = (data[index] + data[index + 1] + data[index + 2]) / 3;
        if (gray < 166) {
          const wave = Math.sin((x + layer * 19) * 0.04 + y * 0.01) * (density > 2 ? 1 + density * 0.12 : 0);
          const offset = (gray / 255 - 0.5) * (8 + density * 0.4) + wave;
          if (segments === 0) ctx.moveTo(x, y + offset);
          else ctx.lineTo(x, y + offset);
          segments += 1;
        }
      }
      if (segments < 2) continue;
      const hue = ((y / Math.max(1, canvas.height)) * 280 + 160 + hueShift) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 66%, ${0.12 + strength * 0.18})`;
      ctx.shadowBlur = 10 + density * 2.8;
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.86)`;
      ctx.lineWidth = 0.9 + density * 0.12;
      ctx.stroke();
    }
  }
  ctx.restore();
}

function applyIcehouse(canvas, amount) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const progress = clamp(amount / 10, 0, 1);
  const sampleSource = createSampleSource(source, 280 + progress * 220);
  const spacing = Math.max(7, Math.round(28 - progress * 18));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(238, 244, 252)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = 0.18 + progress * 0.22;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (let baseY = 0; baseY < canvas.height; baseY += spacing) {
    ctx.beginPath();
    let hasSegment = false;
    for (let x = 0; x <= canvas.width; x += 6) {
      const sx = clamp(Math.round(x), 0, canvas.width - 1);
      const sy = clamp(Math.round(baseY), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
      const saturation = Math.max(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]) - Math.min(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]);
      const amplitude = (1 - gray / 255) * (5 + progress * 18) + saturation * 0.02;
      const wave = Math.sin(x * (0.016 + progress * 0.01) + gray * 0.025 + baseY * 0.018) * amplitude;
      const detail = Math.cos(x * 0.048 + baseY * 0.021) * amplitude * 0.28;
      const y = baseY + wave + detail;
      if (!hasSegment) {
        ctx.moveTo(x, y);
        hasSegment = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    const hue = (baseY / Math.max(1, canvas.height)) * 360;
    ctx.strokeStyle = `hsla(${hue}, 82%, 54%, ${0.18 + progress * 0.22})`;
    ctx.lineWidth = 0.7 + progress * 1.8;
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.06 + progress * 0.1;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applySandstorm(canvas, amount) {
  const source = cloneCanvas(canvas);
  const density = Math.max(0, amount);
  const progress = clamp(amount / 10, 0, 1);
  const cols = Math.max(20, Math.round(26 + progress * 60));
  const rows = Math.max(18, Math.round((canvas.height / canvas.width) * cols));
  const sampleCanvas = getScratchCanvas(cols, rows);
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  sampleCtx.drawImage(source, 0, 0, cols, rows);
  const sample = sampleCtx.getImageData(0, 0, cols, rows).data;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  ctx.fillStyle = `rgba(230, 208, 168,${0.06 + progress * 0.2})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const count = Math.round(180 + progress * 2400);
  ctx.save();
  ctx.strokeStyle = `rgba(232,210,164,${0.04 + progress * 0.14})`;
  ctx.lineWidth = 0.35 + progress * 1.1;
  for (let i = 0; i < count; i += 1) {
    const x = seededNoise(i, 1, 0.4) * canvas.width;
    const y = seededNoise(i, 2, 1.3) * canvas.height;
    const col = clamp(Math.floor((x / canvas.width) * cols), 0, cols - 1);
    const row = clamp(Math.floor((y / canvas.height) * rows), 0, rows - 1);
    const index = (row * cols + col) * 4;
    const luminance = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
    const drift = (seededNoise(i, 5, 0.93) - 0.5) * (8 + progress * 60);
    const len = 3 + seededNoise(i, 3, 2.1) * (8 + progress * 32) * (0.45 + (255 - luminance) / 255);
    ctx.strokeStyle = `rgba(${210 + (255 - luminance) * 0.15},${186 + (255 - luminance) * 0.08},${140 + (255 - luminance) * 0.05},${0.045 + progress * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len + drift, y + len * (0.12 + progress * 0.28));
    ctx.stroke();
  }
  ctx.restore();
}

function applyAbstracted(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const sampleSource = createSampleSource(source, 260 + strength * 200 + density * 40);
  const step = Math.max(9, Math.round(28 - Math.min(18, density * 1.8)));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f3efe9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const dx = x + (seededNoise(x, y, 0.61) - 0.5) * step * (0.42 + density * 0.016);
      const dy = y + (seededNoise(x, y, 1.18) - 0.5) * step * (0.42 + density * 0.016);
      const w = step * (0.8 + seededNoise(x, y, 1.93) * 0.52);
      const h = step * (0.8 + seededNoise(x, y, 2.49) * 0.48);
      const color = {
        r: clamp(sampleSource.data[index] + (seededNoise(x, y, 3.01) - 0.5) * (28 + density * 3), 0, 255),
        g: clamp(sampleSource.data[index + 1] + (seededNoise(x, y, 3.61) - 0.5) * (28 + density * 3), 0, 255),
        b: clamp(sampleSource.data[index + 2] + (seededNoise(x, y, 4.2) - 0.5) * (28 + density * 3), 0, 255),
      };
      ctx.save();
      ctx.translate(dx + w / 2, dy + h / 2);
      ctx.rotate((seededNoise(x, y, 4.73) - 0.5) * (0.9 + density * 0.08));
      ctx.scale(1 + (seededNoise(x, y, 5.21) - 0.5) * (strength + density * 0.05), 1 + (seededNoise(x, y, 5.83) - 0.5) * (strength + density * 0.05));
      if (density > 2) {
        ctx.transform(
          1,
          (seededNoise(x, y, 6.11) - 0.5) * 0.35,
          (seededNoise(x, y, 6.63) - 0.5) * 0.35,
          1,
          0,
          0
        );
      }
      ctx.fillStyle = rgbaString(color, 0.72 + strength * 0.16);
      drawRoundedRectPath(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.26);
      ctx.fill();
      ctx.strokeStyle = rgbaString(seededNoise(x, y, 6.4) > 0.5 ? accent : soft, 0.08 + strength * 0.12);
      ctx.lineWidth = 0.4 + strength;
      ctx.stroke();
      if (density > 2.8) {
        ctx.strokeStyle = rgbaString(dark, 0.04 + strength * 0.08);
        ctx.lineWidth = 0.3 + strength * 0.6;
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.lineTo(w / 2, 0);
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(0, h / 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function applyFeltMarker(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyPosterize(imageData.data, Math.round(3 + amount * 5));
  applyBasicAdjustments(imageData.data, {
    brightness: 4,
    contrast: 12 + amount * 18,
    saturation: 16 + amount * 30,
    blur: 0,
    sharpen: 0,
  }, 0);
  ctx.putImageData(imageData, 0, 0);
  convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 0.08 + amount * 0.18);
}

function applyLinoCut(canvas, amount, dark, soft) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const progress = clamp(amount / 10, 0, 1);
  applyGrayscale(data, 1);
  const threshold = 214 - progress * 150;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    const jitter = (Math.random() - 0.5) * (6 + progress * 30);
    const edgeBias = smoothstep(threshold - 30, threshold + 20, gray + jitter);
    const value = edgeBias > 0.54 ? 246 : 18;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  ctx.putImageData(imageData, 0, 0);
  convolveCanvas(canvas, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 0.04 + progress * 0.28);
  const tinted = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < tinted.data.length; i += 4) {
    const isLight = tinted.data[i] > 180;
    tinted.data[i] = isLight ? soft.r : dark.r;
    tinted.data[i + 1] = isLight ? soft.g : dark.g;
    tinted.data[i + 2] = isLight ? soft.b : dark.b;
  }
  ctx.putImageData(tinted, 0, 0);
}

function applyPointillism(canvas, amount) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const sampleSource = createSampleSource(source, 260 + strength * 220 + density * 30);
  const step = Math.max(4, Math.round(8 + Math.min(14, density * 1.1)));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8f4ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x), 0, canvas.width - 1);
      const sy = clamp(Math.round(y), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const radius = 0.8 + (1 - ((sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 765)) * step * (0.2 + strength * 0.24);
      ctx.fillStyle = `rgba(${sampleSource.data[index]},${sampleSource.data[index + 1]},${sampleSource.data[index + 2]},${0.72 + strength * 0.16})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function applyBallpointPen(canvas, amount) {
  const density = Math.max(0, amount);
  const progress = clamp(amount / 10, 0, 1);
  const source = cloneCanvas(canvas);
  const edgeCanvas = cloneCanvas(canvas);
  applyCannyLikeEdges(edgeCanvas, 0.2 + progress * 0.55);
  const sampleSource = createSampleSource(source, 320 + progress * 220 + density * 30);
  const edges = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f8f7f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.strokeStyle = `rgba(37,64,148,${0.12 + progress * 0.2})`;
  ctx.lineWidth = 0.55 + progress * 0.65;
  const spacing = Math.max(5, Math.round(13 - progress * 7));
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 6) {
      const sx = clamp(Math.round(x), 0, canvas.width - 1);
      const sy = clamp(Math.round(y), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
      const edgeGray = (edges[index] + edges[index + 1] + edges[index + 2]) / 3;
      const offset = (1 - gray / 255) * spacing * (0.46 + progress * 0.2) + (1 - edgeGray / 255) * spacing * 0.38;
      if (x === 0) ctx.moveTo(x, y + offset);
      else ctx.lineTo(x, y + offset);
    }
    ctx.stroke();
  }
  if (density > 0.8) {
    ctx.globalAlpha = 0.22 + progress * 0.18;
    for (let y = spacing / 2; y < canvas.height; y += spacing * 1.4) {
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 8) {
        const sx = clamp(Math.round(x), 0, canvas.width - 1);
        const sy = clamp(Math.round(y), 0, canvas.height - 1);
        const index = getSampleSourceIndex(sampleSource, sx, sy);
        const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
        const edgeGray = (edges[index] + edges[index + 1] + edges[index + 2]) / 3;
        const offset = (1 - gray / 255) * spacing * 0.32 + (1 - edgeGray / 255) * spacing * 0.24;
        if (x === 0) ctx.moveTo(x, y + offset);
        else ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 0.3 + progress * 0.24;
  ctx.drawImage(edgeCanvas, 0, 0);
  ctx.restore();
}

function applySquashStretch(canvas, amount) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const bands = Math.max(10, Math.round(18 + amount * 18));
  const bandHeight = canvas.height / bands;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < bands; i += 1) {
    const y = i * bandHeight;
    const wave = Math.sin((i / bands) * Math.PI * 2);
    const scaleX = 1 + wave * amount * 0.26;
    const width = canvas.width * scaleX;
    const dx = (canvas.width - width) / 2;
    ctx.drawImage(source, 0, y, canvas.width, bandHeight, dx, y, width, bandHeight);
  }
}

function applyRandomWords(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const words = ["noise", "echo", "urban", "fragment", "signal", "color", "dream", "grid", "pixel", "tempo", "trace"];
  const palette = [accent, soft, dark, { r: 255, g: 255, b: 255 }];
  const count = Math.round(8 + density * 12);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < count; i += 1) {
    const paletteColor = palette[i % palette.length];
    const size = 12 + seededNoise(i, 3, 0.9) * (12 + density * 16);
    ctx.font = `${Math.round(size)}px 'Aptos Display', 'Segoe UI', sans-serif`;
    const x = seededNoise(i, 1, 0.2) * canvas.width;
    const y = seededNoise(i, 2, 1.2) * canvas.height;
    const rotation = (seededNoise(i, 4, 1.8) - 0.5) * (0.3 + density * 0.06);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = rgbaString(paletteColor, 0.08 + strength * 0.12);
    ctx.fillText(words[Math.floor(seededNoise(i, 5, 2.6) * words.length)], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function applyTextMosaic(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(10, Math.round(30 - strength * 10 - turbo * 5));
  const sampleSource = createSampleSource(source, 220 + strength * 160 + turbo * 120);
  const words = ["THREAD", "LINE", "STUDIO", "PIXEL", "TRACE", "TONE", "COLOR", "FORM"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      const fontSize = Math.max(9, Math.round(step * (0.65 + darkness * 0.55 + turbo * 0.08)));
      const word = words[Math.floor(seededNoise(x, y, 0.71) * words.length)];
      const rotation = (seededNoise(x, y, 1.37) - 0.5) * (0.16 + strength * 0.22 + turbo * 0.08);
      const alpha = clamp(0.32 + darkness * 0.38 + strength * 0.12, 0.24, 0.88);
      const color = {
        r: Math.round(mix(r, accent.r, 0.08 + darkness * 0.18)),
        g: Math.round(mix(g, dark.g, 0.06 + darkness * 0.14)),
        b: Math.round(mix(b, dark.b, 0.08 + darkness * 0.2)),
      };
      ctx.save();
      ctx.translate(
        x + step * 0.5 + (seededNoise(x, y, 2.1) - 0.5) * step * (0.12 + strength * 0.08),
        y + step * 0.5 + (seededNoise(x, y, 2.9) - 0.5) * step * (0.12 + strength * 0.08)
      );
      ctx.rotate(rotation);
      ctx.font = `${fontSize}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.fillText(word, 0, 0);
      ctx.restore();
    }
  }
}

function applyAsciiDeluxe(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(7, Math.round(24 - strength * 8 - turbo * 5));
  const sampleCanvas = getScratchCanvas(
    Math.max(1, Math.round(canvas.width / step)),
    Math.max(1, Math.round(canvas.height / step))
  );
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  sampleCtx.drawImage(source, 0, 0, sampleCanvas.width, sampleCanvas.height);
  const sample = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
  const chars = ["·", ".", ":", ";", "!", "1", "7", "A", "R", "T", "#", "@", "&", "%", "M", "W"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = rgbaString(soft, 0.98);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "top";

  for (let y = 0; y < sampleCanvas.height; y += 1) {
    for (let x = 0; x < sampleCanvas.width; x += 1) {
      const index = (y * sampleCanvas.width + x) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      const char = chars[clamp(Math.floor(darkness * (chars.length - 1)), 0, chars.length - 1)];
      const size = Math.max(7, Math.round(step * (0.9 + darkness * 0.24 + turbo * 0.06)));
      const color = {
        r: Math.round(mix(r, accent.r, 0.12 + darkness * 0.22)),
        g: Math.round(mix(g, dark.g, 0.1 + darkness * 0.18)),
        b: Math.round(mix(b, dark.b, 0.14 + darkness * 0.24)),
      };
      ctx.font = `${size}px 'Consolas', 'Courier New', monospace`;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${clamp(0.34 + darkness * 0.46 + strength * 0.08, 0.28, 0.94)})`;
      ctx.fillText(char, x * step, y * step);
    }
  }
}

function applyKeywordCloud(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 220 + strength * 140 + turbo * 100);
  const words = ["image", "focus", "trace", "signal", "word", "pixel", "tone", "light", "form", "echo"];
  const step = Math.max(18, Math.round(42 - strength * 14 - turbo * 6));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = step * 0.6; y < canvas.height; y += step) {
    for (let x = step * 0.6; x < canvas.width; x += step) {
      const index = getSampleSourceIndex(sampleSource, x, y);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      const densityGate = 0.18 + (1 - darkness) * 0.54;
      if (seededNoise(x, y, 0.61) < densityGate) continue;
      const size = Math.max(10, Math.round(step * (0.38 + darkness * 0.64 + turbo * 0.06)));
      const word = words[Math.floor(seededNoise(x, y, 2.33) * words.length)];
      const color = {
        r: Math.round(mix(r, accent.r, 0.12 + darkness * 0.12)),
        g: Math.round(mix(g, dark.g, 0.08 + darkness * 0.08)),
        b: Math.round(mix(b, dark.b, 0.1 + darkness * 0.1)),
      };
      ctx.save();
      ctx.translate(
        x + (seededNoise(x, y, 1.47) - 0.5) * step * 0.22,
        y + (seededNoise(x, y, 3.1) - 0.5) * step * 0.22
      );
      ctx.rotate((seededNoise(x, y, 4.2) - 0.5) * (0.14 + strength * 0.12));
      ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${clamp(0.16 + darkness * 0.36 + strength * 0.1, 0.14, 0.68)})`;
      ctx.fillText(word, 0, 0);
      ctx.restore();
    }
  }
}

function applyContourText(canvas, amount, accent, dark) {
  const source = cloneCanvas(canvas);
  const edgeCanvas = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  applyCannyLikeEdges(edgeCanvas, 0.18 + strength * 0.24 + turbo * 0.08);
  const ctx = canvas.getContext("2d");
  const sourceData = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const edgeData = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const step = Math.max(8, Math.round(26 - strength * 10 - turbo * 5));
  const tokens = ["trace", "edge", "line", "draw", "tone"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  ctx.save();
  ctx.globalAlpha = clamp(0.18 + strength * 0.16, 0.16, 0.36);
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = getPixelIndex(clamp(x, 0, canvas.width - 1), clamp(y, 0, canvas.height - 1), canvas.width);
      const edge = edgeData[idx] / 255;
      if (edge < 0.18) continue;
      const r = sourceData[idx];
      const g = sourceData[idx + 1];
      const b = sourceData[idx + 2];
      const luminance = (r + g + b) / 3;
      const word = tokens[Math.floor(seededNoise(x, y, 3.2) * tokens.length)];
      const angle = (seededNoise(x, y, 4.7) - 0.5) * (0.45 + strength * 0.5 + turbo * 0.18);
      const fontSize = Math.max(10, Math.round(step * (0.5 + edge * 0.9 + turbo * 0.08)));
      const color = {
        r: Math.round(mix(r, accent.r, 0.14 + edge * 0.38)),
        g: Math.round(mix(g, dark.g, 0.06 + edge * 0.18)),
        b: Math.round(mix(b, dark.b, 0.16 + edge * 0.42)),
      };
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `${fontSize}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${clamp(0.2 + edge * 0.72 + strength * 0.08, 0.24, 0.92)})`;
      ctx.fillText(word, 0, 0);
      if (luminance < 118) {
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + edge * 0.24})`;
        ctx.lineWidth = Math.max(0.6, fontSize * 0.028);
        ctx.strokeText(word, 0, 0);
      }
      ctx.restore();
    }
  }
}

function applyTypoHalftone(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(8, Math.round(24 - strength * 10 - turbo * 4));
  const sampleSource = createSampleSource(source, 240 + strength * 160 + turbo * 100);
  const glyphs = ["·", ":", "o", "O", "8", "&", "#"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(248, soft.r, 0.06))}, ${Math.round(mix(246, soft.g, 0.06))}, ${Math.round(mix(238, soft.b, 0.06))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      const glyph = glyphs[clamp(Math.floor(darkness * (glyphs.length - 1)), 0, glyphs.length - 1)];
      const size = Math.max(8, Math.round(step * (0.42 + darkness * 1.12 + turbo * 0.08)));
      const fill = {
        r: Math.round(mix(dark.r, accent.r, 0.16 + darkness * 0.18)),
        g: Math.round(mix(dark.g, g, 0.26 + darkness * 0.18)),
        b: Math.round(mix(dark.b, b, 0.28 + darkness * 0.16)),
      };
      ctx.save();
      ctx.translate(x + step / 2, y + step / 2);
      ctx.rotate((seededNoise(x, y, 5.1) - 0.5) * (0.12 + turbo * 0.08));
      ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${clamp(0.22 + darkness * 0.62 + strength * 0.1, 0.22, 0.94)})`;
      ctx.fillText(glyph, 0, 0);
      ctx.restore();
    }
  }
}

function applyTypoRelief(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const edgeCanvas = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  applyCannyLikeEdges(edgeCanvas, 0.16 + strength * 0.22 + turbo * 0.08);
  const ctx = canvas.getContext("2d");
  const sourceData = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const edgeData = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const step = Math.max(10, Math.round(28 - strength * 10 - turbo * 4));
  const words = ["TYPE", "FORM", "PRESS", "RELIEF", "TRACE", "SIGN"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(246, soft.r, 0.06))}, ${Math.round(mix(242, soft.g, 0.08))}, ${Math.round(mix(236, soft.b, 0.06))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.06, 0.08, 0.18);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = step * 0.6; y < canvas.height; y += step) {
    for (let x = step * 0.6; x < canvas.width; x += step) {
      const idx = getPixelIndex(clamp(x, 0, canvas.width - 1), clamp(y, 0, canvas.height - 1), canvas.width);
      const edge = edgeData[idx] / 255;
      const r = sourceData[idx];
      const g = sourceData[idx + 1];
      const b = sourceData[idx + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      if (edge < 0.12 && darkness < 0.34) continue;
      const word = words[Math.floor(seededNoise(x, y, 6.2) * words.length)];
      const size = Math.max(10, Math.round(step * (0.42 + darkness * 0.5 + edge * 0.42 + turbo * 0.04)));
      const fill = {
        r: Math.round(mix(soft.r, r, 0.18 + darkness * 0.12)),
        g: Math.round(mix(soft.g, g, 0.18 + darkness * 0.12)),
        b: Math.round(mix(soft.b, b, 0.18 + darkness * 0.12)),
      };
      const emboss = {
        r: Math.round(mix(dark.r, accent.r, 0.1 + edge * 0.2)),
        g: Math.round(mix(dark.g, dark.g, 0.8)),
        b: Math.round(mix(dark.b, b, 0.06 + edge * 0.08)),
      };
      const dx = x + (seededNoise(x, y, 7.1) - 0.5) * step * 0.1;
      const dy = y + (seededNoise(x, y, 7.9) - 0.5) * step * 0.1;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate((seededNoise(x, y, 8.6) - 0.5) * (0.08 + strength * 0.08));
      ctx.font = `700 ${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${0.14 + edge * 0.22 + strength * 0.04})`;
      ctx.fillText(word, 0.8, 0.8);
      ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${clamp(0.7 + darkness * 0.12, 0.68, 0.9)})`;
      ctx.fillText(word, 0, 0);
      ctx.strokeStyle = `rgba(${emboss.r}, ${emboss.g}, ${emboss.b}, ${0.12 + edge * 0.34 + strength * 0.06})`;
      ctx.lineWidth = Math.max(0.5, size * 0.024);
      ctx.strokeText(word, -0.6, -0.6);
      ctx.restore();
    }
  }
}

function applyLinePoetry(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const lineStep = Math.max(12, Math.round(24 - strength * 7 - turbo * 4));
  const sampleSource = createSampleSource(source, 280 + strength * 180 + turbo * 120);
  const phrase = "threadline studio trace color tone image contour rhythm line form ";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.05, 0.08, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.textBaseline = "middle";

  for (let y = lineStep * 0.7; y < canvas.height; y += lineStep) {
    let cursor = 8;
    let offset = 0;
    while (cursor < canvas.width - 20) {
      const sampleX = clamp(cursor, 0, canvas.width - 1);
      const index = getSampleSourceIndex(sampleSource, sampleX, y);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      const chunkLength = Math.max(6, Math.round(6 + darkness * 10 + turbo * 1.5));
      const text = phrase.slice(offset % phrase.length, (offset % phrase.length) + chunkLength).padEnd(chunkLength, phrase);
      const size = Math.max(9, Math.round(9 + darkness * 6 + turbo * 1.1));
      const baselineShift = (1 - darkness) * lineStep * 0.22 + (seededNoise(cursor, y, 4.9) - 0.5) * (1 + strength * 1.8);
      ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${Math.round(mix(dark.r, accent.r, 0.1 + darkness * 0.16))}, ${Math.round(mix(dark.g, g, 0.12 + darkness * 0.08))}, ${Math.round(mix(dark.b, b, 0.12 + darkness * 0.08))}, ${clamp(0.34 + darkness * 0.4 + strength * 0.08, 0.28, 0.9)})`;
      ctx.fillText(text, cursor, y + baselineShift);
      if (darkness > 0.58) {
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + darkness * 0.12})`;
        ctx.lineWidth = Math.max(0.5, size * 0.02);
        ctx.strokeText(text, cursor, y + baselineShift);
      }
      const width = ctx.measureText(text).width;
      cursor += Math.max(12, width * (0.8 + darkness * 0.12));
      offset += chunkLength;
    }
  }
}

function applyStampText(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 210 + strength * 140 + turbo * 100);
  const words = ["STAMP", "TRACE", "PRINT", "THREAD", "FORM", "PRESS"];
  const step = Math.max(24, Math.round(48 - strength * 14 - turbo * 7));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  ctx.save();
  ctx.globalAlpha = clamp(0.12 + strength * 0.12, 0.1, 0.28);
  ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  for (let y = step * 0.65; y < canvas.height; y += step) {
    for (let x = step * 0.65; x < canvas.width; x += step) {
      const index = getSampleSourceIndex(sampleSource, x, y);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      if (darkness < 0.22 && seededNoise(x, y, 1.21) < 0.82) continue;
      const word = words[Math.floor(seededNoise(x, y, 3.41) * words.length)];
      const size = Math.max(12, Math.round(step * (0.32 + darkness * 0.34 + turbo * 0.04)));
      ctx.save();
      ctx.translate(
        x + (seededNoise(x, y, 2.17) - 0.5) * step * 0.16,
        y + (seededNoise(x, y, 2.93) - 0.5) * step * 0.16
      );
      ctx.rotate((seededNoise(x, y, 4.23) - 0.5) * (0.14 + strength * 0.12));
      ctx.font = `700 ${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${Math.round(mix(dark.r, accent.r, 0.18 + darkness * 0.08))}, ${Math.round(mix(dark.g, g, 0.08))}, ${Math.round(mix(dark.b, b, 0.08))}, ${clamp(0.12 + darkness * 0.3 + strength * 0.08, 0.12, 0.48)})`;
      ctx.fillText(word, 0, 0);
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + darkness * 0.12})`;
      ctx.lineWidth = Math.max(0.8, size * 0.03);
      ctx.strokeText(word, 0, 0);
      ctx.restore();
    }
  }
}

function applyMagazineCollage(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 220 + strength * 150 + turbo * 100);
  const words = ["studio", "image", "signal", "fragment", "editorial", "print", "urban", "graphic"];
  const stepX = Math.max(26, Math.round(64 - strength * 20 - turbo * 12));
  const stepY = Math.max(18, Math.round(40 - strength * 12 - turbo * 8));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(248, soft.r, 0.04))}, ${Math.round(mix(246, soft.g, 0.04))}, ${Math.round(mix(240, soft.b, 0.04))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.06 + strength * 0.04, 0.06, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let y = stepY * 0.7; y < canvas.height; y += stepY) {
    for (let x = stepX * 0.7; x < canvas.width; x += stepX) {
      const index = getSampleSourceIndex(sampleSource, x, y);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      if (darkness < 0.18 && seededNoise(x, y, 0.81) < 0.7) continue;
      const w = stepX * (0.62 + seededNoise(x, y, 2.27) * 0.52 + darkness * 0.18);
      const h = stepY * (0.58 + seededNoise(x, y, 3.11) * 0.42 + darkness * 0.1);
      const bg = {
        r: Math.round(mix(soft.r, r, 0.26 + darkness * 0.16)),
        g: Math.round(mix(soft.g, g, 0.26 + darkness * 0.16)),
        b: Math.round(mix(soft.b, b, 0.26 + darkness * 0.16)),
      };
      ctx.save();
      ctx.translate(
        x + (seededNoise(x, y, 1.63) - 0.5) * stepX * (0.22 + strength * 0.1),
        y + (seededNoise(x, y, 1.91) - 0.5) * stepY * (0.22 + strength * 0.1)
      );
      ctx.rotate((seededNoise(x, y, 4.51) - 0.5) * (0.18 + strength * 0.16 + turbo * 0.05));
      ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${0.82 + darkness * 0.08})`;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.save();
      ctx.globalAlpha = clamp(0.14 + darkness * 0.16 + strength * 0.04, 0.12, 0.34);
      ctx.drawImage(source, x - w / 2, y - h / 2, w, h, -w / 2, -h / 2, w, h);
      ctx.restore();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.18)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.font = `700 ${Math.max(10, Math.round(h * (0.48 + darkness * 0.12)))}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${Math.round(mix(dark.r, accent.r, 0.14 + darkness * 0.1))}, ${Math.round(mix(dark.g, dark.g, 0.8))}, ${Math.round(mix(dark.b, b, 0.08))}, 0.88)`;
      ctx.fillText(words[Math.floor(seededNoise(x, y, 5.73) * words.length)], 0, 0);
      ctx.restore();
    }
  }
}

function applyPopSlogans(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 220 + strength * 150 + turbo * 100);
  const slogans = ["WOW", "BANG", "LOOK", "COLOR", "POP", "FLASH", "YES", "GO"];
  const stepX = Math.max(30, Math.round(72 - strength * 18 - turbo * 10));
  const stepY = Math.max(22, Math.round(48 - strength * 12 - turbo * 6));
  const palette = [
    { r: 244, g: 86, b: 58 },
    { r: 255, g: 214, b: 51 },
    { r: 58, g: 124, b: 255 },
    { r: 26, g: 26, b: 26 },
  ];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08, 0.1, 0.24);
  ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = stepY * 0.7; y < canvas.height; y += stepY) {
    for (let x = stepX * 0.7; x < canvas.width; x += stepX) {
      const index = getSampleSourceIndex(sampleSource, x, y);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      const saturation = getRgbSaturation(r, g, b);
      const edgeProbe = Math.abs(
        getSampleSourceChannel(sampleSource, x + stepX * 0.3, y, 0) -
        getSampleSourceChannel(sampleSource, x - stepX * 0.3, y, 0)
      ) + Math.abs(
        getSampleSourceChannel(sampleSource, x, y + stepY * 0.3, 1) -
        getSampleSourceChannel(sampleSource, x, y - stepY * 0.3, 1)
      );
      const motifSignal = darkness * 0.58 + saturation * 0.28 + clamp(edgeProbe / 255, 0, 1) * 0.34;
      if (motifSignal < 0.2 && seededNoise(x, y, 0.91) < 0.86) continue;
      const slogan = slogans[Math.floor(seededNoise(x, y, 1.77) * slogans.length)];
      const paletteColor = palette[Math.floor(seededNoise(x, y, 2.6) * palette.length)];
      const blend = clamp(0.26 + saturation * 0.34 + darkness * 0.16, 0.22, 0.72);
      const bg = {
        r: Math.round(mix(paletteColor.r, r, blend)),
        g: Math.round(mix(paletteColor.g, g, blend)),
        b: Math.round(mix(paletteColor.b, b, blend)),
      };
      const w = stepX * (0.7 + seededNoise(x, y, 3.21) * 0.44 + motifSignal * 0.2);
      const h = stepY * (0.72 + seededNoise(x, y, 3.94) * 0.32 + motifSignal * 0.12);
      const fontSize = Math.max(11, Math.round(h * (0.46 + motifSignal * 0.22 + turbo * 0.05)));
      const tx = x + (seededNoise(x, y, 4.82) - 0.5) * stepX * 0.16;
      const ty = y + (seededNoise(x, y, 5.47) - 0.5) * stepY * 0.16;
      const imgAlpha = clamp(0.18 + motifSignal * 0.34 + strength * 0.06, 0.16, 0.5);
      const boxAlpha = clamp(0.62 + motifSignal * 0.18, 0.58, 0.88);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate((seededNoise(x, y, 6.23) - 0.5) * (0.16 + strength * 0.12));
      ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${boxAlpha})`;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.save();
      ctx.globalAlpha = imgAlpha;
      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.clip();
      ctx.drawImage(source, x - w / 2, y - h / 2, w, h, -w / 2, -h / 2, w, h);
      ctx.restore();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.24)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      if (motifSignal > 0.42) {
        ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.18, motifSignal * 0.18)})`;
        ctx.lineWidth = Math.max(0.8, h * 0.03);
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 3, -h / 2 + h * 0.22);
        ctx.lineTo(w / 2 - 3, -h / 2 + h * 0.22);
        ctx.stroke();
      }
      ctx.font = `800 ${fontSize}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${Math.round(mix(dark.r, r, 0.14 + motifSignal * 0.08))}, ${Math.round(mix(dark.g, g, 0.14 + motifSignal * 0.08))}, ${Math.round(mix(dark.b, b, 0.14 + motifSignal * 0.08))}, 0.92)`;
      ctx.fillText(slogan, 0.8, 0.8);
      ctx.fillStyle = `rgba(${Math.round(mix(255, soft.r, 0.08))}, ${Math.round(mix(255, soft.g, 0.08))}, ${Math.round(mix(255, soft.b, 0.08))}, 0.96)`;
      ctx.fillText(slogan, 0, 0);
      ctx.restore();
    }
  }
}

function applyMatrixText(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(12, Math.round(canvas.width / Math.max(10, 28 - amount * 1.05)));
  const size = canvas.width / cols;
  const rows = Math.ceil(canvas.height / size);
  const glyphs = ["0", "1", "data", "echo", "trace", "grid", "node", "code"];
  const sampleCanvas = getScratchCanvas(cols, rows);
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  sampleCtx.drawImage(source, 0, 0, cols, rows);
  const sample = sampleCtx.getImageData(0, 0, cols, rows).data;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(228, soft.r, 0.18))}, ${Math.round(mix(244, soft.g, 0.12))}, ${Math.round(mix(232, soft.b, 0.12))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.18 + strength * 0.12, 0.16, 0.34);
  ctx.filter = `blur(${0.3 + strength * 0.7}px) saturate(${1.02 + strength * 0.08})`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = `rgba(${Math.round(mix(110, accent.r, 0.08))}, ${Math.round(mix(188, soft.g, 0.1))}, ${Math.round(mix(136, dark.b, 0.04))}, ${0.08 + strength * 0.05})`;
  ctx.lineWidth = Math.max(0.4, size * 0.04);
  for (let x = 0; x <= canvas.width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.textBaseline = "top";

  for (let col = 0; col < cols; col += 1) {
    const head = Math.floor(seededNoise(col, amount, 0.66) * rows);
    for (let row = 0; row < rows; row += 1) {
      const index = (row * cols + col) * 4;
      const luminance = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
      const darkness = 1 - luminance / 255;
      const distance = Math.abs(row - head);
      const alpha = Math.max(0, 0.96 - distance * 0.11) * (0.2 + strength * 0.7) * (0.28 + darkness * 0.72);
      if (alpha <= 0.035) continue;
      const text = glyphs[Math.floor(seededNoise(col, row, 1.42) * glyphs.length)];
      const sizePx = Math.max(8, Math.round(size * (0.66 + darkness * 0.26 + turbo * 0.04)));
      ctx.font = `${sizePx}px 'Consolas', 'Courier New', monospace`;
      const tint = distance === 0
        ? { r: 56, g: 132, b: 88 }
        : {
            r: Math.round(mix(68, accent.r, 0.12 + darkness * 0.08)),
            g: Math.round(mix(150, soft.g, 0.1 + darkness * 0.08)),
            b: Math.round(mix(88, dark.b, 0.04 + darkness * 0.03)),
          };
      ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${alpha})`;
      const drawX = col * size + size * 0.08;
      const drawY = row * size + size * 0.08;
      ctx.fillText(text, drawX, drawY);
      if (distance === 0 || darkness > 0.64) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.28, alpha * 0.3)})`;
        ctx.fillText(text, drawX + 0.5, drawY + 0.35);
      }
    }
  }
}

function applyWordSilhouette(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(10, Math.round(28 - strength * 9 - turbo * 5));
  const sampleSource = createSampleSource(source, 220 + strength * 150 + turbo * 120);
  const words = ["shape", "outline", "echo", "image", "word", "form", "silhouette"];
  const threshold = 0.7 - strength * 0.24 - turbo * 0.08;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${soft.r}, ${soft.g}, ${soft.b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const darkness = 1 - gray / 255;
      if (darkness < threshold) continue;
      const word = words[Math.floor(seededNoise(x, y, 6.8) * words.length)];
      const size = Math.max(9, Math.round(step * (0.46 + darkness * 0.82 + turbo * 0.06)));
      const ink = {
        r: Math.round(mix(dark.r, accent.r, 0.08 + darkness * 0.14)),
        g: Math.round(mix(dark.g, g, 0.08 + darkness * 0.08)),
        b: Math.round(mix(dark.b, b, 0.12 + darkness * 0.14)),
      };
      ctx.save();
      ctx.translate(
        x + step / 2 + (seededNoise(x, y, 7.5) - 0.5) * step * 0.08,
        y + step / 2 + (seededNoise(x, y, 8.2) - 0.5) * step * 0.08
      );
      ctx.rotate((seededNoise(x, y, 9.1) - 0.5) * (0.08 + turbo * 0.06));
      ctx.font = `${size}px 'Aptos Display', 'Segoe UI', sans-serif`;
      ctx.fillStyle = `rgba(${ink.r}, ${ink.g}, ${ink.b}, ${clamp(0.26 + darkness * 0.62 + strength * 0.08, 0.28, 0.96)})`;
      ctx.fillText(word, 0, 0);
      ctx.restore();
    }
  }
}

function applyTileSwap(canvas, amount, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(5, Math.round(7 + strength * 6 + turbo * 7));
  const tileW = canvas.width / cols;
  const rows = Math.max(4, Math.round(canvas.height / tileW));
  const tileH = canvas.height / rows;
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push({ col, row });
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const cell of cells) {
    const swapChance = 0.18 + strength * 0.46 + turbo * 0.12;
    const radius = 1 + Math.round(strength * 2 + turbo * 3);
    let srcCol = cell.col;
    let srcRow = cell.row;
    if (seededNoise(cell.col, cell.row, 0.71) < swapChance) {
      srcCol = clamp(cell.col + Math.round((seededNoise(cell.col, cell.row, 1.17) - 0.5) * radius * 2), 0, cols - 1);
      srcRow = clamp(cell.row + Math.round((seededNoise(cell.col, cell.row, 1.93) - 0.5) * radius * 2), 0, rows - 1);
    }
    const sx = srcCol * tileW;
    const sy = srcRow * tileH;
    const dx = cell.col * tileW;
    const dy = cell.row * tileH;
    const lift = (seededNoise(cell.col, cell.row, 2.63) - 0.5) * tileW * (0.05 + strength * 0.06);
    const drop = (seededNoise(cell.col, cell.row, 3.01) - 0.5) * tileH * (0.05 + strength * 0.06);
    ctx.drawImage(source, sx, sy, tileW, tileH, dx + lift, dy + drop, tileW, tileH);
  }
  ctx.save();
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.12})`;
  ctx.lineWidth = Math.max(0.6, tileW * 0.015);
  for (let col = 1; col < cols; col += 1) {
    const x = col * tileW;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let row = 1; row < rows; row += 1) {
    const y = row * tileH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function applyStripShift(canvas, amount, accent, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const stripH = Math.max(8, Math.round(28 - strength * 10 - turbo * 7));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += stripH) {
    const offset = (seededNoise(y, amount, 0.83) - 0.5) * canvas.width * (0.04 + strength * 0.14 + turbo * 0.08);
    const wobble = Math.sin((y / canvas.height) * Math.PI * (2 + turbo * 1.4)) * canvas.width * (0.01 + strength * 0.03);
    ctx.drawImage(source, offset + wobble, y, canvas.width, stripH, 0, y, canvas.width, stripH);
  }
  if (amount > 0.55) {
    const stripW = Math.max(10, Math.round(32 - strength * 10 - turbo * 8));
    for (let x = 0; x < canvas.width; x += stripW * 3) {
      const offsetY = (seededNoise(x, amount, 2.17) - 0.5) * canvas.height * (0.02 + strength * 0.08 + turbo * 0.05);
      ctx.drawImage(source, x, offsetY, stripW, canvas.height, x, 0, stripW, canvas.height);
    }
  }
  ctx.save();
  ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.06 + strength * 0.12})`;
  ctx.lineWidth = Math.max(0.6, stripH * 0.06);
  for (let y = stripH; y < canvas.height; y += stripH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function applyShards(canvas, amount, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(4, Math.round(6 + strength * 5 + turbo * 5));
  const cell = canvas.width / cols;
  const rows = Math.max(4, Math.round(canvas.height / cell));
  const cellH = canvas.height / rows;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = 0.16 + strength * 0.12;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cell;
      const y = row * cellH;
      const jitterX = cell * (0.18 + strength * 0.16 + turbo * 0.06);
      const jitterY = cellH * (0.18 + strength * 0.16 + turbo * 0.06);
      const points = [
        [x + (seededNoise(col, row, 0.61) - 0.5) * jitterX, y + (seededNoise(col, row, 0.93) - 0.5) * jitterY],
        [x + cell + (seededNoise(col, row, 1.21) - 0.5) * jitterX, y + (seededNoise(col, row, 1.51) - 0.5) * jitterY],
        [x + cell + (seededNoise(col, row, 1.87) - 0.5) * jitterX, y + cellH + (seededNoise(col, row, 2.13) - 0.5) * jitterY],
        [x + (seededNoise(col, row, 2.43) - 0.5) * jitterX, y + cellH + (seededNoise(col, row, 2.77) - 0.5) * jitterY],
      ];
      const cx = points.reduce((sum, point) => sum + point[0], 0) / points.length;
      const cy = points.reduce((sum, point) => sum + point[1], 0) / points.length;
      const dx = (seededNoise(col, row, 3.11) - 0.5) * cell * (0.08 + strength * 0.12 + turbo * 0.05);
      const dy = (seededNoise(col, row, 3.37) - 0.5) * cellH * (0.08 + strength * 0.12 + turbo * 0.05);
      const angle = (seededNoise(col, row, 3.81) - 0.5) * (0.08 + strength * 0.16 + turbo * 0.06);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.clip();
      ctx.translate(cx + dx, cy + dy);
      ctx.rotate(angle);
      ctx.drawImage(source, x, y, cell, cellH, -cell / 2, -cellH / 2, cell, cellH);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.14})`;
      ctx.lineWidth = Math.max(0.7, cell * 0.016);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function applyPatchwork(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(16, Math.round(52 - strength * 18 - turbo * 10));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(246, soft.r, 0.06))}, ${Math.round(mix(240, soft.g, 0.06))}, ${Math.round(mix(232, soft.b, 0.06))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const w = step * (0.88 + seededNoise(x, y, 0.71) * 0.42);
      const h = step * (0.82 + seededNoise(x, y, 1.09) * 0.44);
      const dx = x + (seededNoise(x, y, 1.63) - 0.5) * step * 0.14;
      const dy = y + (seededNoise(x, y, 2.01) - 0.5) * step * 0.14;
      const radius = Math.max(3, step * 0.08);
      ctx.save();
      buildRoundedRectPath(ctx, dx, dy, w, h, radius);
      ctx.clip();
      ctx.drawImage(source, x, y, w, h, dx, dy, w, h);
      ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.04 + strength * 0.06})`;
      ctx.fillRect(dx, dy, w, h);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.16 + strength * 0.12})`;
      ctx.lineWidth = Math.max(0.8, step * 0.03);
      ctx.setLineDash([Math.max(2, step * 0.08), Math.max(2, step * 0.06)]);
      buildRoundedRectPath(ctx, dx, dy, w, h, radius);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function applyPunchCard(canvas, amount, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 220 + strength * 150 + turbo * 120);
  const step = Math.max(14, Math.round(34 - strength * 10 - turbo * 8));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(248, soft.r, 0.1))}, ${Math.round(mix(244, soft.g, 0.08))}, ${Math.round(mix(232, soft.b, 0.08))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = step * 0.7; y < canvas.height; y += step) {
    for (let x = step * 0.7; x < canvas.width; x += step) {
      const idx = getSampleSourceIndex(sampleSource, x, y);
      const gray = (sampleSource.data[idx] + sampleSource.data[idx + 1] + sampleSource.data[idx + 2]) / 3;
      const darkness = 1 - gray / 255;
      if (darkness < 0.14 && seededNoise(x, y, 0.91) < 0.9) continue;
      const radius = Math.max(2, step * (0.14 + darkness * 0.22 + turbo * 0.04));
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 1.2, y + 1.2, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + darkness * 0.14})`;
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(source, 0, 0);
      ctx.restore();
    }
  }
}

function applyPerforation(canvas, amount, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  const bands = Math.max(2, Math.round(3 + strength * 3 + turbo * 3));
  for (let band = 0; band < bands; band += 1) {
    const horizontal = seededNoise(band, amount, 0.63) > 0.35;
    if (horizontal) {
      const y = canvas.height * (0.12 + (band / Math.max(1, bands - 1)) * 0.76);
      const h = Math.max(12, canvas.height * (0.02 + strength * 0.015 + turbo * 0.01));
      ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.26 + strength * 0.12})`;
      ctx.fillRect(0, y - h / 2, canvas.width, h);
      const holeStep = Math.max(9, Math.round(18 - strength * 4 - turbo * 4));
      for (let x = 0; x < canvas.width; x += holeStep) {
        const r = Math.max(2, h * (0.18 + strength * 0.08));
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + holeStep * 0.5, y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(source, 0, 0);
        ctx.restore();
      }
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.1 + strength * 0.08})`;
      ctx.setLineDash([Math.max(2, h * 0.2), Math.max(2, h * 0.16)]);
      ctx.lineWidth = Math.max(0.8, h * 0.06);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      const x = canvas.width * (0.12 + (band / Math.max(1, bands - 1)) * 0.76);
      const w = Math.max(12, canvas.width * (0.02 + strength * 0.015 + turbo * 0.01));
      ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.24 + strength * 0.12})`;
      ctx.fillRect(x - w / 2, 0, w, canvas.height);
      const holeStep = Math.max(9, Math.round(18 - strength * 4 - turbo * 4));
      for (let y = 0; y < canvas.height; y += holeStep) {
        const r = Math.max(2, w * (0.18 + strength * 0.08));
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y + holeStep * 0.5, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(source, 0, 0);
        ctx.restore();
      }
    }
  }
}

function applyDieCut(canvas, amount, accent, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 220 + strength * 150 + turbo * 120);
  const step = Math.max(28, Math.round(62 - strength * 18 - turbo * 12));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(248, soft.r, 0.08))}, ${Math.round(mix(246, soft.g, 0.08))}, ${Math.round(mix(236, soft.b, 0.08))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = step * 0.7; y < canvas.height; y += step) {
    for (let x = step * 0.7; x < canvas.width; x += step) {
      const idx = getSampleSourceIndex(sampleSource, x, y);
      const gray = (sampleSource.data[idx] + sampleSource.data[idx + 1] + sampleSource.data[idx + 2]) / 3;
      const darkness = 1 - gray / 255;
      if (darkness < 0.2 && seededNoise(x, y, 0.93) < 0.8) continue;
      const w = step * (0.6 + darkness * 0.34 + turbo * 0.04);
      const h = step * (0.54 + darkness * 0.3 + turbo * 0.03);
      const shape = Math.floor(seededNoise(x, y, 1.29) * 3);
      ctx.save();
      buildDieCutPath(ctx, x, y, w, h, shape);
      ctx.clip();
      ctx.drawImage(source, 0, 0);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.1})`;
      ctx.lineWidth = Math.max(0.8, step * 0.03);
      buildDieCutPath(ctx, x, y, w, h, shape);
      ctx.stroke();
      ctx.restore();
      if (darkness > 0.44) {
        ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.04 + darkness * 0.06})`;
        buildDieCutPath(ctx, x, y, w, h, shape);
        ctx.fill();
      }
    }
  }
}

function applyPaperCut(canvas, amount, soft, dark) {
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 200 + strength * 140 + turbo * 120);
  const step = Math.max(14, Math.round(30 - strength * 8 - turbo * 6));
  const layers = [
    { tint: { r: soft.r, g: soft.g, b: soft.b }, alpha: 1, threshold: 0.18, offset: 0 },
    { tint: { r: Math.round(mix(soft.r, 255, 0.12)), g: Math.round(mix(soft.g, 255, 0.12)), b: Math.round(mix(soft.b, 255, 0.12)) }, alpha: 0.92, threshold: 0.34, offset: step * 0.12 },
    { tint: { r: Math.round(mix(soft.r, dark.r, 0.08)), g: Math.round(mix(soft.g, dark.g, 0.08)), b: Math.round(mix(soft.b, dark.b, 0.08)) }, alpha: 0.88, threshold: 0.5, offset: step * 0.24 },
  ];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(252, soft.r, 0.04))}, ${Math.round(mix(250, soft.g, 0.04))}, ${Math.round(mix(244, soft.b, 0.04))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const layer of layers) {
    ctx.save();
    ctx.fillStyle = `rgba(${layer.tint.r}, ${layer.tint.g}, ${layer.tint.b}, ${layer.alpha})`;
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const idx = getSampleSourceIndex(sampleSource, x, y);
        const gray = (sampleSource.data[idx] + sampleSource.data[idx + 1] + sampleSource.data[idx + 2]) / 3;
        const darkness = 1 - gray / 255;
        if (darkness < layer.threshold) continue;
        const w = step * (1.18 + darkness * 0.42);
        const h = step * (1.02 + darkness * 0.34);
        buildRoundedRectPath(ctx, x + layer.offset, y + layer.offset, w, h, Math.max(3, step * 0.16));
        ctx.fill();
      }
    }
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.18 + strength * 0.12, 0.18, 0.34);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applySwirlMorph(canvas, amount) {
  const centers = [
    { x: canvas.width * 0.3, y: canvas.height * 0.34, radius: Math.min(canvas.width, canvas.height) * (0.24 + amount * 0.06) },
    { x: canvas.width * 0.72, y: canvas.height * 0.62, radius: Math.min(canvas.width, canvas.height) * (0.2 + amount * 0.08) },
  ];
  warpCanvas(canvas, (x, y) => {
    let sx = x;
    let sy = y;
    for (const center of centers) {
      const dx = sx - center.x;
      const dy = sy - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > center.radius || dist < 0.001) continue;
      const t = 1 - dist / center.radius;
      const angle = t * t * (0.55 + amount * 0.9);
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);
      sx = center.x + dx * cos - dy * sin;
      sy = center.y + dx * sin + dy * cos;
    }
    return [sx, sy];
  });
}

function applyMeltMorph(canvas, amount, accent) {
  const width = canvas.width;
  const height = canvas.height;
  warpCanvas(canvas, (x, y) => {
    const progress = y / Math.max(1, height - 1);
    const drift = Math.sin((x / width) * Math.PI * (3 + amount * 2.6) + progress * (4 + amount * 2.8)) * (6 + amount * 18);
    const sag = progress * progress * (8 + amount * 26) * (0.35 + seededNoise(x * 0.02, y * 0.02, 0.77));
    const pull = Math.max(0, progress - 0.24) * (8 + amount * 32);
    return [x + drift * 0.25, y - sag - pull * 0.16];
  });
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.03 + clamp(amount, 0, 1) * 0.05})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function applyRubberSheet(canvas, amount) {
  const source = cloneCanvas(canvas);
  const srcCtx = source.getContext("2d", { willReadFrequently: true });
  const { data, width, height } = srcCtx.getImageData(0, 0, source.width, source.height);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 120 + strength * 80 + turbo * 70);
  const anchors = [];
  const cols = 4;
  const rows = 4;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const px = canvas.width * (0.14 + (col / Math.max(1, cols - 1)) * 0.72);
      const py = canvas.height * (0.14 + (row / Math.max(1, rows - 1)) * 0.72);
      const idx = getSampleSourceIndex(sampleSource, px, py);
      const luma = (
        sampleSource.data[idx]
        + sampleSource.data[idx + 1]
        + sampleSource.data[idx + 2]
      ) / 3;
      const darkness = 1 - luma / 255;
      if (darkness < 0.22 && seededNoise(col, row, 0.71) < 0.55) continue;
      anchors.push({
        x: px + (seededNoise(col, row, 1.13) - 0.5) * canvas.width * 0.08,
        y: py + (seededNoise(col, row, 1.47) - 0.5) * canvas.height * 0.08,
        radius: Math.min(canvas.width, canvas.height) * (0.14 + darkness * 0.16 + strength * 0.06 + turbo * 0.03),
        pull: (0.18 + darkness * 0.42 + strength * 0.28 + turbo * 0.12) * Math.min(canvas.width, canvas.height) * 0.055,
        pinch: seededNoise(col, row, 2.03) > 0.42 ? 1 : -1,
      });
    }
  }

  if (anchors.length === 0) {
    anchors.push({
      x: canvas.width * 0.5,
      y: canvas.height * 0.5,
      radius: Math.min(canvas.width, canvas.height) * 0.24,
      pull: Math.min(canvas.width, canvas.height) * 0.05 * (0.5 + strength),
      pinch: 1,
    });
  }

  warpCanvas(canvas, (x, y) => {
    let sx = x;
    let sy = y;

    for (const anchor of anchors) {
      const dx = sx - anchor.x;
      const dy = sy - anchor.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      if (dist > anchor.radius) continue;
      const t = 1 - dist / anchor.radius;
      const membrane = t * t * (1.22 - t * 0.35);
      const bend = anchor.pull * membrane * anchor.pinch;
      sx -= (dx / dist) * bend;
      sy -= (dy / dist) * bend;
      const tangent = membrane * (0.08 + strength * 0.1 + turbo * 0.04) * anchor.radius;
      sx += (-dy / dist) * tangent * 0.16;
      sy += (dx / dist) * tangent * 0.12;
    }

    const luma = sampleImageLuma(data, width, height, sx, sy);
    const localDepth = (1 - luma / 255) * (0.8 + strength * 1.6 + turbo * 0.6);
    const reboundX = Math.sin((y / height) * Math.PI * (2.4 + strength * 1.6) + x * 0.006) * localDepth * 1.8;
    const reboundY = Math.cos((x / width) * Math.PI * (2 + strength * 1.4) + y * 0.007) * localDepth * 1.3;
    return [sx + reboundX, sy + reboundY];
  });

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.globalAlpha = clamp(0.03 + strength * 0.04, 0.03, 0.08);
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = Math.max(0.6, canvas.width * 0.0018);
  const grid = Math.max(32, Math.round(56 - strength * 10 - turbo * 8));
  for (let y = grid; y < canvas.height; y += grid) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 12) {
      const yy = y + Math.sin(x * 0.014 + y * 0.008) * (1.2 + strength * 2.4);
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  for (let x = grid; x < canvas.width; x += grid) {
    ctx.beginPath();
    for (let y = 0; y <= canvas.height; y += 12) {
      const xx = x + Math.cos(y * 0.013 + x * 0.007) * (1.2 + strength * 2.1);
      if (y === 0) ctx.moveTo(xx, y);
      else ctx.lineTo(xx, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function applyWavePull(canvas, amount, soft) {
  const width = canvas.width;
  const height = canvas.height;
  warpCanvas(canvas, (x, y) => {
    const waveX = Math.sin((y / height) * Math.PI * (3.2 + amount * 2.8) + x * 0.008) * (8 + amount * 22);
    const waveY = Math.cos((x / width) * Math.PI * (2.8 + amount * 2.4) + y * 0.01) * (5 + amount * 16);
    return [x + waveX, y + waveY];
  });
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.strokeStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.04 + clamp(amount, 0, 1) * 0.06})`;
  ctx.lineWidth = Math.max(0.6, canvas.width * 0.002);
  const lines = Math.max(4, Math.round(4 + clamp(amount, 0, 1) * 7));
  for (let i = 0; i < lines; i += 1) {
    const y = (canvas.height / (lines + 1)) * (i + 1);
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 12) {
      const yy = y + Math.sin(x * 0.015 + i * 0.8 + amount * 2) * (2 + amount * 5);
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function warpCanvas(canvas, mapper) {
  const source = cloneCanvas(canvas);
  const srcCtx = source.getContext("2d", { willReadFrequently: true });
  const dstCtx = canvas.getContext("2d");
  const srcImage = srcCtx.getImageData(0, 0, source.width, source.height);
  const src = srcImage.data;
  const width = srcImage.width;
  const height = srcImage.height;
  const dest = dstCtx.createImageData(width, height);
  const out = dest.data;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [sx, sy] = mapper(x, y, width, height);
      sampleImageDataBilinear(src, width, height, sx, sy, out, (y * width + x) * 4);
    }
  }
  dstCtx.putImageData(dest, 0, 0);
}

function sampleImageDataBilinear(src, width, height, x, y, out, outIndex) {
  const clampedX = clamp(x, 0, width - 1);
  const clampedY = clamp(y, 0, height - 1);
  const x0 = Math.floor(clampedX);
  const y0 = Math.floor(clampedY);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = clampedX - x0;
  const ty = clampedY - y0;
  const i00 = (y0 * width + x0) * 4;
  const i10 = (y0 * width + x1) * 4;
  const i01 = (y1 * width + x0) * 4;
  const i11 = (y1 * width + x1) * 4;
  for (let c = 0; c < 4; c += 1) {
    const top = src[i00 + c] * (1 - tx) + src[i10 + c] * tx;
    const bottom = src[i01 + c] * (1 - tx) + src[i11 + c] * tx;
    out[outIndex + c] = top * (1 - ty) + bottom * ty;
  }
}

function sampleImageLuma(src, width, height, x, y) {
  const ix = clamp(Math.round(x), 0, width - 1);
  const iy = clamp(Math.round(y), 0, height - 1);
  const index = (iy * width + ix) * 4;
  return 0.299 * src[index] + 0.587 * src[index + 1] + 0.114 * src[index + 2];
}

function buildRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function buildDieCutPath(ctx, cx, cy, width, height, shape) {
  ctx.beginPath();
  if (shape === 0) {
    ctx.ellipse(cx, cy, width * 0.5, height * 0.5, 0, 0, Math.PI * 2);
  } else if (shape === 1) {
    const r = Math.min(width, height) * 0.48;
    for (let i = 0; i < 6; i += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 6;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    const notch = Math.min(width, height) * 0.18;
    ctx.moveTo(cx - width * 0.5 + notch, cy - height * 0.5);
    ctx.lineTo(cx + width * 0.5 - notch, cy - height * 0.5);
    ctx.quadraticCurveTo(cx + width * 0.5, cy - height * 0.5, cx + width * 0.5, cy - height * 0.5 + notch);
    ctx.lineTo(cx + width * 0.5, cy + height * 0.5 - notch);
    ctx.quadraticCurveTo(cx + width * 0.5, cy + height * 0.5, cx + width * 0.5 - notch, cy + height * 0.5);
    ctx.lineTo(cx - width * 0.5 + notch, cy + height * 0.5);
    ctx.quadraticCurveTo(cx - width * 0.5, cy + height * 0.5, cx - width * 0.5, cy + height * 0.5 - notch);
    ctx.lineTo(cx - width * 0.5, cy - height * 0.5 + notch);
    ctx.quadraticCurveTo(cx - width * 0.5, cy - height * 0.5, cx - width * 0.5 + notch, cy - height * 0.5);
    ctx.closePath();
  }
}

function applyMinecraft(canvas, amount) {
  const block = Math.max(6, Math.round(18 - amount * 6));
  const source = cloneCanvas(canvas);
  const ctx = canvas.getContext("2d");
  const sampleSource = createSampleSource(source, 220 + amount * 40);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += block) {
    for (let x = 0; x < canvas.width; x += block) {
      const sx = clamp(Math.round(x + block / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + block / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = Math.round(sampleSource.data[index] / 32) * 32;
      const g = Math.round(sampleSource.data[index + 1] / 32) * 32;
      const b = Math.round(sampleSource.data[index + 2] / 32) * 32;
      ctx.fillStyle = `rgb(${clamp(r + 16, 0, 255)},${clamp(g + 16, 0, 255)},${clamp(b + 16, 0, 255)})`;
      ctx.fillRect(x, y, block, block);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + amount * 0.08})`;
      ctx.fillRect(x, y, block, Math.max(1, block * 0.18));
      ctx.fillStyle = `rgba(0,0,0,${0.12 + amount * 0.12})`;
      ctx.fillRect(x, y + block * 0.82, block, Math.max(1, block * 0.18));
    }
  }
}

function applyMondriaan(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(4, Math.round(4 + strength * 5 + turbo * 5));
  const rows = Math.max(5, Math.round(5 + strength * 6 + turbo * 6));
  const sampleCanvas = getScratchCanvas(cols, rows);
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  sampleCtx.drawImage(source, 0, 0, cols, rows);
  const sample = sampleCtx.getImageData(0, 0, cols, rows).data;
  const xLines = [0];
  const yLines = [0];
  const baseStepX = canvas.width / cols;
  const baseStepY = canvas.height / rows;
  const jitterX = baseStepX * (0.16 + strength * 0.08);
  const jitterY = baseStepY * (0.16 + strength * 0.08);

  for (let i = 1; i < cols; i += 1) {
    xLines.push(clamp(Math.round(i * baseStepX + (seededNoise(i, cols, 0.81) - 0.5) * jitterX), 0, canvas.width));
  }
  xLines.push(canvas.width);

  for (let i = 1; i < rows; i += 1) {
    yLines.push(clamp(Math.round(i * baseStepY + (seededNoise(i, rows, 1.37) - 0.5) * jitterY), 0, canvas.height));
  }
  yLines.push(canvas.height);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(247, 244, 237)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const originalAlpha = clamp(0.34 - strength * 0.18, 0.06, 0.34);
  if (originalAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = originalAlpha;
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  }

  const palette = [
    { r: 230, g: 44, b: 36 },
    { r: 247, g: 209, b: 32 },
    { r: 31, g: 77, b: 182 },
    { r: 246, g: 243, b: 235 },
    { r: 235, g: 231, b: 220 },
  ];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x0 = xLines[col];
      const y0 = yLines[row];
      const x1 = xLines[col + 1];
      const y1 = yLines[row + 1];
      const width = Math.max(1, x1 - x0);
      const height = Math.max(1, y1 - y0);
      const index = (row * cols + col) * 4;
      const rgb = {
        r: sample[index],
        g: sample[index + 1],
        b: sample[index + 2],
      };
      const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const warmBias = Math.max(rgb.r - rgb.b, 0) / 255;
      const coolBias = Math.max(rgb.b - rgb.r, 0) / 255;
      const colorChance = 0.04 + strength * 0.16 + turbo * 0.08;
      const fieldNoise = seededNoise(col, row, 2.11);
      let fill = palette[3];

      if (s > 0.26 && fieldNoise < colorChance) {
        if (h >= 35 && h <= 75) {
          fill = palette[1];
        } else if (h >= 180 && h <= 260) {
          fill = palette[2];
        } else if (h <= 20 || h >= 330 || warmBias > 0.18) {
          fill = palette[0];
        } else {
          fill = fieldNoise > 0.62 ? palette[2] : palette[1];
        }
      } else if (l < 0.2 && strength > 0.55 && fieldNoise > 0.88) {
        fill = { r: 28, g: 28, b: 28 };
      } else if (l > 0.78 || fieldNoise > 0.42 + strength * 0.18) {
        fill = fieldNoise > 0.82 && strength > 0.35 ? palette[4] : palette[3];
      } else if (coolBias > 0.14 && strength > 0.42 && fieldNoise < 0.16 + strength * 0.05) {
        fill = palette[2];
      } else if (warmBias > 0.16 && strength > 0.42 && fieldNoise < 0.16 + strength * 0.05) {
        fill = fieldNoise < 0.08 + strength * 0.04 ? palette[1] : palette[0];
      }

      const fillMix = clamp(0.36 + strength * 0.24 + turbo * 0.08, 0.32, 0.82);
      ctx.fillStyle = `rgb(${Math.round(mix(rgb.r, fill.r, fillMix))}, ${Math.round(mix(rgb.g, fill.g, fillMix))}, ${Math.round(mix(rgb.b, fill.b, fillMix))})`;
      ctx.fillRect(x0, y0, width, height);

      if (strength > 0.08) {
        ctx.save();
        ctx.globalAlpha = clamp(0.14 + strength * 0.12 - turbo * 0.03, 0.08, 0.22);
        ctx.drawImage(source, x0, y0, width, height, x0, y0, width, height);
        ctx.restore();
      }
    }
  }

  const lineWidth = Math.max(2, Math.round((canvas.width / 240) * (0.55 + strength * 0.7 + turbo * 0.16)));
  ctx.strokeStyle = `rgb(${dark.r}, ${dark.g}, ${dark.b})`;
  ctx.lineCap = "square";

  for (const x of xLines) {
    ctx.lineWidth = lineWidth * (seededNoise(x, 0, 4.02) > 0.72 ? 1.22 : 1);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (const y of yLines) {
    ctx.lineWidth = lineWidth * (seededNoise(0, y, 4.68) > 0.72 ? 1.18 : 1);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  if (strength > 0.24) {
    ctx.save();
    ctx.globalAlpha = clamp(0.08 + strength * 0.08 - turbo * 0.02, 0.06, 0.16);
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  }
}

function applyVanGogh(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 420 + strength * 220 + turbo * 80);
  const step = Math.max(6, Math.round(20 - strength * 8 - turbo * 4));
  const strokeLength = step * (1.8 + strength * 1.4 + turbo * 0.5);
  const strokeWidth = Math.max(1.4, step * (0.18 + strength * 0.05));
  const swirlWeight = 0.28 + strength * 0.42 + turbo * 0.08;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(245, soft.r, 0.12))}, ${Math.round(mix(240, soft.g, 0.12))}, ${Math.round(mix(226, soft.b, 0.12))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = clamp(0.22 + strength * 0.1, 0.18, 0.34);
  ctx.filter = `blur(${0.8 + strength * 2.4 + turbo * 0.4}px) saturate(${1.04 + strength * 0.18})`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const gx = ((getSampleSourceChannel(sampleSource, sx + 1, sy, 0)
        + getSampleSourceChannel(sampleSource, sx + 1, sy, 1)
        + getSampleSourceChannel(sampleSource, sx + 1, sy, 2))
        - (getSampleSourceChannel(sampleSource, sx - 1, sy, 0)
        + getSampleSourceChannel(sampleSource, sx - 1, sy, 1)
        + getSampleSourceChannel(sampleSource, sx - 1, sy, 2))) / 255;
      const gy = ((getSampleSourceChannel(sampleSource, sx, sy + 1, 0)
        + getSampleSourceChannel(sampleSource, sx, sy + 1, 1)
        + getSampleSourceChannel(sampleSource, sx, sy + 1, 2))
        - (getSampleSourceChannel(sampleSource, sx, sy - 1, 0)
        + getSampleSourceChannel(sampleSource, sx, sy - 1, 1)
        + getSampleSourceChannel(sampleSource, sx, sy - 1, 2))) / 255;
      const edgeAngle = Math.atan2(gy, gx) + Math.PI / 2;
      const swirlAngle = Math.atan2(sy - canvas.height / 2, sx - canvas.width / 2) + Math.PI / 2;
      const angle = edgeAngle * (1 - swirlWeight) + swirlAngle * swirlWeight + (seededNoise(x, y, 7.1) - 0.5) * (0.2 + strength * 0.28);
      const vivid = clamp(s * (1.08 + strength * 0.22), 0, 1);
      const bright = clamp(l * (0.96 + strength * 0.08), 0, 1);
      let [sr, sg, sb] = hslToRgb(h, vivid, bright);

      if (h >= 180 && h <= 260) {
        sr = Math.round(mix(sr, 44, 0.08 + strength * 0.14));
        sg = Math.round(mix(sg, 92, 0.08 + strength * 0.14));
        sb = Math.round(mix(sb, 182, 0.12 + strength * 0.18));
      } else if (h >= 35 && h <= 75) {
        sr = Math.round(mix(sr, 232, 0.1 + strength * 0.12));
        sg = Math.round(mix(sg, 189, 0.08 + strength * 0.12));
        sb = Math.round(mix(sb, 62, 0.08 + strength * 0.12));
      } else if (l < 0.28) {
        sr = Math.round(mix(sr, dark.r, 0.12 + strength * 0.18));
        sg = Math.round(mix(sg, dark.g, 0.12 + strength * 0.18));
        sb = Math.round(mix(sb, dark.b, 0.12 + strength * 0.18));
      } else {
        sr = Math.round(mix(sr, accent.r, 0.03 + strength * 0.05));
        sg = Math.round(mix(sg, soft.g, 0.03 + strength * 0.05));
        sb = Math.round(mix(sb, soft.b, 0.03 + strength * 0.05));
      }

      const px = x + (seededNoise(x, y, 1.7) - 0.5) * step * 0.34;
      const py = y + (seededNoise(x, y, 2.4) - 0.5) * step * 0.34;
      const len = strokeLength * (0.72 + seededNoise(x, y, 3.8) * 0.72);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${0.46 + strength * 0.18})`;
      ctx.lineWidth = strokeWidth * (0.8 + seededNoise(x, y, 4.6) * 0.9);
      ctx.beginPath();
      ctx.moveTo(-len * 0.45, 0);
      ctx.quadraticCurveTo(0, (seededNoise(x, y, 5.2) - 0.5) * step * (0.7 + strength * 0.4), len * 0.45, 0);
      ctx.stroke();
      if (strength > 0.2) {
        ctx.strokeStyle = `rgba(${Math.round(mix(sr, 255, 0.24))}, ${Math.round(mix(sg, 242, 0.18))}, ${Math.round(mix(sb, 224, 0.12))}, ${0.12 + strength * 0.08})`;
        ctx.lineWidth = Math.max(0.8, ctx.lineWidth * 0.34);
        ctx.beginPath();
        ctx.moveTo(-len * 0.22, -ctx.lineWidth * 0.5);
        ctx.lineTo(len * 0.2, ctx.lineWidth * 0.3);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = clamp(0.04 + strength * 0.08, 0.04, 0.14);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyAugustMacke(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(5, Math.round(6 + strength * 8 + turbo * 5));
  const rows = Math.max(5, Math.round(6 + strength * 7 + turbo * 5));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(248, soft.r, 0.08))}, ${Math.round(mix(241, soft.g, 0.08))}, ${Math.round(mix(228, soft.b, 0.08))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.22 + strength * 0.14, 0.2, 0.38);
  ctx.filter = `blur(${0.5 + strength * 1.2 + turbo * 0.25}px) saturate(${1.04 + strength * 0.2})`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const sx = clamp(Math.round(x + cellW / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + cellH / 2), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const dx = x + (seededNoise(col, row, 0.71) - 0.5) * cellW * (0.12 + strength * 0.06);
      const dy = y + (seededNoise(col, row, 1.33) - 0.5) * cellH * (0.12 + strength * 0.06);
      const w = cellW * (0.86 + seededNoise(col, row, 2.17) * (0.16 + strength * 0.08));
      const hRect = cellH * (0.82 + seededNoise(col, row, 2.91) * (0.22 + strength * 0.08));
      let [fr, fg, fb] = [r, g, b];

      if (h >= 25 && h <= 75) {
        [fr, fg, fb] = [mix(fr, 232, 0.16 + strength * 0.12), mix(fg, 188, 0.14 + strength * 0.12), mix(fb, 74, 0.08 + strength * 0.08)];
      } else if (h >= 180 && h <= 250) {
        [fr, fg, fb] = [mix(fr, 69, 0.1 + strength * 0.08), mix(fg, 118, 0.1 + strength * 0.08), mix(fb, 201, 0.16 + strength * 0.12)];
      } else if (h <= 20 || h >= 330) {
        [fr, fg, fb] = [mix(fr, 220, 0.1 + strength * 0.08), mix(fg, 98, 0.08 + strength * 0.06), mix(fb, 74, 0.06 + strength * 0.05)];
      } else {
        [fr, fg, fb] = [mix(fr, accent.r, 0.05 + strength * 0.04), mix(fg, soft.g, 0.05 + strength * 0.04), mix(fb, soft.b, 0.05 + strength * 0.04)];
      }

      ctx.save();
      ctx.translate(dx + w / 2, dy + hRect / 2);
      ctx.rotate((seededNoise(col, row, 3.61) - 0.5) * (0.12 + strength * 0.16));
      ctx.fillStyle = `rgba(${Math.round(fr)}, ${Math.round(fg)}, ${Math.round(fb)}, ${0.34 + strength * 0.18})`;
      ctx.fillRect(-w / 2, -hRect / 2, w, hRect);
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
      ctx.lineWidth = Math.max(1, (canvas.width / 420) * (0.7 + strength * 0.4));
      ctx.strokeRect(-w / 2, -hRect / 2, w, hRect);
      ctx.restore();

      if (l < 0.42 && strength > 0.18 && seededNoise(col, row, 4.27) > 0.55) {
        ctx.save();
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + strength * 0.1})`;
        ctx.lineWidth = Math.max(1, (canvas.width / 520) * (0.9 + strength * 0.5));
        ctx.beginPath();
        ctx.moveTo(dx + w * 0.18, dy + hRect * 0.08);
        ctx.lineTo(dx + w * 0.18, dy + hRect * 0.88);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function applyArp(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 360 + strength * 160 + turbo * 60);
  const count = Math.round(16 + strength * 34 + turbo * 22);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(244, soft.r, 0.06))}, ${Math.round(mix(240, soft.g, 0.06))}, ${Math.round(mix(233, soft.b, 0.06))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.2 + strength * 0.1, 0.16, 0.3);
  ctx.drawImage(source, 0, 0);
  ctx.restore();

  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 0.3) * canvas.width;
    const cy = seededNoise(i, 2, 0.9) * canvas.height;
    const rx = canvas.width * (0.04 + seededNoise(i, 3, 1.5) * (0.08 + strength * 0.06 + turbo * 0.02));
    const ry = canvas.height * (0.035 + seededNoise(i, 4, 2.1) * (0.08 + strength * 0.06 + turbo * 0.02));
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = getSampleSourceIndex(sampleSource, sx, sy);
    const base = { r: sampleSource.data[index], g: sampleSource.data[index + 1], b: sampleSource.data[index + 2] };
    const [h, s, l] = rgbToHsl(base.r, base.g, base.b);
    const neighborIndex = getSampleSourceIndex(
      sampleSource,
      clamp(Math.round(cx + rx * 0.35), 0, canvas.width - 1),
      clamp(Math.round(cy + ry * 0.35), 0, canvas.height - 1)
    );
    const neighbor = { r: sampleSource.data[neighborIndex], g: sampleSource.data[neighborIndex + 1], b: sampleSource.data[neighborIndex + 2] };
    let target = base;
    if (h >= 35 && h <= 80) target = { r: 238, g: 200, b: 83 };
    else if (h >= 170 && h <= 260) target = { r: 74, g: 128, b: 196 };
    else if (h <= 20 || h >= 330) target = { r: 214, g: 92, b: 88 };
    else target = { r: mix(base.r, soft.r, 0.24), g: mix(base.g, accent.g, 0.18), b: mix(base.b, soft.b, 0.2) };
    const fill = {
      r: Math.round(mix(mix(base.r, neighbor.r, 0.28 + turbo * 0.08), target.r, 0.34 + strength * 0.18)),
      g: Math.round(mix(mix(base.g, neighbor.g, 0.28 + turbo * 0.08), target.g, 0.34 + strength * 0.18)),
      b: Math.round(mix(mix(base.b, neighbor.b, 0.28 + turbo * 0.08), target.b, 0.34 + strength * 0.18)),
    };

    ctx.save();
    ctx.translate(cx, cy);
    const gx = getSampleSourceChannel(sampleSource, sx + 2, sy, 0) - getSampleSourceChannel(sampleSource, sx - 2, sy, 0);
    const gy = getSampleSourceChannel(sampleSource, sx, sy + 2, 0) - getSampleSourceChannel(sampleSource, sx, sy - 2, 0);
    ctx.rotate(Math.atan2(gy, gx) * 0.18 + (seededNoise(i, 5, 2.7) - 0.5) * (0.55 + strength * 0.36));
    drawOrganicBlobPath(ctx, 0, 0, rx, ry, 6, i + 11);
    ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.26 + strength * 0.16})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
    ctx.lineWidth = Math.max(0.8, (canvas.width / 760) * (0.9 + strength * 0.6));
    ctx.stroke();
    if (turbo > 0.1 && s > 0.16) {
      ctx.strokeStyle = `rgba(${Math.round(mix(fill.r, 255, 0.14))}, ${Math.round(mix(fill.g, 255, 0.1))}, ${Math.round(mix(fill.b, 255, 0.1))}, ${0.06 + turbo * 0.08})`;
      ctx.lineWidth = Math.max(0.4, ctx.lineWidth * 0.45);
      drawOrganicBlobPath(ctx, 0, 0, rx * 0.56, ry * 0.56, 6, i + 51);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (turbo > 0.08) {
    ctx.save();
    ctx.globalAlpha = clamp(0.08 + turbo * 0.08 + strength * 0.04, 0.06, 0.18);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  }
}

function applyPaulKlee(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(7, Math.round(8 + strength * 10 + turbo * 5));
  const rows = Math.max(7, Math.round(8 + strength * 10 + turbo * 5));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(247, soft.r, 0.08))}, ${Math.round(mix(236, soft.g, 0.08))}, ${Math.round(mix(221, soft.b, 0.08))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const sx = clamp(Math.round(x + cellW / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + cellH / 2), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      const tintMix = clamp(0.24 + strength * 0.18, 0.2, 0.46);
      const target = {
        r: mix(r, accent.r, 0.08 + strength * 0.08),
        g: mix(g, soft.g, 0.1 + strength * 0.08),
        b: mix(b, soft.b, 0.12 + strength * 0.08),
      };
      ctx.fillStyle = `rgba(${Math.round(mix(r, target.r, tintMix))}, ${Math.round(mix(g, target.g, tintMix))}, ${Math.round(mix(b, target.b, tintMix))}, ${0.28 + strength * 0.18})`;
      ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.1 + strength * 0.08})`;
      ctx.lineWidth = Math.max(0.8, (canvas.width / 760) * (0.9 + strength * 0.5));
      ctx.strokeRect(x, y, cellW, cellH);

      if (seededNoise(col, row, 6.1) > 0.76 - strength * 0.18) {
        ctx.save();
        ctx.translate(x + cellW / 2, y + cellH / 2);
        ctx.rotate((seededNoise(col, row, 7.4) - 0.5) * 0.8);
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.16 + strength * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(-cellW * 0.18, 0);
        ctx.lineTo(cellW * 0.18, 0);
        ctx.moveTo(0, -cellH * 0.18);
        ctx.lineTo(0, cellH * 0.18);
        ctx.stroke();
        ctx.restore();
      }
      if (seededNoise(col, row, 8.2) > 0.82 - strength * 0.14) {
        ctx.save();
        ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.12 + strength * 0.08})`;
        ctx.beginPath();
        ctx.arc(x + cellW * 0.5, y + cellH * 0.5, Math.min(cellW, cellH) * (0.08 + strength * 0.06), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08, 0.08, 0.14);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyMarcChagall(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 360 + strength * 180 + turbo * 70);
  const count = Math.round(12 + strength * 24 + turbo * 16);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, `rgba(${Math.round(mix(38, soft.r, 0.18))}, ${Math.round(mix(62, soft.g, 0.1))}, ${Math.round(mix(110, soft.b, 0.08))}, 1)`);
  bg.addColorStop(1, `rgba(${Math.round(mix(245, soft.r, 0.06))}, ${Math.round(mix(236, soft.g, 0.06))}, ${Math.round(mix(222, soft.b, 0.06))}, 1)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.24 + strength * 0.12, 0.2, 0.34);
  ctx.filter = `blur(${1.2 + strength * 3 + turbo * 0.4}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();

  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 1.2) * canvas.width;
    const cy = seededNoise(i, 2, 1.9) * canvas.height;
    const w = canvas.width * (0.08 + seededNoise(i, 3, 2.8) * (0.1 + strength * 0.08));
    const h = canvas.height * (0.06 + seededNoise(i, 4, 3.7) * (0.11 + strength * 0.08));
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = getSampleSourceIndex(sampleSource, sx, sy);
    const base = { r: sampleSource.data[index], g: sampleSource.data[index + 1], b: sampleSource.data[index + 2] };
    const [hue, sat, lum] = rgbToHsl(base.r, base.g, base.b);
    const anchorIndex = getSampleSourceIndex(
      sampleSource,
      clamp(Math.round(cx - w * 0.22), 0, canvas.width - 1),
      clamp(Math.round(cy + h * 0.28), 0, canvas.height - 1)
    );
    const anchor = { r: sampleSource.data[anchorIndex], g: sampleSource.data[anchorIndex + 1], b: sampleSource.data[anchorIndex + 2] };
    let target = {
      r: mix(base.r, soft.r, 0.08),
      g: mix(base.g, accent.g, 0.06),
      b: mix(base.b, soft.b, 0.08),
    };
    if (hue >= 180 && hue <= 260) target = { r: 58, g: 102, b: 188 };
    else if (hue >= 35 && hue <= 75) target = { r: 232, g: 192, b: 82 };
    else if (hue <= 20 || hue >= 330) target = { r: 196, g: 86, b: 108 };
    else if (lum < 0.28) target = { r: 35, g: 41, b: 84 };
    target = {
      r: mix(mix(base.r, anchor.r, 0.26 + turbo * 0.08), target.r, 0.34 + strength * 0.2),
      g: mix(mix(base.g, anchor.g, 0.26 + turbo * 0.08), target.g, 0.34 + strength * 0.2),
      b: mix(mix(base.b, anchor.b, 0.26 + turbo * 0.08), target.b, 0.34 + strength * 0.2),
    };

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((seededNoise(i, 5, 4.5) - 0.5) * (0.8 + strength * 0.8));
    ctx.fillStyle = `rgba(${Math.round(target.r)}, ${Math.round(target.g)}, ${Math.round(target.b)}, ${0.18 + strength * 0.14})`;
    drawOrganicBlobPath(ctx, 0, 0, w * 0.52, h * 0.52, 7, i + 41);
    ctx.fill();
    ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
    ctx.lineWidth = Math.max(1, (canvas.width / 780) * (1 + strength * 0.5));
    ctx.stroke();
    if (turbo > 0.08 && sat > 0.16) {
      ctx.strokeStyle = `rgba(${Math.round(mix(target.r, 255, 0.16))}, ${Math.round(mix(target.g, 255, 0.12))}, ${Math.round(mix(target.b, 255, 0.12))}, ${0.05 + turbo * 0.08})`;
      ctx.lineWidth = Math.max(0.4, ctx.lineWidth * 0.4);
      drawOrganicBlobPath(ctx, 0, 0, w * 0.3, h * 0.3, 7, i + 71);
      ctx.stroke();
    }
    ctx.restore();
  }

  const moonX = canvas.width * (0.78 + seededNoise(1, 1, 9.1) * 0.08);
  const moonY = canvas.height * (0.18 + seededNoise(1, 2, 9.7) * 0.08);
  const moonR = Math.max(16, canvas.width * (0.028 + strength * 0.014));
  ctx.save();
  ctx.fillStyle = `rgba(246, 232, 169, ${0.14 + strength * 0.12})`;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08, 0.08, 0.18);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyKandinsky(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 360 + strength * 180 + turbo * 80);
  const count = Math.round(28 + strength * 54 + turbo * 32);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(245, 238, 224)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.12 + strength * 0.1, 0.1, 0.2);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 1.7) * canvas.width;
    const cy = seededNoise(i, 2, 2.9) * canvas.height;
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = getSampleSourceIndex(sampleSource, sx, sy);
    const r = sampleSource.data[index];
    const g = sampleSource.data[index + 1];
    const b = sampleSource.data[index + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    const radius = canvas.width * (0.014 + seededNoise(i, 3, 3.4) * (0.04 + strength * 0.03));
    const gx = getSampleSourceChannel(sampleSource, sx + 1, sy, 0) - getSampleSourceChannel(sampleSource, sx - 1, sy, 0);
    const gy = getSampleSourceChannel(sampleSource, sx, sy + 1, 0) - getSampleSourceChannel(sampleSource, sx, sy - 1, 0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.atan2(gy, gx) + (seededNoise(i, 4, 4.2) - 0.5) * 1.2);
    ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.18 + strength * 0.16})`;
    ctx.lineWidth = Math.max(1, (canvas.width / 700) * (1 + strength * 0.8));
    ctx.beginPath();
    ctx.moveTo(-radius * 2.2, 0);
    ctx.lineTo(radius * 2.2, 0);
    ctx.moveTo(0, -radius * 2.2);
    ctx.lineTo(0, radius * 2.2);
    ctx.stroke();
    let target = { r: accent.r, g: soft.g, b: soft.b };
    if (h >= 180 && h <= 260) target = { r: 46, g: 88, b: 198 };
    else if (h >= 35 && h <= 80) target = { r: 242, g: 196, b: 52 };
    else if (h <= 20 || h >= 330) target = { r: 222, g: 70, b: 64 };
    else if (l < 0.28) target = { r: dark.r, g: dark.g, b: dark.b };
    const fillR = Math.round(mix(r, target.r, 0.38 + strength * 0.18));
    const fillG = Math.round(mix(g, target.g, 0.38 + strength * 0.18));
    const fillB = Math.round(mix(b, target.b, 0.38 + strength * 0.18));
    ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.28 + strength * 0.18})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${Math.round(mix(fillR, 255, 0.12 + s * 0.12))}, ${Math.round(mix(fillG, 255, 0.12 + s * 0.08))}, ${Math.round(mix(fillB, 255, 0.12 + s * 0.08))}, ${0.22 + strength * 0.14})`;
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.2 + seededNoise(i, 5, 4.8) * 1.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08, 0.08, 0.18);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyMalevich(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(10 + strength * 18 + turbo * 10);
  const palette = [
    { r: 17, g: 17, b: 17 },
    { r: 225, g: 50, b: 42 },
    { r: 36, g: 83, b: 208 },
    { r: 240, g: 198, b: 28 },
    { r: 247, g: 244, b: 234 },
  ];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(249,247,241)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.04 + strength * 0.05, 0.03, 0.1);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let i = 0; i < count; i += 1) {
    const w = canvas.width * (0.08 + seededNoise(i, 1, 1.2) * (0.18 + strength * 0.1));
    const h = canvas.height * (0.05 + seededNoise(i, 2, 1.9) * (0.16 + strength * 0.08));
    const x = seededNoise(i, 3, 2.7) * (canvas.width - w);
    const y = seededNoise(i, 4, 3.1) * (canvas.height - h);
    const sx = clamp(Math.round(x + w * 0.5), 0, canvas.width - 1);
    const sy = clamp(Math.round(y + h * 0.5), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
    const target = palette[Math.floor(seededNoise(i, 6, 5.1) * palette.length)];
    const fill = {
      r: Math.round(mix(base.r, target.r, 0.42 + strength * 0.24)),
      g: Math.round(mix(base.g, target.g, 0.42 + strength * 0.24)),
      b: Math.round(mix(base.b, target.b, 0.42 + strength * 0.24)),
    };
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((seededNoise(i, 5, 4.3) - 0.5) * (0.6 + strength * 0.4));
    ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.34 + strength * 0.18})`;
    if (seededNoise(i, 7, 6.2) > 0.72) {
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) * 0.42, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + strength * 0.1})`;
  ctx.lineWidth = Math.max(1, (canvas.width / 900) * (1 + strength * 0.6));
  ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9);
  ctx.save();
  ctx.globalAlpha = clamp(0.12 + strength * 0.08, 0.1, 0.22);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applySoniaDelaunay(canvas, amount, accent, soft) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(12 + strength * 18 + turbo * 10);
  const palette = [
    { r: 249, g: 65, b: 68 },
    { r: 249, g: 199, b: 79 },
    { r: 39, g: 125, b: 161 },
    { r: 144, g: 190, b: 109 },
    { r: 249, g: 132, b: 74 },
    { r: 87, g: 117, b: 144 },
  ];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(244, soft.r, 0.08))}, ${Math.round(mix(238, soft.g, 0.08))}, ${Math.round(mix(231, soft.b, 0.08))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08, 0.06, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 0.9) * canvas.width;
    const cy = seededNoise(i, 2, 1.7) * canvas.height;
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
    const radius = canvas.width * (0.05 + seededNoise(i, 3, 2.4) * (0.16 + strength * 0.08));
    const bands = Math.round(4 + strength * 4 + turbo * 2);
    for (let b = 0; b < bands; b += 1) {
      const start = seededNoise(i, b, 3.6) * Math.PI * 2;
      const end = start + Math.PI * (0.5 + seededNoise(i, b + 1, 4.2) * 0.9);
      const target = palette[(i + b) % palette.length];
      const fill = {
        r: Math.round(mix(base.r, target.r, 0.38 + strength * 0.2)),
        g: Math.round(mix(base.g, target.g, 0.38 + strength * 0.2)),
        b: Math.round(mix(base.b, target.b, 0.38 + strength * 0.2)),
      };
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius * (1 - b / (bands + 1)), start, end);
      ctx.closePath();
      ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.18 + strength * 0.16})`;
      ctx.fill();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08, 0.08, 0.18);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyRobertDelaunay(canvas, amount, accent, soft) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(10 + strength * 16 + turbo * 8);
  const palette = [
    { r: 255, g: 204, b: 41 },
    { r: 36, g: 80, b: 216 },
    { r: 232, g: 71, b: 73 },
    { r: 31, g: 158, b: 137 },
    { r: 247, g: 243, b: 232 },
  ];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(250, soft.r, 0.05))}, ${Math.round(mix(246, accent.g, 0.03))}, ${Math.round(mix(239, soft.b, 0.06))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 1.1) * canvas.width;
    const cy = seededNoise(i, 2, 1.8) * canvas.height;
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
    const radius = canvas.width * (0.06 + seededNoise(i, 3, 2.6) * (0.14 + strength * 0.06));
    const rings = Math.round(4 + strength * 3 + turbo * 2);
    for (let r = rings; r >= 1; r -= 1) {
      const target = palette[(i + r) % palette.length];
      ctx.fillStyle = `rgba(${Math.round(mix(base.r, target.r, 0.4 + strength * 0.2))}, ${Math.round(mix(base.g, target.g, 0.4 + strength * 0.2))}, ${Math.round(mix(base.b, target.b, 0.4 + strength * 0.2))}, ${0.18 + strength * 0.16})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * (r / rings), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08, 0.06, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyCezanne(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(6, Math.round(20 - strength * 6 - turbo * 3));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(241, 233, 220)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      ctx.save();
      ctx.translate(x + step / 2, y + step / 2);
      ctx.rotate((seededNoise(x, y, 0.9) - 0.5) * (0.45 + strength * 0.24));
      ctx.fillStyle = `rgba(${Math.round(mix(r, accent.r, 0.05))}, ${Math.round(mix(g, soft.g, 0.08))}, ${Math.round(mix(b, dark.b, 0.03))}, ${0.34 + strength * 0.18})`;
      ctx.fillRect(-step * 0.65, -step * 0.24, step * 1.3, step * 0.48);
      ctx.restore();
    }
  }
}

function applyBraque(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(7, Math.round(7 + strength * 9 + turbo * 12));
  const rows = Math.max(7, Math.round(7 + strength * 9 + turbo * 12));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(226, 214, 194)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const sx = clamp(Math.round((col + 0.5) * cellW), 0, canvas.width - 1);
      const sy = clamp(Math.round((row + 0.5) * cellH), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
      const tone = clamp(gray * (0.78 + strength * 0.08), 30, 220);
      const x = col * cellW;
      const y = row * cellH;
      const contrast = Math.abs(
        gray
        - ((getPixelChannel(sample, canvas.width, canvas.height, sx + Math.max(1, Math.round(cellW * 0.25)), sy, 0)
          + getPixelChannel(sample, canvas.width, canvas.height, sx - Math.max(1, Math.round(cellW * 0.25)), sy, 0)
          + getPixelChannel(sample, canvas.width, canvas.height, sx, sy + Math.max(1, Math.round(cellH * 0.25)), 0)
          + getPixelChannel(sample, canvas.width, canvas.height, sx, sy - Math.max(1, Math.round(cellH * 0.25)), 0)) / 4)
      );
      ctx.save();
      ctx.translate(x + cellW / 2, y + cellH / 2);
      ctx.rotate((seededNoise(col, row, 2.2) - 0.5) * (0.26 + strength * 0.18 + turbo * 0.08));
      ctx.fillStyle = `rgba(${tone}, ${tone * 0.95}, ${tone * 0.82}, ${0.26 + strength * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(-cellW * (0.42 + contrast / 700), -cellH * 0.14);
      ctx.lineTo(cellW * 0.08, -cellH * (0.4 + contrast / 1200));
      ctx.lineTo(cellW * (0.42 + contrast / 900), cellH * 0.08);
      ctx.lineTo(-cellW * 0.08, cellH * (0.38 + contrast / 1200));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
      ctx.lineWidth = Math.max(0.45, (canvas.width / 1400) * (0.6 + strength * 0.5 + turbo * 0.25));
      ctx.stroke();
      if (turbo > 0.15 && contrast > 18) {
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.05 + turbo * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(-cellW * 0.18, -cellH * 0.08);
        ctx.lineTo(cellW * 0.16, cellH * 0.1);
        ctx.moveTo(cellW * 0.05, -cellH * 0.18);
        ctx.lineTo(-cellW * 0.14, cellH * 0.16);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08 + turbo * 0.04, 0.08, 0.22);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyFranzMarc(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(26 + strength * 46 + turbo * 20);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(234, 231, 220)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 1.3) * canvas.width;
    const cy = seededNoise(i, 2, 2.1) * canvas.height;
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const [h] = rgbToHsl(sample[index], sample[index + 1], sample[index + 2]);
    let fill = { r: 50, g: 96, b: 194 };
    if (h >= 35 && h <= 80) fill = { r: 236, g: 194, b: 42 };
    else if (h <= 20 || h >= 330) fill = { r: 217, g: 78, b: 66 };
    else if (h >= 100 && h <= 180) fill = { r: 108, g: 168, b: 88 };
    const size = canvas.width * (0.02 + seededNoise(i, 3, 3.7) * (0.08 + strength * 0.04));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((seededNoise(i, 4, 4.6) - 0.5) * Math.PI);
    ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.28 + strength * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(-size, size * 0.2);
    ctx.lineTo(0, -size);
    ctx.lineTo(size, size * 0.15);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08, 0.08, 0.16);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applySchiele(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(2, Math.round(14 - strength * 5 - turbo * 5));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(246, 238, 226)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.14 + strength * 0.08 + turbo * 0.04, 0.12, 0.26);
  ctx.filter = `blur(${0.35 + strength * 0.7 + turbo * 0.35}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(mix(dark.g, 86, 0.22))}, ${Math.round(mix(dark.b, 70, 0.18))}, ${0.22 + strength * 0.18})`;
  ctx.lineCap = "round";
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const gx = getPixelChannel(sample, canvas.width, canvas.height, x + 1, y, 0) - getPixelChannel(sample, canvas.width, canvas.height, x - 1, y, 0);
      const gy = getPixelChannel(sample, canvas.width, canvas.height, x, y + 1, 0) - getPixelChannel(sample, canvas.width, canvas.height, x, y - 1, 0);
      const mag = Math.abs(gx) + Math.abs(gy);
      if (mag < 46 + (1 - strength) * 26 - turbo * 8) continue;
      ctx.lineWidth = Math.max(0.55, (canvas.width / 1000) * (0.9 + strength * 1.1 + turbo * 0.5));
      const angle = Math.atan2(gy, gx) + Math.PI / 2;
      const len = step * (1.15 + seededNoise(x, y, 6.1) * (0.9 + turbo * 0.35));
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(angle) * len * 0.5, y - Math.sin(angle) * len * 0.5);
      ctx.lineTo(x + Math.cos(angle) * len * 0.5, y + Math.sin(angle) * len * 0.5);
      ctx.stroke();
      if (turbo > 0.18 && mag > 90) {
        ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(mix(dark.g, 102, 0.24))}, ${Math.round(mix(dark.b, 84, 0.2))}, ${0.08 + turbo * 0.12})`;
        ctx.lineWidth = Math.max(0.35, ctx.lineWidth * 0.45);
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle) * len * 0.22, y - Math.sin(angle) * len * 0.22);
        ctx.lineTo(x + Math.cos(angle) * len * 0.28, y + Math.sin(angle) * len * 0.28);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(mix(dark.g, 86, 0.22))}, ${Math.round(mix(dark.b, 70, 0.18))}, ${0.22 + strength * 0.18})`;
      }
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.05 + turbo * 0.06, 0.03, 0.12);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyMatisse(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(18 + strength * 34 + turbo * 18);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(245, 240, 230)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 0.8) * canvas.width;
    const cy = seededNoise(i, 2, 1.4) * canvas.height;
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const r = sample[index];
    const g = sample[index + 1];
    const b = sample[index + 2];
    const rx = canvas.width * (0.03 + seededNoise(i, 3, 2.2) * (0.08 + strength * 0.04));
    const ry = canvas.height * (0.03 + seededNoise(i, 4, 2.9) * (0.08 + strength * 0.04));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((seededNoise(i, 5, 3.6) - 0.5) * 0.7);
    drawOrganicBlobPath(ctx, 0, 0, rx, ry, 7, i + 90);
    ctx.fillStyle = `rgba(${Math.round(mix(r, accent.r, 0.12))}, ${Math.round(mix(g, soft.g, 0.12))}, ${Math.round(mix(b, soft.b, 0.12))}, ${0.3 + strength * 0.18})`;
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
}

function applyMiro(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(18 + strength * 30 + turbo * 18);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(247, 243, 232)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.05 + strength * 0.05, 0.04, 0.1);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.lineCap = "round";
  for (let i = 0; i < count; i += 1) {
    const x = seededNoise(i, 1, 1.7) * canvas.width;
    const y = seededNoise(i, 2, 2.4) * canvas.height;
    const sx = clamp(Math.round(x), 0, canvas.width - 1);
    const sy = clamp(Math.round(y), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const r = sample[index];
    const g = sample[index + 1];
    const b = sample[index + 2];
    const size = canvas.width * (0.01 + seededNoise(i, 3, 3.1) * (0.04 + strength * 0.02));
    ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.16 + strength * 0.16})`;
    ctx.lineWidth = Math.max(1, (canvas.width / 900) * (1 + strength * 0.8));
    ctx.beginPath();
    ctx.moveTo(x - size * 1.8, y + size * 1.4);
    ctx.quadraticCurveTo(x, y - size * 1.4, x + size * 2.1, y + size * 0.8);
    ctx.stroke();
    const [hue] = rgbToHsl(r, g, b);
    let target = { r: 215, g: 38, b: 56 };
    if (hue >= 180 && hue <= 260) target = { r: 32, g: 85, b: 214 };
    else if (hue >= 35 && hue <= 75) target = { r: 240, g: 196, b: 25 };
    else if (seededNoise(i, 5, 4.8) > 0.76) target = { r: 17, g: 17, b: 17 };
    ctx.fillStyle = `rgba(${Math.round(mix(r, target.r, 0.42 + strength * 0.16))}, ${Math.round(mix(g, target.g, 0.42 + strength * 0.16))}, ${Math.round(mix(b, target.b, 0.42 + strength * 0.16))}, ${0.28 + strength * 0.18})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08, 0.06, 0.16);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyPollock(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 340 + strength * 160 + turbo * 80);
  const count = Math.round(56 + strength * 116 + turbo * 90);
  ctx.save();
  ctx.globalAlpha = clamp(0.32 + strength * 0.14, 0.28, 0.46);
  ctx.filter = `blur(${0.25 + strength * 0.7}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.lineCap = "round";
  for (let i = 0; i < count; i += 1) {
    const x0 = seededNoise(i, 3, 4.1) * canvas.width;
    const y0 = seededNoise(i, 4, 4.7) * canvas.height;
    const sx = clamp(Math.round(x0), 0, canvas.width - 1);
    const sy = clamp(Math.round(y0), 0, canvas.height - 1);
    const index = getSampleSourceIndex(sampleSource, sx, sy);
    const r = sampleSource.data[index];
    const g = sampleSource.data[index + 1];
    const b = sampleSource.data[index + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    let target = { r: accent.r, g: accent.g, b: accent.b };
    if (h >= 180 && h <= 260) target = { r: 60, g: 84, b: 168 };
    else if (h >= 35 && h <= 80) target = { r: 245, g: 233, b: 181 };
    else if (l < 0.28) target = { r: dark.r, g: dark.g, b: dark.b };
    else target = { r: soft.r, g: soft.g, b: soft.b };
    ctx.strokeStyle = `rgba(${Math.round(mix(r, target.r, 0.52 + strength * 0.18))}, ${Math.round(mix(g, target.g, 0.52 + strength * 0.18))}, ${Math.round(mix(b, target.b, 0.52 + strength * 0.18))}, ${0.12 + strength * 0.08 + s * 0.07})`;
    ctx.lineWidth = Math.max(0.5, (canvas.width / 1400) * (0.7 + seededNoise(i, 2, 3.1) * 3.2 + strength * 1.5));
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let s = 1; s <= 4; s += 1) {
      const px = seededNoise(i, s + 4, 5.2) * canvas.width;
      const py = seededNoise(i, s + 9, 6.1) * canvas.height;
      const psx = clamp(Math.round(px), 0, canvas.width - 1);
      const psy = clamp(Math.round(py), 0, canvas.height - 1);
      const pIndex = getSampleSourceIndex(sampleSource, psx, psy);
      const luminance = (sampleSource.data[pIndex] + sampleSource.data[pIndex + 1] + sampleSource.data[pIndex + 2]) / (255 * 3);
      const drift = (luminance - 0.5) * canvas.height * 0.03;
      ctx.lineTo(px, py + drift);
    }
    ctx.stroke();
    if (turbo > 0.12 && seededNoise(i, 12, 8.1) > 0.62) {
      ctx.fillStyle = `rgba(${Math.round(mix(r, target.r, 0.54))}, ${Math.round(mix(g, target.g, 0.54))}, ${Math.round(mix(b, target.b, 0.54))}, ${0.08 + turbo * 0.08})`;
      ctx.beginPath();
      ctx.arc(x0, y0, Math.max(0.8, ctx.lineWidth * (0.7 + seededNoise(i, 13, 8.7) * 1.8)), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.16 + strength * 0.1, 0.12, 0.24);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyLichtenstein(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 320 + strength * 180 + turbo * 120);
  const block = Math.max(4, Math.round(22 - strength * 8 - turbo * 8));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(248, 242, 230)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += block) {
    for (let x = 0; x < canvas.width; x += block) {
      const sx = clamp(Math.round(x + block / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + block / 2), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const [h, s, l] = rgbToHsl(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]);
      let color = { r: 255, g: 239, b: 220 };
      if (h >= 180 && h <= 260) color = { r: 34, g: 82, b: 212 };
      else if (h <= 20 || h >= 330) color = { r: 225, g: 54, b: 64 };
      else if (h >= 35 && h <= 75) color = { r: 243, g: 201, b: 31 };
      else if (l < 0.28) color = { r: 22, g: 22, b: 22 };
      const fillR = Math.round(mix(sampleSource.data[index], color.r, 0.52 + strength * 0.16 + turbo * 0.08));
      const fillG = Math.round(mix(sampleSource.data[index + 1], color.g, 0.52 + strength * 0.16 + turbo * 0.08));
      const fillB = Math.round(mix(sampleSource.data[index + 2], color.b, 0.52 + strength * 0.16 + turbo * 0.08));
      ctx.fillStyle = `rgb(${fillR},${fillG},${fillB})`;
      ctx.fillRect(x, y, block, block);
      ctx.fillStyle = `rgba(255,255,255,${0.18 + strength * 0.08})`;
      ctx.beginPath();
      ctx.arc(x + block * 0.5, y + block * 0.5, block * (0.08 + strength * 0.025 + turbo * 0.015), 0, Math.PI * 2);
      ctx.fill();
      if (turbo > 0.12 && s > 0.18) {
        ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.04 + turbo * 0.06})`;
        ctx.beginPath();
        ctx.arc(x + block * 0.24, y + block * 0.24, Math.max(0.7, block * (0.035 + turbo * 0.01)), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.18 + strength * 0.16})`;
  ctx.lineWidth = Math.max(0.7, block * 0.08);
  for (let y = 0; y < canvas.height; y += block) {
    for (let x = 0; x < canvas.width; x += block) {
      ctx.strokeRect(x, y, block, block);
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.05 + turbo * 0.06, 0.03, 0.12);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyHokusai(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(240, 243, 240)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08, 0.08, 0.18);
  ctx.filter = `blur(${0.3 + strength * 0.6}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let y = 0; y < canvas.height; y += 8) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 10) {
      const sx = clamp(x, 0, canvas.width - 1);
      const sy = clamp(y, 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const blueBias = sample[index + 2] / 255;
      const grayBias = (sample[index] + sample[index + 1] + sample[index + 2]) / (255 * 3);
      const offset = Math.sin((x / canvas.width) * Math.PI * (3 + strength * 3)) * (4 + strength * 10) * blueBias;
      const yPos = y + offset - grayBias * (2 + strength * 5);
      if (x === 0) ctx.moveTo(x, yPos);
      else ctx.lineTo(x, yPos);
    }
    const rowSampleIndex = (clamp(y, 0, canvas.height - 1) * canvas.width + Math.floor(canvas.width * 0.5)) * 4;
    const rr = sample[rowSampleIndex];
    const rg = sample[rowSampleIndex + 1];
    const rb = sample[rowSampleIndex + 2];
    ctx.strokeStyle = `rgba(${Math.round(mix(rr, 46, 0.46 + strength * 0.18))}, ${Math.round(mix(rg, 92, 0.42 + strength * 0.18))}, ${Math.round(mix(rb, 178, 0.52 + strength * 0.18))}, ${0.12 + strength * 0.12})`;
    ctx.lineWidth = Math.max(0.8, (canvas.width / 1100) * (1 + strength * 0.6));
    ctx.stroke();
    if (turbo > 0.12 && y % 24 === 0) {
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 16) {
        const crest = Math.sin((x / canvas.width) * Math.PI * (4 + turbo * 2)) * (6 + turbo * 10);
        const foamY = y + crest - 8;
        if (x === 0) ctx.moveTo(x, foamY);
        else ctx.lineTo(x, foamY);
      }
      ctx.strokeStyle = `rgba(245, 248, 252, ${0.04 + turbo * 0.08})`;
      ctx.lineWidth = Math.max(0.5, (canvas.width / 1600) * (0.8 + turbo * 0.6));
      ctx.stroke();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.16 + strength * 0.12, 0.14, 0.28);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.1 + strength * 0.08})`;
  ctx.strokeRect(canvas.width * 0.03, canvas.height * 0.03, canvas.width * 0.94, canvas.height * 0.94);
}

function applyEscher(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const tile = Math.max(12, Math.round(28 - strength * 8 - turbo * 5));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(244, 243, 237)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height + tile; y += tile) {
    for (let x = 0; x < canvas.width + tile; x += tile) {
      const sx = clamp(Math.round(x), 0, canvas.width - 1);
      const sy = clamp(Math.round(y), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const gray = Math.round((sample[index] + sample[index + 1] + sample[index + 2]) / 3);
      const tone = gray > 140 ? 236 : 74;
      const color = gray > 140
        ? { r: Math.round(mix(sample[index], 242, 0.4)), g: Math.round(mix(sample[index + 1], 242, 0.4)), b: Math.round(mix(sample[index + 2], 242, 0.4)) }
        : { r: Math.round(mix(sample[index], 78, 0.46)), g: Math.round(mix(sample[index + 1], 78, 0.46)), b: Math.round(mix(sample[index + 2], 78, 0.46)) };
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.42 + strength * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(x, y - tile * 0.5);
      ctx.lineTo(x + tile * 0.5, y);
      ctx.lineTo(x, y + tile * 0.5);
      ctx.lineTo(x - tile * 0.5, y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.12})`;
      ctx.stroke();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.06, 0.06, 0.14);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyKlimt(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(52 + strength * 98 + turbo * 72);
  const gold = { r: 214, g: 174, b: 58 };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(231, 211, 133)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.24 + strength * 0.14, 0.2, 0.38);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let i = 0; i < count; i += 1) {
    const x = seededNoise(i, 1, 1.1) * canvas.width;
    const y = seededNoise(i, 2, 1.9) * canvas.height;
    const sx = clamp(Math.round(x), 0, canvas.width - 1);
    const sy = clamp(Math.round(y), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const r = sample[index];
    const g = sample[index + 1];
    const b = sample[index + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    const size = canvas.width * (0.004 + seededNoise(i, 3, 2.8) * (0.012 + strength * 0.006));
    const target = h >= 35 && h <= 80
      ? { r: 236, g: 202, b: 84 }
      : h <= 20 || h >= 330
        ? { r: 178, g: 70, b: 82 }
        : l < 0.28
          ? { r: 82, g: 60, b: 28 }
          : gold;
    const fillR = Math.round(mix(r, target.r, 0.58 + strength * 0.18));
    const fillG = Math.round(mix(g, target.g, 0.58 + strength * 0.18));
    const fillB = Math.round(mix(b, target.b, 0.58 + strength * 0.18));
    ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.18 + strength * 0.14 + s * 0.04})`;
    if (seededNoise(i, 4, 3.5) > 0.52) {
      ctx.fillRect(x, y, size, size);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (turbo > 0.08 && seededNoise(i, 5, 4.2) > 0.7) {
      ctx.strokeStyle = `rgba(${Math.round(mix(fillR, 255, 0.12))}, ${Math.round(mix(fillG, 255, 0.1))}, ${Math.round(mix(fillB, 255, 0.08))}, ${0.04 + turbo * 0.05})`;
      ctx.lineWidth = Math.max(0.35, size * 0.18);
      ctx.strokeRect(x - size * 0.3, y - size * 0.3, size * 1.2, size * 1.2);
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.16 + strength * 0.1, 0.12, 0.24);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
  ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9);
}

function applyHilmaAfKlint(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const count = Math.round(12 + strength * 18 + turbo * 10);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(244, 238, 229)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08, 0.06, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let i = 0; i < count; i += 1) {
    const cx = seededNoise(i, 1, 0.7) * canvas.width;
    const cy = seededNoise(i, 2, 1.3) * canvas.height;
    const sx = clamp(Math.round(cx), 0, canvas.width - 1);
    const sy = clamp(Math.round(cy), 0, canvas.height - 1);
    const index = (sy * canvas.width + sx) * 4;
    const base = { r: sample[index], g: sample[index + 1], b: sample[index + 2] };
    const radius = canvas.width * (0.03 + seededNoise(i, 3, 2.1) * (0.08 + strength * 0.04));
    ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + strength * 0.1})`;
    ctx.lineWidth = Math.max(1, (canvas.width / 900) * (1 + strength * 0.5));
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 4; a += 0.2) {
      const rr = (a / (Math.PI * 4)) * radius;
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = `rgba(${Math.round(mix(base.r, mix(accent.r, 255, 0.38), 0.42 + strength * 0.16))}, ${Math.round(mix(base.g, mix(soft.g, 255, 0.22), 0.42 + strength * 0.16))}, ${Math.round(mix(base.b, mix(soft.b, 255, 0.18), 0.42 + strength * 0.16))}, ${0.14 + strength * 0.1})`;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08, 0.08, 0.18);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyKusama(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const spacing = Math.max(6, Math.round(26 - strength * 8 - turbo * 8));
  const dotScale = 0.18 + strength * 0.16 + turbo * 0.08;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(246, soft.r, 0.06))}, ${Math.round(mix(238, soft.g, 0.06))}, ${Math.round(mix(230, soft.b, 0.06))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.22 + strength * 0.14, 0.18, 0.36);
  ctx.filter = `blur(${0.4 + strength * 0.8 + turbo * 0.3}px) saturate(${1.04 + strength * 0.1})`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();

  for (let y = spacing / 2; y < canvas.height; y += spacing) {
    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      const sx = clamp(Math.round(x), 0, canvas.width - 1);
      const sy = clamp(Math.round(y), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const radius = Math.max(
        1.2,
        spacing * (dotScale * (0.55 + s * 0.45) + l * 0.03 + seededNoise(x, y, 1.7) * 0.09),
      );
      let target = { r: accent.r, g: accent.g, b: accent.b };
      if (h >= 180 && h <= 260) target = { r: 54, g: 86, b: 208 };
      else if (h >= 35 && h <= 80) target = { r: 242, g: 196, b: 38 };
      else if (h <= 20 || h >= 330) target = { r: 224, g: 58, b: 76 };
      else if (l < 0.26) target = { r: dark.r, g: dark.g, b: dark.b };
      else if (seededNoise(x, y, 2.4) > 0.68) target = { r: 248, g: 248, b: 248 };

      const fillR = Math.round(mix(r, target.r, 0.48 + strength * 0.18 + turbo * 0.06));
      const fillG = Math.round(mix(g, target.g, 0.48 + strength * 0.18 + turbo * 0.06));
      const fillB = Math.round(mix(b, target.b, 0.48 + strength * 0.18 + turbo * 0.06));
      const jitterX = (seededNoise(x, y, 3.3) - 0.5) * spacing * (0.14 + turbo * 0.04);
      const jitterY = (seededNoise(x, y, 4.1) - 0.5) * spacing * (0.14 + turbo * 0.04);

      ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.24 + strength * 0.16})`;
      ctx.beginPath();
      ctx.arc(x + jitterX, y + jitterY, radius, 0, Math.PI * 2);
      ctx.fill();

      if (turbo > 0.08) {
        ctx.strokeStyle = `rgba(${Math.round(mix(fillR, 255, 0.14))}, ${Math.round(mix(fillG, 255, 0.14))}, ${Math.round(mix(fillB, 255, 0.14))}, ${0.08 + turbo * 0.08})`;
        ctx.lineWidth = Math.max(0.35, radius * 0.16);
        ctx.beginPath();
        ctx.arc(x + jitterX, y + jitterY, radius * (0.56 + turbo * 0.08), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08, 0.06, 0.16);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyGerhardRichter(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(10, Math.round(12 + strength * 10 + turbo * 14));
  const rows = Math.max(14, Math.round(16 + strength * 12 + turbo * 16));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(246, 243, 236)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const sx = clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      let target = { r, g, b };
      if (s < 0.18) {
        target = h >= 180 && h <= 260
          ? { r: 58, g: 108, b: 214 }
          : h >= 35 && h <= 80
            ? { r: 236, g: 198, b: 54 }
            : h <= 20 || h >= 330
              ? { r: 214, g: 72, b: 86 }
              : l < 0.3
                ? { r: dark.r, g: dark.g, b: dark.b }
                : { r: 232, g: 228, b: 220 };
      }
      const mixAmt = 0.42 + strength * 0.2 + turbo * 0.08;
      const fillR = Math.round(mix(r, target.r, mixAmt));
      const fillG = Math.round(mix(g, target.g, mixAmt));
      const fillB = Math.round(mix(b, target.b, mixAmt));
      const inset = Math.max(0.5, Math.min(cellW, cellH) * (0.08 + seededNoise(col, row, 2.7) * 0.08));
      ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.42 + strength * 0.18})`;
      ctx.fillRect(x + inset, y + inset, Math.max(1, cellW - inset * 2), Math.max(1, cellH - inset * 2));
      ctx.strokeStyle = `rgba(${Math.round(mix(fillR, 255, 0.08))}, ${Math.round(mix(fillG, 255, 0.08))}, ${Math.round(mix(fillB, 255, 0.08))}, ${0.08 + strength * 0.08})`;
      ctx.lineWidth = Math.max(0.4, Math.min(cellW, cellH) * 0.08);
      ctx.strokeRect(x + inset, y + inset, Math.max(1, cellW - inset * 2), Math.max(1, cellH - inset * 2));
    }
  }

  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08, 0.08, 0.18);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyMonet(canvas, amount, soft) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(6, Math.round(22 - strength * 7 - turbo * 4));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${Math.round(mix(246, soft.r, 0.08))}, ${Math.round(mix(240, soft.g, 0.08))}, ${Math.round(mix(232, soft.b, 0.08))})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      ctx.save();
      ctx.translate(x + step / 2, y + step / 2);
      ctx.rotate((seededNoise(x, y, 1.7) - 0.5) * 0.8);
      ctx.fillStyle = `rgba(${Math.round(mix(r, 244, 0.08 + strength * 0.08))}, ${Math.round(mix(g, soft.g, 0.12 + strength * 0.12))}, ${Math.round(mix(b, soft.b, 0.12 + strength * 0.12))}, ${0.34 + strength * 0.16})`;
      ctx.fillRect(-step * 0.72, -step * 0.18, step * 1.44, step * 0.36);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.12 + strength * 0.08, 0.1, 0.22);
  ctx.filter = `blur(${0.5 + strength * 1.2 + turbo * 0.3}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function applyPicasso(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(4, Math.round(7 + strength * 4 - turbo * 2));
  const rows = Math.max(4, Math.round(7 + strength * 4 - turbo * 2));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(239,232,220)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.12 + strength * 0.08 - turbo * 0.02, 0.06, 0.2);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const sx = clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      const target = seededNoise(col, row, 2.8) > 0.6 ? { r: accent.r, g: soft.g, b: soft.b } : { r: 224, g: 204, b: 168 };
      ctx.save();
      ctx.translate(x + cellW / 2, y + cellH / 2);
      const rotation = (seededNoise(col, row, 4.1) - 0.5) * (0.4 + strength * 0.28 + turbo * 0.12);
      ctx.rotate(rotation);
      const blend = clamp(0.34 + strength * 0.2 + turbo * 0.06, 0, 0.86);
      ctx.fillStyle = `rgba(${Math.round(mix(r, target.r, blend))}, ${Math.round(mix(g, target.g, blend))}, ${Math.round(mix(b, target.b, blend))}, ${0.34 + strength * 0.16 + turbo * 0.04})`;
      ctx.beginPath();
      ctx.moveTo(-cellW * (0.46 + turbo * 0.03), -cellH * 0.18);
      ctx.lineTo(cellW * 0.14, -cellH * (0.46 + turbo * 0.05));
      ctx.lineTo(cellW * (0.44 + turbo * 0.02), cellH * 0.08);
      ctx.lineTo(-cellW * 0.12, cellH * (0.4 + turbo * 0.04));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.1 + strength * 0.08 + turbo * 0.04})`;
      ctx.lineWidth = Math.max(0.8, Math.min(cellW, cellH) * (0.03 + turbo * 0.008));
      ctx.stroke();
      if (turbo > 0.08) {
        const facets = 1 + Math.min(4, Math.floor(turbo * 2.8));
        for (let i = 0; i < facets; i += 1) {
          ctx.beginPath();
          const ax = -cellW * (0.36 + seededNoise(col, row + i, 6.2) * 0.5);
          const ay = -cellH * (0.32 + seededNoise(col + i, row, 7.3) * 0.46);
          const bx = cellW * (0.14 + seededNoise(col, row + i, 8.4) * 0.36);
          const by = cellH * (-0.18 + seededNoise(col + i, row, 9.1) * 0.62);
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
}

function applyOttoDix(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 360 + strength * 180 + turbo * 100);
  const step = Math.max(2, Math.round(12 - strength * 4 - turbo * 5));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(238,228,214)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.16 + strength * 0.08 + turbo * 0.03, 0.14, 0.3);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.lineCap = "round";
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const gx = getSampleSourceChannel(sampleSource, x + 1, y, 0) - getSampleSourceChannel(sampleSource, x - 1, y, 0);
      const gy = getSampleSourceChannel(sampleSource, x, y + 1, 0) - getSampleSourceChannel(sampleSource, x, y - 1, 0);
      const mag = Math.abs(gx) + Math.abs(gy);
      if (mag < 42 + (1 - strength) * 24 - turbo * 16) continue;
      const angle = Math.atan2(gy, gx) + Math.PI / 2;
      const len = step * (1.3 + seededNoise(x, y, 2.2) * 1.1 + turbo * 0.22);
      ctx.strokeStyle = `rgba(${dark.r}, ${Math.round(mix(dark.g, 78, 0.24))}, ${Math.round(mix(dark.b, 62, 0.2))}, ${0.18 + strength * 0.16 + turbo * 0.05})`;
      ctx.lineWidth = Math.max(0.5, (canvas.width / 1200) * (0.9 + strength * 1.1 + turbo * 0.3));
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(angle) * len * 0.5, y - Math.sin(angle) * len * 0.5);
      ctx.lineTo(x + Math.cos(angle) * len * 0.5, y + Math.sin(angle) * len * 0.5);
      ctx.stroke();
      if (turbo > 0.12 && mag > 72) {
        const crossAngle = angle + (seededNoise(x, y, 12.8) > 0.5 ? 0.42 : -0.42);
        const crossLen = len * (0.42 + turbo * 0.1);
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(crossAngle) * crossLen * 0.5, y - Math.sin(crossAngle) * crossLen * 0.5);
        ctx.lineTo(x + Math.cos(crossAngle) * crossLen * 0.5, y + Math.sin(crossAngle) * crossLen * 0.5);
        ctx.stroke();
      }
    }
  }
}

function applyAndyWarhol(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const cols = 2;
  const rows = 2;
  const panelW = canvas.width / cols;
  const panelH = canvas.height / rows;
  const palettes = [
    [{ r: accent.r, g: accent.g, b: accent.b }, { r: soft.r, g: soft.g, b: soft.b }],
    [{ r: 54, g: 92, b: 214 }, { r: 244, g: 196, b: 46 }],
    [{ r: 230, g: 76, b: 132 }, { r: 92, g: 214, b: 166 }],
    [{ r: 238, g: 150, b: 52 }, { r: 62, g: 78, b: 168 }],
  ];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let pr = 0; pr < rows; pr += 1) {
    for (let pc = 0; pc < cols; pc += 1) {
      const panel = palettes[pr * cols + pc];
      for (let y = 0; y < panelH; y += 6) {
        for (let x = 0; x < panelW; x += 6) {
          const sx = clamp(Math.round((x / panelW) * canvas.width), 0, canvas.width - 1);
          const sy = clamp(Math.round((y / panelH) * canvas.height), 0, canvas.height - 1);
          const index = (sy * canvas.width + sx) * 4;
          const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
          const target = gray < 128 ? panel[0] : panel[1];
          ctx.fillStyle = `rgba(${Math.round(mix(sample[index], target.r, 0.64 + strength * 0.16))}, ${Math.round(mix(sample[index + 1], target.g, 0.64 + strength * 0.16))}, ${Math.round(mix(sample[index + 2], target.b, 0.64 + strength * 0.16))}, ${0.4 + strength * 0.14})`;
          ctx.fillRect(pc * panelW + x, pr * panelH + y, 6, 6);
        }
      }
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.18)`;
      ctx.lineWidth = Math.max(1, canvas.width / 700);
      ctx.strokeRect(pc * panelW, pr * panelH, panelW, panelH);
    }
  }
}

function applyBotticelli(canvas, amount, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const step = Math.max(6, Math.round(18 - strength * 5 - turbo * 3));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(245,239,230)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x + step / 2), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + step / 2), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      ctx.fillStyle = `rgba(${Math.round(mix(r, 238, 0.14 + strength * 0.14))}, ${Math.round(mix(g, soft.g, 0.16 + strength * 0.14))}, ${Math.round(mix(b, 196, 0.12 + strength * 0.12))}, ${0.28 + strength * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(x, y + step * 0.5);
      ctx.quadraticCurveTo(x + step * 0.5, y - step * 0.22, x + step, y + step * 0.5);
      ctx.quadraticCurveTo(x + step * 0.5, y + step * 1.12, x, y + step * 0.5);
      ctx.fill();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.12 + strength * 0.08, 0.1, 0.2);
  ctx.filter = `blur(${0.4 + strength * 0.8}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08})`;
  ctx.strokeRect(canvas.width * 0.04, canvas.height * 0.04, canvas.width * 0.92, canvas.height * 0.92);
}

function applyMunch(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 340 + strength * 180 + turbo * 100);
  const rowStep = Math.max(5, Math.round(10 - turbo * 2));
  const colStep = Math.max(6, Math.round(12 - turbo * 2));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(239,226,214)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.06, 0.05, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let y = 0; y < canvas.height; y += rowStep) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += colStep) {
      const sx = clamp(x, 0, canvas.width - 1);
      const sy = clamp(y, 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const scream = Math.sin((x / canvas.width) * Math.PI * (3 + strength * 2 + turbo * 0.8)) * (6 + strength * 12 + turbo * 8);
      const lift = ((sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / (255 * 3) - 0.5) * canvas.height * 0.04;
      const py = y + scream + lift;
      if (x === 0) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    const rowIndex = getSampleSourceIndex(sampleSource, Math.floor(canvas.width * 0.5), clamp(y, 0, canvas.height - 1));
    const rr = sampleSource.data[rowIndex];
    const rg = sampleSource.data[rowIndex + 1];
    const rb = sampleSource.data[rowIndex + 2];
    ctx.strokeStyle = `rgba(${Math.round(mix(rr, accent.r, 0.36 + strength * 0.18 + turbo * 0.06))}, ${Math.round(mix(rg, soft.g, 0.28 + strength * 0.14 + turbo * 0.05))}, ${Math.round(mix(rb, dark.b, 0.18 + strength * 0.12 + turbo * 0.05))}, ${0.16 + strength * 0.14 + turbo * 0.05})`;
    ctx.lineWidth = Math.max(0.8, (canvas.width / 1200) * (1 + strength * 0.8 + turbo * 0.35));
    ctx.stroke();
    if (turbo > 0.14 && y % (rowStep * 2) === 0) {
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += colStep) {
        const sx = clamp(x, 0, canvas.width - 1);
        const sy = clamp(y + rowStep * 0.6, 0, canvas.height - 1);
        const index = getSampleSourceIndex(sampleSource, sx, sy);
        const wave = Math.sin((x / canvas.width) * Math.PI * (4 + turbo)) * (3 + turbo * 5);
        const lift = ((sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / (255 * 3) - 0.5) * canvas.height * 0.03;
        const py = y + rowStep * 0.6 + wave + lift;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.globalAlpha = 0.82;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

function applyToulouseLautrec(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const cols = Math.max(5, Math.round(8 + strength * 8 + turbo * 18));
  const rows = Math.max(6, Math.round(10 + strength * 10 + turbo * 20));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(244,236,224)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.08 - turbo * 0.03, 0.05, 0.18);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const sx = clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const r = sample[index];
      const g = sample[index + 1];
      const b = sample[index + 2];
      const [h] = rgbToHsl(r, g, b);
      let target = { r: 232, g: 212, b: 176 };
      if (h <= 20 || h >= 330) target = { r: accent.r, g: accent.g, b: accent.b };
      else if (h >= 35 && h <= 80) target = { r: 234, g: 192, b: 82 };
      else if (h >= 180 && h <= 260) target = { r: 86, g: 108, b: 164 };
      const blend = clamp(0.4 + strength * 0.18 + turbo * 0.07, 0, 0.88);
      const fillR = Math.round(mix(r, target.r, blend));
      const fillG = Math.round(mix(g, target.g, blend));
      const fillB = Math.round(mix(b, target.b, blend));
      const inset = cellW * (0.08 - Math.min(0.035, turbo * 0.01));
      const insetY = cellH * (0.08 - Math.min(0.035, turbo * 0.01));
      ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.34 + strength * 0.16 + turbo * 0.04})`;
      ctx.fillRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08 + turbo * 0.04})`;
      ctx.lineWidth = Math.max(0.6, Math.min(cellW, cellH) * (0.03 + turbo * 0.008));
      ctx.strokeRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
      if (turbo > 0.12 && seededNoise(col, row, 5.7) > 0.62) {
        ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, ${0.05 + turbo * 0.04})`;
        ctx.fillRect(
          x + cellW * (0.12 + seededNoise(col, row, 6.1) * 0.22),
          y + cellH * (0.12 + seededNoise(col, row, 7.3) * 0.22),
          cellW * (0.16 + turbo * 0.04),
          cellH * (0.1 + turbo * 0.03)
        );
      }
    }
  }
}

function applySalvadorDali(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const stripHeight = Math.max(2, Math.round(16 - strength * 4 - turbo * 5));
  const phaseOne = smoothstep(0.04, 0.38, amount);
  const phaseTwo = smoothstep(0.34, 1.1, amount);
  const phaseThree = smoothstep(1.05, 2.4, amount);
  const phaseFour = smoothstep(2.2, 3.4, amount);
  const waveA = 6 + phaseOne * 14 + phaseTwo * 18 + phaseThree * 26 + phaseFour * 28;
  const waveB = 3 + phaseOne * 8 + phaseTwo * 10 + phaseThree * 12 + phaseFour * 16;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(236,224,205)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += stripHeight) {
    const progress = y / Math.max(1, canvas.height - 1);
    const melt = Math.sin(progress * Math.PI * (2 + phaseThree * 0.8 + phaseFour * 0.8) + amount * 1.35) * waveA;
    const drift = Math.cos(progress * Math.PI * (4.2 + phaseTwo * 1.6 + phaseFour * 0.9)) * waveB;
    const wobble = Math.sin(progress * Math.PI * (6.2 + phaseThree * 2 + phaseFour * 1.4) + amount * 0.9)
      * (1.2 + phaseTwo * 4 + phaseThree * 7 + phaseFour * 10);
    const offsetX = melt + drift + wobble + (seededNoise(progress, amount, 2.7) - 0.5) * (6 + phaseTwo * 8 + phaseThree * 10 + phaseFour * 16);
    const drawWidth = canvas.width + Math.abs(offsetX) * (0.2 + phaseThree * 0.28 + phaseFour * 0.24);
    ctx.drawImage(
      source,
      0,
      y,
      canvas.width,
      Math.min(stripHeight + 2, canvas.height - y),
      -offsetX * (0.08 + phaseThree * 0.06 + phaseFour * 0.05),
      y + Math.sin(progress * Math.PI * (2.8 + phaseThree * 0.9 + phaseFour * 1.1)) * (phaseOne * 3 + phaseTwo * 5 + phaseThree * 9 + phaseFour * 13),
      drawWidth,
      Math.min(stripHeight + 3 + Math.round(phaseThree * 2 + phaseFour * 3), canvas.height - y)
    );
  }
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = clamp(0.05 + phaseTwo * 0.06 + phaseThree * 0.08 + phaseFour * 0.1, 0.05, 0.34);
  ctx.filter = `blur(${0.6 + phaseTwo * 1.1 + phaseThree * 1.8 + phaseFour * 2.6}px) saturate(${1.04 + phaseTwo * 0.12 + phaseThree * 0.16 + phaseFour * 0.2})`;
  ctx.drawImage(source, canvas.width * (0.004 + phaseThree * 0.012 + phaseFour * 0.018), -canvas.height * (0.004 + phaseTwo * 0.006 + phaseFour * 0.012));
  if (phaseThree > 0.04) {
    ctx.drawImage(source, -canvas.width * (0.004 + phaseThree * 0.01 + phaseFour * 0.016), canvas.height * (0.006 + phaseThree * 0.01 + phaseFour * 0.014));
  }
  if (phaseFour > 0.06) {
    ctx.drawImage(source, canvas.width * 0.018, canvas.height * (0.012 + phaseFour * 0.02));
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = clamp(0.04 + phaseTwo * 0.06 + phaseThree * 0.08 + phaseFour * 0.1, 0.04, 0.32);
  ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.16)`;
  for (let i = 0; i < 3 + Math.round(phaseTwo * 6 + phaseThree * 8 + phaseFour * 12); i += 1) {
    const rx = canvas.width * (0.05 + seededNoise(i, amount, 7.2) * (0.08 + phaseFour * 0.08));
    const ry = canvas.height * (0.02 + seededNoise(i, amount, 8.4) * (0.04 + phaseFour * 0.05));
    const cx = canvas.width * seededNoise(i, amount, 3.1);
    const cy = canvas.height * (0.14 + seededNoise(i, amount, 4.6) * 0.72);
    drawOrganicBlobPath(ctx, cx, cy, rx, ry, 7 + Math.round(phaseFour * 2), i * 2.1 + amount);
    ctx.fill();
  }
  ctx.restore();
  if (phaseThree > 0.06) {
    ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.03 + phaseThree * 0.025 + phaseFour * 0.03})`;
    ctx.lineWidth = Math.max(0.5, canvas.width / 1800);
    for (let x = 0; x < canvas.width; x += Math.max(18, Math.round(canvas.width / 20))) {
      ctx.beginPath();
      ctx.moveTo(x, canvas.height * 0.74);
      ctx.bezierCurveTo(
        x + waveA * (0.42 + phaseFour * 0.5),
        canvas.height * (0.8 + Math.sin(x * 0.01) * 0.04),
        x - waveA * (0.34 + phaseFour * 0.34),
        canvas.height * (0.92 + Math.cos(x * 0.013) * 0.03),
        x + Math.sin(x * 0.02) * (4 + phaseThree * 7 + phaseFour * 10),
        canvas.height
      );
      ctx.stroke();
    }
    for (let i = 0; i < Math.round(2 + phaseThree * 4 + phaseFour * 8); i += 1) {
      const mx = canvas.width * seededNoise(i, turbo, 10.1);
      const my = canvas.height * (0.2 + seededNoise(i, turbo, 10.8) * 0.58);
      const rx = canvas.width * (0.02 + seededNoise(i, turbo, 11.4) * (0.03 + phaseFour * 0.05));
      const ry = canvas.height * (0.01 + seededNoise(i, turbo, 12.2) * (0.018 + phaseFour * 0.03));
      ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.025 + phaseThree * 0.02 + phaseFour * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(mx, my, rx, ry, seededNoise(i, turbo, 13.4) * Math.PI, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(0.06 + phaseOne * 0.05 + phaseTwo * 0.03 + phaseFour * 0.03, 0.06, 0.22);
  ctx.fillStyle = `rgba(${soft.r}, ${soft.g}, ${soft.b}, 0.16)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function applyBauhaus(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 300 + strength * 180 + turbo * 160);
  const cols = Math.max(8, Math.round(10 + strength * 12 + turbo * 30));
  const rows = Math.max(8, Math.round(10 + strength * 12 + turbo * 30));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(245,242,234)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.12 + strength * 0.08 - turbo * 0.03, 0.05, 0.2);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const sx = clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      let target = { r: 236, g: 232, b: 224 };
      if (h >= 180 && h <= 260) target = { r: 46, g: 92, b: 210 };
      else if (h >= 35 && h <= 80) target = { r: 240, g: 196, b: 32 };
      else if (h <= 20 || h >= 330) target = { r: 224, g: 70, b: 54 };
      else if (l < 0.28) target = { r: dark.r, g: dark.g, b: dark.b };
      const blend = clamp(0.42 + strength * 0.2 + turbo * 0.08, 0, 0.94);
      const fillR = Math.round(mix(r, target.r, blend));
      const fillG = Math.round(mix(g, target.g, blend));
      const fillB = Math.round(mix(b, target.b, blend));
      ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${0.34 + strength * 0.16 + turbo * 0.04})`;
      if (seededNoise(col, row, 1.7) > 0.58 - Math.min(0.18, turbo * 0.08)) {
        const inset = cellW * (0.08 - Math.min(0.04, turbo * 0.012));
        const insetY = cellH * (0.08 - Math.min(0.04, turbo * 0.012));
        ctx.fillRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
      }
      else {
        ctx.beginPath();
        ctx.arc(
          x + cellW * (0.5 + (seededNoise(col, row, 9.7) - 0.5) * 0.1),
          y + cellH * (0.5 + (seededNoise(col, row, 10.4) - 0.5) * 0.1),
          Math.min(cellW, cellH) * (0.22 + strength * 0.08 + turbo * 0.03),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (turbo > 0.1 && s > 0.18 && seededNoise(col, row, 13.1) > 0.68) {
        ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + turbo * 0.05})`;
        ctx.lineWidth = Math.max(0.5, Math.min(cellW, cellH) * (0.05 + turbo * 0.01));
        ctx.strokeRect(
          x + cellW * 0.12,
          y + cellH * 0.12,
          cellW * (0.2 + Math.min(0.26, turbo * 0.04)),
          cellH * (0.2 + Math.min(0.26, turbo * 0.04))
        );
      }
    }
  }
}

function applyBrutalism(canvas, amount, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const sample = sourceCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const block = Math.max(2, Math.round(20 - strength * 8 - turbo * 10));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(228,226,221)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08 - turbo * 0.03, 0.03, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let y = 0; y < canvas.height; y += block) {
    for (let x = 0; x < canvas.width; x += block) {
      const sx = clamp(Math.round(x + block * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + block * 0.5), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
      const tone = Math.round(clamp(gray * (0.84 + strength * 0.12 + turbo * 0.05), 18, 236));
      ctx.fillStyle = `rgba(${tone}, ${Math.round(tone * 0.98)}, ${Math.round(tone * 0.94)}, ${0.4 + strength * 0.18 + turbo * 0.04})`;
      const inset = turbo > 0.15 ? block * 0.02 : 0;
      ctx.fillRect(x + inset, y + inset, Math.max(1, block - inset * 2), Math.max(1, block - inset * 2));
      if (turbo > 0.18 && gray < 150 && seededNoise(x, y, 2.7) > 0.54) {
        ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + turbo * 0.05})`;
        ctx.fillRect(
          x + block * (0.08 + seededNoise(x, y, 3.8) * 0.28),
          y + block * (0.08 + seededNoise(x, y, 4.4) * 0.28),
          Math.max(1, block * (0.16 + turbo * 0.05)),
          Math.max(1, block * (0.16 + turbo * 0.05))
        );
      }
    }
  }
  ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.18 + strength * 0.14 + turbo * 0.04})`;
  ctx.lineWidth = Math.max(0.75, block * (0.08 + turbo * 0.01));
  for (let y = 0; y < canvas.height; y += block) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let x = 0; x < canvas.width; x += block) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
}

function applySwissPoster(canvas, amount, accent, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 280 + strength * 220 + turbo * 180);
  const cols = Math.max(6, Math.round(7 + strength * 10 + turbo * 28));
  const rows = Math.max(8, Math.round(10 + strength * 12 + turbo * 34));
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(247,245,239)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.18 + strength * 0.12 - turbo * 0.04, 0.08, 0.3);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cellW;
      const y = row * cellH;
      const sx = clamp(Math.round(x + cellW * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + cellH * 0.5), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const gray = (r + g + b) / 3;
      const lightFill = {
        r: Math.round(mix(r, 246, 0.34 + turbo * 0.08)),
        g: Math.round(mix(g, 246, 0.34 + turbo * 0.08)),
        b: Math.round(mix(b, 246, 0.34 + turbo * 0.08)),
      };
      const inset = cellW * (0.08 - Math.min(0.035, turbo * 0.01));
      const insetY = cellH * (0.08 - Math.min(0.035, turbo * 0.01));
      ctx.fillStyle = gray < 108
        ? `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.34 + strength * 0.2 + turbo * 0.04})`
        : `rgba(${lightFill.r}, ${lightFill.g}, ${lightFill.b}, ${0.28 + strength * 0.14 + turbo * 0.04})`;
      ctx.fillRect(x + inset, y + insetY, cellW - inset * 2, cellH - insetY * 2);
      if (gray > 122 && seededNoise(col, row, 2.3) > 0.72 - strength * 0.14 - turbo * 0.16) {
        ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.18 + strength * 0.14 + turbo * 0.05})`;
        ctx.fillRect(
          x + cellW * (0.12 + seededNoise(col, row, 3.1) * 0.18),
          y + cellH * (0.1 + seededNoise(col, row, 4.2) * 0.18),
          cellW * (0.18 + Math.min(0.26, turbo * 0.05)),
          cellH * (0.12 + Math.min(0.22, turbo * 0.04))
        );
      }
      if (turbo > 0.15 && gray < 138 && seededNoise(col, row, 6.7) > 0.64 - Math.min(0.18, turbo * 0.08)) {
        ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + turbo * 0.05})`;
        ctx.fillRect(
          x + cellW * (0.08 + seededNoise(col, row, 7.9) * 0.38),
          y + cellH * (0.08 + seededNoise(col, row, 8.6) * 0.38),
          Math.max(1, cellW * (0.08 + turbo * 0.03)),
          Math.max(1, cellH * (0.08 + turbo * 0.03))
        );
      }
    }
  }
  if (turbo > 0.1) {
    ctx.save();
    ctx.strokeStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.12 + turbo * 0.04})`;
    ctx.lineWidth = Math.max(0.8, Math.min(cellW, cellH) * (0.04 + turbo * 0.01));
    for (let col = 1; col < cols; col += Math.max(2, Math.round(6 - Math.min(4, turbo)))) {
      const x = col * cellW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function applyKodachrome(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const sat = clamp(s * (1.08 + strength * 0.36 + turbo * 0.16), 0, 1);
    const light = clamp(l * (0.96 + strength * 0.08 + turbo * 0.04), 0, 1);
    const [r, g, b] = hslToRgb(h, sat, light);
    const warmBoost = 0.08 + strength * 0.12 + turbo * 0.05;
    const yellowBoost = 0.06 + strength * 0.1 + turbo * 0.05;
    const coolBoost = 0.08 + strength * 0.12 + turbo * 0.06;
    let rr = Math.round(mix(r, h <= 20 || h >= 330 ? 236 : r, warmBoost));
    let gg = Math.round(mix(g, h >= 35 && h <= 80 ? 204 : g, yellowBoost));
    let bb = Math.round(mix(b, h >= 180 && h <= 260 ? 182 : b, coolBoost));
    if (turbo > 0.08) {
      const density = l < 0.38 ? 1.08 + turbo * 0.08 : 0.98 + turbo * 0.03;
      rr = clamp(rr * density + (h <= 18 || h >= 338 ? turbo * 9 : 0), 0, 255);
      gg = clamp(gg * (1 + turbo * 0.03) + (h >= 42 && h <= 78 ? turbo * 7 : 0), 0, 255);
      bb = clamp(bb * (1 - turbo * 0.02) + (h >= 190 && h <= 250 ? turbo * 10 : -turbo * 4), 0, 255);
    }
    data[i] = rr;
    data[i + 1] = gg;
    data[i + 2] = bb;
  }
  ctx.putImageData(imageData, 0, 0);
  if (turbo > 0.1) {
    const source = cloneCanvas(canvas);
    ctx.save();
    ctx.globalAlpha = clamp(0.04 + turbo * 0.04, 0.04, 0.14);
    ctx.filter = `blur(${0.4 + turbo * 0.8}px) saturate(${1 + turbo * 0.12})`;
    ctx.drawImage(source, 0, 0);
    ctx.restore();
  }
}

function applyDaguerreotype(canvas, amount, dark) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
    const silver = Math.round(mix(gray, 210, 0.14 + strength * 0.14 + turbo * 0.05));
    const shadowWeight = 0.08 + (1 - gray / 255) * (0.12 + turbo * 0.04);
    data[i] = Math.round(mix(silver, dark.r, shadowWeight));
    data[i + 1] = Math.round(mix(silver, dark.g, 0.04 + (1 - gray / 255) * (0.08 + turbo * 0.03)));
    data[i + 2] = Math.round(mix(silver, 182, 0.08 + strength * 0.1 + turbo * 0.04));
    if (turbo > 0.06) {
      const plateLift = turbo * 10;
      data[i] = clamp(data[i] + plateLift * 0.4, 0, 255);
      data[i + 1] = clamp(data[i + 1] + plateLift * 0.35, 0, 255);
      data[i + 2] = clamp(data[i + 2] + plateLift * 0.55, 0, 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const source = cloneCanvas(canvas);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08 + turbo * 0.03, 0.06, 0.22);
  ctx.filter = `blur(${0.4 + strength * 0.8 + turbo * 0.9}px)`;
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  if (turbo > 0.06) {
    const overlay = cloneCanvas(canvas);
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = clamp(0.04 + turbo * 0.05, 0.04, 0.18);
    ctx.filter = `blur(${1 + turbo * 1.2}px)`;
    ctx.drawImage(overlay, 0, 0);
    ctx.restore();
  }
  if (turbo > 0.08) {
    const vignetteAlpha = clamp(0.08 + strength * 0.06 + turbo * 0.04, 0.08, 0.22);
    const gradient = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.48,
      Math.min(canvas.width, canvas.height) * 0.16,
      canvas.width * 0.5,
      canvas.height * 0.5,
      Math.max(canvas.width, canvas.height) * 0.72
    );
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.72, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${vignetteAlpha * 0.4})`);
    gradient.addColorStop(1, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${vignetteAlpha})`);
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  if (turbo > 0.12) {
    const noiseData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = noiseData.data;
    const noiseAmount = 4 + turbo * 6;
    for (let i = 0; i < pixels.length; i += 4) {
      const noise = (Math.random() - 0.5) * noiseAmount;
      pixels[i] = clamp(pixels[i] + noise, 0, 255);
      pixels[i + 1] = clamp(pixels[i + 1] + noise * 0.9, 0, 255);
      pixels[i + 2] = clamp(pixels[i + 2] + noise * 1.1, 0, 255);
    }
    ctx.putImageData(noiseData, 0, 0);
  }
}

function applyRisograph(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 260 + strength * 200 + turbo * 180);
  const block = Math.max(2, Math.round(16 - strength * 5 - turbo * 7));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(249,246,240)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.08 + strength * 0.08 - turbo * 0.02, 0.03, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let y = 0; y < canvas.height; y += block) {
    for (let x = 0; x < canvas.width; x += block) {
      const sx = clamp(Math.round(x + block * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + block * 0.5), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const gray = (sampleSource.data[index] + sampleSource.data[index + 1] + sampleSource.data[index + 2]) / 3;
      const [h, s] = rgbToHsl(sampleSource.data[index], sampleSource.data[index + 1], sampleSource.data[index + 2]);
      const noiseShift = seededNoise(x / Math.max(1, block), y / Math.max(1, block), 5.1);
      if (gray < 170) {
        const radius = block * (0.12 + (1 - gray / 255) * 0.18 + turbo * 0.045);
        ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.14 + strength * 0.12 + turbo * 0.03})`;
        ctx.beginPath();
        ctx.arc(
          x + block * (0.42 + noiseShift * 0.12),
          y + block * (0.42 + seededNoise(x, y, 1.7) * 0.12),
          Math.max(0.6, radius),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (gray < 118) {
        const hueBias = h >= 180 && h <= 300 ? soft : accent;
        const radius = block * (0.08 + (1 - gray / 255) * 0.14 + turbo * 0.035);
        ctx.fillStyle = `rgba(${hueBias.r}, ${hueBias.g}, ${hueBias.b}, ${0.12 + strength * 0.12 + turbo * 0.04})`;
        ctx.beginPath();
        ctx.arc(
          x + block * (0.58 + seededNoise(x, y, 3.7) * 0.1),
          y + block * (0.54 + seededNoise(x, y, 4.4) * 0.1),
          Math.max(0.6, radius),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (gray < 84 || (s > 0.48 && gray < 132 && turbo > 0.2)) {
        const offset = turbo * block * 0.12;
        ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.08 + strength * 0.08 + turbo * 0.04})`;
        ctx.fillRect(
          x + block * 0.22 + offset * seededNoise(x, y, 7.2),
          y + block * 0.22 + offset * seededNoise(x, y, 8.3),
          Math.max(1, block * (0.18 + turbo * 0.04)),
          Math.max(1, block * (0.18 + turbo * 0.04))
        );
      }
      if (turbo > 0.12 && gray < 150 && seededNoise(x, y, 11.4) > 0.52) {
        ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.03 + turbo * 0.035})`;
        ctx.fillRect(
          x + block * 0.06,
          y + block * 0.06,
          Math.max(1, block * (0.16 + turbo * 0.06)),
          Math.max(1, block * (0.06 + turbo * 0.02))
        );
      }
    }
  }
  if (turbo > 0.1) {
    ctx.save();
    ctx.globalAlpha = clamp(0.06 + turbo * 0.04, 0.05, 0.16);
    ctx.translate(block * 0.22, block * 0.12);
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
}

function applyScreenprint(canvas, amount, accent, soft, dark) {
  const ctx = canvas.getContext("2d");
  const source = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  const sampleSource = createSampleSource(source, 300 + strength * 180 + turbo * 140);
  const block = Math.max(2, Math.round(18 - strength * 7 - turbo * 8));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(248,244,236)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = clamp(0.1 + strength * 0.06 - turbo * 0.025, 0.04, 0.16);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
  for (let y = 0; y < canvas.height; y += block) {
    for (let x = 0; x < canvas.width; x += block) {
      const sx = clamp(Math.round(x + block * 0.5), 0, canvas.width - 1);
      const sy = clamp(Math.round(y + block * 0.5), 0, canvas.height - 1);
      const index = getSampleSourceIndex(sampleSource, sx, sy);
      const r = sampleSource.data[index];
      const g = sampleSource.data[index + 1];
      const b = sampleSource.data[index + 2];
      const [h] = rgbToHsl(r, g, b);
      let target = { r: 242, g: 236, b: 228 };
      if (h >= 180 && h <= 260) target = { r: 40, g: 88, b: 210 };
      else if (h >= 35 && h <= 80) target = { r: 242, g: 201, b: 36 };
      else if (h <= 20 || h >= 330) target = { r: 224, g: 72, b: 62 };
      else if ((r + g + b) / 3 < 90) target = { r: dark.r, g: dark.g, b: dark.b };
      const mixAmount = clamp(0.52 + strength * 0.18 + turbo * 0.08, 0, 0.96);
      const fill = {
        r: Math.round(mix(r, target.r, mixAmount)),
        g: Math.round(mix(g, target.g, mixAmount)),
        b: Math.round(mix(b, target.b, mixAmount)),
      };
      ctx.fillStyle = `rgba(${fill.r}, ${fill.g}, ${fill.b}, ${0.36 + strength * 0.16 + turbo * 0.04})`;
      const inset = block * Math.max(0, 0.02 - turbo * 0.005);
      ctx.fillRect(x + inset, y + inset, block - inset * 2, block - inset * 2);
      if (turbo > 0.06) {
        const dotRadius = Math.max(0.5, block * (0.1 + turbo * 0.04) * (0.45 + (255 - (r + g + b) / 3) / 255));
        ctx.fillStyle = `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.06 + turbo * 0.05})`;
        ctx.beginPath();
        ctx.arc(
          x + block * (0.5 + (seededNoise(x, y, 12.3) - 0.5) * 0.24),
          y + block * (0.5 + (seededNoise(x, y, 13.7) - 0.5) * 0.24),
          dotRadius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      if (turbo > 0.26 && ((r + g + b) / 3) < 160) {
        ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.05 + turbo * 0.04})`;
        ctx.lineWidth = Math.max(0.5, block * 0.06);
        ctx.strokeRect(x + block * 0.1, y + block * 0.1, block * 0.8, block * 0.8);
      }
    }
  }
}

function applyRoentgen(canvas, amount, soft, dark) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const source = cloneCanvas(canvas);
  const edgeCanvas = cloneCanvas(canvas);
  const strength = clamp(amount, 0, 1);
  const turbo = Math.max(0, amount - 1);
  applyCannyLikeEdges(edgeCanvas, 0.1 + strength * 0.34 + turbo * 0.06);
  const sourceData = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height);
  const edgeData = edgeCanvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < sourceData.data.length; i += 4) {
    const r = sourceData.data[i];
    const g = sourceData.data[i + 1];
    const b = sourceData.data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const inv = 255 - gray;
    const bone = clamp(inv * (0.52 + strength * 0.2) + Math.max(r, g, b) * (0.08 + turbo * 0.05), 0, 255);
    const edge = edgeData[i] / 255;
    imageData.data[i] = clamp(mix(inv * 0.16, soft.r + bone * 0.08, 0.42 + strength * 0.12) + edge * (16 + turbo * 16), 0, 255);
    imageData.data[i + 1] = clamp(mix(inv * 0.28, soft.g + bone * 0.16, 0.48 + strength * 0.14) + edge * (26 + turbo * 24), 0, 255);
    imageData.data[i + 2] = clamp(mix(inv * 0.48, 224 + bone * 0.11, 0.54 + strength * 0.14) + edge * (34 + turbo * 30), 0, 255);
    imageData.data[i + 3] = sourceData.data[i + 3];
  }
  ctx.putImageData(imageData, 0, 0);
  if (turbo > 0.16) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = clamp(0.05 + turbo * 0.035, 0.05, 0.18);
    ctx.filter = `blur(${0.5 + turbo * 1}px)`;
    ctx.drawImage(edgeCanvas, 0, 0);
    ctx.restore();
  }
  if (strength > 0.1) {
    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.48,
      Math.min(canvas.width, canvas.height) * 0.18,
      canvas.width * 0.5,
      canvas.height * 0.5,
      Math.max(canvas.width, canvas.height) * 0.8
    );
    vignette.addColorStop(0, "rgba(255,255,255,0)");
    vignette.addColorStop(0.82, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.05 + strength * 0.03})`);
    vignette.addColorStop(1, `rgba(${dark.r}, ${dark.g}, ${dark.b}, ${0.14 + strength * 0.05 + turbo * 0.03})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawOrganicBlobPath(ctx, cx, cy, rx, ry, points = 6, seed = 0) {
  ctx.beginPath();
  for (let i = 0; i < points; i += 1) {
    const angle = (i / points) * Math.PI * 2;
    const nextAngle = ((i + 1) / points) * Math.PI * 2;
    const radiusX = rx * (0.72 + seededNoise(seed, i, 0.7) * 0.5);
    const radiusY = ry * (0.72 + seededNoise(seed, i, 1.3) * 0.5);
    const x = cx + Math.cos(angle) * radiusX;
    const y = cy + Math.sin(angle) * radiusY;
    const nextRadiusX = rx * (0.72 + seededNoise(seed, i + 1, 0.7) * 0.5);
    const nextRadiusY = ry * (0.72 + seededNoise(seed, i + 1, 1.3) * 0.5);
    const nx = cx + Math.cos(nextAngle) * nextRadiusX;
    const ny = cy + Math.sin(nextAngle) * nextRadiusY;
    const controlAngle = angle + (nextAngle - angle) * 0.5;
    const c1x = cx + Math.cos(controlAngle) * rx * (0.78 + seededNoise(seed, i, 2.1) * 0.45);
    const c1y = cy + Math.sin(controlAngle) * ry * (0.78 + seededNoise(seed, i, 2.9) * 0.45);
    if (i === 0) {
      ctx.moveTo(x, y);
    }
    ctx.quadraticCurveTo(c1x, c1y, nx, ny);
  }
  ctx.closePath();
}

function drawRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function invertImageData(data) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

function drawLinePattern(ctx, canvas, { spacing, lineWidth, angle, color }) {
  const radians = (angle * Math.PI) / 180;
  const diagonal = Math.hypot(canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (let offset = -diagonal; offset <= diagonal; offset += spacing) {
    ctx.beginPath();
    ctx.moveTo(offset, -diagonal);
    ctx.lineTo(offset, diagonal);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCheckerPattern(ctx, canvas, { size, colorA, colorB }) {
  ctx.save();
  for (let y = 0; y < canvas.height; y += size) {
    for (let x = 0; x < canvas.width; x += size) {
      ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? colorA : colorB;
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

function drawDotPattern(ctx, canvas, { spacing, radius, color }) {
  ctx.save();
  ctx.fillStyle = color;
  for (let y = spacing / 2; y < canvas.height; y += spacing) {
    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawWavePattern(ctx, canvas, { spacing, amplitude, color, lineWidth }) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (let baseY = spacing / 2; baseY < canvas.height + spacing; baseY += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 12) {
      const y = baseY + Math.sin((x / canvas.width) * Math.PI * 4) * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawTestPattern(ctx, canvas, amount) {
  ctx.save();
  const h = canvas.height;
  const bars = ["#f7f7f7", "#f5d84c", "#62e0e5", "#6edb7c", "#ff7aa7", "#ff5d4f", "#4a7dff"];
  const barWidth = canvas.width / bars.length;
  bars.forEach((color, index) => {
    ctx.fillStyle = rgbaFromHex(color, 0.2 + amount * 0.65);
    ctx.fillRect(index * barWidth, 0, barWidth + 1, h * 0.38);
  });
  const blocks = ["#1d1d1d", "#f1f1f1", "#2e53ff", "#101010", "#0f8f65", "#ff3535"];
  const blockWidth = canvas.width / blocks.length;
  blocks.forEach((color, index) => {
    ctx.fillStyle = rgbaFromHex(color, 0.18 + amount * 0.62);
    ctx.fillRect(index * blockWidth, h * 0.7, blockWidth + 1, h * 0.18);
  });
  ctx.restore();
}

function drawDiamondMesh(ctx, canvas, { size, lineWidth, color }) {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  const span = Math.hypot(canvas.width, canvas.height);
  for (let x = -span; x <= span; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, -span);
    ctx.lineTo(x, span);
    ctx.stroke();
  }
  for (let y = -span; y <= span; y += size) {
    ctx.beginPath();
    ctx.moveTo(-span, y);
    ctx.lineTo(span, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTireTracks(ctx, canvas, amount, accent) {
  const progress = clamp(amount / 10, 0, 1);
  const trackCount = Math.max(4, Math.round(6 + progress * 28));
  ctx.save();
  const treadInk = `rgba(18,18,18,${0.18 + progress * 0.34})`;
  for (let band = 0; band < trackCount; band += 1) {
    const tireWidth = 12 + seededNoise(band, 12, 0.21) * 18 + progress * 28;
    const treadStep = 8 + seededNoise(band, 15, 0.31) * 8 + progress * 9;
    const trackGap = tireWidth * (0.56 + seededNoise(band, 18, 0.41) * 0.3);
    const margin = tireWidth * 1.2;
    const centerBase = margin + seededNoise(band, 91, 0.31) * Math.max(margin, canvas.width - margin * 2);
    const verticalShift = (seededNoise(band, 77, 0.18) - 0.5) * canvas.height * 0.32;
    const profileType = Math.floor(seededNoise(band, 66, 0.52) * 4);
    [-trackGap / 2, trackGap / 2].forEach((pairOffset, trackIndex) => {
      const xBase = centerBase + pairOffset;
      for (let y = -treadStep; y <= canvas.height + treadStep; y += treadStep) {
        const sweep = y + verticalShift;
        const sway = (
          Math.sin((sweep + trackIndex * 23 + band * 17) * (0.012 + seededNoise(band, 22, 0.44) * 0.012))
          + Math.cos((sweep + band * 11) * (0.007 + seededNoise(band, 24, 0.62) * 0.008)) * 0.9
        ) * (3 + progress * 15);
        const centerX = xBase + sway;
        const blockW = tireWidth * (0.18 + seededNoise(band, y, 0.17) * 0.08);
        const blockH = treadStep * 0.84;
        ctx.fillStyle = treadInk;
        if (profileType === 0) {
          // Chevron
          for (let lane = -1; lane <= 1; lane += 2) {
            const laneCenter = centerX + lane * tireWidth * 0.22;
            const lean = lane * (trackIndex === 0 ? 1 : -1);
            ctx.save();
            ctx.translate(laneCenter, y + treadStep * 0.48);
            ctx.rotate((lean * 30 * Math.PI) / 180);
            ctx.fillRect(-blockW / 2, -blockH / 2, blockW, blockH);
            ctx.restore();
          }
          ctx.fillRect(centerX - tireWidth * 0.04, y + treadStep * 0.08, tireWidth * 0.08, treadStep * 0.74);
        } else if (profileType === 1) {
          // Block
          for (let lane = -1; lane <= 1; lane += 1) {
            const laneCenter = centerX + lane * tireWidth * 0.16;
            ctx.save();
            ctx.translate(laneCenter, y + treadStep * 0.5);
            ctx.rotate(((lane === 0 ? 0 : lane * 18) * Math.PI) / 180);
            ctx.fillRect(-blockW * 0.42, -blockH / 2, blockW * 0.84, blockH);
            ctx.restore();
          }
        } else if (profileType === 2) {
          // Lamelle
          for (let lane = -2; lane <= 2; lane += 1) {
            const laneCenter = centerX + lane * tireWidth * 0.11;
            ctx.save();
            ctx.translate(laneCenter, y + treadStep * 0.5);
            ctx.rotate(((lane % 2 === 0 ? 12 : -12) * Math.PI) / 180);
            ctx.fillRect(-blockW * 0.18, -blockH / 2, blockW * 0.36, blockH);
            ctx.restore();
          }
        } else {
          // Rallye
          for (let lane = -1; lane <= 1; lane += 2) {
            const laneCenter = centerX + lane * tireWidth * 0.24;
            ctx.save();
            ctx.translate(laneCenter, y + treadStep * 0.5);
            ctx.rotate((lane * 42 * Math.PI) / 180);
            ctx.fillRect(-blockW * 0.62, -blockH * 0.4, blockW * 1.24, blockH * 0.8);
            ctx.restore();
          }
          ctx.fillRect(centerX - tireWidth * 0.06, y + treadStep * 0.14, tireWidth * 0.12, treadStep * 0.64);
        }
        if ((Math.floor(y / treadStep) + trackIndex + band) % 3 === 0) {
          ctx.fillStyle = "rgba(18,18,18,0.04)";
          ctx.fillRect(centerX - tireWidth * 0.46, y + treadStep * 0.28, tireWidth * 0.92, treadStep * 0.14);
          ctx.fillStyle = treadInk;
        }
        if (seededNoise(band, Math.floor(y / treadStep), trackIndex * 0.71) > 0.68) {
          ctx.fillStyle = "rgba(18,18,18,0.03)";
          ctx.fillRect(centerX - tireWidth * 0.5, y + treadStep * 0.04, tireWidth * 0.16, treadStep * 0.2);
          ctx.fillStyle = treadInk;
        }
      }
    });
  }
  ctx.restore();
}

function drawFingerprint(ctx, canvas, amount, dark) {
  const progress = clamp(amount / 10, 0, 1);
  ctx.save();
  const printCount = Math.max(2, Math.round(3 + progress * 18));
  for (let p = 0; p < printCount; p += 1) {
    const ax = 0.16 + seededNoise(p, 14, 0.21) * 0.68;
    const ay = 0.16 + seededNoise(p, 28, 0.49) * 0.68;
    ctx.save();
    ctx.translate(canvas.width * ax, canvas.height * ay);
    ctx.rotate((seededNoise(p, 35, 0.73) - 0.5) * Math.PI * 0.8);
    ctx.strokeStyle = rgbaString(dark, 0.08 + progress * 0.18);
    ctx.lineWidth = 0.7 + progress * 1.25;
    const sizeBias = 0.045 + seededNoise(p, 42, 0.93) * 0.1;
    const maxRadius = Math.min(canvas.width, canvas.height) * (sizeBias + progress * 0.08);
    for (let r = 10; r < maxRadius; r += 4.2) {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 3.6; a += 0.055) {
        const spiral = a * (2.8 + progress * 1.8);
        const wobble = Math.sin(a * 3.2) * (2.8 + progress * 9) + Math.cos(a * 1.8) * (1.4 + progress * 5);
        const x = Math.cos(a) * (r + wobble) + Math.cos(spiral) * (2.8 + progress * 6);
        const y = Math.sin(a) * (r * 0.84 + wobble * 0.5) + Math.sin(spiral) * (2.2 + progress * 5.5);
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawTopoLines(ctx, canvas, amount, soft) {
  ctx.save();
  ctx.strokeStyle = rgbaString(soft, 0.05 + amount * 0.14);
  ctx.lineWidth = 1 + amount * 1.5;
  const spacing = 26 - amount * 10;
  for (let yBase = spacing; yBase < canvas.height + spacing; yBase += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 18) {
      const y = yBase + Math.sin(x * 0.018 + yBase * 0.03) * (6 + amount * 14);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawStaffLines(ctx, canvas, amount, dark) {
  ctx.save();
  ctx.strokeStyle = rgbaString(dark, 0.05 + amount * 0.14);
  ctx.lineWidth = 1 + amount * 1.4;
  const groupGap = 64 + amount * 28;
  for (let start = 30; start < canvas.height; start += groupGap) {
    for (let line = 0; line < 5; line += 1) {
      const y = start + line * (8 + amount * 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBlueprintGrid(ctx, canvas, amount, soft, dark) {
  ctx.save();
  ctx.fillStyle = rgbaString(dark, 0.04 + amount * 0.1);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(14, 42 - amount * 20),
    lineWidth: 1,
    angle: 0,
    color: rgbaString(soft, 0.05 + amount * 0.12),
  });
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(14, 42 - amount * 20),
    lineWidth: 1,
    angle: 90,
    color: rgbaString(soft, 0.05 + amount * 0.12),
  });
  ctx.restore();
}

function drawZebraPattern(ctx, canvas, amount) {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-18 * Math.PI) / 180);
  const spacing = 26 + amount * 28;
  ctx.fillStyle = `rgba(255,255,255,${0.05 + amount * 0.14})`;
  for (let x = -canvas.width; x < canvas.width * 1.5; x += spacing) {
    ctx.fillRect(x, -canvas.height, spacing * 0.55, canvas.height * 2);
  }
  ctx.restore();
}

function drawPerforatedPattern(ctx, canvas, amount, dark) {
  ctx.save();
  ctx.fillStyle = rgbaString(dark, 0.05 + amount * 0.14);
  const spacing = Math.max(10, 28 - amount * 10);
  const radius = Math.max(2.2, 2 + amount * 4);
  for (let y = spacing / 2; y < canvas.height; y += spacing) {
    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function applyBottleGlass(canvas, amount) {
  tintAndNoiseCanvas(canvas, amount, [-22, 18, -12], 10);
}

function applyFrostedGlass(canvas, amount) {
  const blurCanvas = getScratchCanvas(canvas.width, canvas.height);
  const blurCtx = blurCanvas.getContext("2d");
  blurCtx.filter = `blur(${1.5 + amount * 6}px)`;
  blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
  blurCtx.drawImage(canvas, 0, 0);
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.globalAlpha = 0.28 + amount * 0.42;
  ctx.drawImage(blurCanvas, 0, 0);
  ctx.restore();
}

function drawRaindrops(ctx, canvas, amount) {
  ctx.save();
  const density = Math.max(0, amount);
  const progress = clamp(amount, 0, 1);
  const drops = Math.round(28 + density * 180 + Math.max(0, density - 1) * 320);
  for (let i = 0; i < drops; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 1.8 + Math.random() * (3.5 + density * 8);
    const gradient = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
    gradient.addColorStop(0, `rgba(255,255,255,${0.18 + progress * 0.28})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawScratches(ctx, canvas, amount) {
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${0.04 + amount * 0.18})`;
  ctx.lineWidth = 0.6 + amount * 1.4;
  const count = Math.round(10 + amount * 80);
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const len = 14 + Math.random() * (canvas.height * 0.22);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 12, y + len);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlasticWrap(ctx, canvas, amount) {
  ctx.save();
  const count = Math.round(8 + amount * 20);
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * canvas.width;
    const w = 18 + Math.random() * canvas.width * 0.18;
    const gradient = ctx.createLinearGradient(x, 0, x + w, canvas.height);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.45, `rgba(255,255,255,${0.06 + amount * 0.16})`);
    gradient.addColorStop(0.55, `rgba(255,255,255,${0.12 + amount * 0.22})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, w, canvas.height);
  }
  ctx.restore();
}

function applyCardboard(canvas, amount) {
  tintAndNoiseCanvas(canvas, amount, [28, 14, -8], 22);
}

function applyNewsprint(canvas, amount) {
  const source = cloneCanvas(canvas);
  const sample = source.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const ctx = canvas.getContext("2d");
  const progress = clamp(amount / 10, 0, 1);
  const step = Math.max(5, Math.round(5 + progress * 15));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f2ece3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const sx = clamp(Math.round(x), 0, canvas.width - 1);
      const sy = clamp(Math.round(y), 0, canvas.height - 1);
      const index = (sy * canvas.width + sx) * 4;
      const gray = (sample[index] + sample[index + 1] + sample[index + 2]) / 3;
      const radius = (1 - gray / 255) * (0.35 + step * (0.28 + progress * 0.22));
      if (radius < 0.22) continue;
      ctx.fillStyle = `rgba(24,22,20,${0.14 + progress * 0.18})`;
      ctx.beginPath();
      ctx.arc(
        x + (y / step % 2 === 0 ? step * 0.15 : step * 0.48),
        y + step * 0.4,
        radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function applyThermalFax(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  applyGrayscale(data, 1);

  const warmth = 8 + amount * 22;
  const threshold = 198 - amount * 54;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    const localContrast = smoothstep(threshold - 42, threshold + 26, gray);
    const ink = clamp(255 - localContrast * 255, 0, 255);
    const softened = mix(gray, ink, 0.18 + amount * 0.42);
    data[i] = clamp(softened + warmth, 0, 255);
    data[i + 1] = clamp(softened + warmth * 0.96, 0, 255);
    data[i + 2] = clamp(softened + warmth * 0.8, 0, 255);
  }

  applyScanlines(data, canvas.width, canvas.height, 0.06 + amount * 0.22);
  ctx.putImageData(imageData, 0, 0);
  tintAndNoiseCanvas(canvas, amount * 0.55, [10, 8, -2], 8);
}

function drawBrushedMetal(ctx, canvas, amount) {
  ctx.save();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let y = 0; y < canvas.height; y += 1) {
    const streak = (Math.random() - 0.5) * (18 + amount * 48);
    for (let x = 0; x < canvas.width; x += 1) {
      const index = (y * canvas.width + x) * 4;
      data[index] = clamp(data[index] + streak + 12 * amount, 0, 255);
      data[index + 1] = clamp(data[index + 1] + streak + 12 * amount, 0, 255);
      data[index + 2] = clamp(data[index + 2] + streak + 16 * amount, 0, 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  ctx.restore();
}

function drawLinen(ctx, canvas, amount, soft) {
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(10, 22 - amount * 8),
    lineWidth: 1 + amount,
    angle: 0,
    color: rgbaString(soft, 0.04 + amount * 0.08),
  });
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(10, 22 - amount * 8),
    lineWidth: 1 + amount,
    angle: 90,
    color: rgbaString(soft, 0.04 + amount * 0.08),
  });
}

function drawFabricMesh(ctx, canvas, amount, accent, dark) {
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(8, 18 - amount * 7),
    lineWidth: 1 + amount * 1.5,
    angle: 0,
    color: rgbaString(dark, 0.04 + amount * 0.08),
  });
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(8, 18 - amount * 7),
    lineWidth: 1 + amount * 1.5,
    angle: 90,
    color: rgbaString(accent, 0.04 + amount * 0.08),
  });
}

function applyTvNoise(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * (50 + amount * 120);
    data[i] = clamp(data[i] + noise, 0, 255);
    data[i + 1] = clamp(data[i + 1] + noise, 0, 255);
    data[i + 2] = clamp(data[i + 2] + noise, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyCrtDrift(canvas, amount) {
  const ctx = canvas.getContext("2d");
  const copy = getScratchCanvas(canvas.width, canvas.height);
  copy.getContext("2d").drawImage(canvas, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.14 + amount * 0.18;
  ctx.drawImage(copy, -amount * 8, 0);
  ctx.drawImage(copy, amount * 6, 0);
  ctx.restore();
}

function applyJpegArtifacts(canvas, amount) {
  const density = Math.max(0, amount);
  const strength = clamp(amount, 0, 1);
  const block = Math.max(6, Math.round(8 + density * 10));
  applyPixelate(canvas, block);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const corruptionChance = 0.02 + strength * 0.08;
  const macro = Math.max(4, Math.round(10 + density * 8));

  for (let y = 0; y < canvas.height; y += macro) {
    for (let x = 0; x < canvas.width; x += macro) {
      if (seededNoise(x, y, 0.73) > corruptionChance) continue;
      const tintMode = seededNoise(x, y, 1.91);
      for (let by = y; by < Math.min(canvas.height, y + macro); by += 1) {
        for (let bx = x; bx < Math.min(canvas.width, x + macro); bx += 1) {
          const i = (by * canvas.width + bx) * 4;
          if (tintMode > 0.68) {
            data[i] = clamp(data[i] * 0.4, 0, 255);
            data[i + 1] = clamp(data[i + 1] + 70 + strength * 70, 0, 255);
            data[i + 2] = clamp(data[i + 2] * 0.45, 0, 255);
          } else if (tintMode > 0.4) {
            data[i] = clamp(data[i] + 40 + strength * 40, 0, 255);
            data[i + 1] = clamp(data[i + 1] * 0.55, 0, 255);
            data[i + 2] = clamp(data[i + 2] + 18, 0, 255);
          } else {
            const shift = ((bx + by) % 2 === 0 ? 1 : -1) * (12 + strength * 18);
            data[i] = clamp(data[i] + shift, 0, 255);
            data[i + 1] = clamp(data[i + 1] + shift * 0.4, 0, 255);
            data[i + 2] = clamp(data[i + 2] - shift * 0.5, 0, 255);
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyPrintMisregister(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const out = ctx.createImageData(canvas.width, canvas.height);
  const shift = Math.max(1, Math.round(amount * 8));
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const i = (y * canvas.width + x) * 4;
      const r = getPixelChannel(source.data, canvas.width, canvas.height, x - shift, y, 0);
      const g = getPixelChannel(source.data, canvas.width, canvas.height, x, y, 1);
      const b = getPixelChannel(source.data, canvas.width, canvas.height, x + shift, y, 2);
      out.data[i] = r;
      out.data[i + 1] = g;
      out.data[i + 2] = b;
      out.data[i + 3] = source.data[i + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

function applyOverexposure(canvas, amount) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + 28 + amount * 70, 0, 255);
    data[i + 1] = clamp(data[i + 1] + 28 + amount * 70, 0, 255);
    data[i + 2] = clamp(data[i + 2] + 22 + amount * 56, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawLightLeak(ctx, canvas, amount, accent, soft) {
  ctx.save();
  const gradient = ctx.createRadialGradient(
    canvas.width * (0.08 + amount * 0.25),
    canvas.height * 0.18,
    0,
    canvas.width * 0.18,
    canvas.height * 0.2,
    canvas.width * (0.2 + amount * 0.34)
  );
  gradient.addColorStop(0, rgbaString(accent, 0.16 + amount * 0.28));
  gradient.addColorStop(0.6, rgbaString(soft, 0.1 + amount * 0.18));
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawDustAndScratches(ctx, canvas, amount) {
  drawScratches(ctx, canvas, amount * 0.8);
  ctx.save();
  const count = Math.round(80 + amount * 220);
  ctx.fillStyle = `rgba(255,255,255,${0.04 + amount * 0.14})`;
  for (let i = 0; i < count; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * (1.5 + amount * 3.2);
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
}

function drawHaze(ctx, canvas, amount, soft) {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, rgbaString(soft, 0.04 + amount * 0.14));
  gradient.addColorStop(1, rgbaString(soft, 0.14 + amount * 0.22));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawShadowCast(ctx, canvas, amount) {
  ctx.save();
  const gradient = ctx.createLinearGradient(canvas.width * 0.2, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${0.12 + amount * 0.28})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawReflections(ctx, canvas, amount, soft) {
  ctx.save();
  const count = Math.round(2 + amount * 4);
  for (let i = 0; i < count; i += 1) {
    const x = canvas.width * (0.1 + i * 0.18);
    const gradient = ctx.createLinearGradient(x, 0, x + canvas.width * 0.18, canvas.height);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.45, rgbaString(soft, 0.06 + amount * 0.14));
    gradient.addColorStop(0.55, rgbaString(soft, 0.12 + amount * 0.2));
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, canvas.width * 0.2, canvas.height);
  }
  ctx.restore();
}

function drawMoire(ctx, canvas, amount, dark) {
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(6, 16 - amount * 6),
    lineWidth: 1,
    angle: 12,
    color: rgbaString(dark, 0.03 + amount * 0.08),
  });
  drawLinePattern(ctx, canvas, {
    spacing: Math.max(6, 15 - amount * 5),
    lineWidth: 1,
    angle: 15,
    color: rgbaString(dark, 0.02 + amount * 0.06),
  });
}

function applyDoubleExposure(canvas, amount) {
  const ctx = canvas.getContext("2d");
  const copy = getScratchCanvas(canvas.width, canvas.height);
  copy.getContext("2d").drawImage(canvas, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.12 + amount * 0.28;
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(copy, canvas.width * (0.03 + amount * 0.05), -canvas.height * (0.02 + amount * 0.04));
  ctx.restore();
}

function tintAndNoiseCanvas(canvas, amount, rgbShift, noiseScale) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * noiseScale * amount;
    data[i] = clamp(data[i] + rgbShift[0] * amount + noise, 0, 255);
    data[i + 1] = clamp(data[i + 1] + rgbShift[1] * amount + noise, 0, 255);
    data[i + 2] = clamp(data[i + 2] + rgbShift[2] * amount + noise, 0, 255);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyMorphologyToImageData(sourceData, width, height, mode, amount) {
  const baseRadius = mode === "tophat" || mode === "blackhat" ? 1 + amount * 2.2 : 0.6 + amount * 2.2;
  const radius = Math.max(1, Math.round(baseRadius));
  const iterations = amount > 0.72 ? 2 : 1;
  let working = cloneImageData(sourceData);

  const run = (op, input) => {
    if (op === "dilate") return morphologyPass(input, width, height, radius, "max");
    if (op === "erode") return morphologyPass(input, width, height, radius, "min");
    return input;
  };

  if (mode === "dilate" || mode === "erode") {
    for (let i = 0; i < iterations; i += 1) {
      working = run(mode, working);
    }
    return mixImageData(sourceData, working, 0.08 + amount * 0.42);
  }

  if (mode === "open") {
    let temp = working;
    for (let i = 0; i < iterations; i += 1) temp = run("erode", temp);
    for (let i = 0; i < iterations; i += 1) temp = run("dilate", temp);
    return mixImageData(sourceData, temp, 0.1 + amount * 0.38);
  }

  if (mode === "close") {
    let temp = working;
    for (let i = 0; i < iterations; i += 1) temp = run("dilate", temp);
    for (let i = 0; i < iterations; i += 1) temp = run("erode", temp);
    return mixImageData(sourceData, temp, 0.1 + amount * 0.38);
  }

  if (mode === "tophat") {
    let opened = working;
    for (let i = 0; i < iterations; i += 1) opened = run("erode", opened);
    for (let i = 0; i < iterations; i += 1) opened = run("dilate", opened);
    return differenceImageData(sourceData, opened, 0.08 + amount * 0.4);
  }

  if (mode === "blackhat") {
    let closed = working;
    for (let i = 0; i < iterations; i += 1) closed = run("dilate", closed);
    for (let i = 0; i < iterations; i += 1) closed = run("erode", closed);
    return differenceImageData(closed, sourceData, 0.08 + amount * 0.4);
  }

  return working;
}

function morphologyPass(imageData, width, height, radius, mode) {
  const output = new ImageData(width, height);
  const src = imageData.data;
  const dst = output.data;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      let r = mode === "max" ? 0 : 255;
      let g = mode === "max" ? 0 : 255;
      let b = mode === "max" ? 0 : 255;

      for (let ky = -radius; ky <= radius; ky += 1) {
        for (let kx = -radius; kx <= radius; kx += 1) {
          const px = clamp(x + kx, 0, width - 1);
          const py = clamp(y + ky, 0, height - 1);
          const sample = (py * width + px) * 4;
          if (mode === "max") {
            r = Math.max(r, src[sample]);
            g = Math.max(g, src[sample + 1]);
            b = Math.max(b, src[sample + 2]);
          } else {
            r = Math.min(r, src[sample]);
            g = Math.min(g, src[sample + 1]);
            b = Math.min(b, src[sample + 2]);
          }
        }
      }

      dst[index] = r;
      dst[index + 1] = g;
      dst[index + 2] = b;
      dst[index + 3] = src[index + 3];
    }
  }

  return output;
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

function differenceImageData(a, b, amount) {
  const output = new ImageData(a.width, a.height);
  for (let i = 0; i < a.data.length; i += 4) {
    output.data[i] = clamp(mix(a.data[i], clamp(a.data[i] - b.data[i] + 128, 0, 255), amount), 0, 255);
    output.data[i + 1] = clamp(mix(a.data[i + 1], clamp(a.data[i + 1] - b.data[i + 1] + 128, 0, 255), amount), 0, 255);
    output.data[i + 2] = clamp(mix(a.data[i + 2], clamp(a.data[i + 2] - b.data[i + 2] + 128, 0, 255), amount), 0, 255);
    output.data[i + 3] = a.data[i + 3];
  }
  return output;
}

function cloneImageData(imageData) {
  const clone = new ImageData(imageData.width, imageData.height);
  clone.data.set(imageData.data);
  return clone;
}

function cloneCanvas(canvas) {
  const copy = getScratchCanvas(canvas.width, canvas.height);
  copy.getContext("2d", { willReadFrequently: true }).drawImage(canvas, 0, 0);
  return copy;
}

function createSampleSource(canvas, maxDimension = 420) {
  const safeMaxDimension = Math.max(32, Math.round(maxDimension));
  const longestSide = Math.max(canvas.width, canvas.height);
  const scale = longestSide > safeMaxDimension ? safeMaxDimension / longestSide : 1;
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  const sampleCanvas = getScratchCanvas(width, height);
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCtx.clearRect(0, 0, width, height);
  sampleCtx.drawImage(canvas, 0, 0, width, height);
  return {
    data: sampleCtx.getImageData(0, 0, width, height).data,
    width,
    height,
    originWidth: canvas.width,
    originHeight: canvas.height,
  };
}

function getSampleSourceIndex(sampleSource, x, y) {
  const sx = clamp(
    Math.round((clamp(x, 0, sampleSource.originWidth - 1) / Math.max(1, sampleSource.originWidth - 1)) * Math.max(0, sampleSource.width - 1)),
    0,
    sampleSource.width - 1
  );
  const sy = clamp(
    Math.round((clamp(y, 0, sampleSource.originHeight - 1) / Math.max(1, sampleSource.originHeight - 1)) * Math.max(0, sampleSource.height - 1)),
    0,
    sampleSource.height - 1
  );
  return (sy * sampleSource.width + sx) * 4;
}

function getSampleSourceChannel(sampleSource, x, y, channel) {
  return sampleSource.data[getSampleSourceIndex(sampleSource, x, y) + channel];
}

function toGrayscaleArray(data) {
  const gray = new Float32Array(data.length / 4);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

function boxBlurGray(gray, width, height, radius) {
  const output = new Float32Array(gray.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let count = 0;
      for (let ky = -radius; ky <= radius; ky += 1) {
        for (let kx = -radius; kx <= radius; kx += 1) {
          const px = clamp(x + kx, 0, width - 1);
          const py = clamp(y + ky, 0, height - 1);
          sum += gray[py * width + px];
          count += 1;
        }
      }
      output[y * width + x] = sum / count;
    }
  }
  return output;
}

function computeSobelGradient(gray, width, height) {
  const gradient = new Float32Array(gray.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const tl = gray[clamp(y - 1, 0, height - 1) * width + clamp(x - 1, 0, width - 1)];
      const tc = gray[clamp(y - 1, 0, height - 1) * width + x];
      const tr = gray[clamp(y - 1, 0, height - 1) * width + clamp(x + 1, 0, width - 1)];
      const ml = gray[y * width + clamp(x - 1, 0, width - 1)];
      const mr = gray[y * width + clamp(x + 1, 0, width - 1)];
      const bl = gray[clamp(y + 1, 0, height - 1) * width + clamp(x - 1, 0, width - 1)];
      const bc = gray[clamp(y + 1, 0, height - 1) * width + x];
      const br = gray[clamp(y + 1, 0, height - 1) * width + clamp(x + 1, 0, width - 1)];
      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      gradient[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return gradient;
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
  state.sourceImage = null;
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

function mergeProject(base, incoming) {
  const merged = {
    ...base,
    ...incoming,
    meta: { ...base.meta, ...incoming?.meta },
    source: { ...base.source, ...incoming?.source },
    transform: { ...base.transform, ...incoming?.transform },
    corrections: { ...base.corrections, ...incoming?.corrections },
    styles: { ...base.styles, ...incoming?.styles },
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
  let value = dict[key] ?? fallback[key] ?? key;
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

function getPixelChannel(data, width, height, x, y, channel) {
  const px = clamp(Math.round(x), 0, width - 1);
  const py = clamp(Math.round(y), 0, height - 1);
  return data[(py * width + px) * 4 + channel];
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
