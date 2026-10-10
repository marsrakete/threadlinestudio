# Filter-Modularisierung: Bestandsaufnahme und nächste Schritte

## Ziel und aktueller Stand

`app.js` bleibt Orchestrator für Projektzustand, Sliderwerte, Filterreihenfolge und Canvas-Aufrufe. Die wiederverwendbaren RGBA- und Canvas-Renderer liegen unter `packages/threadline-filters/`. Die App initialisiert sie über `factory.js`; die Module selbst bleiben ohne DOM- und App-Globals nutzbar. Browser- und Node-Konsumenten laden dieselben Library-Verträge.

Die Modularisierung soll nach stabilen Effekt-Domänen erfolgen. `applyEffects()` bleibt zunächst App-seitiger Orchestrator: Er kennt Projektzustand, Sliderwerte, Reihenfolge und Canvas. Die Library-Module erhalten stattdessen Bilddaten, Dimensionen, Farben, Renderer-Abhängigkeiten und Zufallsquelle explizit.

## Verbleibende Domänen

| Domäne | Beispiele in `app.js` | Besondere Abhängigkeiten | Zielgrenze |
| --- | --- | --- | --- |
| Pixel-Grundoperationen | Keine offenen Basiseffekte | Zufallsquelle für Korn ist explizit injiziert | Pixelkorrekturen und Korn liegen in der öffentlichen RGBA-Pixel-API; die App übergibt den gemeinsamen Runtime-RNG |
| Canvas-Kern | `applyCanvasBlur`, `convolveCanvas`, `applyPixelate`, `applyGlitch`, `applyHalftone`, `applyContourTracing`, `applyLineBlend`, `applyFocusBlur`, Charcoal, Comic, Ölgemälde, Pop-Art | Canvas 2D, Bildmaße, temporäre Scratch-Canvas | `canvas-effects`, Factory mit Canvas-Erzeuger/Scratch-Provider |
| Morphologie | `applyMorphologyEffects`, `applyMorphologyMix`, `applyMorphologyToImageData`, `applyCannyLikeEdges` | `ImageData`, Nachbarschaftsoperationen, Modi | `canvas-effects/morphology`, reine Pixelkernfunktionen separat exportieren |
| Awareness-Kampagnen | Moustache, Rainbow, Ribbon | Canvas-Geometrie bzw. RGBA-Pixel; Sliderparameter | `campaign-effects`, Abhängigkeiten auf Canvas/Pixeldaten begrenzen |
| Muster, Materialien, Atmosphäre | `applyPatternEffects`, `applyMaterialEffects`, `applyAtmosphereEffects` und `draw*Pattern`/Textur-Renderer | Canvas 2D, Farben, teilweise `Math.random` | eigenständige Rendererfamilien mit Konfiguration und RNG als Parametern |
| Komposition und Schnitt | `applyFragmentEffects`, `applyCutEffects`, Tile-/Patch-/Paper-Effekte | Canvas-Kopien, Sample-Quellen, `seededNoise`, teils Text | `composition-effects`, gemeinsame Sampling- und Geometrie-Abhängigkeiten injizieren |
| Morph-Renderer | `applyMorphEffects`, Swirl/Bulge/Wave/Crumple u.a. | Quellkopien, Pixel-Sampling, Scratch-Canvas, Seed-Noise | `morph-effects`, Kerntransformationen von Canvas-Orchestrierung trennen |
| Textkunst | `applyWordArtEffects`, ASCII-/Typografie-Renderer | `fillText`, Schriftmetriken, Canvas, Farben und Seeds | `text-effects`, Canvas-Kontext und optional Font-/Text-Messadapter explizit übergeben |
| Künstlerlooks | `applyArtistEffects`, etwa Van Gogh, Macke, Klee, Delaunay, Klimt, Kusama | Canvas, Farbschema, Sampling, Seeds; teils Texturen | `artist-effects`, gemeinsames Renderer-Interface; einzelne Looks als registrierbare Funktionen |
| Grafikstile | `applyGraphicStyleEffects`, Bauhaus, Brutalism, Swiss Poster, Risograph u.a. | Canvas, Palette, Sampling und gemeinsame Formen | `graphic-effects`, gemeinsame primitives/Paletten als injizierte Abhängigkeiten |
| App-Komposition | `applyEffects`, `render`, Scratch-Canvas-Verwaltung | `state`, DOM, Layout, Renderreihenfolge | bleibt im App-Einstieg; keine Projektzustands- oder DOM-Imports in die Library |

