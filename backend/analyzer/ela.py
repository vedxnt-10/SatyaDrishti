import cv2
import numpy as np

def run_ela(image, scale=15):
    """
    Multi-Pass Error Level Analysis with Regional Consistency Detection.
    
    Runs ELA at MULTIPLE quality levels (70, 80, 90) and combines the results.
    Lower quality amplifies compression differences dramatically.
    
    Then uses IQR-based block analysis to find tampered regions.
    """
    h_img, w_img = image.shape[:2]
    
    # Safety check for extremely small or malformed images
    if h_img < 32 or w_img < 32:
        return {
            "score": 50,
            "status": "warning",
            "details": "Image too small for reliable Error Level Analysis.",
            "_diagnostics": {"total_blocks": 0, "outlier_blocks": 0}
        }, np.zeros_like(image), (0, [], [])

    # Run ELA at multiple quality levels and combine
    combined_ela = np.zeros((h_img, w_img), dtype=np.float64)
    
    for quality in [70, 80, 90]:
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
        _, encoded = cv2.imencode('.jpg', image, encode_params)
        resaved = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
        
        diff = cv2.absdiff(image, resaved)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY).astype(np.float64)
        combined_ela += diff_gray
    
    # Average across quality levels and amplify
    combined_ela = (combined_ela / 3.0) * scale
    combined_ela = np.clip(combined_ela, 0, 255).astype(np.uint8)
    
    # Also produce the standard single-pass ELA for the raw image output
    _, encoded_90 = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 90])
    resaved_90 = cv2.imdecode(encoded_90, cv2.IMREAD_COLOR)
    ela_raw = cv2.absdiff(image, resaved_90) * scale
    ela_raw = np.clip(ela_raw, 0, 255).astype(np.uint8)
    
    # ===== REGIONAL CONSISTENCY ANALYSIS =====
    ela_gray = combined_ela  # Already grayscale
    h, w = ela_gray.shape
    block_size = 32
    rows = h // block_size
    cols = w // block_size
    
    if rows < 3 or cols < 3:
        block_size = 16
        rows = h // block_size
        cols = w // block_size
    
    block_means = []
    block_coords = []
    for r in range(rows):
        for c in range(cols):
            y1, y2 = r * block_size, (r + 1) * block_size
            x1, x2 = c * block_size, (c + 1) * block_size
            block = ela_gray[y1:y2, x1:x2]
            block_means.append(float(np.mean(block)))
            block_coords.append((y1, y2, x1, x2))
    
    block_means = np.array(block_means)
    
    global_median = float(np.median(block_means))
    global_std = float(np.std(block_means))
    
    q1 = np.percentile(block_means, 25)
    q3 = np.percentile(block_means, 75)
    iqr = q3 - q1
    upper_fence = q3 + 1.8 * iqr  # Tighter threshold to catch subtle edits
    
    # CRITICAL: Prevent false positives on digitally flat (synthetic) genuine documents.
    # If the background is pure white (0 variance), text edges will look like massive outliers.
    # Enforce a minimum absolute ELA variance to be considered a true manipulated outlier.
    upper_fence = max(upper_fence, 20.0)
    
    outlier_mask = block_means > upper_fence
    num_outliers = int(np.sum(outlier_mask))
    total_blocks = len(block_means)
    outlier_ratio = num_outliers / total_blocks if total_blocks > 0 else 0
    
    max_outlier_val = float(np.max(block_means[outlier_mask])) if num_outliers > 0 else 0
    outlier_intensity = (max_outlier_val - global_median) / (global_median + 1) if num_outliers > 0 else 0
    
    # Coefficient of variation across all blocks
    cv = global_std / (global_median + 1e-6)
    
    # ===== SCORING LOGIC =====
    
    # If the image is completely digitally flat (median 0, crazy CV), statistical outliers
    # don't work well because it's just text edges vs pure white background.
    if global_median < 1.0 and cv > 3.0:
        status = "pass"
        score = 95
        details = f"Uniform digital flat image detected. No compression anomalies."
    elif num_outliers > 0 and outlier_intensity > 5.0 and outlier_ratio > 0.005:
        status = "fail"
        score = max(5, 25 - int(outlier_intensity * 2))
        details = (f"Regional compression inconsistency detected. "
                   f"{num_outliers}/{total_blocks} blocks are massive outliers "
                   f"(intensity: {outlier_intensity:.1f}x). Probable image splicing.")
    elif num_outliers > 0 and cv > 0.5 and outlier_ratio > 0.005:
        status = "fail"
        score = max(5, 25 - int(outlier_intensity * 3))
        details = (f"Regional compression inconsistency detected. "
                   f"{num_outliers}/{total_blocks} blocks are outliers "
                   f"(intensity: {outlier_intensity:.1f}x, CV: {cv:.2f}). Probable image splicing.")
    elif num_outliers > 0 and outlier_intensity > 1.0:
        status = "warning"
        score = 50
        details = (f"Minor regional variance: {num_outliers} blocks show elevated artifacts.")
    else:
        status = "pass"
        score = 95
        details = f"Uniform compression across {total_blocks} blocks. No splicing indicators."
    
    return {
        "score": score,
        "status": status,
        "details": details,
        "_diagnostics": {
            "total_blocks": total_blocks,
            "outlier_blocks": num_outliers,
            "outlier_intensity": round(outlier_intensity, 2),
            "coefficient_of_variation": round(cv, 4),
            "global_median_ela": round(global_median, 2),
            "iqr_upper_fence": round(upper_fence, 2)
        }
    }, ela_raw, (num_outliers, outlier_mask, block_coords)

