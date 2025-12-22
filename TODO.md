# Smarty Learn - TODO Liste

**Stand:** Dezember 2024
**Projekt:** Lern-Apps für Grundschulkinder

---

## 🚨 Kritisch (Sofort)

### Bugs
- [ ] **Adaptiver Modus - Lösch-Bug** (deutsch-silben.html)
  - Problem: Löscht nur das 3. Element statt der ersten beiden
  - Datei: `deutsch-silben.html` (Zeile ~650-670)
  - Impact: Adaptive Schwierigkeit funktioniert nicht korrekt
  - Aufwand: 30 Min

- [ ] **Nicht-adaptive Modi - Fixe Anzahl** (deutsch-silben.html)
  - Problem: Modi "einfach", "mittel", "schwer" sollten fixe Aufgabenanzahl haben
  - Aktuell: Verhalten wie adaptiver Modus
  - Gewünscht: Z.B. 20 Aufgaben, dann fertig
  - Aufwand: 1h

### Security (Code-Review Findings)
- [ ] **Content Security Policy (CSP) hinzufügen**
  - Alle HTML-Dateien: `<meta http-equiv="Content-Security-Policy">`
  - Inline-Styles in separates CSS auslagern
  - Priorität: HOCH
  - Aufwand: 4h

- [ ] **Subresource Integrity (SRI) für CDN**
  - jsPDF: Integrity-Hash hinzufügen
  - Google Fonts: Integrity-Hash hinzufügen
  - Priorität: HOCH
  - Aufwand: 30 Min

- [ ] **Input-Validierung implementieren**
  - TaskCount, MaxResult, TaskType validieren
  - Client-Side + Server-Side (falls Option 3 umgesetzt)
  - Priorität: HOCH
  - Aufwand: 2h

---

## ⚡ Kurzfristig (1-2 Wochen)

### Accessibility (WCAG 2.1 AA)
- [ ] **ARIA Live Regions hinzufügen**
  - Task-Count-Updates ankündigen
  - Richtig/Falsch-Feedback für Screen Reader
  - Priorität: MITTEL
  - Aufwand: 2h

- [ ] **Keyboard-Navigation verbessern**
  - Arrow Up/Down: Zwischen Aufgaben navigieren
  - Home/End: Erste/letzte Aufgabe
  - Escape: Input löschen
  - Priorität: MITTEL
  - Aufwand: 2h

- [ ] **Farbkontrast WCAG-konform machen**
  - Korrekte Grenzfarbe: 4.5:1 statt 2.8:1
  - Inkorrekte Grenzfarbe: 4.7:1 statt 3.1:1
  - Priorität: MITTEL
  - Aufwand: 1h

- [ ] **Focus-Indikatoren verbessern**
  - `outline: 3px solid` statt `outline: none`
  - Höherer Kontrast für Schatten
  - Priorität: MITTEL
  - Aufwand: 1h

### Performance
- [ ] **DOM-Manipulation optimieren**
  - DocumentFragment für Batch-Inserts nutzen
  - `replaceChildren()` statt `innerHTML = ''`
  - Priorität: MITTEL
  - Aufwand: 3h

- [ ] **Event-Listener Memory Leaks fixen**
  - WeakMap für Listener-Tracking
  - Proper Cleanup beim Löschen von Elementen
  - Priorität: HOCH
  - Aufwand: 3h

- [ ] **Input-Debouncing verbessern**
  - DebouncedValidator-Klasse implementieren
  - Hardcoded 400ms → Konfigurierbar
  - Priorität: NIEDRIG
  - Aufwand: 1h

### Code Quality
- [ ] **Magic Numbers entfernen**
  - CONFIG-Objekt mit benannten Konstanten
  - Adaptiver Level, Delays, etc.
  - Priorität: MITTEL
  - Aufwand: 2h

- [ ] **Duplicate Code eliminieren**
  - `displayAdaptiveTasks()` + `displayTasks()` → TaskRenderer
  - Animations (celebrate, fadeIn, etc.) → Shared CSS
  - playSuccessSound() → Audio-Modul
  - Priorität: MITTEL
  - Aufwand: 6h

- [ ] **Naming-Konventionen vereinheitlichen**
  - HTML IDs: kebab-case (derzeit gemischt)
  - CSS-Klassen: kebab-case ✅
  - JavaScript: camelCase ✅
  - Konstanten: SCREAMING_SNAKE_CASE
  - Priorität: NIEDRIG
  - Aufwand: 2h

---

