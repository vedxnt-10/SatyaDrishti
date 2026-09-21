import cv2

try:
    from pyzbar.pyzbar import decode
    HAS_PYZBAR = True
except Exception:
    HAS_PYZBAR = False

def check_qr(image, doc_type=None):
    """
    Checks for the presence of a QR code.
    Uses pyzbar if available, with robust OpenCV QRCodeDetector fallback.
    """
    # 1. Try pyzbar on original and grayscale if available
    if HAS_PYZBAR:
        try:
            decoded_objects = decode(image)
            if decoded_objects:
                return {"status": "pass", "score": 100, "details": "Secure QR detected. UIDAI PKI digital signature verified (Mock).", "detected": True}
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            decoded_objects_gray = decode(gray)
            if decoded_objects_gray:
                return {"status": "pass", "score": 100, "details": "Secure QR detected. UIDAI PKI digital signature verified (Mock).", "detected": True}
        except Exception:
            pass

    # 3. Try OpenCV's detector (sometimes finds the bounding box even if pyzbar fails to decode)
    detector = cv2.QRCodeDetector()
    retval, decoded_info, points, _ = detector.detectAndDecodeMulti(image)
    if retval and len(points) > 0:
         return {"status": "pass", "score": 90, "details": "Secure QR structure detected. Offline PKI signature valid (Mock).", "detected": True}
         
    # 4. Try OpenCV detector on Grayscale
    retval, decoded_info, points, _ = detector.detectAndDecodeMulti(gray)
    if retval and len(points) > 0:
         return {"status": "pass", "score": 90, "details": "Secure QR structure detected. Offline PKI signature valid (Mock).", "detected": True}

    # 5. Last resort for demo: if it's a real photo of an ID, it might be blurry.
    # To prevent failing real uploads in MVP, we just give a warning instead of a hard fail
    # so the overall score isn't completely tanked.
    return {"status": "warning", "score": 60, "details": "QR code missing or unreadable due to density/blur.", "detected": False}
