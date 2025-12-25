# Smarty Learn - Development Guide

## Local Development Server

Die Admin-Oberfläche kann die Wortdatenbank direkt bearbeiten, wenn der lokale Entwicklungsserver läuft.

### Installation

```bash
npm install
```

### Server starten

```bash
npm start
# oder
npm run dev
```

Der Server läuft dann auf: **http://localhost:3000**

### Verfügbare Seiten

- **Main App**: http://localhost:3000/index.html
- **Admin Interface**: http://localhost:3000/admin.html
- **German App**: http://localhost:3000/deutsch-silben.html
- **Math App**: http://localhost:3000/mathe-aufgaben.html

## Admin Interface Funktionen

### Drei Speicher-Modi (automatische Auswahl):

1. **Mit Dev-Server** (localhost:3000) - **Priorität 1**
   - Änderungen werden **direkt** in `data/deutsch-words.json` gespeichert
   - Keine manuellen Schritte nötig
   - Sofort verfügbar für alle Apps
   - ✅ Nachricht: "Lokal gespeichert!"

2. **Mit GitHub Token** (online deployed) - **Priorität 2**
   - Committed Änderungen **direkt zu GitHub**
   - Triggert automatisch Deployment-Pipeline
   - Funktioniert auch auf deployed/statischer Version
   - ✅ Nachricht: "Direkt zu GitHub committed!"
   - Setup: `⚙️ GitHub Einstellungen` → Token erstellen & speichern

3. **Download Fallback** (ohne Server/Token) - **Priorität 3**
   - Lädt JSON-Datei herunter
   - Muss manuell in `data/deutsch-words.json` ersetzt werden
   - Für Deployment committen und pushen
   - 📥 Nachricht: "JSON heruntergeladen! Ersetze..."

### Workflow mit Dev-Server:

1. `npm start` ausführen
2. http://localhost:3000/admin.html öffnen
3. Wörter bearbeiten, hinzufügen oder löschen
4. **"💾 Änderungen speichern"** klicken
5. ✅ Datei wird direkt gespeichert!
6. Änderungen committen und pushen

### Workflow mit GitHub Token (online):

1. Admin-Oberfläche online öffnen (deployed version)
2. **"⚙️ GitHub Einstellungen"** klicken
3. [GitHub Token erstellen](https://github.com/settings/tokens/new?scopes=repo&description=Smarty%20Admin) mit `repo` Berechtigung
4. Token kopieren und in Einstellungen speichern
5. Wörter bearbeiten
6. **"💾 Änderungen speichern"** klicken
7. ✅ Wird direkt zu GitHub committed!
8. GitHub Actions deployed automatisch

### Workflow ohne Dev-Server/Token:

1. `admin.html` direkt im Browser öffnen
2. Wörter bearbeiten
3. **"💾 Änderungen speichern"** klicken
4. 📥 JSON wird heruntergeladen
5. Datei in `data/deutsch-words.json` ersetzen
6. Änderungen committen und pushen

## API Endpoints

### POST /api/save-words
Speichert die Wortdatenbank direkt in `data/deutsch-words.json`

**Request:**
```json
{
  "version": "1.0.4",
  "lastUpdated": "2025-12-25",
  "description": "German syllable training word database",
  "totalWords": 83,
  "words": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Daten erfolgreich gespeichert!",
  "totalWords": 83
}
```

### GET /api/get-words
Lädt die aktuelle Wortdatenbank

## Andere Scripts

```bash
# AI-Bilder generieren
npm run generate-images

# API-Key testen
npm run test-api

# Python Server (alternativ)
npm run serve
```

## Deployment

Der `feature/admin-interface` Branch deployed automatisch zu **Beta** via GitHub Actions.

Für Production: Merge zu `master` und Tag erstellen (`v*.*.*`).