Die Namen gruppieren fachlich verwandte Effekte, nicht jeweils eine eigene Datei pro Filter. Viele Renderer sind eng gekoppelt und gehören als Familie zusammen.

## Empfohlene Reihenfolge

1. **Canvas-Core und Abhängigkeitsadapter (Basis umgesetzt):** `canvas-runtime.js` kapselt injizierte Canvas-Erzeugung, Scratch-Canvas-Pool, Klonen, Freigabe und eine injizierte Zufallsquelle. `canvas-sampling.js` kapselt Downsampling und Koordinaten-/Channelzugriff; `canvas-geometry.js` bündelt wiederverwendbare Zeichenpfade. `applyBasicAdjustments` und `applyGrain` liegen in der öffentlichen RGBA-Pixel-API und werden von der App aufgerufen; Korrekturen werden zusätzlich vom Art-Renderer geteilt. App-, Node- und Browser-Vertragstests sind ergänzt. `ImageData`-/Dimensionshilfen und weitere App-Adapter bleiben separat zu extrahieren.
2. **Canvas-Grundeffekte und Morphologie (implementiert):** `canvas-effects.js` kapselt Blur, Convolution, Pixelate, Glitch, Halftone, Konturzeichnung, Line Blend, Fokusunschärfe, Canny-Kanten, Charcoal, Comic, Ölgemälde, Pop-Art und den Morphologie-Canvas-Adapter. Der reine Morphologie/ImageData-Kern liegt separat in `morphology-effects.js`. Die Factory erzeugt und verbindet diese APIs; `applyEffects()` und Slider-Orchestrierung bleiben App-seitig. Der Canvas-Runtime-Pool setzt bei jeder Wiederverwendung den Kontext und Pixelinhalt zurück, damit Renderdurchläufe nicht voneinander abhängen.
3. **Kampagnen und Atmosphäre (implementiert und per Pixelbaseline gegengeprüft):** Awareness-Overlay-Renderer liegen in `campaign-effects.js`; Atmosphärenrenderer liegen in `atmosphere-effects.js`. Contract-Tests decken beide Module ab. Die Pixelbaseline ist nach dem Scratch-Canvas-Reset erneut für alle 19 Szenarien erfolgreich. Für nichtdeterministische Effekte wird der RNG injiziert; der App-Provider erhält weiterhin Produktionszufall.
4. **Muster, Materialien und Grafikstile (implementiert):** `canvas-primitives.js` kapselt wiederverwendbare Linien-, Schachbrett-, Punkt- und Wellenrenderer. `pattern-effects.js`, `material-effects.js` und `graphic-effects.js` halten die jeweiligen Rendererfamilien samt Slider-Orchestrierung in eigenen Modulen. RNG, Pixel-/Farboperationen, Sampling, Kantenfilter und Canvas-Helfer werden intern verdrahtet. Contract-Tests decken jede Familie ab; die Pixelbaseline schützt ihre repräsentativen Kombinationen.
5. **Komposition, Schnitt und Morphs (implementiert):** `composition-effects.js` enthält Fragment- und Schnitt-Orchestrierung sowie Tile-Swap, Streifenversatz, Scherben, Patchwork, Lochkarte, Perforation, Stanzform und Papierschnitt. `morph-effects.js` enthält acht Bildtransformationen, den bilinearen Warp-Kern und Pixel-Sampling. Die Factory verdrahtet Sampling, Canvas-Kopien, Seed-Rauschen, Farb- und Formpfade; Contract-Tests und Pixelbaseline decken die Familien ab.
6. **Textkunst, Künstlerlooks und Illustrationsfilter (implementiert):** `text-effects.js` kapselt zwölf typografische Renderer; `artist-effects.js` bündelt 34 künstler-inspirierte Renderer; `art-effects.js` enthält 20 illustrative, ASCII-, Collage-, Mosaik- und Druckfilter. Die Factory verdrahtet Canvas-, Sampling-, Scratch-, Pfad-, Pixel-, Farb- und Rauschhelfer. Contract-Tests, Browser-Starttest und Pixelbaseline decken die Familien ab; das Art-Szenario wird zusätzlich zweimal pro Baseline-Lauf gerendert und verglichen.
7. **Library-Nutzbarkeit (implementiert; Verteilung über dieses Repository):** `effects.js` bündelt Pixel- und Renderer-APIs für CommonJS und klassisches Browser-Script. `metadata-runtime.js` stellt DOM-freies Flattening von Filtermanifesten bereit. Die 15 UI-Gruppen werden aus versionierten Manifesten mit stabilen IDs, Übersetzungsschlüsseln, Performance-Stufen, Wertebereichen und `stateKey`s aufgebaut; deutsche, englische und französische Texte liegen separat unter `locales/`. Contract-Tests sichern Library-APIs, Metadaten, Einstellungs-Kompatibilität und Performance-Markierungen ab. Browser-Smoke-Tests prüfen App-Start, Feldset-Aufteilung und Sprachwechsel. Die Library wird ausschließlich aus diesem GitHub-Repository verwendet; externe Registry-, npm-Tarball- und Scope-Prüfungen gehören nicht zum Release-Prozess.