## 📦 Mittelfristig (1-2 Monate)

### Architektur
- [ ] **Monolithic HTML in Module aufteilen**
  - CSS: `/css/main.css`, `/css/animations.css`, `/css/components.css`
  - JS: `/js/task-generator.js`, `/js/ui-controller.js`, `/js/adaptive-trainer.js`
  - Priorität: HOCH
  - Aufwand: 16h

- [ ] **ES6 Module System einführen**
  - `export class TaskGenerator {}`
  - `import { TaskRenderer } from './ui/TaskRenderer.js'`
  - Priorität: HOCH
  - Aufwand: 8h

- [ ] **Build-Pipeline einrichten**
  - Webpack oder Vite
  - Minification, Bundling
  - Source Maps für Debugging
  - Priorität: MITTEL
  - Aufwand: 6h

### Testing
- [ ] **Unit-Tests schreiben**
  - Vitest oder Jest
  - Test Coverage: >80%
  - Tests für: TaskGenerator, AdaptiveTrainer, Validator
  - Priorität: HOCH
  - Aufwand: 20h

- [ ] **Integration Tests**
  - End-to-End Tests mit Playwright
  - Test-Szenarien: Aufgaben generieren, PDF export, Adaptive Logic
  - Priorität: MITTEL
  - Aufwand: 12h

### Error Handling
- [ ] **Error Boundaries hinzufügen**
  - Try/Catch um kritische Funktionen
  - Graceful Degradation bei CDN-Ausfällen
  - User-Feedback bei Fehlern
  - Priorität: HOCH
  - Aufwand: 4h

- [ ] **Error-Tracking einrichten**
  - Sentry.io Integration
  - Client-side Error Logging
  - Priorität: MITTEL
  - Aufwand: 3h

### Features
- [ ] **Offline-Support (Service Worker)**
  - PWA Manifest
  - Cache-First Strategie
  - Offline-Page
  - Priorität: MITTEL
  - Aufwand: 8h

- [ ] **Progress-Tracking**
  - LocalStorage für Lernfortschritt
  - Statistiken (Genauigkeit, Durchschnittszeit)
  - Export-Funktion
  - Priorität: NIEDRIG
  - Aufwand: 12h

- [ ] **Anpassbare Wortdatenbank** (Deutsch-App)
  - JSON-Import für eigene Wörter
  - LocalStorage für Custom Words
  - UI für Wort-Verwaltung
  - Priorität: NIEDRIG
  - Aufwand: 10h

---

## 🚀 Langfristig (3-6 Monate)

### Major Features
- [ ] **PWA (Progressive Web App)**
  - Installierbar auf Homescreen
  - Voll offline-fähig
  - Push-Notifications (optional)
  - Priorität: MITTEL
  - Aufwand: 20h

- [ ] **Analytics & Progress-Tracking**
  - Detaillierte Lernstatistiken
  - Visualisierung (Charts)
  - Spaced-Repetition-Algorithmus
  - Eltern/Lehrer-Dashboard
  - Priorität: MITTEL
  - Aufwand: 40h

- [ ] **Multi-User-Support**
  - Profile für mehrere Kinder
  - Lehrer-Dashboard
  - Klassenübersicht
  - Fortschritts-Export
  - Priorität: NIEDRIG
  - Aufwand: 60h

- [ ] **Internationalisierung (i18n)**
  - Mehrsprachige UI (EN, DE, FR, ES)
  - i18next-Integration
  - Lokalisierung von Aufgaben
  - Priorität: NIEDRIG
  - Aufwand: 30h

- [ ] **Weitere Aufgabentypen**
  - Multiplikation (1x1)
  - Division
  - Bruchrechnen
  - Geometrie
  - Priorität: MITTEL
  - Aufwand: 40h

- [ ] **Gamification**
  - Achievement-System
  - Badges & Rewards
  - Streak-Tracking
  - Leaderboard (optional)
  - Priorität: NIEDRIG
  - Aufwand: 24h

### Infrastructure
- [ ] **Backend-API (Option 3)**
  - FastAPI oder Node.js/Express
  - JWT-Authentication
  - Server-side PDF-Generation
  - Domain-Locking
  - Priorität: NIEDRIG (nur bei kommerziellem Einsatz)
  - Aufwand: 60h

- [ ] **CI/CD erweitern**
  - Automated Testing in Pipeline
  - Lighthouse-Scores prüfen
  - Accessibility-Tests
  - Priorität: MITTEL
  - Aufwand: 8h

---

