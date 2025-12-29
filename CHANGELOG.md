# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

---

## [2.4.0] - 2025-12-29

### 🔤 Buchstaben-Trainer App

#### Added
- **Neue App: Buchstaben-Trainer**
  - Buchstabenerkennung in deutschen Wörtern
  - 75+ Wörter mit Emoji-Visualisierung
  - Orange/Lila Farbschema passend zum Lern-Charakter
  - Sofortiges visuelles Feedback (grün/rot)
  - Crown-Belohnungen: 1-5 Kronen je nach Schwierigkeit
  - Integriert in gemeinsames Crown-System (`smarty-crowns`)

- **Features:**
  - Zeigt Buchstaben (Groß + Klein): A a, B b, etc.
  - 6 Bilder pro Aufgabe (50/50 Verteilung richtig/falsch)
  - Sofortiges Feedback beim Klick:
    - ✓ Grüner Haken für richtige Auswahl (unten rechts)
    - ✗ Roter X für falsche Auswahl (unten rechts)
  - Keine Text-Labels unter Bildern (nur Emojis)
  - Kein "Prüfen"-Button nötig
  - Auto-Advance wenn alle richtigen gefunden
  - Erfolgsmeldung: "🎉 Super! Alle gefunden! 🎉"
  - 10 Schwierigkeitsstufen (bestimmt Anzahl Aufgaben)
  - Mobile-optimiert mit responsivem Grid

- **Crown-Integration:**
  - Level 1-3: 1 Krone 👑
  - Level 4-6: 2 Kronen 👑👑
  - Level 7-9: 3 Kronen 👑👑👑
  - Level 10: 5 Kronen 👑👑👑👑👑

#### Technical Details
- **Dateien:** `deutsch-buchstaben.html`, `js/buchstaben-app.js`, `css/theme-german.css`, `data/buchstaben-words.json`
- **Zeilen:** ~870 Zeilen Code (HTML: 103, JS: 467, CSS: 194, JSON: 104)
- **Wort-Datenbank:** 75+ deutsche Wörter (A-Z Coverage)
- **Verifizierung:** Prüft tatsächliche Buchstaben im Wort (nicht nur JSON-Kategorisierung)
  - "Fuchs" enthält: F, U, C, H, **S** ✓
  - Deutsche Sprache wird korrekt berücksichtigt

#### Changed
- **Index.html:**
  - Hinzugefügt: Buchstaben-Trainer Card
  - Umbenannt: "Deutsch" → "Silben" für Klarheit
  - 4 Apps jetzt verfügbar (Mathe, Silben, Buchstaben, Sudoku)

- **GitHub Actions Pipeline:**
  - Validierung für `deutsch-buchstaben.html`
  - HTTP Server Load Test
  - Beta & Production Deployment Integration

#### Fixed
- **Buchstabenerkennung:**
  - Verifiziert gegen tatsächliches Wort statt JSON `letters` Array
  - "Fuchs" wird jetzt korrekt als "enthält S" erkannt
  - Alle Buchstaben im Wort werden korrekt geprüft

- **UX Improvements:**
  - Erfolgsmeldung zentriert auf Mobile (war rechts unten)
  - Smooth Scale-Animation statt Slide-Animation
  - AudioManager Error Handling (verhindert Absturz wenn Audio fehlt)
  - Completion Check funktioniert sofort nach letzter richtiger Auswahl

---

## [2.3.0] - 2025-12-29

### 🧩 Kinder-Sudoku App

#### Added
- **Neue App: Kinder-Sudoku 4×4**
  - Zahlen 1-4 für Kinder geeignet
  - 3 Schwierigkeitsgrade (Sehr Einfach, Einfach, Mittel)
  - Grün-Türkis Theme passend zum Puzzle-Charakter
  - Automatische Validierung bei vollständigem Grid
  - Crown-Belohnungen: 1/2/3 Kronen je nach Schwierigkeit
  - Integriert in gemeinsames Crown-System (`smarty-crowns`)

- **Features:**
  - 4×4 Grid mit 2×2 Box-Unterteilung (visuell hervorgehoben)
  - Automatische Prüfung wenn alle Felder ausgefüllt
  - Kein "Prüfen"-Button nötig
  - Hinweis-Funktion (💡) zum Aufdecken einzelner Zahlen
  - "Neues Spiel" Button für schnellen Neustart
  - Puzzle-Generator mit Shuffle-Algorithmus
  - Input-Validierung: nur 1-4 erlaubt
  - Keyboard-Navigation mit Pfeiltasten
  - Mobile-optimiert mit responsiven Größen

