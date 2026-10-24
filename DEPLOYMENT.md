# VIBHA EdTech — Production Deployment & Operations Guide

> **Motto:** *"Learn Skills. Build Projects. Grow Careers."*

This document provides complete instructions for provisioning, securing, deploying, and operating the VIBHA EdTech full-stack website and Learning Management System (LMS) in production.

---

## 1. System Architecture & Topology

The production stack is packaged into a secure, resource-efficient container architecture:

```
                            [ HTTPS Requests (Port 443) ]
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │      Nginx Reverse Proxy        │
                         │ (SSL Termination, CSP, Gzip,   │
                         │    Static Asset Caching)       │
                         └───────┬─────────────────┬───────┘
                                 │                 │
         /api/*, /docs, /health  │                 │  /* (SSR & Client Pages)
                                 ▼                 ▼
             ┌─────────────────────────┐     ┌─────────────────────────┐
             │      FastAPI Backend    │     │     Next.js Frontend    │
             │   (4 Uvicorn Workers,   │     │  (Standalone Node.js,   │
             │    Non-root 'appuser')  │     │   Non-root 'nextjs')    │
             └───────────┬─────────────┘     └─────────────────────────┘
                         │
                         ▼
             ┌─────────────────────────┐
             │   PostgreSQL 16 Engine  │
             │ (Persistent named vol,  │
             │   Hourly/Daily Backups) │
             └─────────────────────────┘
```

---

## 2. Low-Cost Initial Infrastructure Recommendation

For a cost-effective, high-reliability launch serving **1,000 to 5,000 active students and campus batches**, a single high-performance Linux VPS is recommended:

| Provider | Recommended Tier | Specifications | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Hetzner Cloud** (Recommended) | CPX21 / CAX21 | 3 vCPU (AMD/ARM), 4 GB RAM, 80 GB NVMe | **~$6.50 – $8.00 / month** |
| **DigitalOcean** | Basic Droplet | 2 vCPU, 4 GB RAM, 80 GB SSD | **$24.00 / month** |
| **AWS Lightsail** | Standard Instance | 2 vCPU, 4 GB RAM, 80 GB SSD | **$20.00 / month** |

### Why This Low-Cost Setup Works:
1. **Next.js Standalone Output**: Packaged build runs on a slim Alpine runner consuming under 120MB memory.
2. **Asynchronous FastAPI**: Handles thousands of concurrent I/O connections per second using lightweight coroutines.
3. **Database Connection Pooling**: SQLAlchemy connection pool limits peak database memory to under 400MB.
4. **Provider-Independent AI Abstraction**: AI features default to deterministic offline mock during CI/test, with paid OpenAI/Gemini tokens consumed only when user explicitly invokes features.

---

## 3. Step-by-Step Production Deployment

### Step 3.1: Server Provisioning & Prerequisites