## TODO: Projektübergreifende Komplettnutzung

Die gemeinsame Factory ist implementiert und wird von Threadline Studio selbst genutzt. Externe Projekte können die Library aus einem Checkout über die Factory, einzelne Module und versionierte Metadaten verwenden. Die Library bleibt ausschließlich im GitHub-Repository; eine Veröffentlichung in einer Paket-Registry ist nicht vorgesehen.

- [x] **Host-Abhängigkeiten inventarisieren:** Die folgende Matrix hält die Factory-Eingaben aus `app.js` und die Modul-Validierungen fest. "Erforderlich" bedeutet: Die Factory lehnt fehlende Funktionen aktuell ab, auch wenn einzelne Aufrufe sie nicht verwenden; Canvas-2D-Operationen werden zusätzlich zur Laufzeit vorausgesetzt. Die Einträge sind Host-/Modulverträge, keine neuen Defaults.

### Inventar der Host-Abhängigkeiten

| Modul/Familie | Erforderliche Host-Abhängigkeiten | Bibliotheks-/Querabhängigkeiten und Hinweise |
| --- | --- | --- |
| Pixeloperationen (`index.js`) | Keine; Eingaben sind RGBA-`Uint8ClampedArray`, Maße, Zahlen/Farben | Reine Pixelverarbeitung ohne DOM oder App-Globals. |
| Canvas Runtime (`canvas-runtime.js`) | `createCanvas()`, `random()` | Erzeugte Canvas-Objekte brauchen bei den genutzten Methoden 2D-Kontext, `drawImage`, `getImageData`/`putImageData`; RNG liefert `[0, 1)`. |
| Morphologie (`morphology-effects.js`) | `createImageData(width, height)`, `clamp(value,min,max)`, `mix(original,target,amount)` | Browser-`ImageData` ist nicht zwingend, wenn Host einen kompatiblen ImageData-Container liefert. |
| Canvas Core (`canvas-effects.js`) | `runtime`, `clamp`, `mix`, `smoothstep`, `morphology` | Erwartet passende Runtime- und Morphologie-Instanzen; verwendet 2D-Canvas-APIs und Pixelzugriff. |
| Kampagnen (`campaign-effects.js`) | `clamp`, `mix` | Renderer erhalten Canvas-/Pixelparameter beim Aufruf; Canvas 2D wird von den Canvas-Overlays vorausgesetzt. |
| Atmosphäre (`atmosphere-effects.js`) | Intern: `clamp`, Scratch-Canvas, Pixelation, Linien-/Kratz-Primitive, `rgbaString`, Pixelzugriff, `seededNoise`, Runtime-RNG | Factory verdrahtet die Abhängigkeiten intern; Host muss `canvas.createCanvas()` bereitstellen. Canvas-2D und ImageData sind Laufzeitvoraussetzungen. |
| Canvas Primitives (`canvas-primitives.js`) | Keine Factory; Zeichenfunktionen erhalten Canvas-Kontext, Canvas und Optionen; Kratzer erhalten zusätzlich RNG | Host muss standardkonforme 2D-Zeichenoperationen bereitstellen. Wird von Pattern, Material und Atmosphäre genutzt. |
| Muster (`pattern-effects.js`) | `clamp`, `seededNoise(x,y,seed)`, `rgbaString(color,alpha)`, `rgbaFromHex(hex,alpha)`, `parseHexColor(hex)`, `primitives` | `primitives` kann `canvas-primitives.js` sein. Zeichenfläche und 2D-Kontext kommen vom Aufrufer. |
| Materialien (`material-effects.js`) | Intern: Pixeloperationen, Runtime, Primitives, Patterns und Canvas Core | Factory verdrahtet alle Renderer-Abhängigkeiten intern; Host muss `canvas.createCanvas()` bereitstellen. |
| Grafikstile (`graphic-effects.js`) | Intern: Numerik, RGB/HSL, Sampling, Canvas Core und Zufall | Factory verdrahtet die Abhängigkeiten intern; Host muss `canvas.createCanvas()` bereitstellen. |
| Komposition (`composition-effects.js`) | Intern: Numerik, Sampling und Pfadgeometrie | Factory verdrahtet die Abhängigkeiten intern; Host muss `canvas.createCanvas()` bereitstellen. |
| Morphs (`morph-effects.js`) | `clamp`, `seededNoise(x,y,seed)`, `cloneCanvas(canvas)`, `createSampleSource(canvas)`, `getSampleSourceIndex(source,x,y)`, `curveThousand(value,curve,scale)`, `parseHexColor(hex)` | Sampling-/Canvas-Adapter; Pixelzugriff und Canvas 2D erforderlich. |
| Textkunst (`text-effects.js`) | `clamp`, `mix`, `seededNoise(x,y,seed)`, `cloneCanvas(canvas)`, Sampling-Helfer, `getPixelIndex(x,y,width)`, `getRgbSaturation(r,g,b)`, `getScratchCanvas(width,height)`, `applyCannyLikeEdges(canvas,amount)`, Geometrie aus `canvas-geometry.js`, `rgbaString(color,alpha)`, `curveThousand(value,curve,scale)`, `parseHexColor(hex)` | Canvas-Textmetriken und `fillText`/2D-Kontext sind Laufzeitvoraussetzungen; Sampling und Pfadgeometrie sind library-intern. |
| Künstlerlooks (`artist-effects.js`) | `clamp`, `mix`, `seededNoise(x,y,seed)`, `smoothstep`, `cloneCanvas(canvas)`, Sampling-Helfer, `getPixelChannel(data,width,height,x,y,channel)`, `getScratchCanvas(width,height)`, `rgbToHsl(r,g,b)`, `hslToRgb(h,s,l)`, Geometrie aus `canvas-geometry.js`, `curveThousand(value,curve,scale)`, `parseHexColor(hex)` | Canvas- und Farbadapter; Sampling und Pfadgeometrie sind library-intern. |
| Illustrations-/Art-Effekte (`art-effects.js`) | `clamp`, `mix`, `seededNoise(x,y,seed)`, `smoothstep`, `rgbaString(color,alpha)`, `cloneCanvas(canvas)`, Sampling-Helfer, `getScratchCanvas(width,height)`, Geometrie aus `canvas-geometry.js`, `applyCannyLikeEdges(canvas,amount)`, `convolveCanvas(canvas,kernel)`, `applyBasicAdjustments(data,corrections,hueShift)`, Pixel-API, `curveThousand(value,curve,scale)`, `parseHexColor(hex)` | Pixelkorrekturen kommen aus der öffentlichen RGBA-Pixel-API; `convolveCanvas` bleibt eine Canvas-Effektabhängigkeit. |

