import os
import re
import uuid
from typing import Tuple, Set

# Whitelist of safe MIME types and corresponding extensions
ALLOWED_MIME_TYPES = {
    "application/pdf": [".pdf"],
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
    "application/zip": [".zip"],
    "text/markdown": [".md"],
    "text/plain": [".txt"],
}

# Blacklist of executable or dangerous extensions that must never be uploaded
FORBIDDEN_EXTENSIONS: Set[str] = {
    ".exe", ".bat", ".cmd", ".sh", ".bash", ".php", ".py", ".rb", ".pl",
    ".js", ".ts", ".html", ".htm", ".vbs", ".dll", ".so", ".jar", ".ps1",
    ".scr", ".com", ".pif", ".c", ".cpp", ".msi"
}

# Maximum upload file size in bytes (10 Megabytes)
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def sanitize_filename(filename: str) -> str:
    """Sanitizes a filename to prevent path traversal and control character exploits.
    Strips directory separators, null bytes, and non-alphanumeric characters.
    """
    if not filename:
        return f"file_{uuid.uuid4().hex[:8]}"

    # Remove null bytes and path components
    cleaned = filename.replace("\0", "")
    cleaned = os.path.basename(cleaned)

    # Separate basename and extension
    base, ext = os.path.splitext(cleaned)
    ext = ext.lower().strip()

    # Sanitize base name to alphanumeric, dashes, and underscores only
    safe_base = re.sub(r"[^a-zA-Z0-9_\-]", "_", base)
    if not safe_base:
        safe_base = f"upload_{uuid.uuid4().hex[:8]}"

    return f"{safe_base[:50]}{ext}"


def validate_file_upload(
    filename: str,
    file_size_bytes: int,
    content_type: str,
    max_size_bytes: int = MAX_FILE_SIZE_BYTES,
) -> Tuple[bool, str]:
    """Validates an uploaded file against size limits, extension whitelists,
    and MIME-type consistency.
    
    Returns:
        (is_valid: bool, error_message: str)
    """
    # 1. Size check
    if file_size_bytes <= 0:
        return False, "File is empty (0 bytes)."
    if file_size_bytes > max_size_bytes:
        return False, f"File exceeds maximum allowed size of {max_size_bytes // (1024 * 1024)}MB."

    # 2. Path Traversal & dangerous character check
    if ".." in filename or "/" in filename or "\\" in filename:
        return False, "Path traversal attempt detected in filename."

    # 3. Extension check
    _, ext = os.path.splitext(filename.lower())
    if not ext:
        return False, "Files without extensions are not permitted."

    if ext in FORBIDDEN_EXTENSIONS:
        return False, f"File type '{ext}' is forbidden for security reasons."

    # 4. MIME-type validation against whitelist
    normalized_mime = content_type.lower().split(";")[0].strip()
    if normalized_mime not in ALLOWED_MIME_TYPES:
        return False, f"MIME type '{normalized_mime}' is not in the approved upload whitelist."

    # 5. Extension matches MIME type
    valid_exts = ALLOWED_MIME_TYPES[normalized_mime]
    if ext not in valid_exts:
        return False, f"File extension '{ext}' does not match content type '{normalized_mime}'."

    return True, ""


def generate_secure_storage_path(
    tenant_id: int,
    category: str,
    original_filename: str,
    base_storage_dir: str = "/var/vibha/private_uploads",
) -> Tuple[str, str]:
    """Generates a non-executable, isolated private storage path for an approved upload.
    Returns: (absolute_storage_path, unique_stored_filename)
    """
    safe_name = sanitize_filename(original_filename)
    unique_prefix = uuid.uuid4().hex
    unique_stored_filename = f"{unique_prefix}_{safe_name}"

    tenant_folder = f"tenant_{tenant_id}"
    safe_category = re.sub(r"[^a-zA-Z0-9_\-]", "", category)

    directory_path = os.path.join(base_storage_dir, tenant_folder, safe_category)
    full_path = os.path.join(directory_path, unique_stored_filename)

    return full_path, unique_stored_filename
