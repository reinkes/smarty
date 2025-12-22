# Deployment Dokumentation - Smarty Learn

## Übersicht

Das Smarty Learn Projekt nutzt GitHub Actions für automatisches Deployment bei jedem Push/Merge auf den `master` Branch.

## Deployment-Pipeline

Die Pipeline (`.github/workflows/deploy.yml`) führt folgende Schritte aus:

### 1. Validation & Testing
- HTML-Struktur-Validierung
- Security-Scan (eval, innerHTML, XSS-Risiken)
- Code-Quality-Checks
- HTTP-Server-Test

### 2. Deployment (nur bei Push auf `master`)
- Erstellt Deployment-Paket mit allen notwendigen Dateien
- Deployed automatisch via SFTP/FTP
- Optional: GitHub Pages, Netlify, Vercel

## SFTP/FTP Setup

### Voraussetzungen

Sie benötigen Zugangsdaten zu Ihrem Webhosting (z.B. IONOS, Strato, ALL-INKL, etc.):
- FTP/SFTP Host (z.B. `sftp.example.com`)
- FTP/SFTP Benutzername
- FTP/SFTP Passwort
- Zielverzeichnis auf dem Server (z.B. `/html` oder `/public_html`)

### GitHub Secrets konfigurieren

1. Gehen Sie zu Ihrem GitHub Repository
2. Klicken Sie auf **Settings** → **Secrets and variables** → **Actions**
3. Klicken Sie auf **New repository secret**
4. Fügen Sie folgende Secrets hinzu:

| Secret Name | Beispielwert | Beschreibung |
|-------------|--------------|--------------|
| `FTP_HOST` | `sftp.example.com` | SFTP/FTP Server-Adresse (ohne `sftp://` oder `ftp://`) |
| `FTP_USER` | `u12345678` | Ihr FTP-Benutzername |
| `FTP_PASSWORD` | `YourSecurePassword123!` | Ihr FTP-Passwort |
| `FTP_PATH` | `/html` | Zielverzeichnis auf dem Server |

### Beispiel-Konfiguration für gängige Hoster

#### IONOS
```
FTP_HOST: home12345678.1und1-data.host
FTP_USER: u12345678
FTP_PATH: /
```

#### Strato
```
FTP_HOST: ssh.strato.de
FTP_USER: username
FTP_PATH: /html
```

#### ALL-INKL.COM
```
FTP_HOST: ssh.kasserver.com
FTP_USER: username
FTP_PATH: /www
```

#### Hetzner
```
FTP_HOST: your-server.your-storagebox.de
FTP_USER: username
FTP_PATH: /
```

## Deployment-Prozess

### Automatisches Deployment

1. Änderungen im Code vornehmen
2. Committen und pushen auf `master` Branch:
   ```bash
   git add .
   git commit -m "Update: Neue Features"
   git push origin master
   ```
3. GitHub Actions startet automatisch
4. Nach ~2-5 Minuten ist die neue Version live

### Deployment-Status prüfen

1. Gehen Sie zu Ihrem GitHub Repository
2. Klicken Sie auf **Actions**
3. Sehen Sie den aktuellen Workflow-Status
4. Bei Fehlern: Klicken Sie auf den fehlgeschlagenen Job für Details

### Manuelles Deployment (Fallback)

Falls GitHub Actions nicht funktioniert, können Sie manuell deployen:

```bash
# 1. Dateien lokal vorbereiten
mkdir deploy
cp index.html deploy/
cp mathe-aufgaben.html deploy/
cp deutsch-silben.html deploy/
cp README.md deploy/
cp LICENSE deploy/

# 2. Per SFTP hochladen (mit FileZilla, WinSCP, oder Kommandozeile)
sftp username@sftp.example.com
> cd /html
> put -r deploy/*
> exit
```

## Deployment-Ziele

Die Pipeline unterstützt mehrere Deployment-Ziele parallel:

### 1. SFTP/FTP (Hauptziel)
- **Aktiviert wenn:** `FTP_HOST` Secret gesetzt ist
- **Protokoll:** SFTP (Port 22) bevorzugt, FTP (Port 21) als Fallback
- **Methode:** Mirror-Upload (alte Dateien werden gelöscht)

### 2. GitHub Pages (Optional)
- **Aktiviert wenn:** `GITHUB_TOKEN` gesetzt ist (automatisch verfügbar)
- **URL:** `https://username.github.io/smarty`
- **Branch:** `gh-pages`
- **Setup:**
  1. Repository Settings → Pages
  2. Source: Deploy from branch → `gh-pages`