**Querschnittsbefund:** Die Renderer-Module verwenden keine direkten `document`, `window`, `state`- oder `els`-Zugriffe. Die Factory verdrahtet Pixel-, Runtime-, Sampling-, Geometrie-, Primitives-, Canvas-, Atmosphären-, Material-, Grafik-, Kompositions-, Morph-, Text-, Künstlerlook- und Art-Abhängigkeiten intern. `canvas.createCanvas` ist der wesentliche Host-Einstieg für aktivierte Canvas-Familien; optionale Adapter können host-spezifisches Verhalten überschreiben.
- [x] **Gemeinsames Host-Konfigurationsschema entwerfen und implementieren:** `factory.js` validiert `schemaVersion`, Fähigkeiten und optionale Adapter. Factory-Vertragstests sichern Normalfälle, ungültige Eingaben und Capability-Abhängigkeiten.

### Vorschlag: versionierter Host-Vertrag

Die gemeinsame Factory soll eine Konfiguration mit `schemaVersion: 1` entgegennehmen. Der Host wählt Fähigkeiten explizit; fehlende optionale Fähigkeiten bedeuten, dass die betreffende Effektfamilie nicht erzeugt wird. Das verhindert, dass ein Projekt alle Abhängigkeiten der gesamten Library implementieren muss, nur um einzelne Filter zu verwenden.

