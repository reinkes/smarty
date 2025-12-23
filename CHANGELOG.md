# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [2.0.0] - 2025-12-23

### 🎉 Major Refactoring - Modular Architecture

#### Added
- **Organisierte Folder-Struktur:**
  - `css/` - Alle Stylesheets (shared, animations, themes)
  - `js/` - Alle JavaScript-Module (shared, apps, audio)
- **Class-based Architecture:**
  - `MatheApp` Klasse (900+ Zeilen)
  - `DeutschApp` Klasse (700+ Zeilen)
- **Singleton Pattern:**
  - `AudioManager` - Verhindert mehrfache AudioContext-Instanzen
- **CSS Module:**
  - `css/shared.css` - Gemeinsame Basis-Styles
  - `css/animations.css` - Animationen & Keyframes
  - `css/theme-math.css` - Mathe-Theme
  - `css/theme-german.css` - Deutsch-Theme
- **JS Module:**
  - `js/shared.js` - ProgressTracker, Utilities
  - `js/audio-manager.js` - AudioContext Singleton
  - `js/mathe-app.js` - Mathe-Logik
  - `js/deutsch-app.js` - Deutsch-Logik

#### Changed
- **Code-Organisation:**
  - Entfernt: 1400+ Zeilen inline CSS/JS
  - Reduziert: Dateigrößen um 30-40%
  - Verbessert: Wartbarkeit & Erweiterbarkeit
- **Event Handling:**
  - Ersetzt alle `onclick="..."` mit `addEventListener`
  - Implementiert DOM Caching für Performance
- **Deployment Pipeline:**
  - `.github/workflows/deploy.yml` kopiert jetzt `css/` und `js/` Ordner
  - Entfernt alte `shared.css` / `shared.js` Logik

#### Fixed
- **Security:**
  - CSP Header entfernt `'unsafe-inline'` für Scripts
  - Alle `innerHTML` ersetzt mit sicherer DOM-Manipulation
  - `try-catch` um `JSON.parse` für LocalStorage
- **Performance:**
  - AudioContext Singleton spart Memory
  - DOM Caching reduziert Queries

### 🔧 Technical Debt Elimination

#### Removed
- ❌ Inline `<style>` Blöcke (600+ Zeilen in mathe, 160+ in deutsch)
- ❌ Inline `<script>` Blöcke (875+ Zeilen in mathe, 482+ in deutsch)
- ❌ Inline Event Handlers (`onclick`, `oninput`, `onchange`)
- ❌ Duplicate Code (playSuccessSound, fireworks, celebrations)

---

## [1.2.0] - 2025-12-23

### 📱 Mobile UX Improvements

#### Fixed
- **Keyboard bleibt offen (iOS/Android):**
  - Synchrone Focus-Übertragung ohne `setTimeout`
  - Verwendet `requestAnimationFrame` für Scroll
  - Research-basiert: iOS benötigt synchronen Focus im Event Handler
- **+0 Aufgaben reduziert:**
  - Erhöht Rejection von 90% auf 98%
  - Verhindert aufeinanderfolgende +0 Tasks
  - Prüft letzte 3 Aufgaben auf +0

#### Changed
- **Adaptive Mode:**
  - Letzte 10 gelöste Aufgaben bleiben sichtbar
  - Graduelles Verblassen (Opacity 0.3 → 0.6)
  - Ältere Tasks werden sanft entfernt (kein abruptes Remove)
- **Animations:**
  - Removed 300ms setTimeout vor Focus
  - Focus passiert sofort nach Validation
  - Visuelle Updates nutzen `requestAnimationFrame`

#### Performance
- Reduziert DOM-Manipulation während Input-Focus
- Verhindert Layout-Thrashing durch Debouncing

---

## [1.1.0] - 2025-12-23

### 🎨 UI/UX Improvements

#### Fixed
- **Footer Overlap auf Index-Seite:**
  - Footer nutzt jetzt `position: relative` statt `absolute`
  - Body verwendet `flex-direction: column` für proper spacing
  - Responsive padding für Mobile

#### Changed
- **Layout:**
  - Container nutzt `flex: 1` für vertikales spacing
  - Footer hat `margin-top: 3rem` für Trennung
  - Mobile: Reduzierter padding für kompaktere Ansicht

---

## [1.0.0] - 2024-12-21

### 🎉 Initial Release

#### Mathe-Aufgaben Generator

**Features:**
- Addition im Zahlenraum 10, 20, 50
- Subtraktion im Zahlenraum 10, 20, 50
- Adaptiver Trainingsmodus
- PDF-Export für Arbeitsblätter
- Interaktive Aufgabenlösung mit sofortigem Feedback
- Farbcodierung (grün/rot)
- Automatischer Cursor-Sprung

**Motivations-System:**
- Celebration alle 10 gelösten Aufgaben
- Großes Feuerwerk bei kompletter Liste
- Level-Up Benachrichtigungen
- Sound-Effekte

**Adaptive Logik:**
- Start bei Level 5
- Level-Up nach 3 korrekten Antworten
- Level-Down nach 2 falschen Antworten
- Graduelle Schwierigkeitssteigerung

#### Silben-Trainer

**Features:**
- Drei Schwierigkeitsstufen (Einfach, Mittel, Schwer)
- Adaptiver Modus
- 50+ Wörter mit Emoji-Visualisierung
- 3 Auswahlmöglichkeiten pro Aufgabe
- Sofortiges Feedback
- Anzeige der richtigen Lösung bei Fehler

**Wort-Datenbank:**
- Einfach: 20 Wörter (2-Buchstaben-Silben)
- Mittel: 15 Wörter (2-3 Buchstaben)
- Schwer: 10 Wörter (komplexe Silben)

#### Technische Details

**Design:**
- Responsive (Desktop, Tablet, Mobile)
- Kinderfreundliche UI
- Custom Fonts (Fredoka, Nunito)
- CSS-Animationen
- Touch-optimiert

**Browser:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Performance:**
- Pure JavaScript (kein Framework)
- Offline-fähig
- Keine Server-Kommunikation
- jsPDF für PDF-Export (via CDN)

---

## Versionsrichtlinien

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
