#!/usr/bin/env python3
"""VIBHA EdTech - Database Backup Utility.

Supports automated, compressed, checksum-verified backups for both
PostgreSQL and SQLite relational databases.
"""

import os
import sys
import gzip
import shutil
import sqlite3
import hashlib
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings


def compute_sha256(filepath: Path) -> str:
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()


def backup_sqlite(db_path: Path, output_dir: Path) -> Path:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    raw_backup_path = output_dir / f"vibha_backup_{timestamp}.db"
    compressed_backup_path = output_dir / f"vibha_backup_{timestamp}.db.gz"

    print(f"[*] Initiating SQLite online backup from: {db_path}")
    source_conn = sqlite3.connect(str(db_path))
    dest_conn = sqlite3.connect(str(raw_backup_path))

    with dest_conn:
        source_conn.backup(dest_conn)

    dest_conn.close()
    source_conn.close()

    # Compress with gzip
    print(f"[*] Compressing backup archive to: {compressed_backup_path.name}")
    with open(raw_backup_path, "rb") as f_in, gzip.open(compressed_backup_path, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)

    os.remove(raw_backup_path)
    return compressed_backup_path


def backup_postgresql(db_url: str, output_dir: Path) -> Path:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    compressed_backup_path = output_dir / f"vibha_pg_backup_{timestamp}.sql.gz"

    print(f"[*] Executing pg_dump for PostgreSQL database...")
    # Run pg_dump command piped to gzip
    cmd = f"pg_dump --dbname={db_url} --no-owner --clean --if-exists | gzip > {compressed_backup_path}"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"pg_dump failed: {result.stderr}")

    return compressed_backup_path


def run_backup(output_directory: str = "backups") -> dict:
    output_dir = BASE_DIR / output_directory
    output_dir.mkdir(parents=True, exist_ok=True)

    db_url = settings.DATABASE_URL
    start_time = datetime.now(timezone.utc)

    if db_url.startswith("sqlite"):
        # Resolve SQLite file path
        clean_path = db_url.replace("sqlite:///", "").replace("sqlite://", "")
        db_file = Path(clean_path)
        if not db_file.is_absolute():
            db_file = BASE_DIR / db_file

        if not db_file.exists():
            raise FileNotFoundError(f"Source database file not found at: {db_file}")

        archive_path = backup_sqlite(db_file, output_dir)
    else:
        archive_path = backup_postgresql(db_url, output_dir)

    file_size_bytes = archive_path.stat().st_size
    checksum = compute_sha256(archive_path)

    manifest = {
        "status": "SUCCESS",
        "archive_file": archive_path.name,
        "archive_path": str(archive_path),
        "size_bytes": file_size_bytes,
        "size_kb": round(file_size_bytes / 1024, 2),
        "sha256": checksum,
        "timestamp_utc": start_time.isoformat(),
        "database_type": "sqlite" if db_url.startswith("sqlite") else "postgresql",
    }

    manifest_path = archive_path.with_suffix(".json")
    import json
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[+] Backup completed successfully!")
    print(f"    File: {archive_path.name} ({manifest['size_kb']} KB)")
    print(f"    SHA256: {checksum}")
    return manifest


if __name__ == "__main__":
    try:
        run_backup()
    except Exception as exc:
        print(f"[!] Backup failed: {exc}", file=sys.stderr)
        sys.exit(1)