```js
const threadline = createThreadlineFilters({
  schemaVersion: 1,
  canvas: {
    createCanvas: function createCanvas() {
      return document.createElement("canvas");
    },
  },
  random: Math.random,
  capabilities: {
    pixel: true,
    campaigns: true,
    canvas: true,
    patterns: true,
  },
  adapters: {
    // Nur Adapter für aktivierte Fähigkeiten ergänzen.
  },
});
```

#### Verbindliche Schema-Regeln

- `schemaVersion` ist erforderlich und wird bei unbekannten Versionen mit einer verständlichen `RangeError` abgelehnt.
- `capabilities` ist eine explizite Auswahl. Aktivierte Fähigkeiten ohne notwendige Provider/Adapter führen bei der Factory-Erzeugung zu einem Fehler, der Fähigkeit und fehlende Namen nennt.
- Pixeloperationen brauchen keine Host-Abhängigkeiten und sind standardmäßig verfügbar. Alle übrigen Familien sind opt-in; die Factory darf sie nicht implizit durch globale Browser- oder App-Objekte aktivieren.
- `canvas.createCanvas()` ist nur für aktivierte Canvas-Familien erforderlich. Es muss ein Canvas-artiges Objekt mit einem nutzbaren 2D-Kontext erzeugen; `document.createElement` selbst ist kein Library-Default.
- `random()` ist optional. Ohne Host-RNG wird ein internes `Math.random` verwendet; deterministische Hosts und Tests können einen Provider injizieren. Der Provider muss eine endliche Zahl im Intervall `[0, 1)` liefern. Der Default darf nicht als kryptografisch sicher verstanden werden.
- Reine, stabile Numerik- und Farbhelfer (`clamp`, `mix`, `smoothstep`, `seededNoise`, `curveThousand`, Hex-Farbparser und RGB/HSL-Konvertierung) sollen von der Library bereitgestellt werden, nicht für jeden Host wiederholt werden.
- Library-interne Querabhängigkeiten werden innerhalb der Factory verdrahtet: Pixeloperationen, Runtime, Canvas-Primitives, Morphologie und wiederverwendbare Effektfamilien sollen nicht vom Verbraucher dupliziert oder manuell zwischen Modulen verbunden werden.
- `adapters` enthält nur Fähigkeiten, die nicht sinnvoll neutral in der Library implementiert werden können. Adapter werden pro Fähigkeit definiert, mit klaren Signaturen dokumentiert und nur validiert, wenn die betreffende Fähigkeit aktiviert ist.
- Erste Adapterblöcke: `sampling` (`createSampleSource`, Index-/Channel-Zugriff), `geometry` (rounded/die-cut/organic paths), `canvasEffects` (Canny/convolution/pixelate/basic adjustments), `text` (Font-/Textmessung nur falls tatsächlich außerhalb Canvas 2D benötigt) und optional `imageData` (kompatible ImageData-Erzeugung).
- Farben und Projektpalette sind Effekt-Aufrufdaten, nicht globale Host-Konfiguration: Renderer erhalten beim Aufruf ihre Farben/Einstellungen, damit Projekte eigene Paletten verwenden können.
- Keine DOM-, Fenster-, State-, Storage- oder UI-Abhängigkeiten in der Factory-Konfiguration. Der Aufrufer übergibt Canvas/Bild, Werte und Palette explizit an die Renderer.
- Die Factory gibt ein eingefrorenes Objekt mit `filters` und nur den durch `capabilities` aktivierten Effektfamilien zurück. Fehlt eine Fähigkeit, ist ihr Eintrag klar als nicht verfügbar repräsentiert; keine stillen No-op-Renderer.

