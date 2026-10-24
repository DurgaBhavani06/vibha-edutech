# VIBHA EdTech — Google Cloud Firebase & Firestore Integration Guide

This guide provides an end-to-end technical specification of how VIBHA EdTech integrates with **Google Cloud Firebase** and **Cloud Firestore**, replacing the traditional relational database with a scalable serverless NoSQL document store.

---

## 1. Architectural Overview

```
 ┌────────────────────────────────────────────────────────┐
 │            Next.js 14 Frontend Application             │
 │          (TypeScript, Tailwind CSS, SSR/Client)        │
 └──────────────────────────┬─────────────────────────────┘
                            │ REST API Requests (/api/v1/*)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │                  FastAPI REST Backend                  │
 │      (OWASP Security Headers, Rate Limiting, RBAC)     │
 └─────────────┬────────────────────────────┬─────────────┘
               │                            │
   (Direct Firestore SDK)         (Optional Fallback)
               ▼                            ▼
 ┌───────────────────────────┐    ┌───────────────────────┐
 │   Google Cloud Firestore  │    │ Relational SQLite/PG  │
 │  (Serverless Document DB) │    │      (vibha.db)       │
 └───────────────────────────┘    └───────────────────────┘
```

### Why Use Firebase Admin SDK in the Backend?
- **Server-Side Role-Based Access Control (RBAC)**: Roles (`SUPER_ADMIN`, `TRAINER`, `COLLEGE_COORDINATOR`, `STUDENT`) are never resolved or trusted from client-side cookies or browsers. The FastAPI backend verifies every claim against Firestore.
- **Assessment Integrity**: Quiz answer keys and grading logic remain strictly on the backend, preventing students from inspecting network payloads to find correct MCQ options.
- **AI Quota & Cost Control**: AI Tutor requests and rate limits are enforced before consuming external OpenAI/Gemini tokens.
- **Zero Frontend Code Rewrites**: The existing Next.js frontend continues to interact seamlessly with `/api/v1/*` endpoints without needing complex client-side Firebase Auth SDK rewrites.

---

## 2. Step-by-Step Setup in Firebase Console

### Step 2.1: Create a Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or **"Create a project"**).
3. Enter a project name, e.g., `vibha-edtech-production`.
4. (Optional) Disable or enable Google Analytics based on your preference, then click **"Create project"**.

### Step 2.2: Enable Cloud Firestore
1. In your Firebase project dashboard, click **"Build"** in the left sidebar $\rightarrow$ Select **"Firestore Database"**.
2. Click **"Create database"**.
3. **Database location**: Choose a multi-region or region closest to your users:
   - For India: `asia-south1` (Mumbai).
   - For Global/US: `us-central1` (Iowa).
4. **Security rules**: Select **"Start in production mode"**. (Direct public access is denied; all operations will be authenticated through the FastAPI Admin SDK).
5. Click **"Create"**.

### Step 2.3: Generate Service Account Private Key
1. In the Firebase Console, click the **Gear icon (Project settings)** next to "Project Overview" at the top of the left sidebar.
2. Select the **"Service accounts"** tab.
3. Ensure **"Firebase Admin SDK"** and **Python** are selected.
4. Click the blue button: **"Generate new private key"**.
5. Confirm by clicking **"Generate key"** in the modal popup.
6. A file named `<project-id>-firebase-adminsdk-xxxxx.json` will download to your machine.

### Step 2.4: Place Key in VIBHA Project Root
1. Rename the downloaded file to **`firebase-key.json`**.
2. Copy or move this file into your VIBHA workspace root:
   ```
   C:\Users\Admin\Desktop\llm portal\firebase-key.json
   ```

---

## 3. Cloud Firestore Collection Schema Mapping

The relational tables from PostgreSQL/SQLite map directly to normalized Firestore document collections:

### 3.1 `users` Collection
Each document represents a registered platform user:
```json
// Collection: users | Document ID: "fb_user_101" or numeric string
{
  "id": "1",
  "email": "student@vibha.io",
  "full_name": "Aarav V. Mehta",
  "role": "STUDENT",
  "hashed_password": "$2b$12$...",
  "is_active": true,
  "organization_id": "1",
  "failed_login_attempts": 0,
  "locked_until": null,
  "created_at": "2026-10-23T10:00:00+00:00",
  "updated_at": "2026-10-23T10:00:00+00:00"
}
```

### 3.2 `courses` Collection
Each document represents an entire curriculum track with nested modules and lessons:
```json
// Collection: courses | Document ID: "1" or slug "full-stack-web-development"
{
  "id": "1",
  "slug": "full-stack-web-development",
  "title": "Full-Stack Web Development Track",
  "tagline": "Master modern Python, FastAPI, React, and scalable PostgreSQL architectures.",
  "category": "Full Stack",
  "level": "BEGINNER",
  "audience": "College Students & Freshers",
  "duration_weeks": 16,
  "hours_per_week": 10,
  "is_published": true,
  "prerequisites": ["Basic Python Syntax", "HTML/CSS Fundamentals"],
  "key_skills": ["FastAPI", "React", "Next.js", "SQLAlchemy", "PostgreSQL"],
  "modules": [
    {
      "id": "1",
      "title": "Module 1: Modern Backend Foundations",
      "order_index": 1,
      "lessons": [
        {
          "id": "1",
          "title": "REST API Architecture & HTTP Semantics",
          "slug": "lesson-1-1",
          "lesson_type": "VIDEO",
          "duration_min": 45,
          "content": "Comprehensive markdown notes on REST endpoints and idempotency.",
          "video_url": "https://commondatastorage.googleapis.com/.../BigBuckBunny.mp4",
          "is_preview": true
        }
      ]
    }
  ]
}
```

