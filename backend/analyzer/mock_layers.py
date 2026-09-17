def mock_ai_detection(qr_detected, mean_ela):
    """
    Mock AI Generation Detection.
    If no QR is detected and ELA shows high variance (mean_ela > some threshold),
    we flag it as likely AI generated.
    """
    if not qr_detected and mean_ela > 20:
        return {
            "score": 8,
            "status": "fail",
            "details": "Low-confidence GAN artifacts detected in frequency analysis. Inconclusive."
        }
    elif not qr_detected and mean_ela > 10:
        return {
            "score": 45,
            "status": "warning",
            "details": "Minor spectral anomalies detected. Requires manual review."
        }
    else:
        return {
            "score": 85,
            "status": "pass",
            "details": "No synthetic generation fingerprints detected."
        }

def mock_face_match(face_result):
    """
    Mock Face Match / Liveness.
    """
    if face_result.get("detected"):
        return {
            "detected": True,
            "confidence": 97.2,
            "status": "pass"
        }
    return {
        "detected": False,
        "confidence": 0,
        "status": "fail"
    }

def mock_database_verify(ocr_data):
    """
    Mock Government Database Verification.
    """
    # Just assume if we got an ID number, it matched.
    if ocr_data.get("id_number") != "—":
        return {
            "verified": True,
            "match_score": 98
        }
    return {
        "verified": False,
        "match_score": 0
    }
