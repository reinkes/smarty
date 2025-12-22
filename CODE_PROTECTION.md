# Code Protection Strategy - Option 3 (Server-Based)

## Übersicht

Diese Dokumentation beschreibt eine server-basierte Schutzstrategie für die Smarty Learn Anwendung.
**Hinweis:** Dies ist eine konzeptionelle Dokumentation für zukünftige Implementierung.

## Architektur-Überblick

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ────────│  API Server  │ ────────│  Database   │
│  (Frontend) │  HTTPS  │   (Backend)  │         │  (Optional) │
└─────────────┘         └──────────────┘         └─────────────┘
       │                       │
       │  1. Request Token     │
       │──────────────────────>│
       │                       │
       │  2. Validate Domain   │
       │  3. Generate JWT      │
       │<──────────────────────│
       │                       │
       │  4. Use Token for     │
       │     API Calls         │
       │──────────────────────>│
       │                       │
       │  5. Validate Token    │
       │  6. Return Data       │
       │<──────────────────────│
```

## Komponenten

### 1. Frontend (Client-Side)

**Dateien:**
- `js/auth.js` - Token-Management
- `js/api-client.js` - API-Kommunikation
- `js/domain-check.js` - Domain-Validierung

#### Auth-Modul (`js/auth.js`)

```javascript
/**
 * Authentication Module
 * Handles token acquisition and renewal
 */
class AuthManager {
  constructor() {
    this.apiBaseUrl = 'https://api.smarty-learn.com';
    this.token = null;
    this.tokenExpiresAt = null;
    this.refreshTimer = null;
  }

  /**
   * Initialize app authentication
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    try {
      // Check if domain is allowed
      if (!this.isAllowedDomain()) {
        this.showDomainError();
        return false;
      }

      // Request initial token
      await this.requestToken();

      // Setup auto-refresh
      this.setupAutoRefresh();

      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      this.showAuthError();
      return false;
    }
  }

  /**
   * Check if current domain is allowed
   * @returns {boolean}
   */
  isAllowedDomain() {
    const allowedDomains = [
      'smarty-learn.com',
      'www.smarty-learn.com',
      'localhost'
    ];

    const currentDomain = window.location.hostname;
    return allowedDomains.includes(currentDomain) ||
           currentDomain.startsWith('localhost') ||
           currentDomain === '127.0.0.1';
  }

