import logging
import re
from typing import Any


class SecretMaskingFilter(logging.Filter):
    """Logging filter that redacts sensitive values such as passwords,
    session tokens, JWTs, and API keys before they reach log files or consoles.
    """

    PATTERNS = [
        # Bearer tokens
        (re.compile(r"(Bearer\s+)[a-zA-Z0-9_\-\.]+", re.IGNORECASE), r"\1***MASKED_TOKEN***"),
        # Passwords in JSON or key-value pairs
        (re.compile(r'("(?:password|new_password|current_password|secret_key)":\s*")[^"]+(")', re.IGNORECASE), r'\1***MASKED***\2'),
        (re.compile(r'((?:password|new_password|current_password|secret_key)\s*=\s*)[^\s,]+', re.IGNORECASE), r'\1***MASKED***'),
        # API Keys (OpenAI, Gemini, Stripe, etc.)
        (re.compile(r'("(?:api_key|openai_api_key|gemini_api_key)":\s*")[^"]+(")', re.IGNORECASE), r'\1***MASKED_KEY***\2'),
        (re.compile(r'(sk-[a-zA-Z0-9]{20,})', re.IGNORECASE), r'sk-***MASKED_KEY***'),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern, replacement in self.PATTERNS:
                record.msg = pattern.sub(replacement, record.msg)

        if record.args:
            if isinstance(record.args, dict):
                cleaned_args = {}
                for k, v in record.args.items():
                    if any(term in k.lower() for term in ["password", "secret", "token", "key"]):
                        cleaned_args[k] = "***MASKED***"
                    else:
                        cleaned_args[k] = v
                record.args = cleaned_args
            elif isinstance(record.args, tuple):
                record.args = tuple(
                    "***MASKED***" if any(term in str(arg).lower() for term in ["password", "bearer", "sk-"])
                    else arg
                    for arg in record.args
                )

        return True


def setup_logging(level: int = logging.INFO):
    """Configures structured, masked application logging."""
    masking_filter = SecretMaskingFilter()

    # Formatter with timestamp, level, module, and message
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers if re-initialized
    if not root_logger.handlers:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        console_handler.addFilter(masking_filter)
        root_logger.addHandler(console_handler)
    else:
        for handler in root_logger.handlers:
            handler.setFormatter(formatter)
            handler.addFilter(masking_filter)

    # Ensure app logger has the filter
    app_logger = logging.getLogger("vibha")
    app_logger.addFilter(masking_filter)


def get_logger(name: str = "vibha") -> logging.Logger:
    """Returns a named logger with security masking applied."""
    return logging.getLogger(name)