### 3.3 `enrollments` Collection
Tracks student course progress and completed lessons:
```json
// Collection: enrollments | Document ID: auto-generated or "user_course"
{
  "id": "enr_abc123",
  "user_id": "1",
  "course_id": "1",
  "status": "ACTIVE",
  "progress_percentage": 45,
  "completed_lessons": ["1", "2", "3"],
  "enrolled_at": "2026-10-23T10:30:00+00:00",
  "updated_at": "2026-10-23T11:00:00+00:00"
}
```

### 3.4 `assessments` Collection
Stores question banks with encrypted/hidden answer keys until evaluation:
```json
// Collection: assessments | Document ID: "1"
{
  "id": "1",
  "course_id": "1",
  "title": "Full-Stack Web & API Fundamentals Quiz",
  "assessment_type": "QUIZ",
  "passing_score": 70,
  "time_limit_minutes": 20,
  "is_published": true,
  "questions": [
    {
      "id": "q1",
      "question_text": "In RESTful API architecture, which HTTP method is designed to be idempotent?",
      "question_type": "MCQ",
      "options": [
        {"id": "A", "text": "POST"},
        {"id": "B", "text": "PUT"},
        {"id": "C", "text": "PATCH"},
        {"id": "D", "text": "CONNECT"}
      ],
      "correct_answer": "B",
      "points": 10,
      "explanation": "PUT is defined by RFC 7231 as an idempotent method."
    }
  ]
}
```

### 3.5 `document_chunks` Collection
Stores segmented, searchable knowledge passages used by the **VIBHA AI Tutor RAG** engine:
```json
// Collection: document_chunks | Document ID: auto-generated
{
  "id": "chk_xyz789",
  "document_id": "1",
  "course_id": "1",
  "chunk_index": 1,
  "content": "Chapter 1: REST API Standards. All endpoints must follow strict HTTP semantics...",
  "token_count": 60,
  "metadata_json": {"chapter": 1, "topic": "HTTP Semantics"}
}
```

---

## 4. Running the Migration Utility

The platform includes an automated migration utility [`backend/scripts/migrate_to_firestore.py`](file:///c:/Users/Admin/Desktop/llm%20portal/backend/scripts/migrate_to_firestore.py).

To migrate all sample data from SQLite into your live Firestore project:

```powershell
cd "c:\Users\Admin\Desktop\llm portal\backend"
.\.venv\Scripts\python scripts\migrate_to_firestore.py
```

### Expected Output:
```
=================================================================
      VIBHA EDTECH — CLOUD FIRESTORE MIGRATION UTILITY
=================================================================
Target Mode: Google Cloud Firestore
Project ID : vibha-edtech-production
-----------------------------------------------------------------
[+] Migrated 5 users to 'users' collection
[+] Migrated 1 organizations to 'organizations' collection
[+] Migrated 5 courses to 'courses' collection
[+] Migrated 1 enrollments to 'enrollments' collection
[+] Migrated 1 batches to 'batches' collection
[+] Migrated 1 assessments to 'assessments' collection
[+] Migrated 3 document chunks to 'document_chunks' collection
[+] Migrated 0 enquiries to 'enquiries' collection
-----------------------------------------------------------------
MIGRATION COMPLETED SUCCESSFULLY!
All database entities are now synchronized into Firebase Firestore.
=================================================================
```

---

## 5. Firebase Security Rules (`firestore.rules`)

In [`firestore.rules`](file:///c:/Users/Admin/Desktop/llm%20portal/firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lock direct browser read/write access.
    // All requests must pass through the authorized VIBHA FastAPI Backend.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Why Lock Direct Client-Side Access?
1. **Prevents API Key Leaks**: Browsers never hold master database write privileges.
2. **Enforces OWASP Controls**: Rate limiting, brute-force lockout, and input validation are executed by FastAPI before reaching the database.
3. **No Unmetered Usage**: Prevents malicious users from writing infinite documents to your Firebase project.

---

## 6. Free Tier vs. Paid Tier Costs (Firebase Spark Plan)

Firebase provides a generous **Spark Plan (Free Tier)** that easily covers development, testing, and small-to-medium campus cohorts:

| Resource | Firebase Spark Plan (Free) | Platform Estimated Daily Usage |
| :--- | :--- | :--- |
| **Document Reads** | **50,000 / day** | ~1,000 – 5,000 / day |
| **Document Writes** | **20,000 / day** | ~200 – 1,000 / day |
| **Document Deletes** | **20,000 / day** | ~10 – 50 / day |
| **Stored Data** | **1 GiB total** | ~15 – 50 MiB total |
| **Network Egress** | **10 GiB / month** | ~500 MiB / month |
| **Cost** | **$0.00 / month** | **100% Free** |

---

## 7. Verification & Health Monitoring

Verify that the platform recognizes your Firebase connection:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/v1/health" | ConvertTo-Json -Depth 4
```

Response:
```json
{
  "status": "healthy",
  "service": "VIBHA EdTech Platform",
  "version": "1.0.0",
  "database": "ok",
  "database_latency_ms": 1.35,
  "firebase": {
    "is_live": true,
    "project_id": "your-firebase-project-id",
    "mode": "Google Cloud Firestore",
    "credentials_found": true
  },
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
