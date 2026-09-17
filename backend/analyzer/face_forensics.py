import cv2
import numpy as np

def analyze_face_splicing(image, face_box):
    """
    Detects if a face was pasted onto a document by comparing the compression
    and noise signature of the face region against its immediate local background.
    
    This is highly robust because it ignores the high variance of text elsewhere 
    on the document.
    """
    if not face_box:
        return {"status": "pass", "score": 90, "details": "No face detected to analyze for splicing."}
        
    x, y, w, h = face_box
    
    # 1. Define the regions: Face vs Immediate Background Margin
    margin = 30
    h_img, w_img = image.shape[:2]
    
    bg_y1 = max(0, y - margin)
    bg_y2 = min(h_img, y + h + margin)
    bg_x1 = max(0, x - margin)
    bg_x2 = min(w_img, x + w + margin)
    
    face_roi = image[y:y+h, x:x+w]
    # Create a mask for the background margin (the area around the face)
    bg_mask = np.ones((bg_y2-bg_y1, bg_x2-bg_x1), dtype=np.uint8)
    bg_mask[y-bg_y1:y-bg_y1+h, x-bg_x1:x-bg_x1+w] = 0
    bg_roi = image[bg_y1:bg_y2, bg_x1:bg_x2]
    
    # If the background margin is too small to be meaningful, skip
    if np.sum(bg_mask) < 100:
        return {"status": "pass", "score": 90, "details": "Face too close to edge for boundary analysis."}
        
    # 2. Extract Noise Signatures
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    noise = cv2.Laplacian(gray, cv2.CV_64F)
    noise = np.abs(noise)
    
    face_noise = noise[y:y+h, x:x+w]
    bg_noise = noise[bg_y1:bg_y2, bg_x1:bg_x2]
    
    face_noise_mean = np.mean(face_noise)
    bg_noise_mean = np.mean(bg_noise[bg_mask == 1])
    
    noise_ratio = face_noise_mean / (bg_noise_mean + 1e-6)
    
    # 3. Extract ELA Signatures
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, 85]
    _, encoded = cv2.imencode('.jpg', image, encode_params)
    resaved = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    ela = cv2.absdiff(image, resaved)
    ela_gray = cv2.cvtColor(ela, cv2.COLOR_BGR2GRAY)
    
    face_ela = ela_gray[y:y+h, x:x+w]
    bg_ela = ela_gray[bg_y1:bg_y2, bg_x1:bg_x2]
    
    face_ela_mean = np.mean(face_ela)
    bg_ela_mean = np.mean(bg_ela[bg_mask == 1])
    
    ela_ratio = face_ela_mean / (bg_ela_mean + 1e-6)
    
    # 4. Splicing Logic
    # If you paste a high-res face on a flat background, noise_ratio and ela_ratio spike.
    # If they differ by more than 3x, it's almost certainly a splice.
    
    # Normal photos have texture, but not 5x more than the document background
    score = 100
    details = "Face boundary integrates naturally with document background."
    status = "pass"
    
    # Calculate an aggregate boundary mismatch score
    mismatch_factor = max(noise_ratio, 1/noise_ratio) + max(ela_ratio, 1/ela_ratio)
    
    if mismatch_factor > 4.5:
        score = 15
        status = "fail"
        details = f"Face boundary splicing detected. Massive mismatch between face and local background (Mismatch factor: {mismatch_factor:.1f})."
    elif mismatch_factor > 3.5:
        score = 55
        status = "warning"
        details = f"Suspicious face boundary integration (Mismatch factor: {mismatch_factor:.1f})."
        
    return {
        "score": score,
        "status": status,
        "details": details,
        "_diagnostics": {
            "noise_ratio": round(noise_ratio, 2),
            "ela_ratio": round(ela_ratio, 2),
            "mismatch_factor": round(mismatch_factor, 2)
        }
    }
