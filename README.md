# Threadline Studio

Language: Deutsch | [English notes](#english) | [Francais](#francais)

Threadline Studio ist ein rein browserbasiertes Bildbearbeitungs-Tool ohne KI.
Ein Bild wird lokal geladen, direkt im Canvas bearbeitet und anschliessend als `PNG`, `JPEG`, `WebP` oder `PDF` exportiert oder geteilt.

## Highlights

- laeuft komplett im Browser, ohne Cloud-Zwang und ohne KI
- merkt sich den aktuellen Arbeitsstand automatisch
- funktioniert auch auf dem Handy mit Touch, Drag und Pinch
- kombiniert Korrektur, Stil, Verfremdung, Muster, Material und Stoerung in einer App
- exportiert schnell in gaengige Formate inklusive `PDF`
- mehrsprachige Oberflaeche mit eingebautem README und Update-Pruefung

## Effektgruppen

### Korrektur

- Helligkeit: hellt das Bild auf oder dunkelt es ab
- Kontrast: vergroessert oder verringert Hell-Dunkel-Unterschiede
- Saettigung: macht Farben kraeftiger oder flacher
- Unschaerfe: weicht das gesamte Bild auf
- Schaerfen: betont Kanten und feine Details

### Stil

- Graustufen: entfernt Farbe
- Schwarzweiss: reduziert auf harte Hell-Dunkel-Flaechen
- Sepia: warmer Foto-Look
- Duotone: bildet das Bild auf zwei Farben ab
- Vintage: leicht gealterter Look
- Posterize: reduziert Farb- und Helligkeitsstufen
- Halftone: macht ein Druckraster daraus

### Verfremdung

- Pixelate: vergroessert sichtbare Pixel
- Glitch: verschiebt Bildteile digital
- Konturen: zieht Kanten deutlicher heraus
- Relief: gibt Kanten eine plastische Praegung
- Konturzeichnung: zeichnet Helligkeitsspruenge wie abgepaust nach
- Kohle: wandelt in grobe dunkle Zeichnung um
- Farbton: verschiebt die gesamte Farblage
- Invertieren: kehrt Farben um
- Vignette: dunkelt die Raender ab
- Filmkorn: legt leichtes Rauschen darueber
- Comic: vereinfacht Flaechen und betont Linien
- Silhouette: schiebt das Motiv in harte Hell-Dunkel-Flaechen
- Scanlines: legt horizontale Zeilen darueber
- Fokus Mitte: hebt die Bildmitte hervor
- Hintergrund weich: macht den Aussenbereich unschaerfer
- Overlay: legt eine Farbfolie darueber
- Rahmen: setzt einen sichtbaren Rand

### Muster

- Testbild, Streifen, Kariert, Punkte, Diagonal, Schraffur, Wellen
- Maschendraht, Reifenspuren, Fingerabdruck, Topografie, Notenlinien
- Blueprint, Zebra, Lochblech, Papier, Verlauf

### Material

- Glasflasche, Milchglas, Regentropfen, Kratzer, Folie
- Papierfaser, Karton, Zeitung, Thermopapier
- Metall, Beton, Asphalt, Leinen, Netzstoff

### Stoerung / Atmosphaere

- Fernsehrauschen, CRT Drift, JPEG Artefakte, Druckversatz
- Ueberbelichtung, Lichtleck, Staub & Kratzer
- Nebel, Schattenwurf, Spiegelung, Moire, Doppelbelichtung

## Projekt und Speichern

Threadline Studio speichert den aktuellen Arbeitsstand automatisch im Browser. Dazu gehoeren:

- das geladene Bild
- alle Regler und Transformationswerte
- Export-Einstellungen
- Sprache, Theme und Revisionsstand

Damit ueberlebt das aktuelle Projekt einen Reload im selben Browser.

Zusaetzlich gibt es im Bereich `Projekt`:

- `Projekt speichern`: exportiert den kompletten Stand als JSON-Datei
- `Projekt laden`: stellt eine zuvor gespeicherte JSON-Datei wieder her
- `Projekt loeschen`: entfernt den aktuellen Stand aus dem Browser

## Tipps

- Viele Filter arbeiten gegeneinander. Zum Beispiel kann `Unschaerfe` die Wirkung von `Konturen`, `Relief` oder `Schaerfen` abschwaechen.
- `Overlay`, `Duotone`, `Sepia` und `Vintage` beeinflussen alle die Farbwirkung. Lieber mit kleinen Werten beginnen und nur ein bis zwei davon kombinieren.
- `Konturzeichnung`, `Kohle`, `Comic` und `Halftone` sind starke Stilfilter. Wenn davon mehrere gleichzeitig aktiv sind, verliert das Bild schnell Struktur.
- `Fokus Mitte` und `Hintergrund weich` passen gut zusammen. Mit `Pixelate` oder `Glitch` kollidieren sie oft.
- Wenn ein Bild zu hell oder zu weiss kippt, zuerst `Helligkeit`, `Kontrast`, `Overlay` und starke Stilfilter reduzieren.
- Fuer saubere Ergebnisse zuerst Korrektur, dann Stil, dann Verfremdung und zum Schluss Muster oder Material einsetzen.

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

Dann im Browser oeffnen:

`http://localhost:5000/`

## Versionen

Es gibt zwei Ebenen:

- `appVersion` in `version.json` fuer App-Updates und Cache-Wechsel
- `revision` im Projekt fuer jeden Bearbeitungsschritt

## English

Threadline Studio is a no-AI browser image editor. It stores the current project locally, offers correction, style, distortion, pattern, material and atmosphere effects, and exports directly from the browser.

## Francais

Threadline Studio est un editeur d'image sans IA dans le navigateur. Il memorise le projet localement, propose des effets de correction, style, deformation, motifs, materiaux et atmosphere, puis exporte directement depuis le navigateur.
