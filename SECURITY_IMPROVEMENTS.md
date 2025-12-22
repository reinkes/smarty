# Security Improvements - Implementierungsanleitung

## Status: In Arbeit

### ✅ Abgeschlossen
1. Bug-Fixes (Adaptive Mode, Task Count)
2. Rechtliche Dokumente
3. Deployment-Pipeline

### 🔄 In Arbeit
1. Content Security Policy (CSP)
2. Subresource Integrity (SRI)
3. Input-Validierung

---

## 1. Subresource Integrity (SRI) Hashes

### jsPDF (mathe-aufgaben.html)
```html
<!-- VORHER -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- NACHHER -->
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
  integrity="sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNougY+X+vvFqE4N8tZyYuFVhZJjQN1dqxTQQdnF9+XCkJN+9FEAXuEVw=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
```

### Google Fonts
```html
<!-- VORHER -->
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;700&display=swap" rel="stylesheet">

<!-- NACHHER -->
<link
  href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@400;700&display=swap"
  rel="stylesheet"
  crossorigin="anonymous"
>
```

**Hinweis:** Google Fonts ändert CSS-Dateien dynamisch, daher kein SRI-Hash. Alternative: Fonts lokal hosten.

---

## 2. Content Security Policy (CSP)

### Problem
Aktuell: Inline-Styles und Inline-Scripts erlaubt → XSS-Risiko

### Lösung (Kurzfristig - mit unsafe-inline)
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'none';
">
```

### Lösung (Mittelfristig - ohne unsafe-inline)
1. Alle Inline-Styles in separate CSS-Datei auslagern
2. Alle Inline-Scripts in separate JS-Datei auslagern
3. CSP ohne `unsafe-inline`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdnjs.cloudflare.com;
  style-src 'self' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'none';
">
```

---

## 3. Input-Validierung

### Betroffene Inputs

#### mathe-aufgaben.html
```javascript
// TaskType
document.getElementById('taskType').value
// Erlaubte Werte: 'add10', 'add20', 'sub10', 'adaptive'

// TaskCount
document.getElementById('taskCount').value
// Erlaubte Werte: 1-100

// MaxResult (nur adaptive)
document.getElementById('maxResult').value
// Erlaubte Werte: 5-50
```

#### deutsch-silben.html
```javascript
// Difficulty
document.getElementById('difficulty').value
// Erlaubte Werte: 'easy', 'medium', 'hard', 'adaptive'
```

### Implementierung
```javascript
class InputValidator {
  static validateTaskType(type) {
    const allowed = ['add10', 'add20', 'sub10', 'adaptive'];
    if (!allowed.includes(type)) {
      throw new Error(`Ungültiger Aufgabentyp: ${type}`);
    }
    return type;
  }

  static validateTaskCount(count) {
    const num = parseInt(count, 10);
    if (!Number.isInteger(num) || num < 1 || num > 100) {
      throw new Error('Aufgabenanzahl muss zwischen 1 und 100 liegen');
    }
    return num;
  }

  static validateMaxResult(value) {
    const num = parseInt(value, 10);
    if (!Number.isInteger(num) || num < 5 || num > 50) {
      throw new Error('Maximales Ergebnis muss zwischen 5 und 50 liegen');
    }
    return num;
  }

  static validateDifficulty(difficulty) {
    const allowed = ['easy', 'medium', 'hard', 'adaptive'];
    if (!allowed.includes(difficulty)) {
      throw new Error(`Ungültige Schwierigkeit: ${difficulty}`);
    }
    return difficulty;
  }
}

// Usage in generateTasks()
function generateTasks() {
    try {
        const taskType = InputValidator.validateTaskType(
            document.getElementById('taskType').value
        );

        const taskCount = InputValidator.validateTaskCount(
            document.getElementById('taskCount').value
        );

        // Continue with validated input...
    } catch (error) {
        alert(error.message);
        return;
    }
}
```

---

## 4. Weitere Empfehlungen

### HTML Sanitization
Auch wenn aktuell nur selbst-generierte Daten verwendet werden, sollte für zukünftige Features eine Sanitization-Bibliothek vorbereitet werden:

```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>

<script>
function safeRender(htmlString) {
  return DOMPurify.sanitize(htmlString);
}
</script>
```

### HTTPS Erzwingen
```html
<!-- In <head> -->
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

### X-Frame-Options
```html
<!-- In <head> -->
<meta http-equiv="X-Frame-Options" content="DENY">
```

---

## Implementierungs-Checklist

- [x] Bug-Fixes (Adaptive Mode)
- [x] Bug-Fixes (Task Count)
- [ ] SRI-Hashes für jsPDF hinzufügen
- [ ] CSP Meta-Tag in alle HTML-Dateien
- [ ] Input-Validierung in mathe-aufgaben.html
- [ ] Input-Validierung in deutsch-silben.html
- [ ] X-Frame-Options hinzufügen
- [ ] Testing der CSP-Regeln

---

**Aufwand gesamt:** ~4-5 Stunden
**Priorität:** HOCH (vor Production-Deployment)
