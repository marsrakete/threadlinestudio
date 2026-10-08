# Threadline Studio

Language: Deutsch | [English notes](#english) | [Français](#francais)

Threadline Studio ist ein rein browserbasiertes Bildbearbeitungs-Tool ohne KI.
Ein Bild wird lokal geladen, direkt im Canvas bearbeitet und anschließend als `PNG`, `JPEG`, `WebP` oder `PDF` exportiert oder geteilt.

## Highlights

- läuft komplett im Browser, ohne Cloud-Zwang und ohne KI
- merkt sich den aktuellen Arbeitsstand automatisch
- funktioniert auch auf dem Handy mit Touch, Drag und Pinch
- kombiniert Korrektur, Stil, Verfremdung, Muster, Material und Störung in einer App
- exportiert schnell in gängige Formate inklusive `PDF`
- mehrsprachige Oberfläche mit eingebautem README und Update-Prüfung

## Effektgruppen

### Korrektur

- Helligkeit: hellt das Bild auf oder dunkelt es ab
- Kontrast: vergrößert oder verringert Hell-Dunkel-Unterschiede
- Sättigung: macht Farben kräftiger oder flacher
- Unschärfe: weicht das gesamte Bild auf
- Schärfen: betont Kanten und feine Details

### Stil

- Graustufen: entfernt Farbe
- Schwarzweiß: reduziert auf harte Hell-Dunkel-Flächen
- Sepia: warmer Foto-Look
- Duotone: bildet das Bild auf zwei Farben ab
- Vintage: leicht gealterter Look
- Posterize: reduziert Farb- und Helligkeitsstufen
- Halftone: macht ein Druckraster daraus

### Verfremdung

- Pixelate: vergrößert sichtbare Pixel
- Glitch: verschiebt Bildteile digital
- Konturen: zieht Kanten deutlicher heraus
- Relief: gibt Kanten eine plastische Prägung
- Konturzeichnung: zeichnet Helligkeitssprünge wie abgepaust nach
- Kohle: wandelt in grobe dunkle Zeichnung um
- Farbton: verschiebt die gesamte Farblage
- Invertieren: kehrt Farben um
- Vignette: dunkelt die Ränder ab
- Filmkorn: legt leichtes Rauschen darüber
- Comic: vereinfacht Flächen und betont Linien
- Silhouette: schiebt das Motiv in harte Hell-Dunkel-Flächen
- Scanlines: legt horizontale Zeilen darüber
- Fokus Mitte: hebt die Bildmitte hervor
- Hintergrund weich: macht den Außenbereich unschärfer
- Overlay: legt eine Farbfolie darüber
- Rahmen: setzt einen sichtbaren Rand

### Muster

- Testbild, Streifen, Kariert, Punkte, Diagonal, Schraffur, Wellen
- Maschendraht, Reifenspuren, Fingerabdruck, Topografie, Notenlinien
- Blueprint, Zebra, Lochblech, Papier, Verlauf

### Material

- Glasflasche, Milchglas, Regentropfen, Kratzer, Folie
- Papierfaser, Karton, Zeitung, Thermopapier
- Metall, Beton, Asphalt, Leinen, Netzstoff

### Störung / Atmosphäre

- Fernsehrauschen, CRT Drift, JPEG Artefakte, Druckversatz
- Überbelichtung, Lichtleck, Staub & Kratzer
- Nebel, Schattenwurf, Spiegelung, Moiré, Doppelbelichtung

## Projekt und Speichern

Threadline Studio speichert den aktuellen Arbeitsstand automatisch im Browser. Dazu gehören:

- das geladene Bild
- alle Regler und Transformationswerte
- Export-Einstellungen
- Sprache, Theme und Revisionsstand

Damit überlebt das aktuelle Projekt einen Reload im selben Browser.

Zusätzlich gibt es im Bereich `Projekt`:

- `Projekt speichern`: exportiert den kompletten Stand als JSON-Datei
- `Projekt laden`: stellt eine zuvor gespeicherte JSON-Datei wieder her
- `Projekt löschen`: entfernt den aktuellen Stand aus dem Browser

## Tipps

- Viele Filter arbeiten gegeneinander. Zum Beispiel kann `Unschärfe` die Wirkung von `Konturen`, `Relief` oder `Schärfen` abschwächen.
- `Overlay`, `Duotone`, `Sepia` und `Vintage` beeinflussen alle die Farbwirkung. Lieber mit kleinen Werten beginnen und nur ein bis zwei davon kombinieren.
- `Konturzeichnung`, `Kohle`, `Comic` und `Halftone` sind starke Stilfilter. Wenn davon mehrere gleichzeitig aktiv sind, verliert das Bild schnell Struktur.
- `Fokus Mitte` und `Hintergrund weich` passen gut zusammen. Mit `Pixelate` oder `Glitch` kollidieren sie oft.
- Wenn ein Bild zu hell oder zu weiß kippt, zuerst `Helligkeit`, `Kontrast`, `Overlay` und starke Stilfilter reduzieren.
- Für saubere Ergebnisse zuerst Korrektur, dann Stil, dann Verfremdung und zum Schluss Muster oder Material einsetzen.

## Export

- `PNG`: verlustfrei
- `JPEG`: kompakter
- `WebP`: modern und effizient
- `PDF`: Einzelseite mit eingebettetem Bild

Je nach Browser kann das Ergebnis danach direkt geteilt werden.

## Support

- [Ko-Fi](https://ko-fi.com/)

## Lokaler Start

```powershell
.\start-server.ps1
```

Dann im Browser öffnen:

`http://localhost:5000/`

## Versionen

Es gibt zwei Ebenen:

- `appVersion` und `cacheVersion` in `version.js` für App-Updates und Cache-Wechsel
- `revision` im Projekt für jeden Bearbeitungsschritt

## English

Threadline Studio is a no-AI browser image editor. It stores the current project locally, offers correction, style, distortion, pattern, material and atmosphere effects, and exports directly from the browser.

## Français

Threadline Studio est un éditeur d'image sans IA dans le navigateur. Il mémorise le projet localement, propose des effets de correction, de style, de déformation, des motifs, des matériaux et une ambiance, puis exporte directement depuis le navigateur.