#### Fähigkeiten und Adapter-Zuordnung

| Fähigkeit | Factory-interne Bereitstellung | Externe Adapter, falls aktiviert |
| --- | --- | --- |
| `pixel` | `index.js`; kein Adapter | Keine |
| `campaigns` | `campaign-effects.js`, Numerik | Keine; Canvas-Overlays nutzen Canvas-2D zur Laufzeit |
| `canvas` | Runtime, Morphologie, Canvas Core | `canvas.createCanvas`; optional `imageData.createImageData`, falls Host nicht kompatibles Standard-ImageData bereitstellt |
| `atmosphere` | Numerik, Runtime, Sampling, Canvas Core und Primitives | Nur `canvas.createCanvas`; Querabhängigkeiten werden intern verdrahtet |
| `patterns` | Numerik, Farbparser, Canvas-Primitives | Keine |
| `materials` | Pixeloperationen, Runtime, Primitives, Patterns und Canvas Core | Nur `canvas.createCanvas`; Querabhängigkeiten werden intern verdrahtet |
| `graphics` | Numerik, Farboperationen, Sampling und Canvas Core | Nur `canvas.createCanvas`; RGB/HSL und Kantenfilter werden intern bereitgestellt |
| `composition` | Numerik, Sampling und Geometrie | Nur `canvas.createCanvas`; Sampling und Pfade werden intern bereitgestellt |
| `morphs` | Numerik, Sampling und Canvas Runtime | Nur `canvas.createCanvas`; Sampling wird intern bereitgestellt |
| `text` | Numerik, Sampling, Scratch-Canvas, Canvas Core und Geometrie | Nur `canvas.createCanvas`; Kantenfilter und Pfade werden intern bereitgestellt |
| `artists` | Numerik, Farboperationen, Sampling, Scratch-Canvas und Geometrie | Nur `canvas.createCanvas`; Sampling und Pfade werden intern bereitgestellt |
| `art` | Pixeloperationen, Numerik, Sampling, Scratch-Canvas, Canvas Core und Geometrie | Nur `canvas.createCanvas`; Pixel- und Canvas-Querabhängigkeiten werden intern bereitgestellt |

**Kompatibilitätsentscheidung:** v1 aktiviert Pixel standardmäßig; andere Fähigkeiten werden nur angelegt, wenn explizit angefordert. Unbekannte Capability-Namen werden abgelehnt statt ignoriert. Optionale Adapterobjekte dürfen erweitert werden, aber Signaturänderungen an bestehenden Adaptern erfordern eine neue `schemaVersion`. Diese Regeln sind implementiert und durch Contract-Tests abgesichert.
- [x] **Zentrale Factory implementieren:** `factory.js` exportiert `createThreadlineFilters(host)`, prüft Schema-Version und Fähigkeiten und verdrahtet alle Rendererfamilien intern. Familienadapter sind optionale Overrides; für Canvas-Familien genügt `canvas.createCanvas`.
- [x] **Factory-Abhängigkeiten vereinheitlichen:** Runtime, Sampling, Pfadgeometrie, Canvas Core, Atmosphäre, Materialien, Grafikstile, Komposition, Morphs, Text, Künstlerlooks und Art werden library-intern verbunden.
- [x] **Aufrufkonvention dokumentieren:** Die Factory liefert immer `.filters` und eine eingefrorene `.capabilities`-Map; deaktivierte Familien haben keinen Renderer-Eintrag. Die README dokumentiert die bestehenden Aufrufmuster (mutierender RGBA-Puffer versus Canvas-Renderer mit Domänenwerten/Palette) und hält fest, dass UI-State, Filterreihenfolge, Metadaten und Übersetzungen beim Host bleiben. Eine universelle `apply(image, filterId, values)`-Funktion wird bewusst nicht vorgetäuscht, solange die Familien unterschiedliche Bildverträge und Nebenwirkungen haben.
- [x] **Externe Konsumenten-Fixture ausbauen:** `tests/fixtures/repository-consumer/` enthält ein eigenständiges Node-Beispiel und eine Browser-Demo mit eigener Capability-/Filterkonfiguration. Beide laden die Library über einen expliziten Checkout-Pfad statt über Projektimports. Contract-Tests führen Node aus einem fremden Arbeitsverzeichnis aus und prüfen die Browser-Demo über HTTP samt Canvas-Ausgabe und `pageerror`-Sammlung.
- [x] **Verträge und Browserverhalten absichern:** Factory-Normalfälle und Fehlerfälle sind vertraglich getestet. Browser-Smoke-Tests prüfen den separaten Repository-Consumer und den Start der echten App inklusive `pageerror`; visuelle Effektgruppen sind durch die 19-Szenarien-Pixelbaseline geschützt.
- [ ] **GitHub-Verbrauch dokumentieren:** Stabilen Importpfad und empfohlenen Pinning-Ansatz (Release-Tag oder Commit) samt Upgrade-Hinweisen dokumentieren. Sicherstellen, dass `files`/`exports` nur als lokale Paketmetadaten dienen und keine Registry-Veröffentlichung voraussetzen.
- [x] **Technische Abschlussprüfung:** Vollständige Tests (109/109), App- und Consumer-Browser-Smoke sowie die 19-Szenarien-Pixelbaseline bestehen. Scratch-Canvas-Wiederverwendung ist gegen Kontext-/Pixel-Leaks abgesichert.
- [ ] **Git-Abschluss:** Diff und Arbeitsbaum prüfen, anschließend den Nutzerentscheid zu Commit/Branch-Status umsetzen.