  /**
   * Request new authentication token from server
   * @returns {Promise<void>}
   */
  async requestToken() {
    const response = await fetch(`${this.apiBaseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Domain': window.location.hostname,
        'X-Referer': document.referrer || 'direct',
        'X-User-Agent': navigator.userAgent
      },
      body: JSON.stringify({
        fingerprint: this.generateFingerprint()
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();

    this.token = data.token;
    this.tokenExpiresAt = Date.now() + data.expiresIn;

    // Store in sessionStorage (not localStorage for security)
    sessionStorage.setItem('app_token', this.token);
    sessionStorage.setItem('token_expires', this.tokenExpiresAt);
  }

  /**
   * Setup automatic token refresh
   */
  setupAutoRefresh() {
    // Clear existing timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    // Refresh 1 minute before expiry
    const refreshInterval = (this.tokenExpiresAt - Date.now()) - 60000;

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.requestToken();
        this.setupAutoRefresh(); // Setup next refresh
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.showSessionExpiredError();
      }
    }, Math.max(refreshInterval, 60000)); // At least 1 minute
  }

  /**
   * Generate browser fingerprint for tracking
   * @returns {string}
   */
  generateFingerprint() {
    const data = [
      window.location.hostname,
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown'
    ];

    return btoa(data.join('|'));
  }

  /**
   * Get current valid token
   * @returns {string|null}
   */
  getToken() {
    // Check if token is still valid
    if (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt) {
      return null;
    }
    return this.token;
  }

  /**
   * Show domain error to user
   */
  showDomainError() {
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      ">
        <div style="
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        ">
          <h1 style="color: #E74C3C; margin-bottom: 1rem;">❌ Nicht autorisiert</h1>
          <p style="color: #666; font-size: 1.1rem; line-height: 1.6;">
            Diese Anwendung läuft auf einer nicht autorisierten Domain.
          </p>
          <p style="color: #666; margin-top: 1rem;">
            Bitte besuchen Sie
            <a href="https://smarty-learn.com" style="color: #667eea;">
              smarty-learn.com
            </a>
          </p>
          <p style="color: #999; font-size: 0.9rem; margin-top: 2rem;">
            © 2024 Smarty Learn. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Show authentication error
   */
  showAuthError() {
    alert('Authentifizierung fehlgeschlagen. Bitte laden Sie die Seite neu.');
  }

  /**
   * Show session expired error
   */
  showSessionExpiredError() {
    alert('Ihre Sitzung ist abgelaufen. Bitte laden Sie die Seite neu.');
    location.reload();
  }
}

// Export singleton instance
export const authManager = new AuthManager();
```

#### API Client (`js/api-client.js`)

```javascript
/**
 * API Client for server communication
 */
import { authManager } from './auth.js';

class APIClient {
  constructor() {
    this.baseUrl = 'https://api.smarty-learn.com';
  }

  /**
   * Make authenticated API request
   * @param {string} endpoint
   * @param {object} options
   * @returns {Promise<any>}
   */
  async request(endpoint, options = {}) {
    const token = authManager.getToken();

    if (!token) {
      throw new Error('No valid authentication token');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      authManager.showSessionExpiredError();
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate PDF on server
   * @param {Array} tasks
   * @returns {Promise<Blob>}
   */
  async generatePDF(tasks) {
    const token = authManager.getToken();

    if (!token) {
      throw new Error('No valid authentication token');
    }

    const response = await fetch(`${this.baseUrl}/pdf/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tasks })
    });

    if (response.status === 401) {
      authManager.showSessionExpiredError();
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    return response.blob();
  }

  /**
   * Report unauthorized copy detection
   * @param {object} copyInfo
   */
  async reportCopy(copyInfo) {
    try {
      await fetch(`${this.baseUrl}/security/report-copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...copyInfo,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          domain: window.location.hostname
        })
      });
    } catch (error) {
      // Silent fail - don't break app if reporting fails
      console.warn('Copy detection report failed:', error);
    }
  }
}

export const apiClient = new APIClient();
```

### 2. Backend (Server-Side)

**Tech Stack:** FastAPI (Python) - kann auch Node.js/Express sein

**Dateien:**
- `main.py` - API Server
- `auth.py` - Authentication logic
- `pdf_generator.py` - Server-side PDF generation
- `security.py` - Security monitoring

#### API Server (`main.py`)

```python
from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import jwt
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import io

app = FastAPI(title="Smarty Learn API", version="1.0.0")

# CORS Configuration
ALLOWED_ORIGINS = [
    "https://smarty-learn.com",
    "https://www.smarty-learn.com",
    "http://localhost:8080",
    "http://127.0.0.1:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SECRET_KEY = "your-secret-key-here-change-in-production"  # Use env variable!
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 15

# Allowed domains
ALLOWED_DOMAINS = [
    "smarty-learn.com",
    "www.smarty-learn.com",
    "localhost",
    "127.0.0.1"
]

# Rate limiting storage (use Redis in production)
rate_limit_store = {}


def verify_domain(domain: str) -> bool:
    """Verify if domain is allowed"""
    return domain in ALLOWED_DOMAINS or domain.startswith("localhost")


def create_token(domain: str, fingerprint: str) -> dict:
    """Create JWT token"""
    expires = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)

    payload = {
        "domain": domain,
        "fingerprint": fingerprint,
        "exp": expires,
        "iat": datetime.utcnow(),
        "iss": "smarty-learn-api"
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "token": token,
        "expiresIn": TOKEN_EXPIRE_MINUTES * 60 * 1000  # milliseconds
    }


def verify_token(authorization: str = Header(...)) -> dict:
    """Verify JWT token from Authorization header"""
    try:
        # Extract token from "Bearer <token>"
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")

        token = authorization.replace("Bearer ", "")

        # Decode and verify
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/auth/token")
async def create_auth_token(
    request: Request,
    x_domain: str = Header(..., alias="X-Domain"),
    x_referer: Optional[str] = Header(None, alias="X-Referer"),
    x_user_agent: Optional[str] = Header(None, alias="X-User-Agent")
):
    """Create authentication token for valid domains"""

    # Verify domain
    if not verify_domain(x_domain):
        # Log unauthorized access attempt
        print(f"⚠️ Unauthorized domain attempt: {x_domain}")
        raise HTTPException(
            status_code=403,
            detail="Domain not authorized"
        )

    # Rate limiting (simple implementation)
    client_ip = request.client.host
    now = datetime.utcnow()

    if client_ip in rate_limit_store:
        last_request = rate_limit_store[client_ip]
        if (now - last_request).seconds < 1:
            raise HTTPException(
                status_code=429,
                detail="Too many requests"
            )

    rate_limit_store[client_ip] = now

    # Get fingerprint from request body
    body = await request.json()
    fingerprint = body.get("fingerprint", "unknown")

    # Create token
    token_data = create_token(x_domain, fingerprint)

    # Log successful authentication
    print(f"✅ Token created for domain: {x_domain}")

    return token_data


@app.post("/pdf/generate")
async def generate_pdf(
    request: Request,
    token_data: dict = Depends(verify_token)
):
    """Generate PDF server-side (requires valid token)"""

    body = await request.json()
    tasks = body.get("tasks", [])

    if not tasks:
        raise HTTPException(status_code=400, detail="No tasks provided")

    # Generate PDF using ReportLab or similar
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    # Add content
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(100, 800, "Mathe-Aufgaben")

    y_position = 750
    for i, task in enumerate(tasks):
        if y_position < 100:
            pdf.showPage()
            y_position = 800

        pdf.setFont("Helvetica", 16)
        equation = f"{task['num1']} {task['operator']} {task['num2']} = ___"
        pdf.drawString(100, y_position, f"{i+1}. {equation}")
        y_position -= 30

    pdf.save()
    buffer.seek(0)

    # Return PDF
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=mathe-aufgaben.pdf"
        }
    )


@app.post("/security/report-copy")
async def report_unauthorized_copy(request: Request):
    """Log unauthorized copy detection"""

    body = await request.json()

    # Log to database or monitoring service
    print(f"🚨 UNAUTHORIZED COPY DETECTED:")
    print(f"   Domain: {body.get('domain')}")
    print(f"   Timestamp: {body.get('timestamp')}")
    print(f"   User-Agent: {body.get('userAgent')}")
    print(f"   Fingerprint: {body.get('fingerprint', 'N/A')}")

    # In production: Send to Sentry, log to database, send email alert

    return {"status": "reported"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### PDF Generator (`pdf_generator.py`)

```python
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
import io


def generate_math_worksheet(tasks: list) -> bytes:
    """
    Generate professional math worksheet PDF

    Args:
        tasks: List of task dicts with num1, num2, operator, result

    Returns:
        PDF bytes
    """
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Header
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(2*cm, height - 3*cm, "Mathe-Aufgaben 🎯")

    # Date and name field
    pdf.setFont("Helvetica", 10)
    pdf.drawString(2*cm, height - 4*cm, f"Datum: _____________")
    pdf.drawString(10*cm, height - 4*cm, f"Name: _____________")

    # Tasks
    pdf.setFont("Helvetica", 14)
    y_position = height - 6*cm
    column = 0
    tasks_per_row = 3

    for i, task in enumerate(tasks):
        if y_position < 3*cm:
            pdf.showPage()
            y_position = height - 3*cm
            column = 0

        x_position = 2*cm + column * 6*cm

        equation = f"{task['num1']} {task['operator']} {task['num2']} = ___"
        pdf.drawString(x_position, y_position, f"{i+1}. {equation}")

        column += 1
        if column >= tasks_per_row:
            column = 0
            y_position -= 1.5*cm

    # Footer
    pdf.setFont("Helvetica", 8)
    pdf.drawString(
        2*cm,
        1.5*cm,
        "© 2024 Smarty Learn - Erstellt mit smarty-learn.com"
    )

    pdf.save()
    buffer.seek(0)

    return buffer.getvalue()
```

## Deployment

### Backend Hosting Options

1. **Heroku** (Einfach)
   - Kosten: ~7€/Monat (Hobby Dyno)
   - Setup: `git push heroku main`

2. **Railway.app** (Modern)
   - Kosten: ~5€/Monat
   - Auto-deploy from GitHub

3. **AWS Lambda + API Gateway** (Skalierbar)
   - Kosten: ~0-10€/Monat (pay per request)
   - Serverless

4. **DigitalOcean App Platform**
   - Kosten: ~12€/Monat
   - Managed platform

### Environment Variables

```bash
SECRET_KEY=your-very-secret-key-change-this
ALLOWED_DOMAINS=smarty-learn.com,www.smarty-learn.com
SENTRY_DSN=https://...  # Error tracking
DATABASE_URL=postgresql://...  # Optional
```

## Vorteile dieser Lösung

✅ **Starker Schutz:** Code kann nicht ohne Server laufen
✅ **Monitoring:** Alle Zugriffe werden geloggt
✅ **Flexibilität:** Features können server-seitig erweitert werden
✅ **Analytics:** Nutzungsstatistiken automatisch verfügbar
✅ **Skalierbar:** Kann mit Nutzerzahl wachsen

## Nachteile

❌ **Kosten:** ~10-20€/Monat für Hosting
❌ **Komplexität:** Mehr Code zu warten
❌ **Abhängigkeit:** Offline-Nutzung nicht möglich
❌ **Latenz:** API-Calls verzögern Funktionen leicht

## Migration Path

1. **Phase 1:** Domain-Lock und Token-System implementieren
2. **Phase 2:** PDF-Generation auf Server verlagern
3. **Phase 3:** Aufgaben-Generierung auf Server (optional)
4. **Phase 4:** Progress-Tracking und Analytics

## Kosten-Schätzung

| Komponente | Monatlich | Jährlich |
|------------|-----------|----------|
| API Server (Heroku Hobby) | 7€ | 84€ |
| Domain SSL (Let's Encrypt) | 0€ | 0€ |
| Error Tracking (Sentry Free) | 0€ | 0€ |
| **Total** | **7€** | **84€** |

## Alternativen

Wenn Kosten ein Problem sind:

1. **Firebase Cloud Functions** (Free Tier: 2M requests/month)
2. **Cloudflare Workers** (Free Tier: 100k requests/day)
3. **Vercel Serverless Functions** (Free Tier)

## Nächste Schritte

1. Backend-Code in separates Repository
2. API deployen (z.B. Heroku)
3. Frontend anpassen (auth.js, api-client.js)
4. Testing mit localhost
5. Production-Deployment
