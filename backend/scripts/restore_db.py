#!/usr/bin/env python3
"""VIBHA EdTech - Database Restore Utility.

Restores a verified, decompressed database snapshot for disaster recovery.
"""

import os
import sys
import gzip
import shutil
import sqlite3
import hashlib
import json
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings


def compute_sha256(filepath: Path) -> str:
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()


def restore_sqlite(archive_path: Path, target_db_path: Path):
    print(f"[*] Decompressing {archive_path.name} to {target_db_path}...")
    temp_restored = target_db_path.with_suffix(".restored_temp")

    with gzip.open(archive_path, "rb") as f_in, open(temp_restored, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)

    # Verify restored SQLite file opens and has tables
    conn = sqlite3.connect(str(temp_restored))
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table'")
    table_count = cursor.fetchone()[0]
    conn.close()

    if table_count == 0:
        if temp_restored.exists():
            os.remove(temp_restored)
        raise ValueError("Restored database contains zero tables. Aborting.")

    # Swap in restored database
    if target_db_path.exists():
        backup_target = target_db_path.with_suffix(".pre_restore_bak")
        shutil.copy(target_db_path, backup_target)
        os.remove(target_db_path)

    os.rename(temp_restored, target_db_path)
    print(f"[+] Restored {table_count} tables into {target_db_path}")


def restore_postgresql(archive_path: Path, db_url: str):
    print(f"[*] Restoring PostgreSQL snapshot from {archive_path.name}...")
    cmd = f"gzip -dc {archive_path} | psql --dbname={db_url}"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"psql restore failed: {result.stderr}")
    print("[+] PostgreSQL restore completed successfully.")


def run_restore(archive_file: str):
    archive_path = Path(archive_file)
    if not archive_path.is_absolute():
        archive_path = BASE_DIR / archive_path

    if not archive_path.exists():
        raise FileNotFoundError(f"Backup archive not found: {archive_path}")

    # Check manifest if available
    manifest_path = archive_path.with_suffix(".json")
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        expected_sha = manifest.get("sha256")
        if expected_sha:
            actual_sha = compute_sha256(archive_path)
            if actual_sha != expected_sha:
                raise ValueError(f"Integrity check failed! Expected {expected_sha}, got {actual_sha}")
            print(f"[+] Backup archive SHA256 integrity check verified: {actual_sha[:12]}...")

    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite"):
        clean_path = db_url.replace("sqlite:///", "").replace("sqlite://", "")
        db_file = Path(clean_path)
        if not db_file.is_absolute():
            db_file = BASE_DIR / db_file
        restore_sqlite(archive_path, db_file)
    else:
        restore_postgresql(archive_path, db_url)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python restore_db.py <path_to_backup_archive.gz>")
        sys.exit(1)

    archive_arg = sys.argv[1]
    try:
        run_restore(archive_arg)
    except Exception as exc:
        print(f"[!] Restore failed: {exc}", file=sys.stderr)
        sys.exit(1)