## Qualitäts- und Abschlusskriterien je Extraktion

- Alte Berechnung aus `app.js` entfernen; App-Adapter enthalten höchstens die Delegation.
- Keine Abhängigkeit auf `state`, `els`, `document` oder implizite globale Zufallsquellen im Library-Code.
- Öffentliche Funktionen dokumentieren Zweck, Parameter und Rückgabewert; keine Ternarys.
- Vertragstest mit Normalfall, Randfall und ungültigen Eingaben, wo sinnvoll.
- Die 19-Szenarien-Renderbaseline schützt die aktuelle Referenz; wenn ein nachgewiesener Fehler behoben wird, dürfen die erwarteten Pixel nach reproduzierbarer Prüfung gezielt aktualisiert werden.
- Browser-Smoke-Test lädt die App und sammelt `pageerror`; Canvas-/Text-/Layoutverhalten wird im Browser geprüft, nicht nur in Node.
- Service-Worker-Assets, App-/Cacheversion und Dokumentation werden bei geänderten Dateien synchron gehalten.

## Bekannte Grenzen der aktuellen Baseline

Die Baseline schützt repräsentative Kombinationen der Pipeline und ist nicht einzeln vollständig für alle Slider. Canvas-Text und Rasterung sind Browser-/Plattform-abhängig. Seed-Noise ist reproduzierbar; Aufrufe mit `Math.random` benötigen für neue Einzelfalltests einen injizierten Test-RNG, ohne das Live-Verhalten zu ändern. Der Canvas-Runtime-Pool setzt Kontextzustand und Pixel beim Wiederverwenden zurück; die Art-Referenz prüft zusätzlich identische Pixel bei einer direkt wiederholten Renderung.

Dieses Dokument ist eine Bestandsaufnahme und ein Vorschlag für die Reihenfolge. Es ändert keine Filterimplementierung oder sichtbares Verhalten.

## Vertriebsentscheidung

Die Filterlibrary bleibt ausschließlich Bestandteil dieses GitHub-Repositories. `packages/threadline-filters/package.json` ist deshalb als privat markiert; npm-Registry, npm-Tarball-Installation, Scope-Verfügbarkeit und npm-Zugangsdaten sind keine Veröffentlichungsziele oder offenen Release-Gates. Konsumenten klonen das Repository und referenzieren die benötigten Dateien direkt. Diese Entscheidung ersetzt ältere Hinweise in Schritt 7 zu npm-Veröffentlichung und Registry-Prüfung.

**Aktueller Stand:** Die Metadaten umfassen fünfzehn UI-Gruppen mit stabilen IDs, Übersetzungsschlüsseln, Performance-Kennzeichnungen und Wertebereichen. `metadata-runtime.js` stellt das Flattening als DOM-freie API bereit; App-Feldsets ordnen Teilbereiche über stabile `filterId`s zu. Der Paketstand ist `0.34.0`, die App-Version `0.2.73` und der Cache `v176`.
