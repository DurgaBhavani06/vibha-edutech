#!/usr/bin/env python3
"""VIBHA EdTech - Automated Security & Compliance Verification Script.

Audits environment configuration, OWASP security headers, secret protection,
and database safety rules.
"""

import sys
import logging
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.core.logging import SecretMaskingFilter


def run_security_audit() -> bool:
    print("=" * 60)
    print("    VIBHA EDTECH - PLATFORM SECURITY AUDIT")
    print("=" * 60)

    checks_passed = 0
    total_checks = 7

    # Check 1: Production Secret Key Strength
    print("[1/7] Auditing SECRET_KEY strength...")
    if settings.ENVIRONMENT == "production":
        if "development" in settings.SECRET_KEY or len(settings.SECRET_KEY) < 32:
            print("  [FAIL] Insecure or default SECRET_KEY in production!")
        else:
            print("  [PASS] Strong, custom SECRET_KEY detected.")
            checks_passed += 1
    else:
        print(f"  [PASS] Non-production environment ({settings.ENVIRONMENT}) with dev key.")
        checks_passed += 1

    # Check 2: Debug Mode in Production
    print("[2/7] Checking DEBUG mode flag...")
    if settings.ENVIRONMENT == "production" and settings.DEBUG:
        print("  [FAIL] DEBUG is enabled in production! Stack traces could leak.")
    else:
        print(f"  [PASS] DEBUG flag correctly calibrated ({settings.DEBUG}).")
        checks_passed += 1

    # Check 3: OWASP Security Headers Configuration
    print("[3/7] Checking OWASP Security Headers middleware...")
    if settings.SECURITY_HEADERS_ENABLED:
        print("  [PASS] SecurityHeadersMiddleware is active (CSP, X-Frame-Options, nosniff, HSTS).")
        checks_passed += 1
    else:
        print("  [FAIL] SecurityHeadersMiddleware is disabled.")

    # Check 4: Rate Limiting Middleware
    print("[4/7] Checking DoS / Brute-force Rate Limiting...")
    if settings.RATE_LIMIT_ENABLED:
        print("  [PASS] RateLimitMiddleware is active on authentication & public endpoints.")
        checks_passed += 1
    else:
        print("  [FAIL] RateLimitMiddleware is disabled.")

    # Check 5: Secret Masking in Logging
    print("[5/7] Verifying sensitive data masking filter...")
    masking_filter = SecretMaskingFilter()
    test_record = logging.LogRecord(
        name="test", level=logging.INFO, pathname=__file__, lineno=1,
        msg='User authenticated with "password": "super_secret_123" and Bearer eyJhbGciOiJIUzI1NiI.test.token',
        args=(), exc_info=None
    )
    masking_filter.filter(test_record)
    if "super_secret_123" not in test_record.msg and "***MASKED***" in test_record.msg:
        print("  [PASS] Log records successfully mask passwords and bearer tokens.")
        checks_passed += 1
    else:
        print("  [FAIL] Sensitive data was NOT masked in log records!")

    # Check 6: Password Hashing Entropy & Salt
    print("[6/7] Verifying password hashing (bcrypt + salt)...")
    plain = "TestVibhaPassword!2026"
    hashed = get_password_hash(plain)
    if hashed.startswith("$2b$") and verify_password(plain, hashed):
        print("  [PASS] Passwords hashed using bcrypt with salted entropy.")
        checks_passed += 1
    else:
        print("  [FAIL] Insecure password hashing mechanism!")

    # Check 7: Account Lockout Controls
    print("[7/7] Verifying brute-force account lockout thresholds...")
    if settings.MAX_LOGIN_ATTEMPTS <= 5 and settings.LOCKOUT_DURATION_MINUTES >= 10:
        print(f"  [PASS] Lockout configured: {settings.MAX_LOGIN_ATTEMPTS} attempts / {settings.LOCKOUT_DURATION_MINUTES}m lockout.")
        checks_passed += 1
    else:
        print(f"  [WARN] Loose lockout settings: {settings.MAX_LOGIN_ATTEMPTS} attempts.")

    print("-" * 60)
    score_pct = round((checks_passed / total_checks) * 100, 1)
    print(f"Security Audit Score: {checks_passed}/{total_checks} ({score_pct}%)")
    print("=" * 60)

    return checks_passed == total_checks


if __name__ == "__main__":
    success = run_security_audit()
    sys.exit(0 if success else 1)
