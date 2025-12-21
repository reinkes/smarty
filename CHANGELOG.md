# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2024-12-21

### Hinzugefügt - Mathe-Aufgaben Generator

#### Features
- Addition im Zahlenraum 10
- Addition im Zahlenraum 20
- Subtraktion im Zahlenraum 10
- Adaptiver Trainingsmodus mit automatischer Schwierigkeitsanpassung
- PDF-Export für Arbeitsblätter
- Interaktive Aufgabenlösung mit sofortigem Feedback
- Farbcodierung (grün/rot) für richtige/falsche Antworten
- Automatischer Cursor-Sprung bei richtiger Antwort
- Intelligente Validierung (keine Fehlmeldung beim Tippen zweistelliger Zahlen)

#### Motivations-System
- Celebration-Animation alle 10 gelösten Aufgaben
- Großes Feuerwerk bei vollständig gelöster Aufgabenliste
- Level-Up Benachrichtigungen im adaptiven Modus
- Sound-Effekte bei richtigen Antworten

#### Aufgabengenerierung
- Vermeidung von +0 Aufgaben (nur 10% Wahrscheinlichkeit)
- Bei Subtraktion: Nur 10% mit Ergebnis 0
- Keine direkt aufeinanderfolgenden Duplikate
- Adaptiver Modus: Graduelle Schwierigkeitssteigerung
- Start bei max. Ergebnis 5, wächst bis zur konfigurierten Grenze

### Hinzugefügt - Silben-Trainer

#### Features
- Drei Schwierigkeitsstufen (Einfach, Mittel, Schwer)
- Adaptiver Modus mit automatischer Anpassung
- 50+ Wörter mit Emoji-Visualisierung
- 3 Auswahlmöglichkeiten pro Aufgabe
- Sofortiges Feedback bei Auswahl
- Anzeige der richtigen Lösung bei Fehler

#### Wort-Datenbank
- Einfach: 20 Wörter mit 2-Buchstaben-Silben
- Mittel: 15 Wörter mit 2-3 Buchstaben-Silben
- Schwer: 10 Wörter mit komplexen Silben

#### Adaptive Logik
- Nach 3 richtigen Antworten → Level-Up
- Nach 2 falschen Antworten → Level-Down
- Celebration bei Meilensteinen

### Technische Details

#### Design
- Responsive Design (Desktop, Tablet, Mobile)
- Playful und kinderfreundliche Benutzeroberfläche
- Custom Fonts (Fredoka, Nunito)
- CSS-Animationen für alle Interaktionen
- Touch-optimierte Buttons

#### Browser-Kompatibilität
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### Performance
- Keine externen Abhängigkeiten (außer jsPDF für PDF-Export)
- Pure JavaScript (kein Framework)
- Offline-fähig nach initialem Laden
- Keine Datenübertragung an Server

### Dokumentation
- Umfassendes README mit allen Features
- REQUIREMENTS.txt mit technischen Voraussetzungen
- MIT Lizenz
- .gitignore für saubere Repository-Verwaltung

---

## [Geplant für zukünftige Versionen]

### Version 1.1.0 (Q1 2025)
- [ ] Multiplikation und Division
- [ ] Mehr Wörter für Silben-Trainer (Ziel: 100+)
- [ ] Statistik-Tracking (optional mit localStorage)
- [ ] Drucker-freundliche Ansicht
- [ ] Barrierefreiheit-Verbesserungen (WCAG 2.1 AA)

### Version 1.2.0 (Q2 2025)
- [ ] KI-generierte Bilder statt Emojis (optional)
- [ ] Bruchrechnen
- [ ] Geometrie-Aufgaben
- [ ] Endsilben-Trainer
- [ ] Reimwörter-Finder

### Version 2.0.0 (Q3 2025)
- [ ] Mehrspielermodus (lokal)
- [ ] Fortschritt-Speicherung
- [ ] Anpassbare Schwierigkeitskurven
- [ ] Lehrer-Dashboard (optional)
- [ ] Multi-Language Support

---

## Änderungsrichtlinien

### Added (Hinzugefügt)
Für neue Features.

### Changed (Geändert)
Für Änderungen an bestehender Funktionalität.

### Deprecated (Veraltet)
Für Features, die bald entfernt werden.

### Removed (Entfernt)
Für entfernte Features.

### Fixed (Behoben)
Für Bugfixes.

### Security (Sicherheit)
Für sicherheitsrelevante Änderungen.
