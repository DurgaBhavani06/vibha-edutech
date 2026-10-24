# VIBHA EdTech — Full-Stack Platform & LMS

> **Motto:** *"Learn Skills. Build Projects. Grow Careers."*

A full-stack, enterprise-grade EdTech and Learning Management System (LMS) built with Next.js (TypeScript, Tailwind CSS), FastAPI (Python 3.12), SQLAlchemy, Alembic, and PostgreSQL.

---

## Architecture & Project Structure

The codebase is organized into two primary applications with clean separation of concerns:

```
vibha-edtech/
├── backend/                              # FastAPI REST API (Python 3.12)
│   ├── alembic/                          # Database migration scripts
│   │   ├── versions/
│   │   │   ├── 001_initial_schema.py     # Milestone 1: enquiries, courses
│   │   │   ├── 002_auth_and_organizations.py # Milestone 2: users, orgs, tokens, audit logs
│   │   │   ├── 003_lms_modules_lessons_enrollments.py # Milestone 3: modules, lessons, enrollments, progress
│   │   │   ├── 004_assessments_batches_certificates.py # Milestone 4: assessments, submissions, certificates
│   │   │   ├── 005_college_training_requests.py # Milestone 5: college training requests & proposals
│   │   │   └── 006_ai_usage_documents_chunks.py # Milestone 6: AI usage tracking, documents & RAG chunks
│   │   ├── env.py                        # Migration environment configuration
│   │   └── script.py.mako
│   ├── app/
│   │   ├── api/                          # Dependencies & route injection
│   │   │   ├── deps.py                   # Server-side auth, RBAC & tenant checkers
│   │   │   └── v1/                       # Versioned REST endpoints
│   │   │       ├── endpoints/
│   │   │       │   ├── ai.py             # Milestone 6: AI Tutor, RAG & Question Generator
│   │   │       │   ├── assessments.py    # Milestone 4: Quizzes, submissions, certificates
│   │   │       │   ├── auth.py           # Register, Login, Session, Password Reset
│   │   │       │   ├── batches.py        # Milestone 4: Batches & attendance tracking
│   │   │       │   ├── college.py        # Milestone 5: College coordinator & tenant reports
│   │   │       │   ├── courses.py        # Course catalog & Admin curriculum management
│   │   │       │   ├── enrollments.py    # Course enrollment & progress aggregation
│   │   │       │   ├── enquiries.py      # Form submission, honeypot & retrieval
│   │   │       │   ├── health.py         # System & DB connectivity health check
│   │   │       │   ├── lessons.py        # Lesson content delivery & completion tracking
│   │   │       │   ├── organizations.py  # Tenant-isolated organization management
│   │   │       │   └── users.py          # User management & profile endpoints
│   │   │       └── api.py                # Unified v1 router
│   │   ├── core/
│   │   │   ├── config.py                 # Pydantic BaseSettings, JWT keys, AI quotas & timeouts
│   │   │   ├── database.py               # Engine, sessionmaker, and DB dependencies
│   │   │   ├── security.py               # Bcrypt hashing, JWT creation & verification
│   │   │   └── seeder.py                 # Automatic DB seeding for courses, modules, lessons & docs
│   │   ├── services/                     # Business logic & Database / AI abstractions
│   │   │   ├── ai/
│   │   │   │   ├── base.py               # BaseLLMProvider interface & LLMResult
│   │   │   │   ├── mock_provider.py      # Offline-first deterministic pedagogical provider
│   │   │   │   ├── openai_provider.py    # OpenAI GPT async client
│   │   │   │   ├── gemini_provider.py    # Google Gemini async client
│   │   │   │   └── factory.py            # Provider resolver & offline fallback
│   │   │   └── firebase/                 # Firebase Cloud Firestore Integration
│   │   │       ├── client.py             # Firebase Admin SDK & connection manager
│   │   │       └── repositories.py       # Firestore document repositories (users, courses, etc.)
│   │   ├── models/                       # SQLAlchemy declarative ORM models
│   │   │   ├── ai_usage.py               # AI token tracking & cost auditing
│   │   │   ├── assessment.py             # Quiz & assessment definitions
│   │   │   ├── assessment_attempt.py     # Student quiz attempts & scores
│   │   │   ├── attendance.py             # Student batch attendance records
│   │   │   ├── audit_log.py              # Security audit log
│   │   │   ├── batch.py                  # Campus student cohorts
│   │   │   ├── batch_membership.py       # Batch enrollment associations
│   │   │   ├── certificate.py            # Tamper-evident verified credentials
│   │   │   ├── course.py                 # Course data model with trainer association
│   │   │   ├── document.py               # Approved reference documents for RAG
│   │   │   ├── document_chunk.py         # Searchable text chunks with token counts
│   │   │   ├── enrollment.py             # Student course enrollments & progress %
│   │   │   ├── enquiry.py                # Enquiry model with types & status enums
│   │   │   ├── lesson.py                 # Lesson model (video, text, resources, quiz)
│   │   │   ├── lesson_progress.py        # Granular student lesson completion logs
│   │   │   ├── module.py                 # Course modules / chapters
│   │   │   ├── organization.py           # Multi-tenant organizations
│   │   │   ├── organization_membership.py# College/Org membership mapping
│   │   │   ├── password_reset.py         # Password recovery tokens with expiration
│   │   │   ├── question.py               # Multiple-choice question bank
│   │   │   ├── submission.py             # Assignment & project PR submissions
│   │   │   ├── training_request.py       # College semester training proposals
│   │   │   └── user.py                   # User model with role & lockout attributes
│   │   ├── schemas/                      # Pydantic v2 validation models
│   │   │   ├── course.py                 # CourseSummary, CourseDetail schemas
│   │   │   ├── enrollment.py             # EnrollmentCreate, EnrollmentResponse schemas
│   │   │   ├── enquiry.py                # EnquiryCreate, EnquiryResponse schemas
│   │   │   ├── lesson.py                 # LessonCreate, LessonResponse schemas
│   │   │   ├── module.py                 # ModuleCreate, ModuleResponse schemas
│   │   │   ├── organization.py           # OrganizationCreate, OrganizationResponse
│   │   │   ├── token.py                  # Token, TokenPayload schemas
│   │   │   └── user.py                   # UserCreate, UserLogin, PasswordReset schemas
│   │   └── main.py                       # FastAPI application & startup lifecycle
│   ├── tests/                            # Automated test suite (Pytest - 58 tests)
│   │   ├── conftest.py                   # Isolated in-memory SQLite fixtures
│   │   ├── test_auth.py                  # Auth, lockout, RBAC, reset tests
│   │   ├── test_courses.py               # Course catalog & search tests
│   │   ├── test_enquiries.py             # Validation, honeypot & persistence tests
│   │   ├── test_health.py                # Health & metadata tests
│   │   ├── test_lms.py                   # LMS enrollments, lessons, progress tests
│   │   ├── test_organizations.py         # Tenant isolation & college coordinator tests
│   │   ├── test_milestone4.py            # Quizzes, assessments, certificates & verification tests
│   │   ├── test_milestone5.py            # College batches, student roster & reports tests
│   │   ├── test_milestone6.py            # AI Tutor, RAG, Question Generator & quota tests
│   │   ├── test_milestone7.py            # OWASP security headers, rate limiting, masked logging & backups
│   │   └── test_firebase.py              # Firebase Cloud Firestore repositories & CRUD tests
│   ├── scripts/                          # Operational & security utilities
│   │   ├── backup_db.py                  # Compressed online DB backup with SHA256 manifest
│   │   ├── restore_db.py                 # Checksum-verified disaster recovery restore
│   │   ├── migrate_to_firestore.py       # Synchronize relational data to Cloud Firestore
│   │   └── verify_security.py            # 7-point automated security compliance audit
│   ├── alembic.ini                       # Migration config
│   ├── pyproject.toml                    # Python project configuration
│   ├── requirements.txt                  # Pinned backend dependencies
│   └── Dockerfile                        # Multi-stage non-root container image
│
├── frontend/                             # Next.js 14 App Router (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── about/page.tsx            # About VIBHA & anti-hype philosophy
│   │   │   ├── contact/page.tsx          # Multi-purpose contact & enquiry center
│   │   │   ├── courses/page.tsx          # Filterable catalog with transparency notice
│   │   │   ├── courses/[slug]/page.tsx   # Dynamic syllabus, enrollment & preview
│   │   │   ├── dashboard/                # Unified Role-based dashboard router
│   │   │   │   ├── admin/page.tsx        # Super Admin & Admin curriculum/user console
│   │   │   │   ├── college/page.tsx      # College Coordinator console
│   │   │   │   ├── courses/[slug]/lessons/[lessonId]/page.tsx # Interactive Lesson Player
│   │   │   │   ├── professional/page.tsx # Working Professional track console
│   │   │   │   ├── student/page.tsx      # Student learner console with active courses
│   │   │   │   ├── trainer/page.tsx      # Faculty & Trainer console
│   │   │   │   └── page.tsx              # Dynamic session & role router
│   │   │   ├── for-colleges/page.tsx     # Institutional partnerships & college LMS
│   │   │   ├── for-freshers/page.tsx     # Graduate transition & codebase immersion
│   │   │   ├── for-students/page.tsx     # Campus learning & project mentorship
│   │   │   ├── for-working-professionals/page.tsx # Senior upskilling
│   │   │   ├── forgot-password/page.tsx  # Password recovery request
│   │   │   ├── login/page.tsx            # Secure user login
│   │   │   ├── practical-projects/page.tsx # Project-first pedagogy manifesto
│   │   │   ├── privacy/page.tsx          # Privacy Policy
│   │   │   ├── refund/page.tsx           # Refund & Cancellation Policy
│   │   │   ├── register/page.tsx         # Account registration by learning track
│   │   │   ├── reset-password/page.tsx   # Token-validated password reset
│   │   │   ├── terms/page.tsx            # Terms of Service
│   │   │   ├── trainers-and-mentors/page.tsx # Educator standards & criteria
│   │   │   ├── layout.tsx                # Global HTML shell, Navbar & Footer
│   │   │   └── page.tsx                  # Responsive Homepage
│   │   ├── components/                   # Reusable accessible UI components
│   │   │   ├── CourseCard.tsx            # Course card with badges & metadata
│   │   │   ├── EnrollButton.tsx          # Dynamic enrollment trigger & state handler
│   │   │   ├── EnquiryForm.tsx           # Dynamic form with anti-spam & reference tracking
│   │   │   ├── Footer.tsx                # Corporate footer with direct contacts
│   │   │   └── Navbar.tsx                # Dynamic navbar with session awareness
│   │   ├── context/                      # React context providers
│   │   │   └── AuthContext.tsx           # Session management & user profile state
│   │   ├── lib/
│   │   │   ├── api.ts                    # Type-safe API client with resilient fallbacks
│   │   │   ├── auth.ts                   # Token storage & auth endpoints client
│   │   │   └── lms.ts                    # LMS client for enrollments, lessons, progress
│   │   └── types/                        # Shared TypeScript interfaces
│   │       ├── auth.ts                   # User, UserRole, AuthTokens contracts
│   │       ├── index.ts                  # Course, Enquiry contracts
│   │       └── lms.ts                    # Enrollment, Module, Lesson, Progress contracts
│   ├── package.json                      # Next.js, React, Tailwind & Lucide icons
│   ├── tailwind.config.ts                # Brand color definitions
│   ├── tsconfig.json                     # TypeScript strict configuration
│   └── Dockerfile                        # Multi-stage production container
│
├── docker-compose.yml                    # Multi-container orchestration (Postgres + API + Web)
├── .env.example                          # Environment template
└── README.md                             # Comprehensive technical documentation
```

