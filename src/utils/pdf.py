"""PDF utilities for InsuranceIQ."""

import base64
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path: str | Path) -> str:
    """
    Extract text from a PDF file using PyMuPDF.

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Extracted text content
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    text_parts = []
    with fitz.open(pdf_path) as doc:
        for page_num, page in enumerate(doc):
            text = page.get_text()
            if text.strip():
                text_parts.append(f"--- Page {page_num + 1} ---\n{text}")

    return "\n\n".join(text_parts)


def extract_images_from_pdf(pdf_path: str | Path, max_images: int = 5) -> list[dict]:
    """
    Extract images from a PDF file for vision analysis.

    Args:
        pdf_path: Path to the PDF file
        max_images: Maximum number of images to extract

    Returns:
        List of dicts with 'page', 'data' (base64), and 'media_type'
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    images = []
    with fitz.open(pdf_path) as doc:
        for page_num, page in enumerate(doc):
            if len(images) >= max_images:
                break

            # Render page as image (useful for scanned documents)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for clarity
            img_data = pix.tobytes("png")

            images.append({
                "page": page_num + 1,
                "data": base64.standard_b64encode(img_data).decode("utf-8"),
                "media_type": "image/png"
            })

    return images


def render_pdf_page_as_image(pdf_path: str | Path, page_num: int = 0) -> Optional[dict]:
    """
    Render a specific PDF page as an image.

    Args:
        pdf_path: Path to the PDF file
        page_num: Page number (0-indexed)

    Returns:
        Dict with 'data' (base64) and 'media_type', or None if page doesn't exist
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    with fitz.open(pdf_path) as doc:
        if page_num >= len(doc):
            return None

        page = doc[page_num]
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img_data = pix.tobytes("png")

        return {
            "data": base64.standard_b64encode(img_data).decode("utf-8"),
            "media_type": "image/png"
        }


def load_image_as_base64(image_path: str | Path) -> dict:
    """
    Load an image file and return as base64 for Claude vision.

    Args:
        image_path: Path to the image file

    Returns:
        Dict with 'data' (base64) and 'media_type'
    """
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    # Determine media type
    suffix = image_path.suffix.lower()
    media_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }
    media_type = media_types.get(suffix, "image/png")

    with open(image_path, "rb") as f:
        img_data = f.read()

    return {
        "data": base64.standard_b64encode(img_data).decode("utf-8"),
        "media_type": media_type
    }