- **Crown-Integration:**
  - Sehr Einfach (10 Hinweise): 1 Krone 👑
  - Einfach (8 Hinweise): 2 Kronen 👑👑
  - Mittel (6 Hinweise): 3 Kronen 👑👑👑
  - Erfolgsanzeige: "🎉 Geschafft! Super gelöst! +X = Y Kronen!"

#### Changed
- **Mobile-First Design:**
  - Base: 130px Grid (32.5px/Zelle)
  - Tablet (768px+): 200px Grid
  - Desktop (1024px+): 220px Grid
  - Progressive Enhancement statt Media-Query Scaling

- **Celebration System:**
  - Direkte Anzeige ohne Animation (Performance)
  - 4 Sekunden Sichtbarkeit
  - Inline Styles für maximale Kompatibilität
  - Feuerwerk via `shared.js` launchFireworks()

#### Fixed
- **Grid-Positionierung:**
  - 2×2 Box-Trennlinien exakt mittig (Row 2 & Column 2)
  - Border-Width: 3px für bessere Sichtbarkeit
  - Zell-Borders: 1px solid #C0C0C0 (alle Trennlinien sichtbar)

- **Celebration Display:**
  - Opacity-Konflikt mit CSS-Animation behoben
  - Deaktivierte milestoneShow-Animation
  - Sofortige Sichtbarkeit mit opacity: 1
  - z-index: 999999 für sichere Überlagerung

- **Input-Handling:**
  - Tab-Navigation überspringt readonly Zellen
  - Pfeiltasten-Navigation intelligent
  - Auto-Check-Trigger bei vollständiger Eingabe
  - Validierung erlaubt nur 1-4

#### Technical Details
- **Dateien:** `kinder-sudoku.html`, `js/sudoku-app.js`, `css/theme-sudoku.css`
- **Zeilen:** ~1.100 Zeilen Code (HTML: 89, JS: 663, CSS: 342)
- **Deployment:** GitHub Actions Pipeline erweitert
- **Browser:** Getestet auf Chrome, Firefox, Safari (Desktop & Mobile)

---

## [2.2.0] - 2025-12-26

### 🎯 Crown System & German App Enhancements

#### Added
- **Difficulty-Based Crown Rewards:**
  - Level 1-3: 1 Krone 👑
  - Level 4-6: 2 Kronen 👑👑
  - Level 7-9: 3 Kronen 👑👑👑
  - Level 10: 5 Kronen 👑👑👑👑👑
  - Shared across both apps via LocalStorage (`smarty-crowns`)
- **Unified Completion Screens:**
  - Both apps show crown rewards in format: "+X = Y Kronen!"
  - Animated crown badge with `bounceIn` effect
  - "Nochmal üben!" button to restart training
- **Expanded German Word Database:**
  - Added 30 new easy-level words (83 → 113 words, +36%)
  - All new words use 2-letter syllables (Ba, Di, Do, Fu, etc.)
  - Categories: Animals, Food, Objects, Clothing, Nature, Vehicles, Toys
  - Version bumped to 1.1.0 (`data/deutsch-words.json`)
- **Duplicate Prevention:**
  - `lastUsedWord` tracking prevents consecutive identical icons
  - Improves learning variety and user experience

#### Changed
- **Crown Display Timing:**
  - `earnCrown()` now called BEFORE showing completion screen
  - Completion screen receives earned crowns as parameter
  - Fixes bug where crowns wouldn't display on first completion
- **Fireworks Integration:**
  - Both apps pass `crownsEarned` to `launchFireworks()`
  - Celebration message shows "+X 👑 Kronen!" when applicable

#### Fixed
- **German App Task Count Bug:**
  - Was: User had to solve 22 tasks despite counter showing "X / 20"
  - Root cause: Logic didn't account for 3 simultaneously visible tasks
  - Fix: Calculate `totalTasksGenerated = tasksSolved + tasksRemaining`
  - Now: Exactly 20 tasks, no more, no less
- **Crown Display Bug:**
  - Crown info wasn't showing on German app completion screen
  - Fixed by earning crowns before building DOM elements
  - Now both apps show identical crown rewards

#### Technical Details
- **Database:** `deutsch-words.json` v1.1.0 with 113 words
- **Task Logic:** Improved `shouldContinue` calculation in `slideOutAndReplace()`
- **Crown System:** Unified `calculateCrownReward()` method across both apps
- **Code Consistency:** Both apps now use identical completion flow

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
