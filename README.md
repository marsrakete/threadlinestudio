# Threadline Studio

Language: Deutsch | [English notes](#english) | [Francais](#francais)

Threadline Studio ist ein rein browserbasiertes Bildbearbeitungs-Tool ohne KI.
Die App laedt ein einzelnes Bild, rendert es ueber Canvas neu, speichert das aktuelle Projekt lokal und exportiert direkt als `PNG`, `JPEG`, `WebP` oder `PDF`.

## Highlights

- PWA-Grundgeruest mit `manifest.webmanifest`, `service-worker.js` und Offline-Cache
- Mehrsprachige UI: Deutsch, Englisch, Franzoesisch
- Einstellungen mit Sprachumschalter, Backup-Export, Backup-Import und Update-Pruefung
- Persistentes Projekt: Reloads ueberleben dank `localStorage`
- Laufende Projekt-Versionierung ueber Revisionszaehler `rN`
- Mobile Bedienung mit Drag, Pinch und grosser Touch-Oberflaeche
- Export und Teilen direkt aus dem Browser
- Ko-Fi-Button, README und Apache-2.0-Lizenz im Projekt

## Effektgruppen

### Korrektur

- Helligkeit
- Kontrast
- Saettigung
- Unschaerfe
- Schaerfen

### Stil

- Graustufen
- Schwarzweiss
- Sepia
- Duotone
- Vintage
- Posterize
- Halftone

### Verfremdung

- Pixelate
- Glitch
- Konturen
- Relief
- Bleistift
- Kohle
- Farbton-Verschiebung
- Invertieren
- Vignette
- Filmkorn
- Comic
- Silhouette
- Scanlines
- Fokus Mitte
- Hintergrund weichzeichnen
- Overlay
- Rahmen

## Projekt speichern

Die App speichert automatisch:

- geladenes Bild als Data-URL
- alle Effekt- und Transformationswerte
- Export-Einstellungen
- Spracheinstellung
- Revisionsnummer und Zeitstempel

Damit ueberlebt der aktuelle Arbeitsstand einen Reload im selben Browser.

## Backup

Im Dialog `Einstellungen` gibt es zwei Aktionen:

- `Backup herunterladen`: speichert das komplette Projekt als JSON
- `Backup importieren`: stellt ein zuvor exportiertes Projekt wieder her

## Export

- `PNG`: verlustfrei
- `JPEG`: kompakter
- `WebP`: modern und effizient
- `PDF`: Einzelseite mit eingebettetem Bild

Danach kann die Datei je nach Browser direkt per Web Share API geteilt werden.

## Lokaler Start

```powershell
.\start-server.ps1
```

Dann im Browser oeffnen:

`http://localhost:5000/`

## Versionsidee

Es gibt zwei Versionsebenen:

- `appVersion` in `version.json` fuer App-Updates und Cache-Wechsel
- `revision` im Projekt fuer jeden inhaltlichen Bearbeitungsschritt

Wenn du eine neue App-Fassung auslieferst, erhoehe `appVersion` und `cacheVersion`.

## English

Threadline Studio is a no-AI browser image editor built as a PWA. It supports local project persistence, multilingual UI, effect pipelines, backup import/export, mobile gestures, file export and direct sharing.

## Francais

Threadline Studio est un editeur d'image sans IA dans le navigateur. Il prend en charge la persistence locale du projet, une interface multilingue, les sauvegardes JSON, les gestes mobiles, l'export et le partage.