### 3. Netlify (Optional)
- **Aktiviert wenn:** `NETLIFY_SITE_ID` und `NETLIFY_AUTH_TOKEN` gesetzt sind
- **Setup:**
  1. Netlify-Account erstellen
  2. Site ID aus Netlify Dashboard kopieren
  3. Auth Token generieren (User Settings → Applications → Personal access tokens)
  4. Als GitHub Secrets hinzufügen

### 4. Vercel (Optional)
- **Aktiviert wenn:** `VERCEL_TOKEN` gesetzt ist
- **Setup:**
  1. Vercel-Account erstellen
  2. Token generieren (Account Settings → Tokens)
  3. Projekt erstellen und IDs kopieren
  4. Als GitHub Secrets hinzufügen

## Deployment-Paket Inhalt

Das Deployment-Paket enthält:
- `index.html` - Startseite
- `mathe-aufgaben.html` - Mathe-App
- `deutsch-silben.html` - Deutsch-App
- `README.md` - Projekt-Dokumentation
- `LICENSE` - MIT-Lizenz
- `CHANGELOG.md` - Versionshistorie
- `deployment-info.json` - Build-Metadaten (Version, Commit, Timestamp)

## Troubleshooting

### "SFTP connection failed"
- **Prüfen:** Sind `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD` korrekt gesetzt?
- **Prüfen:** Erlaubt Ihr Hoster SFTP-Verbindungen?
- **Prüfen:** Firewall-Regeln auf Server-Seite
- **Lösung:** Logs in GitHub Actions prüfen

### "Permission denied"
- **Prüfen:** Hat der FTP-User Schreibrechte auf `FTP_PATH`?
- **Lösung:** Verzeichnis-Berechtigungen auf dem Server prüfen

### "Authentication failed"
- **Prüfen:** Passwort enthält Sonderzeichen? → GitHub Secrets escapen sie automatisch
- **Prüfen:** Username korrekt? (oft E-Mail oder Kürzel)

### Pipeline läuft nicht
- **Prüfen:** Push war auf `master` Branch?
- **Prüfen:** `.github/workflows/deploy.yml` existiert?
- **Lösung:** Repository Settings → Actions → Enable workflows

## Lokales Testing

Vor dem Deployment lokal testen:

```bash
# HTTP-Server starten
python3 -m http.server 8080

# Browser öffnen
open http://localhost:8080

# Tests manuell durchführen
# - Alle Links funktionieren?
# - Mathe-App lädt korrekt?
# - Deutsch-App lädt korrekt?
# - Navigation zwischen Seiten funktioniert?
```

## Deployment-Frequency

- **Development:** Bei jedem Push auf `master`
- **Empfohlen:** Feature-Branches nutzen, dann Merge Request auf `master`
- **Hotfixes:** Direkter Push auf `master` möglich

## Rollback

Falls eine fehlerhafte Version deployed wurde:

```bash
# 1. Zu letztem funktionierenden Commit zurück
git log --oneline  # Commit-Hash finden
git revert <commit-hash>
git push origin master

# 2. Oder: Force-Push auf alten Stand (Vorsicht!)
git reset --hard <commit-hash>
git push --force origin master
```

## Monitoring

Nach Deployment prüfen:
- [ ] Website erreichbar unter https://your-domain.com
- [ ] index.html lädt
- [ ] Links zu mathe-aufgaben.html und deutsch-silben.html funktionieren
- [ ] Zurück-Buttons funktionieren
- [ ] PDFs können generiert werden (Mathe-App)
- [ ] Keine JavaScript-Fehler in Browser-Console

## Performance

- **Deployment-Dauer:** ~2-5 Minuten
- **Upload-Geschwindigkeit:** Abhängig von SFTP-Server
- **Cache:** Browser-Cache kann neue Version verzögern (Strg+F5 zum Hard-Refresh)

## Security

- **Secrets:** Niemals in Code committen!
- **HTTPS:** Webserver sollte HTTPS erzwingen
- **Backups:** Hoster-Backups aktivieren
- **Access Logs:** Regelmäßig auf verdächtige Aktivitäten prüfen

## Support

Bei Problemen:
1. GitHub Actions Logs prüfen
2. Server-Logs beim Hoster prüfen
3. Issue auf GitHub erstellen mit Log-Auszügen
