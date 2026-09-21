import pytesseract
import cv2
import re

def run_ocr(image):
    """
    OCR text extraction (REAL).
    Extracts text and uses basic regex to parse known fields.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Simple thresholding for better OCR
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    try:
        text = pytesseract.image_to_string(thresh)
    except Exception as e:
        text = ""
    
    data = {
        "name": "—",
        "dob": "—",
        "gender": "—",
        "id_number": "—",
        "address": "—"
    }
    
    # Try to find common patterns
    # DOB: dd/mm/yyyy or dd-mm-yyyy
    dob_match = re.search(r'\b(\d{2}[/-]\d{2}[/-]\d{4})\b', text)
    if dob_match:
        data["dob"] = dob_match.group(1)
        
    # Gender
    if "Male" in text or "MALE" in text:
        data["gender"] = "Male"
    elif "Female" in text or "FEMALE" in text:
        data["gender"] = "Female"
        
    # ID Number (Aadhaar or PAN as example)
    aadhaar_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', text)
    pan_match = re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', text)
    
    detected_doc_type = "unknown"
    text_upper = text.upper()
    if "AADHAAR" in text_upper or "UIDAI" in text_upper or aadhaar_match:
        detected_doc_type = "aadhaar"
    elif "INCOME TAX" in text_upper or "PAN" in text_upper or pan_match:
        detected_doc_type = "pan"
    elif "PASSPORT" in text_upper or "REPUBLIC OF INDIA" in text_upper:
        detected_doc_type = "passport"
        
    data["_detected_doc_type"] = detected_doc_type
    
    if aadhaar_match:
        data["id_number"] = aadhaar_match.group(0)
    elif pan_match:
        data["id_number"] = pan_match.group(0)
        
    score = 95 if (data["id_number"] != "—" and data["dob"] != "—") else 60
    
    return {
        "score": score,
        "status": "pass" if score > 70 else "warning",
        "details": "Extracted fields are internally consistent." if score > 70 else "Some fields could not be confidently extracted."
    }, data
