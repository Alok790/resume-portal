import re
from pdfminer.high_level import extract_text as pdf_extract_text
from skills_vocab import SKILLS_VOCAB


def extract_text_from_pdf(file_stream):
    """Extract raw text from a PDF file stream."""
    try:
        text = pdf_extract_text(file_stream)
        return text or ""
    except Exception as e:
        return ""


def extract_skills(text):
    """
    Extract skills from text by matching against the SKILLS_VOCAB vocabulary.
    Returns a deduplicated list of found skills (original casing from vocab).
    """
    text_lower = text.lower()
    found = set()

    for skill in SKILLS_VOCAB:
        # Use word boundary matching for short skills to avoid false positives
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)

    return sorted(list(found))