---

## Milestones Implemented

### Milestone 1: Design System, Public Platform & Enquiry Engine
- **Branding**: Navy Blue (`#102A43`), Accent Teal (`#0D9488`), White, and Light Slate (`#F0F4F8`). Tagline: *"Learn Skills. Build Projects. Grow Careers."*
- **Public Website & Navigation**: Mobile drawer navigation, audience programs, and transparent corporate policies.
- **Audience Service Sections**: `/for-students`, `/for-colleges`, `/for-freshers`, `/for-working-professionals`, `/practical-projects`, `/trainers-and-mentors`, `/about`.
- **Course Catalog & Detail System**: Curricula filterable by audience, level, and keywords, paired with dynamic detail templates (`/courses/[slug]`).
- **Enquiry System with Anti-Spam & Persistence**: Pydantic v2 validation, honeypot bot trap, reference tracking (`VIB-YYYY-HEX`), and database persistence.

### Milestone 2: Database, Authentication, Roles & Authorization
- **Role-Based Access Control (RBAC)**:
  - 6 server-enforced roles: `SUPER_ADMIN`, `ADMIN`, `TRAINER`, `COLLEGE_COORDINATOR`, `STUDENT`, `PROFESSIONAL_LEARNER`.
  - Roles are **always resolved server-side** from trusted database records (never trusted from browser tokens or headers).
  - Role escalation prevention: public registration cannot assign administrative roles.