## 💰 Monetarisierung & Marketing

### SEO & Discoverability
- [ ] **SEO-Optimierung**
  - Meta-Tags (Description, Keywords)
  - Open Graph Tags (Facebook/Twitter)
  - Sitemap.xml
  - robots.txt
  - Schema.org Markup
  - Priorität: MITTEL
  - Aufwand: 6h

- [ ] **Content Marketing**
  - Blog: Lerntipps für Eltern
  - Erklärvideos auf YouTube
  - Social Media Präsenz
  - Priorität: NIEDRIG
  - Aufwand: Ongoing

### Werbung & Einnahmen
- [ ] **Google Ads Integration**
  - Research: Google AdSense für Bildungs-Apps
  - DSGVO-konforme Umsetzung
  - Consent-Management (Cookie-Banner)
  - Priorität: NIEDRIG
  - Aufwand: 8h
  - **Hinweis:** Kann kindgerechte Atmosphäre stören!

- [ ] **Alternative Einnahmequellen**
  - "Buy me a Coffee" Button
  - Patreon/Steady für Unterstützer
  - Premium-Features (z.B. Teacher-Dashboard)
  - Freemium-Modell
  - Priorität: NIEDRIG
  - Aufwand: Variabel

---

## 📋 Dokumentation

- [x] ~~Deployment-Dokumentation (DEPLOYMENT.md)~~
- [x] ~~Code-Protection-Strategie (CODE_PROTECTION.md)~~
- [x] ~~Rechtliche Dokumente (Impressum, Nutzungsbedingungen, Datenschutz)~~
- [ ] **API-Dokumentation** (falls Backend implementiert)
  - Aufwand: 6h
- [ ] **Contributor-Guide** (CONTRIBUTING.md)
  - Aufwand: 4h
- [ ] **Code-Styleguide**
  - ESLint-Config
  - Prettier-Config
  - Aufwand: 2h

---

## 🛠️ DevOps & Tooling

- [x] ~~GitHub Actions Deployment-Pipeline~~
- [ ] **Pre-commit Hooks**
  - ESLint
  - Prettier
  - Husky
  - Aufwand: 2h
- [ ] **Dependency-Updates automatisieren**
  - Dependabot oder Renovate
  - Aufwand: 1h
- [ ] **Performance-Monitoring**
  - Lighthouse CI
  - Web Vitals
  - Aufwand: 4h

---

## 🎯 Priorisierung

### Diese Woche
1. ✅ Adaptive-Mode-Bug fixen (deutsch-silben.html)
2. ✅ Fixe Aufgabenanzahl für nicht-adaptive Modi
3. CSP & SRI hinzufügen
4. Input-Validierung

### Nächsten 2 Wochen
1. Event-Listener Memory Leaks
2. DOM-Manipulation optimieren
3. ARIA & Accessibility
4. Duplicate Code eliminieren

### Nächsten 2 Monate
1. Modulstruktur einführen
2. Testing (Unit + Integration)
3. Build-Pipeline
4. Error-Tracking

### 2025 Q1-Q2
1. PWA & Offline-Support
2. Progress-Tracking
3. SEO-Optimierung
4. Multi-User (optional)

---

## 📊 Metriken & Ziele

### Code Quality
- **Aktuell:**
  - Lines of Code: ~2,100
  - Test Coverage: 0%
  - Code Duplication: ~15%
  - Accessibility Score: 70/100

- **Ziel (6 Monate):**
  - Lines of Code: ~3,500 (mit Tests)
  - Test Coverage: >80%
  - Code Duplication: <3%
  - Accessibility Score: 95+/100

### Performance
- **Aktuell:**
  - Lighthouse Performance: 85/100
  - First Contentful Paint: ~1.2s
  - Time to Interactive: ~2s

- **Ziel:**
  - Lighthouse Performance: 95+/100
  - First Contentful Paint: <1s
  - Time to Interactive: <1.5s

### Nutzer (Langfristig)
- **Ziel 2025:**
  - 1,000 monatliche Nutzer
  - 5,000 generierte Aufgaben/Monat
  - 500 PDF-Downloads/Monat

---

## 🤝 Hilfe benötigt?

Bei Fragen oder Unterstützung:
- **GitHub Issues:** https://github.com/reinkes/smarty/issues
- **E-Mail:** kontakt@smarty-learn.com
- **Diskussionen:** GitHub Discussions

---

**Letzte Aktualisierung:** Dezember 2024
**Maintainer:** [Ihr Name]
