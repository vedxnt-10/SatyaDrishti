def calculate_risk_score(ela_result, structural_result, ocr_result, qr_result, ai_detection):
    """
    Calculate an overall risk score (0-100, where higher = more risk / more likely fake).
    
    ELA is the primary forensic signal and is weighted heavily.
    """
    weights = {
        "ela": 3.0,
        "qr": 1.5,
        "structural": 1.0,
        "ocr": 1.0,
        "ai": 1.0,
    }
    
    weighted_sum = (
        ela_result.get("score", 0) * weights["ela"] +
        qr_result.get("score", 0) * weights["qr"] +
        structural_result.get("score", 0) * weights["structural"] +
        ocr_result.get("score", 0) * weights["ocr"] +
        ai_detection.get("score", 0) * weights["ai"]
    )
    total_weight = sum(weights.values())
    avg_score = weighted_sum / total_weight
    
    risk = 100 - avg_score
    
    # HARD FAIL: If ELA specifically fails, override everything
    if ela_result.get("status") == "fail":
        risk = max(risk, 85)
    
    non_ela_scores = [
        structural_result.get("score", 0),
        ocr_result.get("score", 0),
        qr_result.get("score", 0),
        ai_detection.get("score", 0)
    ]
    if any(s < 30 for s in non_ela_scores):
        risk = max(risk, 70)
        
    return int(risk)

def generate_explanation(layers_results):
    """
    Generate a detailed forensic explanation based on the layer results.
    """
    failed_layers = []
    warning_layers = []
    passed_layers = []
    
    for layer_name, result in layers_results.items():
        if result.get("status") == "fail":
            failed_layers.append((layer_name, result.get("details", "")))
        elif result.get("status") == "warning":
            warning_layers.append((layer_name, result.get("details", "")))
        else:
            passed_layers.append(layer_name)
            
    if not failed_layers and not warning_layers:
        return ("All forensic checks passed. Error Level Analysis shows uniform compression "
                "across all analyzed blocks. OCR fields are internally consistent. "
                "Document appears authentic.")
    
    parts = []
    
    # Prioritize ELA findings
    for layer_name, details in failed_layers:
        if layer_name == "pixel_forensics":
            parts.insert(0, f"[CRITICAL] {details}")
        else:
            parts.append(f"[FAIL] {details}")
    
    for layer_name, details in warning_layers:
        parts.append(f"[WARN] {details}")
    
    if passed_layers:
        parts.append(f"[OK] {len(passed_layers)} layer(s) passed checks.")
    
    return " ".join(parts)
