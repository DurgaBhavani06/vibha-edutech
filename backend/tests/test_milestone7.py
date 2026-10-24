import os
import gzip
import shutil
import logging
from pathlib import Path
from starlette.testclient import TestClient
from app.core.rate_limit import rate_limiter
from app.core.logging import SecretMaskingFilter
from app.core.file_security import (
    sanitize_filename,
    validate_file_upload,
    generate_secure_storage_path,
)
from scripts.backup_db import run_backup, compute_sha256


def test_owasp_security_headers_present_on_all_responses(client: TestClient):
    """Verifies that all responses include OWASP-recommended security headers."""
    response = client.get("/")
    assert response.status_code == 200

    headers = response.headers
    assert headers.get("x-frame-options") == "DENY"
    assert headers.get("x-content-type-options") == "nosniff"
    assert "default-src 'self'" in headers.get("content-security-policy", "")
    assert "strict-origin-when-cross-origin" in headers.get("referrer-policy", "")
    assert "camera=()" in headers.get("permissions-policy", "")


def test_rate_limiting_enforcement_and_retry_after(client: TestClient):
    """Verifies that exceeding the rate limit on sensitive endpoints triggers HTTP 429."""
    rate_limiter.reset()

    # Hit sensitive login endpoint 15 times (limit is 15 in 60s)
    endpoint = "/api/v1/auth/login"
    login_payload = {"email": "nonexistent@vibha.io", "password": "wrong_password"}

    for _ in range(15):
        resp = client.post(endpoint, json=login_payload)
        # Should be 401 Unauthorized (credentials invalid), not rate limited yet
        assert resp.status_code in (401, 400)
        assert resp.headers.get("x-ratelimit-remaining") is not None

    # 16th request must trigger 429 Too Many Requests
    blocked_resp = client.post(endpoint, json=login_payload)
    assert blocked_resp.status_code == 429
    assert "Rate limit exceeded" in blocked_resp.json()["detail"]
    assert blocked_resp.headers.get("retry-after") is not None

    rate_limiter.reset()


def test_secret_masking_filter_redacts_credentials_in_logs():
    """Verifies that the SecretMaskingFilter redacts bearer tokens, passwords, and API keys."""
    masking_filter = SecretMaskingFilter()

    # 1. Bearer Token
    log_token = logging.LogRecord(
        name="test", level=logging.INFO, pathname=__file__, lineno=10,
        msg="Handling incoming Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyPayload.signature",
        args=(), exc_info=None
    )
    masking_filter.filter(log_token)
    assert "***MASKED_TOKEN***" in log_token.msg
    assert "dummyPayload" not in log_token.msg

    # 2. Plaintext Password
    log_pw = logging.LogRecord(
        name="test", level=logging.INFO, pathname=__file__, lineno=20,
        msg='Registration payload received with "password": "VibhaSecure123!@#" and email: "test@vibha.io"',
        args=(), exc_info=None
    )
    masking_filter.filter(log_pw)
    assert '***MASKED***' in log_pw.msg
    assert "VibhaSecure123!@#" not in log_pw.msg

    # 3. OpenAI API Key
    log_key = logging.LogRecord(
        name="test", level=logging.INFO, pathname=__file__, lineno=30,
        msg="External request to OpenAI with key sk-abcdef1234567890abcdef123456",
        args=(), exc_info=None
    )
    masking_filter.filter(log_key)
    assert "sk-***MASKED_KEY***" in log_key.msg
    assert "abcdef1234567890abcdef123456" not in log_key.msg


def test_file_upload_security_and_path_traversal_prevention():
    """Verifies that file uploads are strictly validated and path traversal is prevented."""
    # Safe file validation
    valid, msg = validate_file_upload(
        filename="project_spec.pdf",
        file_size_bytes=1024 * 500,  # 500 KB
        content_type="application/pdf",
    )
    assert valid is True
    assert msg == ""

    # Path traversal in filename
    valid_pt, msg_pt = validate_file_upload(
        filename="../../../etc/passwd",
        file_size_bytes=1024,
        content_type="text/plain",
    )
    assert valid_pt is False
    assert "traversal" in msg_pt.lower()

    # Dangerous executable extension
    valid_exe, msg_exe = validate_file_upload(
        filename="malicious_payload.exe",
        file_size_bytes=1024 * 100,
        content_type="application/octet-stream",
    )
    assert valid_exe is False
    assert "forbidden" in msg_exe.lower()

    # Mismatched MIME type and extension
    valid_mismatch, msg_mismatch = validate_file_upload(
        filename="report.pdf",
        file_size_bytes=1024,
        content_type="image/jpeg",
    )
    assert valid_mismatch is False
    assert "does not match" in msg_mismatch.lower()

    # Filename sanitization
    safe_name = sanitize_filename("my project & assignment (v1).final..pdf")
    assert ".." not in safe_name
    assert " " not in safe_name
    assert safe_name.endswith(".pdf")

    # Secure storage path generation
    storage_path, unique_file = generate_secure_storage_path(
        tenant_id=42,
        category="assignments",
        original_filename="submission.zip",
        base_storage_dir="/var/vibha/uploads",
    )
    assert "tenant_42" in storage_path
    assert "assignments" in storage_path
    assert unique_file.endswith(".zip")


def test_database_backup_generation_and_integrity_checksum(tmp_path: Path):
    """Verifies that the backup script produces a gzip archive and valid SHA256 manifest."""
    manifest = run_backup(output_directory=str(tmp_path))
    assert manifest["status"] == "SUCCESS"
    assert manifest["size_bytes"] > 0
    assert len(manifest["sha256"]) == 64  # SHA256 hex length

    archive_file = Path(manifest["archive_path"])
    assert archive_file.exists()
    assert archive_file.name.endswith(".db.gz")

    # Verify archive decompresses cleanly
    with gzip.open(archive_file, "rb") as f:
        header = f.read(16)
        assert b"SQLite format 3" in header

    # Verify manifest SHA256 matches actual file
    assert compute_sha256(archive_file) == manifest["sha256"]


def test_enhanced_health_check_endpoint(client: TestClient):
    """Verifies the enhanced health endpoint reports latency, security status, and AI engine info."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["database"] == "ok"
    assert isinstance(data["database_latency_ms"], (int, float))
    assert data["security"]["rate_limiting"] is True
    assert data["security"]["security_headers"] is True
    assert data["security"]["masked_logging"] is True
    assert data["ai_engine"]["enabled"] is True
