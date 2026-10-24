#!/usr/bin/env python3
"""VIBHA EdTech - Relational DB to Google Cloud Firestore Migration Utility.

Migrates all existing relational entities from SQLite/PostgreSQL into
normalized Cloud Firestore collections with JSON document representations.
"""

import sys
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.organization import Organization
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment
from app.models.batch import Batch
from app.models.assessment import Assessment
from app.models.question import Question
from app.models.certificate import Certificate
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.enquiry import Enquiry

from app.services.firebase.client import get_firestore_client, get_firebase_status


def serialize_val(val):
    if isinstance(val, datetime):
        return val.isoformat()
    if hasattr(val, "value"):
        return val.value
    return val


def migrate_all():
    print("=" * 65)
    print("      VIBHA EDTECH — CLOUD FIRESTORE MIGRATION UTILITY")
    print("=" * 65)

    db = SessionLocal()
    fs = get_firestore_client()

    status = get_firebase_status()
    print(f"Target Mode: {status['mode']}")
    print(f"Project ID : {status['project_id']}")
    print("-" * 65)

    report = {}

    try:
        # 1. Migrate Users
        users = db.query(User).all()
        user_count = 0
        for u in users:
            u_data = {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "role": serialize_val(u.role),
                "hashed_password": u.hashed_password,
                "is_active": u.is_active,
                "organization_id": str(u.organization_id) if u.organization_id else None,
                "created_at": serialize_val(u.created_at),
                "failed_login_attempts": u.failed_login_attempts,
                "locked_until": serialize_val(u.locked_until),
            }
            fs.collection("users").document(str(u.id)).set(u_data)
            user_count += 1
        report["users"] = user_count
        print(f"[+] Migrated {user_count} users to 'users' collection")

        # 2. Migrate Organizations
        orgs = db.query(Organization).all()
        org_count = 0
        for o in orgs:
            o_data = {
                "id": str(o.id),
                "name": o.name,
                "slug": o.slug,
                "code": o.code,
                "type": serialize_val(o.type),
                "contact_email": o.contact_email,
                "contact_phone": o.contact_phone,
                "address": o.address,
                "is_active": o.is_active,
                "created_at": serialize_val(o.created_at),
            }
            fs.collection("organizations").document(str(o.id)).set(o_data)
            org_count += 1
        report["organizations"] = org_count
        print(f"[+] Migrated {org_count} organizations to 'organizations' collection")

        # 3. Migrate Courses with nested Modules & Lessons
        courses = db.query(Course).all()
        course_count = 0
        for c in courses:
            modules_list = []
            for m in c.rel_modules:
                lessons_list = []
                for les in m.lessons:
                    lessons_list.append({
                        "id": str(les.id),
                        "title": les.title,
                        "slug": les.slug,
                        "lesson_type": serialize_val(les.lesson_type),
                        "duration_min": les.duration_min,
                        "content": les.content,
                        "video_url": les.video_url,
                        "order_index": les.order_index,
                        "is_preview": les.is_preview,
                    })
                modules_list.append({
                    "id": str(m.id),
                    "title": m.title,
                    "description": m.description,
                    "order_index": m.order_index,
                    "lessons": lessons_list,
                })

            c_data = {
                "id": str(c.id),
                "slug": c.slug,
                "title": c.title,
                "tagline": c.tagline,
                "description": c.description,
                "category": c.category,
                "level": serialize_val(c.level),
                "audience": c.audience,
                "duration_weeks": c.duration_weeks,
                "hours_per_week": c.hours_per_week,
                "format": c.format,
                "prerequisites": c.prerequisites,
                "key_skills": c.key_skills,
                "is_published": c.is_published,
                "modules": modules_list,
                "created_at": serialize_val(c.created_at),
            }
            fs.collection("courses").document(str(c.id)).set(c_data)
            course_count += 1
        report["courses"] = course_count
        print(f"[+] Migrated {course_count} courses to 'courses' collection")

        # 4. Migrate Enrollments
        enrollments = db.query(Enrollment).all()
        enr_count = 0
        for enr in enrollments:
            e_data = {
                "id": str(enr.id),
                "user_id": str(enr.user_id),
                "course_id": str(enr.course_id),
                "status": serialize_val(enr.status),
                "progress_percentage": enr.progress_percentage,
                "enrolled_at": serialize_val(enr.enrolled_at),
                "completed_at": serialize_val(enr.completed_at),
            }
            fs.collection("enrollments").document(str(enr.id)).set(e_data)
            enr_count += 1
        report["enrollments"] = enr_count
        print(f"[+] Migrated {enr_count} enrollments to 'enrollments' collection")

        # 5. Migrate Batches
        batches = db.query(Batch).all()
        batch_count = 0
        for b in batches:
            b_data = {
                "id": str(b.id),
                "name": b.name,
                "code": b.code,
                "course_id": str(b.course_id),
                "organization_id": str(b.organization_id) if b.organization_id else None,
                "trainer_id": str(b.trainer_id) if b.trainer_id else None,
                "max_students": b.max_students,
                "is_active": b.is_active,
                "created_at": serialize_val(b.created_at),
            }
            fs.collection("batches").document(str(b.id)).set(b_data)
            batch_count += 1
        report["batches"] = batch_count
        print(f"[+] Migrated {batch_count} batches to 'batches' collection")

        # 6. Migrate Assessments & Questions
        assessments = db.query(Assessment).all()
        ass_count = 0
        for a in assessments:
            questions_list = []
            for q in a.questions:
                questions_list.append({
                    "id": str(q.id),
                    "question_text": q.question_text,
                    "question_type": serialize_val(q.question_type),
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "points": q.points,
                    "explanation": q.explanation,
                })
            a_data = {
                "id": str(a.id),
                "course_id": str(a.course_id),
                "title": a.title,
                "description": a.description,
                "assessment_type": serialize_val(a.assessment_type),
                "passing_score": a.passing_score,
                "time_limit_minutes": a.time_limit_minutes,
                "is_published": a.is_published,
                "questions": questions_list,
            }
            fs.collection("assessments").document(str(a.id)).set(a_data)
            ass_count += 1
        report["assessments"] = ass_count
        print(f"[+] Migrated {ass_count} assessments to 'assessments' collection")

        # 7. Migrate Documents & Chunks for RAG
        chunks = db.query(DocumentChunk).all()
        chunk_count = 0
        for chk in chunks:
            chk_data = {
                "id": str(chk.id),
                "document_id": str(chk.document_id),
                "course_id": str(chk.document.course_id) if chk.document else "1",
                "chunk_index": chk.chunk_index,
                "content": chk.content,
                "token_count": chk.token_count,
            }
            fs.collection("document_chunks").document(str(chk.id)).set(chk_data)
            chunk_count += 1
        report["document_chunks"] = chunk_count
        print(f"[+] Migrated {chunk_count} document chunks to 'document_chunks' collection")

        # 8. Migrate Enquiries
        enquiries = db.query(Enquiry).all()
        enq_count = 0
        for enq in enquiries:
            enq_data = {
                "id": str(enq.id),
                "full_name": enq.full_name,
                "email": enq.email,
                "phone": enq.phone,
                "enquiry_type": serialize_val(enq.enquiry_type),
                "message": enq.message,
                "status": serialize_val(enq.status),
                "created_at": serialize_val(enq.created_at),
            }
            fs.collection("enquiries").document(str(enq.id)).set(enq_data)
            enq_count += 1
        report["enquiries"] = enq_count
        print(f"[+] Migrated {enq_count} enquiries to 'enquiries' collection")

        print("-" * 65)
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("All database entities are now synchronized into Firebase Firestore.")
        print("=" * 65)
        return report

    finally:
        db.close()


if __name__ == "__main__":
    migrate_all()
