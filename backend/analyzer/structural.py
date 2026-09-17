def check_structure(image, doc_type):
    """
    Basic structural checks (SEMI-REAL).
    For this demo, we'll check aspect ratio.
    """
    h, w = image.shape[:2]
    aspect_ratio = w / h
    
    score = 90
    details = "Document dimensions and layout match expected template."
    status = "pass"
    
    # Example logic: ID cards usually have ~1.58 aspect ratio (credit card size)
    # PAN and Aadhaar physical cards often follow this roughly.
    if doc_type in ["aadhaar", "pan"]:
        if not (1.3 < aspect_ratio < 1.8):
            score = 55
            details = f"Unusual aspect ratio ({aspect_ratio:.2f}) for {doc_type}."
            status = "warning"
            
    return {
        "score": score,
        "status": status,
        "details": details
    }