def generate_heatmap(image, num_outliers, outlier_mask, block_coords, face_splice_result=None, face_box=None, ai_detection=None, risk_score=0):
    h, w = image.shape[:2]
    # Create a smooth Grad-CAM style hotspot mask for outliers
    blob_mask = np.zeros((h, w), dtype=np.float32)
    
    if num_outliers > 0:
        for i, is_outlier in enumerate(outlier_mask):
            if is_outlier:
                y1, y2, x1, x2 = block_coords[i]
                # Fill the block with a high intensity
                blob_mask[y1:y2, x1:x2] = 255.0
                
    # If face matching failed, or if the AI detection flagged the image (even as a warning),
    # or if the overall risk score is highly suspicious (>= 70), provide a visual heatmap.
    if (num_outliers == 0 and risk_score >= 60) or \
       (face_splice_result and face_splice_result.get("status") == "fail") or \
       (ai_detection and ai_detection.get("status") in ["fail", "warning"]):
        if face_box:
            x, y, w_box, h_box = face_box
            # Focus intensely on the face
            blob_mask[y:y+h_box, x:x+w_box] = 255.0
        elif risk_score >= 60:
            # If no face is found but it's a global fake, tint the center heavily
            cy, cx = h // 2, w // 2
            blob_mask[cy-h//4:cy+h//4, cx-w//4:cx+w//4] = 200.0
                
    # Blur massively to create smooth heat blobs
    ksize = min(w, h) // 6
    if ksize % 2 == 0:
        ksize += 1
    ksize = max(31, ksize)
    
    blob_mask = cv2.GaussianBlur(blob_mask, (ksize, ksize), 0)
    
    # Normalize the blurred mask back to 0-255
    if np.max(blob_mask) > 0:
        blob_mask = cv2.normalize(blob_mask, None, 0, 255, cv2.NORM_MINMAX)
        
    blob_mask = blob_mask.astype(np.uint8)
    
    # Apply colormap (INFERNO: 0 is black, 255 is bright yellow/white)
    heatmap = cv2.applyColorMap(blob_mask, cv2.COLORMAP_INFERNO)
    
    # Create a dimmed grayscale version of the original image as the background
    gray_bg = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    dark_bg = cv2.merge([gray_bg, gray_bg, gray_bg])
    dark_bg = cv2.convertScaleAbs(dark_bg, alpha=0.4, beta=0)
    
    # Blend the glowing heatmap over the dimmed background
    overlay = dark_bg.copy()
    for c in range(3):
        overlay[:, :, c] = np.where(blob_mask > 20, 
                                   cv2.addWeighted(dark_bg[:, :, c], 0.3, heatmap[:, :, c], 0.9, 0), 
                                   dark_bg[:, :, c])
    
    # Draw RED bounding boxes precisely around the specific outlier blocks
    if num_outliers > 0:
        for i, is_outlier in enumerate(outlier_mask):
            if is_outlier:
                y1, y2, x1, x2 = block_coords[i]
                cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 0, 255), 2)
                
    if face_splice_result and face_splice_result.get("status") == "fail" and face_box:
        x, y, w_box, h_box = face_box
        cv2.rectangle(overlay, (x, y), (x+w_box, y+h_box), (0, 0, 255), 2)
        
    return overlay
