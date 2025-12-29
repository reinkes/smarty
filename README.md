# Smarty Learn - Lern-Apps für Kinder

Interaktive Web-Anwendungen für Grundschulkinder zum Üben von **Mathematik**, **Deutsch** und **Logik**.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Browser](https://img.shields.io/badge/browser-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-green.svg)]()
[![Version](https://img.shields.io/badge/version-2.4.0-brightgreen.svg)]()

---

## 📱 Apps

### 🔢 Mathe-Aufgaben Generator
Interaktive Rechenübungen mit automatischer Korrektur und Motivations-Features.

**Features:**
- ✅ Addition & Subtraktion (Zahlenraum 1-50)
- 🚀 **Adaptiver Trainingsmodus** - passt sich automatisch an
- 📊 10 Schwierigkeitsstufen (Level 1-10 via Slider)
- 👑 **Kronen-Belohnungssystem** - verdiene Kronen basierend auf Schwierigkeit
- 📄 PDF-Export für Arbeitsblätter
- 🎆 Feuerwerk & Celebrations bei Meilensteinen
- 📱 **Mobile-optimiert** - Tastatur bleibt offen beim Tippen
- 💾 Progress-Tracking (LocalStorage)

**Adaptive Intelligenz:**
- Startet mit einfachen Aufgaben
- **Level-Up** nach 3 korrekten Antworten in Folge
- **Level-Down** nach 2 falschen Antworten
- Zeigt letzte 10 gelöste Aufgaben (verblassen graduell)
- **Keine +0 Cluster** - verhindert langweilige Aufgaben

### 📖 Silben-Trainer
Spielerisches Lernen von Anfangssilben mit Emoji-Visualisierung.

**Features:**
- ✅ **113 Wörter** mit bunten Emojis (einfach/mittel/schwer)
- 🎯 10 Schwierigkeitsstufen (2-4+ Buchstaben-Silben)
- 🚀 **Adaptiver Modus** - automatische Anpassung
- 👑 **Kronen-Belohnungssystem** - verdiene Kronen basierend auf Schwierigkeit
- 🎲 **Duplikat-Vermeidung** - keine identischen Icons hintereinander
- 🎨 3 Auswahlmöglichkeiten pro Aufgabe
- ✨ Sofortiges Feedback + Fehlerkorrektur
- 💾 Progress-Tracking

### 🔤 Buchstaben-Trainer
Buchstabenerkennung in deutschen Wörtern mit sofortigem Feedback.

**Features:**
- ✅ **75+ Wörter** mit bunten Emojis (A-Z Abdeckung)
- 🎯 10 Schwierigkeitsstufen (bestimmt Anzahl Aufgaben)
- 👑 **Kronen-Belohnungssystem** - 1-5 Kronen je nach Schwierigkeit
- 🔍 **Deutsche Sprache** - erkennt alle Buchstaben im Wort ("Fuchs" enthält "S" ✓)
- ⚡ **Sofortiges Feedback** - grüner Haken (✓) oder roter X (✗)
- 🎉 **Auto-Advance** - keine "Prüfen"-Button nötig
- 🖼️ **Nur Emojis** - keine Text-Labels unter Bildern
- 📱 **Mobile-optimiert** - responsive Grid-Layout

**Spielmechanik:**
- Zeigt Buchstaben (Groß + Klein): A a, B b, etc.
- 6 Bilder pro Aufgabe (50/50 richtig/falsch Verteilung)
- Klick auf Bild → sofortiges Feedback
- Alle richtigen gefunden → "🎉 Super! Alle gefunden! 🎉"
- Automatisch zur nächsten Aufgabe

### 🧩 Kinder-Sudoku
4×4 Sudoku-Rätsel speziell für Kinder mit Zahlen 1-4.

**Features:**
- ✅ **4×4 Grid** - perfekt für Einsteiger
- 🎯 3 Schwierigkeitsgrade (Sehr Einfach, Einfach, Mittel)
- 🎨 Grün-Türkis Theme mit klarer Visualisierung
- ⚡ **Automatische Prüfung** - kein Button nötig!
- 👑 **Kronen-Belohnungen** - 1/2/3 Kronen je nach Schwierigkeit
- 💡 Hinweis-Funktion zum Aufdecken einzelner Zahlen
- ⌨️ Keyboard-Navigation mit Pfeiltasten
- 🔢 Input-Validierung (nur 1-4)
- 📱 **Mobile-optimiert** - responsive Größen
- 🎆 Feuerwerk & Celebrations bei Erfolg

**Spielmechanik:**
- Klare 2×2 Box-Unterteilung mit Trennlinien
- Vorgefüllte Zellen (grün hinterlegt)
- Intelligente Navigation (überspringt readonly Felder)
- Automatische Validierung bei vollständiger Eingabe
- Shuffle-Algorithmus für Puzzle-Generierung

---

## 🚀 Schnellstart

**Keine Installation nötig!**

1. Repository klonen oder ZIP herunterladen
2. `index.html` im Browser öffnen
3. App auswählen und loslegen

**Voraussetzungen:**
- Moderner Browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Für PDF-Export: Internetverbindung (lädt jsPDF via CDN)

---

## 💻 Projekt-Struktur

```
smarty/
├── index.html                  # Startseite
├── mathe-aufgaben.html        # Mathe-App
├── deutsch-silben.html        # Silben-Trainer App
├── deutsch-buchstaben.html    # Buchstaben-Trainer App (NEU v2.4.0)
├── kinder-sudoku.html         # Sudoku-App
│
├── css/
│   ├── shared.css             # Gemeinsame Basis-Styles
│   ├── animations.css         # Animationen (Feuerwerk, Fading)
│   ├── theme-math.css         # Mathe-Theme (pink/orange)
│   ├── theme-german.css       # Deutsch-Theme (lila/blau + Buchstaben-Styles) ← UPDATED
│   └── theme-sudoku.css       # Sudoku-Theme (grün/türkis)
│
├── js/
│   ├── shared.js              # Gemeinsame Utilities
│   ├── audio-manager.js       # Singleton für Sound-Effekte
│   ├── mathe-app.js          # Mathe-Logik (900+ Zeilen)
│   ├── deutsch-app.js        # Silben-Trainer Logik (820+ Zeilen)
│   ├── buchstaben-app.js     # Buchstaben-Trainer Logik (467 Zeilen) ← NEU
│   └── sudoku-app.js         # Sudoku-Logik (663 Zeilen)
│
├── data/
│   ├── deutsch-words.json     # Silben-Wort-Datenbank (v1.1.0, 113 Wörter)
│   └── buchstaben-words.json  # Buchstaben-Wort-Datenbank (v1.0.0, 75+ Wörter) ← NEU
│
└── .github/
    └── workflows/
        └── deploy.yml         # CI/CD Pipeline (GitHub Actions)
```

---

## 🏗️ Technische Details

### Architektur

**Frontend:**
- Pure HTML5, CSS3, JavaScript (ES6+)
- **Class-based OOP** - `MatheApp`, `DeutschApp` Klassen
- **Singleton Pattern** - `AudioManager` für Web Audio API
- **DOM Caching** - Performance-Optimierung
- **Event Delegation** - `addEventListener` (keine inline handlers)

**Externe Dependencies:**
- [jsPDF 2.5.1](https://cdnjs.com/libraries/jspdf) - PDF-Export (via CDN, SRI-Hash)
- [Google Fonts](https://fonts.google.com/) - Fredoka, Nunito (CORS-enabled)

### Sicherheit

**Content Security Policy (CSP):**
```html
<!-- Mathe App -->
script-src 'self' https://cdnjs.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
```

**Best Practices:**
- ✅ Keine `eval()` oder `innerHTML` (XSS-Schutz)
- ✅ Safe DOM Manipulation (`createElement`, `textContent`)
- ✅ `try-catch` um `JSON.parse` (LocalStorage)
- ✅ Input Validation & Sanitization

### Performance

**Optimierungen:**
- **AudioContext Singleton** - 1 Instanz statt N pro Sound
- **DOM Caching** - Alle Elemente werden in `this.dom` gecacht
- **requestAnimationFrame** - Smooth Animationen
- **Debouncing** - Opacity-Updates mit Timeout
- **Lazy Task Removal** - Nur ältere als 10 werden entfernt

**Mobile Keyboard:**
- ✅ **Synchrone Focus-Übertragung** - Tastatur bleibt offen
- ✅ `focus()` ohne `setTimeout` (iOS-Kompatibilität)
- ✅ `scrollIntoView` mit `requestAnimationFrame`

### Datenschutz

- ✅ **Keine Server-Kommunikation** (außer CDN für Fonts/jsPDF)
- ✅ **Keine Cookies**
- ✅ **Keine Tracking-Scripte**
- ✅ **LocalStorage nur lokal** (kein Upload)
- ✅ **Offline-fähig** nach initialem Laden

---

## 🎯 Pädagogische Konzepte

### Adaptive Logik

**Mathe:**
```javascript
// Level-Up: 3 korrekt in Folge → +1 Level
if (correctStreak >= 3) level++;

// Level-Down: 2 falsch → -2 Levels
if (incorrectCount >= 2) level -= 2;

// Aufgabengenerierung: 98% Rejection für +0
if (num2 === 0 && (hasRecentZero || Math.random() < 0.98)) {
    retry(); // Verhindert langweilige Aufgaben
}
```

**Deutsch:**
- Progressive Komplexität: 2 → 3 → 4+ Buchstaben
- Gleicher Adaptive-Algorithmus wie Mathe

### Motivations-Psychologie

1. **Sofortiges Feedback** - Grün/Rot Farbcodierung
2. **Positive Verstärkung** - Sound + Feuerwerk
3. **Kronen-Belohnungen** - Mehr Kronen für schwierigere Levels
   - Level 1-3: 1 Krone 👑
   - Level 4-6: 2 Kronen 👑👑
   - Level 7-9: 3 Kronen 👑👑👑
   - Level 10: 5 Kronen 👑👑👑👑👑
4. **Milestones** - Celebration alle 10 Aufgaben
5. **Flow-Zustand** - Adaptive Modi halten optimale Challenge
6. **Visuelle Historie** - Letzte 10 Aufgaben verblassen (zeigt Fortschritt)

---

## 📱 Mobile Optimierung

**Touch-First Design:**
- Große, fingerfreundliche Buttons (min. 44×44px)
- `inputMode="numeric"` für Nummern-Tastatur
- `scrollIntoView` mit smooth behavior
- Responsive Grid-Layout (`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`)

**Tastatur-Handling:**
- Keine `setTimeout` bei Focus (iOS-Requirement)
- Synchrone Focus-Übertragung im gleichen Event Handler
- `requestAnimationFrame` für Scroll (nicht-blockierend)

---

## 🔧 Entwicklung

### Lokaler Development Server

```bash
# Python 3
python -m http.server 8080

# Node.js
npx http-server -p 8080

# Browser öffnen
open http://localhost:8080
```

### Code-Struktur

**Mathe-App (`js/mathe-app.js`):**
```javascript
class MatheApp {
    constructor() {
        this.currentTasks = [];
        this.adaptiveMode = false;
        this.dom = {}; // DOM Cache
    }

    init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadProgress();
    }

    generateAdaptiveTask() { /* ... */ }
    handleAdaptiveInput(input, taskDiv) { /* ... */ }
    adjustAdaptiveLevel(correct) { /* ... */ }
}
```

**Deutsch-App (`js/deutsch-app.js`):**
```javascript
class DeutschApp {
    constructor() {
        this.wordDatabase = []; // Geladen aus JSON
        this.currentMode = '';
        this.crownsEarned = 0;
        this.lastUsedWord = null; // Duplikat-Vermeidung
        this.dom = {};
    }

    async loadWordDatabase() {
        // Lädt 113 Wörter aus data/deutsch-words.json
    }

    calculateCrownReward() {
        // Level 1-3: 1, 4-6: 2, 7-9: 3, 10: 5
    }

    generateTask() {
        // Verhindert consecutive duplicates
    }
}
```

### CSS-Variablen

**Theme-System:**
```css
:root {
    /* Math Theme */
    --math-primary: #FF6B9D;
    --math-secondary: #FEC62E;
    --math-tertiary: #5DADE2;

    /* German Theme */
    --german-primary: #9B59B6;
    --german-secondary: #3498DB;
    --german-tertiary: #1ABC9C;
}
```

### Deployment

**GitHub Actions Pipeline (`.github/workflows/deploy.yml`):**
1. **Validate** - HTML-Struktur, Security-Scan, Code-Quality
2. **Test** - HTTP-Server, Page-Load Tests
3. **Deploy** - FTP/SFTP, GitHub Pages, Netlify, Vercel (konfigurierbar)

**Deploy Commands:**
```bash
# Manual Deploy
git add .
git commit -m "feat: Add new feature"
git push origin master

# Automatic via GitHub Actions
# → Triggered on push to master
# → Validates, tests, deploys
```

---

## 🐛 Bekannte Limitierungen

- PDF-Export benötigt Internetverbindung (jsPDF via CDN)
- Web Audio API nicht in allen Browsern (Fallback: stumm)
- Emoji-Darstellung variiert je nach OS

---

## 🤝 Contributing

**Ideen für Beiträge:**
- Neue Wörter für Silben-Trainer
- Weitere Aufgabentypen (Multiplikation, Division)
- Accessibility-Verbesserungen (ARIA, Screen Reader)
- Internationalisierung (i18n)

**Development Workflow:**
1. Fork Repository
2. Feature Branch erstellen (`git checkout -b feature/neue-funktion`)
3. Änderungen committen
4. Pull Request erstellen

---

## 📄 Lizenz

**MIT License** - Frei verwendbar für private und kommerzielle Zwecke.

Siehe [LICENSE](LICENSE) für Details.

---

## 📞 Support

**Probleme melden:**
1. [GitHub Issues](https://github.com/reinkes/smarty/issues)
2. Browser-Konsole für Fehler checken
3. Mit Screenshot + Browser-Version

---

**Viel Spaß beim Lernen! 🎉📚**
