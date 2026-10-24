from app.models.enquiry import EnquiryType, EnquiryStatus, Enquiry


def test_create_valid_student_enquiry(client, db_session):
    payload = {
        "full_name": "Aarav Patel",
        "email": "aarav.patel@example.com",
        "phone": "+91 9876543210",
        "enquiry_type": "STUDENT",
        "course_slug": "fullstack-web-engineering",
        "message": "I am a 3rd-year CS student interested in weekend batch timings and prerequisites.",
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "VIB-" in data["reference_code"]
    assert data["enquiry"]["full_name"] == "Aarav Patel"
    assert data["enquiry"]["email"] == "aarav.patel@example.com"
    assert data["enquiry"]["enquiry_type"] == "STUDENT"
    assert data["enquiry"]["status"] == "NEW"

    # Verify persistence in database
    saved = db_session.query(Enquiry).filter(Enquiry.email == "aarav.patel@example.com").first()
    assert saved is not None
    assert saved.reference_code == data["reference_code"]


def test_create_college_training_enquiry(client, db_session):
    payload = {
        "full_name": "Dr. Ramesh Kulkarni",
        "email": "hod.cse@mitcoe.ac.in",
        "phone": "9823456789",
        "enquiry_type": "COLLEGE_TRAINING",
        "organization_or_college": "MIT College of Engineering",
        "message": "Requesting proposal for a 60-hour semester workshop on Cloud Architecture & Kubernetes for 120 final year students.",
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["enquiry"]["organization_or_college"] == "MIT College of Engineering"
    assert data["enquiry"]["enquiry_type"] == "COLLEGE_TRAINING"


def test_validation_error_invalid_email(client):
    payload = {
        "full_name": "Invalid User",
        "email": "not-an-email",
        "phone": "9876543210",
        "enquiry_type": "GENERAL_CONTACT",
        "message": "Testing invalid email format rejection.",
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("email" in err["loc"] for err in errors)


def test_validation_error_too_short_message(client):
    payload = {
        "full_name": "Short Message User",
        "email": "valid.user@example.com",
        "phone": "9876543210",
        "enquiry_type": "STUDENT",
        "message": "Hi",  # < 10 characters
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("message" in err["loc"] for err in errors)


def test_validation_error_invalid_phone(client):
    payload = {
        "full_name": "Bad Phone",
        "email": "badphone@example.com",
        "phone": "123",  # < 7 characters
        "enquiry_type": "GENERAL_CONTACT",
        "message": "Checking invalid phone number rejection.",
    }
    response = client.post("/api/v1/enquiries", json=payload)
    assert response.status_code == 422


def test_honeypot_anti_spam_trap(client, db_session):
    """Spam bots filling the honeypot field must NOT pollute the database."""
    bot_payload = {
        "full_name": "Spam Bot 3000",
        "email": "spambot@spammer.org",
        "phone": "+1 555 123 4567",
        "enquiry_type": "GENERAL_CONTACT",
        "message": "Buy cheap backlinks at www.spam-example.com now!",
        "hp_token": "malicious-auto-filled-token",  # Honeypot filled
    }
    response = client.post("/api/v1/enquiries", json=bot_payload)
    # Returns 201 so bot does not detect honeypot counter-measure
    assert response.status_code == 201
    
    # Confirm it was NOT persisted to DB
    count = db_session.query(Enquiry).filter(Enquiry.email == "spambot@spammer.org").count()
    assert count == 0


def test_list_and_filter_enquiries(client):
    # Seed 2 enquiries
    client.post("/api/v1/enquiries", json={
        "full_name": "Student One",
        "email": "student1@example.com",
        "phone": "+91 9111111111",
        "enquiry_type": "STUDENT",
        "message": "Inquiry about syllabus and pre-course reading list.",
    })
    client.post("/api/v1/enquiries", json={
        "full_name": "HR Manager",
        "email": "hr@technocorp.com",
        "phone": "+91 9222222222",
        "enquiry_type": "CORPORATE_TRAINING",
        "organization_or_college": "TechnoCorp",
        "message": "Upskilling training for 25 backend developers on Spring Boot.",
    })

    # List all
    all_res = client.get("/api/v1/enquiries")
    assert all_res.status_code == 200
    assert len(all_res.json()) >= 2

    # Filter by type
    student_res = client.get("/api/v1/enquiries?enquiry_type=STUDENT")
    assert student_res.status_code == 200
    for item in student_res.json():
        assert item["enquiry_type"] == "STUDENT"
