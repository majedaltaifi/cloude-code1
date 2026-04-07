import io
import os
from openai import OpenAI
from pathlib import Path

# Reuse API key from environment 
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-api-key-here")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY != "your-api-key-here" else None

def transcribe_audio(audio_bytes: bytes) -> dict:
    """
    Transcribe audio bytes using OpenAI Whisper API.
    Returns: { text: str, engine: str, success: bool }
    """
    if not client:
        return {"text": "", "engine": "none", "success": False, "error": "API Key missing"}

    try:
        # Create a temporary file-like object for the OpenAI API
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "whisper_audio.webm" # OpenAI needs a named file-like object

        transcript = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file,
            language="ar"
        )
        
        return {
            "text": transcript.text.strip(),
            "engine": "openai-whisper",
            "success": True
        }
    except Exception as e:
        print(f"[Voice] OpenAI API Transcription failed: {e}")
        return {"text": "", "engine": "openai", "success": False, "error": str(e)}

def decode_base64_audio(b64_string: str) -> bytes:
    import base64
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    return base64.b64decode(b64_string)

SUPPORTED_FORMATS = [".wav", ".mp3", ".ogg", ".webm", ".m4a", ".flac"]
def is_supported_format(filename: str | None) -> bool:
    if not filename: return False
    return Path(filename).suffix.lower() in SUPPORTED_FORMATS
