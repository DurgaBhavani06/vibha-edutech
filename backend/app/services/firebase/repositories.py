from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from app.services.firebase.client import get_firestore_client


class UsersRepository:
    """Firestore repository for user profiles, roles, and security lockouts."""
    COLLECTION = "users"

    @classmethod
    def get_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        client = get_firestore_client()
        docs = client.collection(cls.COLLECTION).where("email", "==", email.lower().strip()).limit(1).get()
        if docs:
            data = docs[0].to_dict()
            data["id"] = docs[0].id
            return data
        return None

    @classmethod
    def get_by_id(cls, user_id: str) -> Optional[Dict[str, Any]]:
        client = get_firestore_client()
        doc = client.collection(cls.COLLECTION).document(str(user_id)).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    @classmethod
    def save_user(cls, user_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        client = get_firestore_client()
        now = datetime.now(timezone.utc).isoformat()
        user_data["updated_at"] = now
        if "email" in user_data and user_data["email"]:
            user_data["email"] = user_data["email"].lower().strip()

        if user_id:
            client.collection(cls.COLLECTION).document(str(user_id)).set(user_data, merge=True)
            user_data["id"] = str(user_id)
            return user_data
        else:
            user_data["created_at"] = now
            _, doc_ref = client.collection(cls.COLLECTION).add(user_data)
            user_data["id"] = doc_ref.id
            return user_data

    @classmethod
    def record_failed_login(cls, user_id: str, max_attempts: int = 5, lockout_minutes: int = 15):
        user = cls.get_by_id(user_id)
        if not user:
            return
        attempts = user.get("failed_login_attempts", 0) + 1
        update_data = {"failed_login_attempts": attempts}
        if attempts >= max_attempts:
            locked_until = datetime.now(timezone.utc) + timedelta(minutes=lockout_minutes)
            update_data["locked_until"] = locked_until.isoformat()
        cls.save_user(update_data, user_id=user_id)

    @classmethod
    def reset_failed_logins(cls, user_id: str):
        cls.save_user({"failed_login_attempts": 0, "locked_until": None}, user_id=user_id)


class CoursesRepository:
    """Firestore repository for course curricula, modules, and lessons."""
    COLLECTION = "courses"

    @classmethod
    def list_courses(
        cls,
        category: Optional[str] = None,
        level: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        client = get_firestore_client()
        query = client.collection(cls.COLLECTION).where("is_published", "==", True)

        if category:
            query = query.where("category", "==", category)
        if level:
            query = query.where("level", "==", level)

        results = []
        for doc in query.stream():
            data = doc.to_dict()
            data["id"] = doc.id
            if search:
                s = search.lower()
                title = data.get("title", "").lower()
                desc = data.get("description", "").lower()
                tagline = data.get("tagline", "").lower()
                skills = " ".join(data.get("key_skills", [])).lower()
                if s not in title and s not in desc and s not in tagline and s not in skills:
                    continue
            results.append(data)
        return results

    @classmethod
    def get_by_slug(cls, slug: str) -> Optional[Dict[str, Any]]:
        client = get_firestore_client()
        docs = client.collection(cls.COLLECTION).where("slug", "==", slug).limit(1).get()
        if docs:
            data = docs[0].to_dict()
            data["id"] = docs[0].id
            return data
        return None

    @classmethod
    def get_by_id(cls, course_id: str) -> Optional[Dict[str, Any]]:
        client = get_firestore_client()
        doc = client.collection(cls.COLLECTION).document(str(course_id)).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    @classmethod
    def save_course(cls, course_data: Dict[str, Any], course_id: Optional[str] = None) -> Dict[str, Any]:
        client = get_firestore_client()
        now = datetime.now(timezone.utc).isoformat()
        course_data["updated_at"] = now

        if course_id:
            client.collection(cls.COLLECTION).document(str(course_id)).set(course_data, merge=True)
            course_data["id"] = str(course_id)
            return course_data
        else:
            course_data["created_at"] = now
            _, doc_ref = client.collection(cls.COLLECTION).add(course_data)
            course_data["id"] = doc_ref.id
            return course_data


class EnrollmentsRepository:
    """Firestore repository for student enrollments and lesson progress."""
    COLLECTION = "enrollments"

    @classmethod
    def get_user_enrollments(cls, user_id: str) -> List[Dict[str, Any]]:
        client = get_firestore_client()
        docs = client.collection(cls.COLLECTION).where("user_id", "==", str(user_id)).get()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results

    @classmethod
    def enroll_student(cls, user_id: str, course_id: str) -> Dict[str, Any]:
        client = get_firestore_client()
        existing = client.collection(cls.COLLECTION).where("user_id", "==", str(user_id)).where("course_id", "==", str(course_id)).get()
        if existing:
            data = existing[0].to_dict()
            data["id"] = existing[0].id
            return data

        now = datetime.now(timezone.utc).isoformat()
        record = {
            "user_id": str(user_id),
            "course_id": str(course_id),
            "status": "ACTIVE",
            "progress_percentage": 0,
            "completed_lessons": [],
            "enrolled_at": now,
            "updated_at": now,
        }
        _, doc_ref = client.collection(cls.COLLECTION).add(record)
        record["id"] = doc_ref.id
        return record

    @classmethod
    def update_progress(cls, user_id: str, course_id: str, lesson_id: str) -> Dict[str, Any]:
        client = get_firestore_client()
        existing = client.collection(cls.COLLECTION).where("user_id", "==", str(user_id)).where("course_id", "==", str(course_id)).get()
        if not existing:
            enrollment = cls.enroll_student(user_id, course_id)
        else:
            enrollment = existing[0].to_dict()
            enrollment["id"] = existing[0].id

        completed = set(enrollment.get("completed_lessons", []))
        completed.add(str(lesson_id))
        enrollment["completed_lessons"] = list(completed)

        # Recalculate percentage based on course lesson count
        course = CoursesRepository.get_by_id(course_id)
        total_lessons = 0
        if course and "modules" in course:
            for m in course.get("modules", []):
                total_lessons += len(m.get("lessons", []))
        total_lessons = max(1, total_lessons)

        pct = min(100, int((len(completed) / total_lessons) * 100))
        enrollment["progress_percentage"] = pct
        enrollment["updated_at"] = datetime.now(timezone.utc).isoformat()

        client.collection(cls.COLLECTION).document(enrollment["id"]).set(enrollment, merge=True)
        return enrollment


class EnquiriesRepository:
    """Firestore repository for student enquiries and college proposals."""
    COLLECTION = "enquiries"

    @classmethod
    def create_enquiry(cls, enquiry_data: Dict[str, Any]) -> Dict[str, Any]:
        client = get_firestore_client()
        now = datetime.now(timezone.utc).isoformat()
        enquiry_data["created_at"] = now
        enquiry_data["status"] = enquiry_data.get("status", "NEW")

        _, doc_ref = client.collection(cls.COLLECTION).add(enquiry_data)
        enquiry_data["id"] = doc_ref.id
        return enquiry_data

    @classmethod
    def list_enquiries(cls) -> List[Dict[str, Any]]:
        client = get_firestore_client()
        docs = client.collection(cls.COLLECTION).order_by("created_at", direction="DESCENDING").get()
        return [{"id": d.id, **d.to_dict()} for d in docs]


class DocumentsRepository:
    """Firestore repository for approved course reference manuals and chunks for RAG."""
    COLLECTION_DOCS = "documents"
    COLLECTION_CHUNKS = "document_chunks"

    @classmethod
    def get_approved_chunks(cls, course_id: str) -> List[Dict[str, Any]]:
        client = get_firestore_client()
        chunks = client.collection(cls.COLLECTION_CHUNKS).where("course_id", "==", str(course_id)).get()
        return [{"id": c.id, **c.to_dict()} for c in chunks]
