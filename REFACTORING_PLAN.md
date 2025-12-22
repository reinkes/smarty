# Refactoring Plan - Unified Difficulty System

## Status: In Umsetzung

## Ziel
Vereinheitlichung des Schwierigkeitssystems für beide Apps (Mathe & Deutsch) mit:
- **Schwierigkeits-Slider** (Level 1-10) statt Dropdown
- **Adaptive-Checkbox** zum Ein/Ausschalten der automatischen Anpassung
- **Gemeinsame Code-Basis** (shared.css, shared.js)
- **Progress Tracking** mit LocalStorage

## Architektur-Änderungen

### 1. Neue Dateien (✅ Erstellt)
- `shared.css` - Gemeinsame Styles für beide Apps
- `shared.js` - Gemeinsame Utilities (Animationen, Validierung, Progress Tracking)

### 2. HTML-Struktur (Beide Apps)

#### Alt (Dropdown):
```html
<select id="difficulty">
    <option value="easy">Einfach</option>
    <option value="medium">Mittel</option>
    <option value="hard">Schwer</option>
    <option value="adaptive">Adaptiv</option>
</select>
```

#### Neu (Slider + Checkbox):
```html
<div class="form-group">
    <label for="difficulty">🎯 Schwierigkeitsgrad:
        <span class="slider-value" id="difficultyValue">Level 5 (Mittel) 🤔</span>
    </label>
    <div class="slider-container">
        <input type="range" id="difficultySlider" min="1" max="10" value="5" step="1">
        <div class="slider-labels">
            <span>😊 Einfach</span>
            <span>🤔 Mittel</span>
            <span>🔥 Schwer</span>
        </div>
    </div>
</div>

<div class="form-group">
    <div class="checkbox-container" onclick="document.getElementById('adaptiveMode').click()">
        <input type="checkbox" id="adaptiveMode" onclick="event.stopPropagation()">
        <label for="adaptiveMode" class="checkbox-label">
            🚀 Automatisch anpassen (adaptiv)
        </label>
    </div>
    <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
        Wenn aktiviert, passt sich die Schwierigkeit automatisch an deine Leistung an!
    </p>
</div>
```

### 3. JavaScript-Änderungen

#### Level-Mapping
```javascript
// Level 1-10 → Konkrete Werte

// MATHE:
// Level 1-3: Zahlenraum 10
// Level 4-6: Zahlenraum 20
// Level 7-10: Zahlenraum bis 50

function getMathRange(level) {
    if (level <= 3) return { max: 10, label: 'Zahlenraum 10' };
    if (level <= 6) return { max: 20, label: 'Zahlenraum 20' };
    return { max: 50, label: 'Zahlenraum 50' };
}

// DEUTSCH:
// Level 1-3: 2-Buchstaben-Silben, gleicher Anfangsbuchstabe
// Level 4-6: 2-3 Buchstaben, gleicher Anfangsbuchstabe
// Level 7-10: Alle Silben, gemischt

function getGermanDifficulty(level) {
    if (level <= 3) return { type: 'easy', sameStart: true, label: '2-Buchstaben' };
    if (level <= 6) return { type: 'medium', sameStart: true, label: '2-3 Buchstaben' };
    return { type: 'hard', sameStart: false, label: 'Alle Silben' };
}
```

#### Adaptive Modus
```javascript
// Adaptiv startet bei gewähltem Level und passt sich an
let currentLevel = parseInt(document.getElementById('difficultySlider').value);
const isAdaptive = document.getElementById('adaptiveMode').checked;

if (isAdaptive) {
    // Nach 3 richtigen: Level + 1
    // Nach 2 falschen: Level - 1
    // Level bleibt zwischen 1-10
}
```

### 4. Progress Tracking Integration

```javascript
// Beim Start der App
const progress = ProgressTracker.getProgress('math'); // oder 'german'
document.getElementById('difficultySlider').value = progress.level;
updateSliderDisplay();

// Nach jeder Aufgabe
ProgressTracker.recordAttempt('math', isCorrect);

// Bei Level-Up (nur adaptiv)
if (isAdaptive && shouldLevelUp) {
    currentLevel++;
    ProgressTracker.updateLevel('math', currentLevel);
    showLevelUpCelebration(currentLevel);
}
```

### 5. CSS-Integration

Beide HTML-Dateien ersetzen `<style>`-Block durch:
```html
<link rel="stylesheet" href="shared.css">
<style>
    /* App-spezifische Styles */
    body { background: linear-gradient(...); }
    body::before { background: var(--math-primary); } /* oder --german-primary */

    .card { border-color: var(--math-primary); }
    h1 { color: var(--math-primary); text-shadow: 3px 3px 0px var(--math-secondary); }
    /* ... */
</style>
```

## Implementierungs-Schritte

### Kurzfristig (Heute)
- [x] shared.css erstellen
- [x] shared.js erstellen
- [ ] deutsch-silben.html refactoren
- [ ] mathe-aufgaben.html refactoren
- [ ] Testing beider Apps
- [ ] Pull Request erstellen

### Mittelfristig (Diese Woche)
- [ ] Progress-Tracking UI (Statistik-Seite)
- [ ] Eltern-Dashboard (progress.html)
- [ ] Achievement-System

### Langfristig (Nächste Woche)
- [ ] Multi-User Support
- [ ] Backend für Cloud-Sync
- [ ] Fehler-Analyse Dashboard

## Breaking Changes

⚠️ **LocalStorage-Schema ändert sich**

Alt:
```json
{
  "lastDifficulty": "medium",
  "tasksSolved": 42
}
```

Neu:
```json
{
  "level": 5,
  "tasksCompleted": 42,
  "correctAnswers": 38,
  "totalAttempts": 42,
  "accuracy": 90,
  "lastSession": "2024-12-22T10:30:00Z",
  "currentStreak": 7,
  "longestStreak": 15
}
```

## Testing-Checkliste

- [ ] Slider bewegen funktioniert
- [ ] Label aktualisiert sich korrekt (Level 1 😊, Level 5 🤔, Level 10 🔥)
- [ ] Adaptive-Checkbox aktiviert/deaktiviert Adaptive Mode
- [ ] Mathe: Level 1-3 = Zahlenraum 10, 4-6 = 20, 7-10 = 50
- [ ] Deutsch: Level 1-3 = 2-Buchst., 4-6 = 2-3-Buchst., 7-10 = Alle
- [ ] Adaptive Mode passt Level nach 3 richtigen / 2 falschen an
- [ ] Progress wird in LocalStorage gespeichert
- [ ] Progress wird beim Neustart geladen
- [ ] Animationen und Sounds funktionieren
- [ ] Mobile-Responsive
- [ ] CSP-Header bleiben intakt

## Performance-Optimierungen

- Lazy-Loading von shared.js (nur wenn benötigt)
- Event-Listener nur einmal binden
- Debouncing bei Slider-Updates
- Throttling bei Progress-Speicherung

## Rückwärts-Kompatibilität

Optional: Migration-Script für existierende LocalStorage-Daten
```javascript
function migrateOldProgress() {
    const oldData = localStorage.getItem('smarty_oldKey');
    if (oldData) {
        // Convert to new format
        const newData = convertOldToNew(oldData);
        ProgressTracker.saveProgress('math', newData);
        localStorage.removeItem('smarty_oldKey');
    }
}
```

## Rollback-Plan

Falls Probleme auftreten:
```bash
git checkout master
git branch -D feature/unified-difficulty-system
```

---

**Geschätzter Aufwand:** 4-6 Stunden
**Priorität:** HOCH
**Verantwortlich:** Stefan
**Deadline:** 22.12.2024 EOD
