from sqlalchemy.orm import Session
from app.data.sample_courses import SAMPLE_COURSES
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson, LessonType
from app.models.assessment import Assessment, AssessmentType
from app.models.question import Question, QuestionType
from app.models.batch import Batch
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationType
from app.models.organization_membership import OrganizationMembership
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.core.security import get_password_hash


def seed_courses_and_curriculum(db: Session) -> None:
    """Seed normalized relational courses, modules, and lessons if courses table is empty."""
    existing_count = db.query(Course).count()
    if existing_count == 0:
        for c_data in SAMPLE_COURSES:
            course = Course(
                slug=c_data["slug"],
                title=c_data["title"],
                tagline=c_data["tagline"],
                description=c_data["description"],
                category=c_data["category"],
                level=c_data["level"],
                audience=c_data["audience"],
                duration_weeks=c_data["duration_weeks"],
                hours_per_week=c_data["hours_per_week"],
                format=c_data["format"],
                prerequisites=c_data.get("prerequisites", []),
                key_skills=c_data.get("key_skills", []),
                modules=c_data.get("modules", []),
                projects=c_data.get("projects", []),
                is_published=True,
            )
            db.add(course)
            db.flush()

            # Create normalized modules & lessons
            for mod_idx, m_data in enumerate(c_data.get("modules", []), start=1):
                module = Module(
                    course_id=course.id,
                    title=m_data["title"],
                    description=m_data.get("description", ""),
                    order_index=mod_idx,
                )
                db.add(module)
                db.flush()

                for les_idx, l_data in enumerate(m_data.get("lessons", []), start=1):
                    l_type = LessonType.TEXT
                    type_str = l_data.get("type", "").upper()
                    if type_str in LessonType.__members__:
                        l_type = LessonType[type_str]
                    elif type_str == "LECTURE":
                        l_type = LessonType.VIDEO

                    lesson = Lesson(
                        module_id=module.id,
                        title=l_data["title"],
                        slug=f"lesson-{mod_idx}-{les_idx}",
                        lesson_type=l_type,
                        duration_min=l_data.get("duration_min", 45),
                        content=f"## {l_data['title']}\n\nWelcome to this interactive unit in **{m_data['title']}**.\n\n### Learning Objectives\n- Understand core principles and industry best practices.\n- Apply hands-on lab code and verify outputs.\n- Submit your solution for mentor feedback.\n\n```typescript\n// Example Code Snippet\nconsole.log('VIBHA practical learning in action');\n```",
                        video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" if l_type in [LessonType.VIDEO, LessonType.LAB] else None,
                        order_index=les_idx,
                        is_preview=(mod_idx == 1 and les_idx == 1),
                    )
                    db.add(lesson)

        db.commit()

    # Seed initial assessments if none exist
    if db.query(Assessment).count() == 0:
        first_course = db.query(Course).first()
        if first_course:
            quiz = Assessment(
                course_id=first_course.id,
                title="Full-Stack Web & API Fundamentals Quiz",
                description="Test your conceptual understanding of REST APIs, asynchronous execution, and database indexing.",
                assessment_type=AssessmentType.QUIZ,
                passing_score=70,
                time_limit_minutes=20,
                is_published=True,
            )
            db.add(quiz)
            db.flush()

            q1 = Question(
                assessment_id=quiz.id,
                question_text="In RESTful API architecture, which HTTP method is designed to be idempotent and completely replace an existing resource?",
                question_type=QuestionType.MCQ,
                options=[
                    {"id": "A", "text": "POST"},
                    {"id": "B", "text": "PUT"},
                    {"id": "C", "text": "PATCH"},
                    {"id": "D", "text": "CONNECT"},
                ],
                correct_answer="B",
                points=10,
                explanation="PUT is idempotent and designed to replace the target resource in its entirety with the request payload.",
                order_index=1,
            )
            q2 = Question(
                assessment_id=quiz.id,
                question_text="Which React hook is used to encapsulate side-effects such as remote data queries, subscriptions, and DOM updates?",
                question_type=QuestionType.MCQ,
                options=[
                    {"id": "A", "text": "useState"},
                    {"id": "B", "text": "useEffect"},
                    {"id": "C", "text": "useMemo"},
                    {"id": "D", "text": "useCallback"},
                ],
                correct_answer="B",
                points=10,
                explanation="useEffect executes after the component renders and cleans up previous side effects when dependencies change.",
                order_index=2,
            )
            q3 = Question(
                assessment_id=quiz.id,
                question_text="What is the primary performance benefit of implementing a B-Tree index on a frequently filtered database column?",
                question_type=QuestionType.MCQ,
                options=[
                    {"id": "A", "text": "Reduces disk space by compressing text columns"},
                    {"id": "B", "text": "Decreases search complexity from O(N) full-table scans to O(log N)"},
                    {"id": "C", "text": "Prevents SQL injection vulnerabilities"},
                    {"id": "D", "text": "Enforces automatic database backups"},
                ],
                correct_answer="B",
                points=10,
                explanation="Indexes allow the database engine to locate target rows in O(log N) time rather than scanning every row in the table.",
                order_index=3,
            )
            db.add_all([q1, q2, q3])
            db.commit()

    # Seed sample batch if none exist and a trainer exists
    if db.query(Batch).count() == 0:
        first_course = db.query(Course).first()
        trainer = db.query(User).filter(User.role == UserRole.TRAINER).first()
        if first_course:
            batch = Batch(
                name="Full-Stack Web Cohort 2026-A",
                code="FS-2026-A",
                course_id=first_course.id,
                trainer_id=trainer.id if trainer else None,
                max_students=35,
                is_active=True,
            )
            db.add(batch)
            db.commit()

    # Seed approved course documents & chunks for RAG if none exist
    if db.query(Document).count() == 0:
        first_course = db.query(Course).first()
        if first_course:
            doc = Document(
                course_id=first_course.id,
                title="VIBHA Full-Stack Systems Architecture Guide",
                source_filename="fullstack_systems_architecture_v1.md",
                file_type="MARKDOWN",
                is_approved=True,
            )
            db.add(doc)
            db.flush()

            c1 = DocumentChunk(
                document_id=doc.id,
                chunk_index=1,
                content="Chapter 1: REST API Standards and Idempotency. In VIBHA enterprise systems, all REST endpoints must follow strict HTTP semantics. GET requests must be read-only and cacheable. POST is used for resource creation. PUT is idempotent and replaces the complete resource payload. PATCH applies partial modifications. DELETE is idempotent.",
                token_count=60,
                metadata_json={"chapter": 1, "topic": "HTTP Semantics"},
            )
            c2 = DocumentChunk(
                document_id=doc.id,
                chunk_index=2,
                content="Chapter 2: Relational Schema Design and ACID Guarantees. Relational databases enforce normalization up to 3NF. Atomicity ensures transactions either fully commit or completely rollback. Consistency maintains all foreign keys and unique constraints. Isolation prevents dirty and non-repeatable reads. Durability ensures committed WAL writes survive crashes.",
                token_count=65,
                metadata_json={"chapter": 2, "topic": "ACID and Schema"},
            )
            c3 = DocumentChunk(
                document_id=doc.id,
                chunk_index=3,
                content="Chapter 3: Asynchronous Execution and React State Lifecycle. Modern frontends use React 18+ App Router. Server components render static subtrees on the server without shipping JavaScript bundles. Client components with 'use client' handle interactivity and local state. Side effects must execute in useEffect hooks with explicit dependency arrays.",
                token_count=70,
                metadata_json={"chapter": 3, "topic": "React State"},
            )
            db.add_all([c1, c2, c3])
            db.commit()

    # Seed demo role-based users if no users exist
    if db.query(User).count() == 0:
        # Default strong passwords for local exploration
        admin_user = User(
            email="admin@vibha.io",
            hashed_password=get_password_hash("VibhaAdmin2026!"),
            full_name="VIBHA Platform Administrator",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
        trainer_user = User(
            email="trainer@vibha.io",
            hashed_password=get_password_hash("VibhaTrainer2026!"),
            full_name="Prof. Rajesh K. Sharma",
            role=UserRole.TRAINER,
            is_active=True,
        )
        coordinator_user = User(
            email="coordinator@vibha.io",
            hashed_password=get_password_hash("VibhaCollege2026!"),
            full_name="Dr. Sunita Deshmukh",
            role=UserRole.COLLEGE_COORDINATOR,
            is_active=True,
        )
        student_user = User(
            email="student@vibha.io",
            hashed_password=get_password_hash("VibhaStudent2026!"),
            full_name="Aarav V. Mehta",
            role=UserRole.STUDENT,
            is_active=True,
        )
        pro_user = User(
            email="pro@vibha.io",
            hashed_password=get_password_hash("VibhaPro2026!"),
            full_name="Pooja R. Iyer",
            role=UserRole.PROFESSIONAL_LEARNER,
            is_active=True,
        )
        db.add_all([admin_user, trainer_user, coordinator_user, student_user, pro_user])
        db.flush()

        # Create sample partner college organization
        org = Organization(
            name="Apex Institute of Engineering & Technology",
            slug="apex-institute-of-engineering-technology",
            code="APEX-TECH-2026",
            type=OrganizationType.COLLEGE,
            contact_email="partnerships@apex-institute.edu",
            contact_phone="+91 98765 43210",
            address="Viman Nagar, Pune, Maharashtra 411014",
            is_active=True,
        )
        db.add(org)
        db.flush()

        # Link college coordinator and student to organization
        m1 = OrganizationMembership(
            organization_id=org.id,
            user_id=coordinator_user.id,
            role_in_org="COORDINATOR",
        )
        m2 = OrganizationMembership(
            organization_id=org.id,
            user_id=student_user.id,
            role_in_org="STUDENT",
        )
        db.add_all([m1, m2])

        # Link first course enrollment for student
        first_course = db.query(Course).first()
        if first_course:
            enr = Enrollment(
                user_id=student_user.id,
                course_id=first_course.id,
                status=EnrollmentStatus.ACTIVE,
                progress_percentage=45,
            )
            db.add(enr)

            # Assign trainer to sample batch
            batch = db.query(Batch).first()
            if batch:
                batch.trainer_id = trainer_user.id

        db.commit()