On a fresh Ubuntu 22.04 / 24.04 LTS server:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker & Docker Compose Plugin
sudo apt install -y curl git ufw fail2ban
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 3. Configure firewall (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

### Step 3.2: Clone Repository & Configure Environment

```bash
# 1. Clone repository
git clone https://github.com/vibha-edtech/vibha-platform.git /var/www/vibha
cd /var/www/vibha

# 2. Create production environment file from template
cp .env.example .env.production

# 3. Generate a cryptographically secure 64-character SECRET_KEY
python3 -c 'import secrets; print(secrets.token_hex(32))'
```

Edit `.env.production`:
```env
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=paste_your_generated_64_char_key_here
POSTGRES_USER=vibha_admin
POSTGRES_PASSWORD=use_a_strong_random_db_password
POSTGRES_DB=vibha_production_db
CORS_ORIGINS=https://vibha.io,https://www.vibha.io
AI_ENABLED=true
AI_PROVIDER=mock  # Change to "openai" or "gemini" when API keys are configured
OPENAI_API_KEY=
GEMINI_API_KEY=
```

### Step 3.3: Launch Multi-Container Production Stack

```bash
# Build and launch production containers in detached mode
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Verify container health
docker compose -f docker-compose.prod.yml ps
```

### Step 3.4: Run Database Migrations & Initial Seeding

```bash
# Run Alembic migrations up to head (Milestone 1 through 6)
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Run automated security verification checklist
docker compose -f docker-compose.prod.yml exec backend python scripts/verify_security.py
```

---

## 4. Domain & Let's Encrypt SSL/TLS Setup

To enable automated HTTPS with valid certificates using Certbot:

```bash
# 1. Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtain Let's Encrypt SSL certificate
sudo certbot certonly --standalone -d vibha.io -d www.vibha.io

# 3. Update nginx/nginx.conf to mount certificates:
# /etc/letsencrypt/live/vibha.io/fullchain.pem
# /etc/letsencrypt/live/vibha.io/privkey.pem
```

---

## 5. Database Backup, Recovery & Disaster Plan

The platform includes automated, compressed backup scripts in [`backend/scripts/`](file:///c:/Users/Admin/Desktop/llm%20portal/backend/scripts):

### Creating a Manual Backup
```bash
docker compose -f docker-compose.prod.yml exec backend python scripts/backup_db.py
```
- Creates a timestamped `.sql.gz` (or `.db.gz`) archive in `/app/backups/`.
- Computes and stores the **SHA256 checksum** in an adjacent manifest `.json`.

### Restoring from Backup
```bash
docker compose -f docker-compose.prod.yml exec backend python scripts/restore_db.py backups/vibha_pg_backup_20261023_120000.sql.gz
```
- Verifies SHA256 integrity before touching the database.
- Confirms schema and tables before finalizing the restore.

### Setting Up Daily Automated Backups (Cron)
```bash
crontab -e

# Append daily backup job at 02:00 AM UTC
0 2 * * * docker compose -f /var/www/vibha/docker-compose.prod.yml exec -T backend python scripts/backup_db.py >> /var/log/vibha_backup.log 2>&1
```

---

## 6. Security Hardening & OWASP Compliance

| OWASP Threat Category | Platform Implementation & Defense | Verification |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Server-side role resolution (`RoleChecker`), multi-tenant college boundary enforcement on all SQL queries. Browser roles are never trusted. | Verified in `test_organizations.py` |
| **A02: Cryptographic Failures** | Passwords hashed using `bcrypt` with unique salts. Short-lived JWTs (24h dev, 1h prod) with HTTP-only cookies. | Verified in `test_auth.py` |
| **A03: Injection (SQL / XSS)** | SQLAlchemy ORM parameterized queries; Pydantic v2 input validation; Next.js automatic React escaping; Content Security Policy (CSP). | Verified in `test_milestone7.py` |
| **A04: Insecure Design** | Strict token quotas (50k tokens/day) prevent AI resource exhaustion; Human-in-the-loop requirement on generated questions. | Verified in `test_milestone6.py` |
| **A05: Security Misconfiguration** | `DEBUG=false` in production suppresses stack traces; OWASP headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`). | Verified in `verify_security.py` |
| **A06: Vulnerable Components** | Minimal multi-stage container images; non-root user `appuser` (UID 1001) and `nextjs` (UID 1001). | Dockerfile specs |
| **A07: Identification Failures** | Account lockout after 5 consecutive failed logins for 15 minutes; rate limiting on authentication endpoints. | Verified in `test_auth.py` |
| **A08: Software & Data Integrity** | Database backup archives verified with SHA256 checksum manifests before restoration. | Verified in `test_milestone7.py` |
| **A09: Logging & Monitoring** | `SecretMaskingFilter` strips passwords, bearer tokens, and API keys from all application logs before writing. | Verified in `test_milestone7.py` |
| **A10: SSRF & File Uploads** | Strict file size (10MB), extension whitelist (`.pdf`, `.png`, `.zip`), MIME validation, non-executable private paths. | Verified in `test_milestone7.py` |

---

## 7. Health Checks & System Monitoring

The platform provides a comprehensive observability endpoint at `/api/v1/health`:

```bash
curl -s http://localhost:8000/api/v1/health | jq .
```

Sample output:
```json
{
  "status": "healthy",
  "service": "VIBHA EdTech Platform",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-10-23T15:48:44.123456+00:00",
  "database": "ok",
  "database_latency_ms": 0.54,
  "security": {
    "rate_limiting": true,
    "security_headers": true,
    "masked_logging": true
  },
  "ai_engine": {
    "enabled": true,
    "provider": "mock",
    "model": "vibha-ai-deterministic-v1"
  }
}
```

---

## 8. Expected Usage-Based Costs & Service Budget

### Monthly Infrastructure Breakdown

| Service | Provider / Solution | Expected Monthly Cost |
| :--- | :--- | :--- |
| **Compute & Host** | Hetzner CPX21 (4GB RAM, 3 vCPU) | **$7.50 / month** |
| **PostgreSQL Database** | Embedded container with persistent volume | **$0.00** (Included in VPS) |
| **Domain & DNS** | Cloudflare / Namecheap (.io or .com) | **~$1.00 / month** ($12/year) |
| **SSL Certificates** | Let's Encrypt | **$0.00** (Free, automated) |
| **Video Hosting** | YouTube Unlisted or Vimeo Pro Starter | **$0.00 – $9.00 / month** |
| **AI LLM Services** | OpenAI `gpt-4o-mini` or Google `gemini-1.5-flash` | **~$5.00 – $15.00 / month** (50k tokens/day allowance per active user) |
| **Total Estimated Operating Cost** | | **~$13.50 – $32.50 / month** |

> [!TIP]
> The platform can run completely free of AI API charges by setting `AI_PROVIDER=mock`, which utilizes VIBHA's deterministic pedagogical tutor and MCQ generator without external network calls.
