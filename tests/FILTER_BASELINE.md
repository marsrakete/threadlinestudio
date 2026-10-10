# Filter-Verhaltensbaseline

Die Baseline hält die aktuelle Ausgabepipeline fest, bevor Filter in wiederverwendbare Module verschoben werden. `npm run test:filters` rendert repräsentative Szenarien über die bestehende App-Pipeline und vergleicht SHA-256-Prüfsummen der dekodierten RGBA-Pixel. Dadurch werden sowohl versehentliche sichtbare Änderungen als auch Änderungen in der Reihenfolge oder Einbindung der Filter erkannt.

Voraussetzungen: `npm install` und `npx playwright install chromium`. Danach startet `npm run test:filters` den lokalen Browser-Test. `npm run baseline:filters:update` schreibt die Referenzen neu und soll nur nach Sichtprüfung einer beabsichtigten Änderung verwendet werden.

Die feste SVG-Testquelle enthält Farbverläufe, Kanten, Landschaft, Gebäude und ein Gesicht. Die Szenarien decken neutrale Ausgabe, Korrekturen, Farbstile, selektive Farbe, Kampagnen, Canvas-Effekte, Morphologie, Muster, Material, Atmosphäre, Kunst-, Text-, Fragment-, Schnitt-, Morph-, Künstler- und Grafikfilter ab. Zufallsbasierte Effekte bekommen im Testlauf einen festen Seed; das Produktionsverhalten wird nicht verändert.

Die Vergleiche sind absichtlich an Plattform und Chromium-Version gebunden, weil Canvas-Text und Rasterung je nach Betriebssystem oder Browser anders ausfallen können. Bei einer späteren, beabsichtigten visuellen Änderung zuerst die Ausgabe prüfen und dann mit `npm run baseline:filters:update` die Referenzen ausdrücklich neu aufnehmen. Eine aktualisierte Prüfsumme allein ist kein Nachweis für ein korrektes Ergebnis.

Die festgehaltene Reihenfolge in `applyEffects` lautet: erster Pixel-Durchlauf für Korrekturen und Farbstile; Canvas-Korrekturen (Unschärfe, Fokusunschärfe, Schärfen, Konturen/Relief); Zeichen- und Stilfilter; Kampagnen-Overlays; Halftone/Pixelate/Glitch; Morphologie, Muster, Material, Atmosphäre, Kunst, Textkunst, Fragmente, Schnittformen, Morphs, Künstlerfilter und Grafikstile; abschließender Pixel-Durchlauf für Korn, Vignette, Scanlines, Farbtrennung, Overlay und Rahmen. Die Baseline kombiniert repräsentative Filter an diesen Übergängen, um Reihenfolge- und Integrationsänderungen zu erkennen.

Die Baseline ist ein Sicherheitsnetz für die schrittweise Extraktion, kein vollständiger Einzeltest jedes Reglers. Bei jeder Extraktion kommen gezielte Vertrags- und Randfalltests für die neue öffentliche Library-API hinzu.
