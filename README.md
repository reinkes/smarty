# Smarty Learn - Lern-Apps für Kinder

Interaktive Web-Anwendungen für Grundschulkinder zum Üben von **Mathematik**, **Deutsch** und **Logik** — plus Belohnungsspiele zum Kronen ausgeben.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Browser](https://img.shields.io/badge/browser-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-green.svg)]()
[![Version](https://img.shields.io/badge/version-3.0.0-brightgreen.svg)]()

---

## 📱 Lern-Apps

### 🔢 Mathe-Aufgaben Generator
Interaktive Rechenübungen mit automatischer Korrektur und Motivations-Features.

**Aufgabentypen:**
- ➕ **Addition** (Zahlenraum abhängig von Schwierigkeit, bis 50)
- ➖ **Subtraktion** (Zahlenraum abhängig von Schwierigkeit, bis 50)
- ➕➖ **Mix** - zufällig Addition & Subtraktion gemischt (Zahlenraum bis 20)
- ➕➕ **3-Zahlen Addition** - drei Zahlen addieren (Zahlenraum bis 20)

**Features:**
- 🚀 Adaptiver Trainingsmodus — passt sich automatisch an
- 📊 10 Schwierigkeitsstufen (Level 1-10 via Slider)
- 👑 Kronen-Belohnungen basierend auf Schwierigkeit
- 📄 PDF-Export für Arbeitsblätter
- 🎆 Feuerwerk & Celebrations bei Meilensteinen
- 📱 Mobile-optimiert — Tastatur bleibt offen beim Tippen
- 💾 Progress-Tracking (LocalStorage)

### ⚖️ Größer / Kleiner
Zahlen vergleichen mit >, < und = — spielerisch und schnell.

**Features:**
- Zahlenvergleich 1–20
- 10 Schwierigkeitsstufen
- Adaptiver Trainingsmodus
- 👑 Kronen-Belohnungen bei Abschluss

### ➕ Additions-Tabelle
Fülle die Additions-Tabelle aus — Zeile und Spalte geben den Weg vor.

**Features:**
- 2×2 bis 4×4 Tabellen
- Summen bis 10 oder 20
- Kopfzeile ergänzen (Knobel-Mode ab Level 7)
- Deduce-Modus: fehlende Kopfzeilen aus vorgegebenen Ergebnissen ableiten
- Abgestufte Hinweise: voll → mittel → schwach → keine
- 10 Schwierigkeitsstufen, konfigurierbare Kronen pro Level (1–4)

### 📖 Silben-Trainer
Spielerisches Lernen von Anfangssilben mit Emoji-Visualisierung.

**Features:**
- 113 Wörter mit bunten Emojis (einfach/mittel/schwer)
- 10 Schwierigkeitsstufen (2-4+ Buchstaben-Silben)
- Adaptiver Modus
- 3 Auswahlmöglichkeiten pro Aufgabe
- Duplikat-Vermeidung

### ✍️ Wörter schreiben
Bild anschauen, Artikel wählen und das ganze Wort aufschreiben.

**Features:**
- der / die / das lernen
- 55 Wörter mit Emojis
- Sofortiges Feedback
- 👑 Kronen bei Abschluss

### 🔤 Buchstaben-Trainer
Buchstabenerkennung in deutschen Wörtern mit sofortigem Feedback.

**Features:**
- 75+ Wörter mit Emoji-Visualisierung
- 6 Bilder pro Aufgabe (50/50 richtig/falsch)
- Sofortiges Feedback — kein Prüfen-Button nötig
- 10 Schwierigkeitsstufen

### 🔡 Buchstaben-Puzzle
Buchstaben per Drag & Drop oder Klick zum richtigen Wort zusammensetzen.

**Features:**
- 55 Wörter mit Emojis
- Drag & Drop + Klick-Steuerung
- 10 Schwierigkeitsstufen
- Hinweis-Funktion (Emoji anzeigen)

### 📅 Wochentage & Monate
Tage und Monate kennenlernen mit bunten Aufgaben und Feuerwerk.

**Features:**
- Wochentage & Monate üben
- Aufgabentypen: Vor / Nach / Fehlend erkennen
- Visuelle Sequenz-Leiste mit Emojis
- Adaptiver Modus oder 20 feste Aufgaben
- 10 Schwierigkeitsstufen (Level 1-4: Tage, 5-7: Monate, 8-10: Mix)

### 🧩 Kinder-Sudoku
4×4 Sudoku-Rätsel speziell für Kinder mit Zahlen 1-4.

**Features:**
- 4×4 Grid mit 2×2 Box-Unterteilung
- 3 Schwierigkeitsgrade
- Automatische Prüfung bei vollständiger Eingabe
- Hinweis-Funktion (💡)
- Keyboard-Navigation mit Pfeiltasten
- **Einzigartige Lösbarkeit** — Backtracking-Solver garantiert genau eine Lösung

---

## 🎮 Belohnungs-Spiele

Spiele die gesammelte Kronen **verbrauchen**. Motiviert Kinder zum Weiterlernen!

### 🃏 Memory
Finde die passenden Emoji-Paare.

**Features:**
- 3 Schwierigkeitsgrade: 3×2 (1 👑), 4×3 (2 👑), 4×4 (3 👑)
- 16 verschiedene Tier-Emojis
- Karten-Flip-Animation (CSS 3D transform)
- 🏆 Highscore pro Schwierigkeitsgrad (wenigste Züge)
- Kostet Kronen zum Starten — blockiert bei zu wenig Guthaben

### 🐍 Snake
Klassisches Snake-Spiel mit Touch-Steuerung.

**Features:**
- Canvas-basiertes 15×15 Spielfeld
- 3 Geschwindigkeiten: Langsam (1 👑), Normal (2 👑), Schnell (3 👑)
- **Tastatur-Steuerung**: Pfeiltasten
- **Mobile-Steuerung**: Swipe-Gesten (Touch Start/End, 30px Threshold)
- Emoji-Früchte als Futter (🍎🍐🍊🍋🍇🍓🍒🍑)
- Schlange mit Augen (Richtungsabhängig) und Gradient-Körper
- 🏆 Highscore (global, höchste Punktzahl)
- Feuerwerk bei Score ≥ 10 oder neuem Rekord
- Kostet Kronen zum Starten

---

## 👑 Kronen-System

Zentrales Belohnungssystem über alle Apps hinweg.

**Verdienen (Lern-Apps):**
- Level 1-3: 1 Krone
- Level 4-6: 2 Kronen
- Level 7-9: 3 Kronen
- Level 10: 5 Kronen
- Additions-Tabelle: eigene Config pro Level (1–4 Kronen)

**Ausgeben (Belohnungs-Spiele):**
- Memory: 1–3 Kronen je nach Schwierigkeit
- Snake: 1–3 Kronen je nach Geschwindigkeit

**Technisch:**
- Singleton `CrownManager` in `js/shared.js`
- Ein LocalStorage-Key: `smarty-crowns`
- Alle Apps nutzen `CrownManager.earn(reward)` bzw. `CrownManager.earn(-cost)`
- `CrownManager.earnAndDisplay(level, crownCountEl, crownCounterEl)` für Standard-Flow
- Counter-Animation bei Änderung (`.earn` CSS-Klasse)

---

## 🚀 Schnellstart

**Keine Installation nötig!**

1. Repository klonen oder ZIP herunterladen
2. `index.html` im Browser öffnen
3. App auswählen und loslegen

```bash
# Lokaler Dev-Server
python -m http.server 8080
# oder
npx http-server -p 8080
```

**Voraussetzungen:**
- Moderner Browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Für PDF-Export: Internetverbindung (jsPDF via CDN)

---

## 💻 Projekt-Struktur

```
smarty/
├── index.html                  # Startseite mit App-Übersicht
├── mathe-aufgaben.html         # Mathe-Aufgaben Generator
├── mathe-groesser-kleiner.html # Größer/Kleiner Vergleich
├── mathe-tabelle.html          # Additions-Tabelle
├── deutsch-silben.html         # Silben-Trainer
├── deutsch-woerter.html        # Wörter schreiben
├── deutsch-buchstaben.html     # Buchstaben-Trainer
├── deutsch-puzzle.html         # Buchstaben-Puzzle
├── wochentage-monate.html      # Wochentage & Monate
├── kinder-sudoku.html          # 4×4 Sudoku
├── memory-spiel.html           # Memory (Belohnungsspiel)
├── snake-spiel.html            # Snake (Belohnungsspiel)
│
├── css/
│   ├── shared.css              # Gemeinsame Basis-Styles
│   ├── animations.css          # Animationen (Feuerwerk, Fading)
│   ├── theme-math.css          # Mathe-Theme (pink/orange)
│   ├── theme-german.css        # Deutsch-Theme (lila/blau)
│   ├── theme-sudoku.css        # Sudoku-Theme (grün/türkis)
│   ├── theme-tabelle.css       # Tabelle-Theme
│   ├── theme-memory.css        # Memory-Theme (orange/amber)
│   └── theme-snake.css         # Snake-Theme (grün/lime)
│
├── js/
│   ├── shared.js               # CrownManager, ProgressTracker, Utilities
│   ├── audio-manager.js        # Web Audio API Singleton
│   ├── mathe-app.js            # Mathe-Aufgaben Logik
│   ├── groesser-kleiner-app.js # Größer/Kleiner Logik
│   ├── mathe-tabelle-app.js    # Additions-Tabelle Logik
│   ├── deutsch-app.js          # Silben-Trainer Logik
│   ├── woerter-app.js          # Wörter schreiben Logik
│   ├── buchstaben-app.js       # Buchstaben-Trainer Logik
│   ├── puzzle-app.js           # Buchstaben-Puzzle Logik
│   ├── wochentage-app.js       # Wochentage & Monate Logik
│   ├── sudoku-app.js           # Sudoku Logik (inkl. Unique-Solver)
│   ├── memory-app.js           # Memory Logik
│   └── snake-app.js            # Snake Logik (Canvas + Touch)
│
├── data/
│   ├── deutsch-words.json      # Silben-Wort-Datenbank (113 Wörter)
│   ├── buchstaben-words.json   # Buchstaben-Wort-Datenbank (75+ Wörter)
│   └── woerter-words.json      # Wörter-Schreiben Datenbank (55 Wörter)
│
└── .github/
    └── workflows/
        └── deploy.yml          # CI/CD Pipeline (GitHub Actions)
```

---

## 🏗️ Technische Details

### Architektur

- Pure HTML5, CSS3, JavaScript (ES6+) — keine Frameworks, kein Build-Schritt
- **Class-based OOP** — jede App ist eine Klasse mit `constructor()`, `init()`, `cacheDOMElements()`, `attachEventListeners()`
- **DOM Caching** — alle Elemente in `this.dom = {}` Objekt
- **Singleton Pattern** — `AudioManager` für Web Audio API, `CrownManager` für Kronen
- **Event Delegation** — `addEventListener` (keine inline handlers)

### Shared Utilities (`js/shared.js`)

| Export | Beschreibung |
|--------|-------------|
| `CrownManager` | Kronen laden/speichern/anzeigen/animieren |
| `ProgressTracker` | Level-Tracking pro App (LocalStorage) |
| `launchFireworks()` | Feuerwerk-Animation (DOM-basiert) |
| `showMilestoneCelebration(msg)` | Celebration-Banner anzeigen |
| `getDifficultyLabel(level)` | Label für Level 1-10 |
| `getDifficultyEmoji(level)` | Emoji für Level 1-10 |
| `audioManager` | Globale AudioManager-Instanz |

### LocalStorage Keys

| Key | App | Inhalt |
|-----|-----|--------|
| `smarty-crowns` | Alle | Gesamtzahl gesammelter Kronen |
| `smarty-snake-highscore` | Snake | Bester Score (Zahl) |
| `smarty-memory-highscore` | Memory | JSON `{1: moves, 2: moves, 3: moves}` pro Difficulty |
| `smarty-progress` | Lern-Apps | JSON mit Level-Stand pro App |

### CSS-Theme-System

Jede App hat eine eigene Theme-Datei (`css/theme-*.css`) die CSS Custom Properties überschreibt:

```css
:root {
    --primary: #FF6B9D;
    --secondary: #FEC62E;
    --tertiary: #5DADE2;
}
```

Shared styles in `css/shared.css` nutzen diese Variablen. Neue Apps brauchen nur eine neue Theme-Datei.

### Sicherheit

- **CSP Header** in jeder HTML-Seite
- Kein `eval()`, kein `innerHTML` für User-Content (nur `textContent`)
- `innerHTML = ''` nur zum Leeren von Containern
- Input Validation & Sanitization

### Datenschutz

- Keine Server-Kommunikation (außer CDN für Fonts/jsPDF)
- Keine Cookies, kein Tracking
- LocalStorage nur lokal
- Offline-fähig nach initialem Laden

---

## 🎯 Pädagogische Konzepte

### Adaptive Logik (Mathe, Silben, Wochentage)

- **Level-Up** nach 3 korrekten Antworten in Folge
- **Level-Down** nach 2 falschen Antworten (springt 2 Levels zurück)
- Flow-Zustand durch optimale Challenge

### Motivations-Psychologie

1. **Sofortiges Feedback** — Grün/Rot Farbcodierung
2. **Positive Verstärkung** — Sound + Feuerwerk
3. **Kronen-Belohnungen** — mehr für schwierigere Levels
4. **Belohnungs-Spiele** — Kronen können ausgegeben werden
5. **Highscores** — Persönliche Bestleistungen in Memory und Snake
6. **Milestones** — Celebration alle 10 Aufgaben
7. **Visuelle Historie** — Letzte Aufgaben verblassen (zeigt Fortschritt)

---

## 📱 Mobile Optimierung

**Touch-First Design:**
- Große, fingerfreundliche Buttons (min. 44×44px)
- `inputMode="numeric"` für Nummern-Tastatur
- `scrollIntoView` mit smooth behavior
- Responsive Grid-Layout

**Snake Mobile-Steuerung:**
- Swipe-Gesten (Touch Start → Touch End, 30px Minimum-Distanz)
- `touch-action: none` auf Canvas verhindert Seiten-Scroll
- Richtungserkennung: horizontaler vs. vertikaler Swipe
- Rückwärts-Richtung blockiert (kann nicht in sich selbst laufen)

**Tastatur-Handling:**
- Synchrone Focus-Übertragung (iOS-Kompatibilität)
- `requestAnimationFrame` für Scroll

---

## 🔧 Deployment

### GitHub Actions Pipeline (`.github/workflows/deploy.yml`)

**Branches:**
- `master` → Deploy nach `/` (Production)
- `beta/*` → Deploy nach `/beta/`
- `refactor/*` → Deploy nach `/refactor/`

**Stages:**
1. **Validate** — HTML-Struktur, Security-Scan
2. **Test** — HTTP-Server, Page-Load Tests
3. **Deploy** — SFTP Mirror

---

## 🐛 Bekannte Limitierungen

- PDF-Export benötigt Internetverbindung (jsPDF via CDN)
- Web Audio API nicht in allen Browsern (Fallback: stumm)
- Emoji-Darstellung variiert je nach OS
- Snake `roundRect()` benötigt moderne Browser (Chrome 99+, Firefox 112+, Safari 15.4+)

---

## 📄 Lizenz

**MIT License** — Frei verwendbar für private und kommerzielle Zwecke.

Siehe [LICENSE](LICENSE) für Details.

---

**Viel Spaß beim Lernen! 🎉📚**