- **Authentication & Session Management**:
  - Secure bcrypt password hashing with salt (rounds=12).
  - Short-lived JWT access tokens + long-lived refresh tokens.
  - Dual delivery: `Authorization: Bearer <token>` header support and secure HTTP-only cookies (`access_token`).
- **Account Protection & Rate Limiting**:
  - Account lockout triggered after 5 consecutive failed password attempts for 15 minutes.
  - Audit logging for all security events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`, `PASSWORD_RESET`).
- **Password Recovery Flow**:
  - Cryptographically secure single-use reset tokens with 1-hour expiration.
  - Protection against email enumeration.
- **Multi-Tenant College Isolation**:
  - `organizations` and `organization_memberships` entities.
  - College Coordinators are restricted strictly to their own institution's data. Accessing records from other colleges returns `403 Forbidden`.
- **Role-Specific Dashboards**:
  - `/dashboard`: Dynamically verifies authenticated session with backend and routes to verified role console.
  - `/dashboard/student`: Active enrollment progress, lab tasks, PR review queue.
  - `/dashboard/professional`: Weekend cohorts, architecture reviews, GST tax invoices.
  - `/dashboard/trainer`: Assigned batches, student rosters, PR review queue.
  - `/dashboard/college`: Tenant-isolated campus cohorts, attendance, and NAAC/NBA reports.
  - `/dashboard/admin`: Live platform directory for Users, Inquiries triage, and Organization tenants.

### Milestone 3: Course Management, Enrolment, Lessons & Progress Tracking
- **Course & Curriculum Structure**:
  - Relational hierarchy: `Course` -> `Module` -> `Lesson` with sequential ordering (`order_index`).
  - Lesson content types supported: `VIDEO`, `TEXT`, `RESOURCE`, `QUIZ`, `ASSIGNMENT`.
  - Content details: Duration, external controlled video embedding URLs, downloadable resource links, and study text.
- **Student Enrollment Engine**:
  - `POST /api/v1/enrollments`: One-click course enrollment with duplicate prevention (`400 Bad Request` if already enrolled).
  - `GET /api/v1/enrollments/my`: Live enrolled courses list with aggregated progress percentages.
  - `GET /api/v1/enrollments/{course_id}/progress`: Granular module and lesson completion statuses.
- **Interactive Lesson Player**:
  - Route: `/dashboard/courses/[slug]/lessons/[lessonId]`.
  - Sticky collapsible curriculum sidebar highlighting completed lessons with checkmarks.
  - Responsive video embed player, markdown study notes, resource attachments.
  - One-click "Mark as Completed" button triggering real-time completion tracking and next-lesson auto-navigation.
- **Progress Recalculation Engine**:
  - `POST /api/v1/lessons/{id}/complete`: Atomically logs progress in `lesson_progress` table and dynamically recalculates course progress percentage (`completed_lessons / total_lessons * 100`).
  - Updates enrollment status to `COMPLETED` upon reaching 100%.
- **Admin Curriculum & Course Console**:
  - `/dashboard/admin` includes "Courses & Curricula" management tab.
  - Course status publishing toggle (`DRAFT` <-> `PUBLISHED`).
  - Course creation dialog with category, level, duration, and prerequisites.
  - Module management with sub-lesson sequencing.

### Milestone 4: Assessments, Submissions, Attendance & Trainer Dashboards
- **Assessments & Question Banks**:
  - `assessments`, `questions`, and `assessment_attempts` relational entities.
  - Multiple-choice questions (MCQs) with options, point weightings, and mentor explanations.
  - **Zero Answer Leakage**: Student-facing endpoints (`GET /assessments/{id}`) strictly scrub `correct_answer` and `explanation`.
  - Real-time quiz evaluation (`POST /assessments/{id}/attempt`) dynamically computing score, total points, pass/fail status, and revealing detailed per-question post-submission feedback.
  - Interactive quiz UI: `/dashboard/assessments/[id]`.
- **Assignment Submissions & Mentor Code Review**:
  - `submissions` entity supporting project title, GitHub repository link, live demo URL, and architectural notes.
  - Pending review queue (`GET /submissions/pending`) for trainers and faculty.
  - Structured grading interface (`PUT /submissions/{id}/grade`) with outcome status (`GRADED` / `REJECTED`), numerical score (0-100), and detailed mentor feedback.
- **Batches & Attendance Tracking**:
  - `batches`, `batch_memberships`, and `attendance` entities.
  - Trainer assigned cohorts with student roster inspection (`GET /batches/{id}`).
  - Daily session attendance entry (`POST /attendance/batch/{batch_id}`) supporting `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED` with per-student remarks.
  - Automated cohort attendance analytics & compliance rates (`GET /attendance/batch/{batch_id}`).
- **Tamper-Evident Certificates & Verification**:
  - `certificates` entity with unique cryptographic verification codes (`VIB-CERT-YYYY-<8-HEX>`).
  - Strict eligibility rules: Requires 100% curriculum completion and passing grades on required assessments. Registration alone never qualifies.
  - Public verification portal: `/verify` and `/verify/[code]` allowing real-time authentication of certificates without requiring platform login.
  - Administrative certificate revocation support (`PATCH /certificates/{id}/revoke`).
- **Interactive Trainer Dashboard**:
  - `/dashboard/trainer` fully interactive with three operational consoles:
    1. Assigned Batches & Student Rosters
    2. Attendance Entry & Compliance Analytics
    3. Assignment Grading & Code Review Queue

### Milestone 5: College Organizations, Batches & Reports
- **Multi-Tenant Data Isolation**:
  - Strict server-side verification (`check_organization_access`) on every college endpoint.
  - College Coordinators are strictly restricted to their own institution's data; unauthorized cross-college requests return `403 Forbidden`.
  - Super Admin and Admin retain system-wide directory visibility.
- **Authorized Student Directories**:
  - `GET /api/v1/colleges/{org_id}/students`: Filtered to authorized student learners affiliated with the college.
  - Real-time status reporting: Course completions, active batch enrollments, and certified graduate counts.
- **Campus Cohort Batch Management**:
  - `GET /api/v1/colleges/{org_id}/batches`: Institutional cohort overview with enrolled capacities and dates.
  - `POST /api/v1/colleges/{org_id}/batches`: College coordinators can directly create campus cohorts mapped to their college.
- **NAAC & NBA Accreditation Compliance Reporting**:
  - `GET /api/v1/colleges/{org_id}/reports`: Relational audit report tracking Criterion 1 (Curricular Aspects & Value-Added Courses) and Criterion 2 (Teaching-Learning, Experiential Capstones & Attendance Rates).
  - One-click CSV export: `GET /api/v1/colleges/{org_id}/reports/export` generating official audit spreadsheets.
- **Semester Training Proposals Engine**:
  - `training_requests` entity for institutional curriculum requests.
  - `POST /api/v1/colleges/{org_id}/training-requests`: Submit proposals with target audience, student count, start date, and hybrid/on-campus delivery mode.
  - `PATCH /api/v1/colleges/training-requests/{id}/status`: Administrative approval and scheduling pipeline.
- **Interactive College Coordinator Dashboard**:
  - `/dashboard/college` with live organization profile editing, campus cohort creation, searchable student rosters, accreditation metrics, and proposal submissions.

---

## Automated Test Verification

### Backend Tests (Pytest - 42 Tests)

```bash
cd backend
pytest tests -v
```

All 42 tests pass:
- `test_register_student_success`
- `test_register_duplicate_email_fails`
- `test_register_weak_password_fails`
- `test_register_admin_role_escalation_prevented`
- `test_login_success_and_cookie`
- `test_login_wrong_password_fails`
- `test_login_account_lockout_after_failed_attempts`
- `test_get_me_authenticated`
- `test_get_me_unauthenticated_fails`
- `test_rbac_student_forbidden_from_admin_route`
- `test_rbac_admin_allowed_on_admin_route`
- `test_password_reset_flow`
- `test_create_and_list_organization_by_admin`
- `test_tenant_isolation_college_coordinator`
- `test_list_all_courses`
- `test_filter_courses_by_audience`
- `test_search_courses`
- `test_get_valid_course_detail`
- `test_get_nonexistent_course_detail`
- `test_create_valid_student_enquiry`
- `test_create_college_training_enquiry`
- `test_validation_error_invalid_email`
- `test_validation_error_too_short_message`
- `test_validation_error_invalid_phone`
- `test_honeypot_anti_spam_trap`
- `test_list_and_filter_enquiries`
- `test_root_endpoint`
- `test_health_check_endpoint`
- `test_admin_create_course_and_module_and_lesson`
- `test_student_enrollment_in_course`
- `test_duplicate_enrollment_rejected`
- `test_lesson_completion_and_progress_recalculation`
- `test_batch_creation_and_student_roster`
- `test_attendance_marking_and_summary`
- `test_assessment_flow_answers_hidden_and_evaluation`
- `test_assignment_submission_and_trainer_grading`
- `test_certificate_eligibility_and_public_verification`
- `test_college_coordinator_profile_and_tenant_boundary`
- `test_cross_college_student_isolation`
- `test_college_batch_creation_and_isolation`
- `test_college_reports_and_csv_export`
- `test_college_training_request_proposal_flow`
- `test_ai_tutor_modes_hints_vs_explanation`
- `test_ai_quota_rate_limiting`
- `test_rag_document_assistant_grounding_and_citations`
- `test_question_generator_role_enforcement_and_trainer_review`
- `test_ai_usage_stats`
- `test_owasp_security_headers_present_on_all_responses`
- `test_rate_limiting_enforcement_and_retry_after`
- `test_secret_masking_filter_redacts_credentials_in_logs`
- `test_file_upload_security_and_path_traversal_prevention`
- `test_database_backup_generation_and_integrity_checksum`
- `test_enhanced_health_check_endpoint`
- `test_firebase_client_initialization_and_status`
- `test_firestore_users_repository_crud_and_lockout`
- `test_firestore_courses_repository_and_search`
- `test_firestore_enrollments_repository_and_progress_tracking`
- `test_firestore_enquiries_repository`

### Cloud Firestore Migration

To synchronize all local relational courses, users, and curricula into your Firebase Cloud Firestore project:

```bash
cd backend
python scripts/migrate_to_firestore.py
```

### Security Audit Check

```bash
cd backend
python scripts/verify_security.py
```
Audits SECRET_KEY entropy, DEBUG status, OWASP headers, rate limiting, masked logging, bcrypt password hashing, and lockout thresholds.

### Frontend Production Build

```bash
cd frontend
npm run build
```

Prerenders all 28 static and dynamic routes with zero TypeScript errors.

---

## Production Deployment

Complete low-cost deployment instructions, Let's Encrypt SSL configuration, automated backup crons, and cloud budget estimates are available in [DEPLOYMENT.md](file:///c:/Users/Admin/Desktop/llm%20portal/DEPLOYMENT.md).

```bash
# Production multi-container launch
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## Quick Start & Running Locally

### 1. Backend Server
```powershell
cd backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger): `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

### 2. Frontend Web App
```powershell
cd frontend
npm run dev
```
- Web Application: `http://localhost:3000`
- Sign in: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`
- Dashboard: `http://localhost:3000/dashboard`
