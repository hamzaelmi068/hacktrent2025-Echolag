"""Wrapper utilities for the ElevenLabs API client."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs


ENV_KEY = "ELEVENLABS_API_KEY"


def _load_dotenv() -> None:
    """Load environment variables from a .env file when present."""
    # load_dotenv is idempotent; calling repeatedly is safe.
    load_dotenv()


@lru_cache(maxsize=1)
def get_elevenlabs_client(api_key: Optional[str] = None) -> ElevenLabs:
    """Return a configured ElevenLabs client.

    Parameters
    ----------
    api_key:
        Optional override for the API key. When omitted, the function looks for
        the `ELEVENLABS_API_KEY` environment variable.

    Raises
    ------
    RuntimeError
        If no API key can be resolved.
    """
    _load_dotenv()

    resolved_key = api_key or os.getenv(ENV_KEY)
    if not resolved_key:
        raise RuntimeError(
            "ElevenLabs API key is not configured. "
            f"Set the {ENV_KEY} environment variable or pass api_key explicitly."
        )

    return ElevenLabs(api_key=resolved_key)


def list_available_models(client: Optional[ElevenLabs] = None) -> list[dict]:
    """Fetch the list of models available to the authenticated account.

    This helper demonstrates basic usage and can be used for smoke testing.
    """
    resolved_client = client or get_elevenlabs_client()
    response = resolved_client.models.get_all()
    # The SDK returns a ModelsResponse dataclass with `.models`.
    return [model.model_dump() for model in response.models]

