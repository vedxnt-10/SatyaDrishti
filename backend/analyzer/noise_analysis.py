import cv2
import numpy as np

def analyze_noise_consistency(image):
    """
    Noise Inconsistency Analysis — detects pasted elements from different sources.
    
    CORE PRINCIPLE: Every camera/scanner/screen-capture produces images with a
    characteristic noise pattern. When you paste a face from Source A onto a
    document from Source B, the pasted region has a fundamentally different noise
    level. This survives JPEG re-saving.
    
    Method:
    1. Extract the high-frequency noise component using a Laplacian filter
    2. Divide the image into blocks
    3. Measure the noise variance in each block
    4. Blocks from a different source will have a different noise variance → outlier
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Extract noise using Laplacian (high-pass filter)
    noise = cv2.Laplacian(gray, cv2.CV_64F)
    noise = np.abs(noise)
    
    h, w = noise.shape
    block_size = 32
    rows = h // block_size
    cols = w // block_size
    
    if rows < 3 or cols < 3:
        block_size = 16
        rows = h // block_size
        cols = w // block_size
    
    block_variances = []
    for r in range(rows):
        for c in range(cols):
            y1, y2 = r * block_size, (r + 1) * block_size
            x1, x2 = c * block_size, (c + 1) * block_size
            block = noise[y1:y2, x1:x2]
            block_variances.append(float(np.var(block)))
    
    block_variances = np.array(block_variances)
    
    if len(block_variances) < 4:
        return {"score": 80, "status": "pass", "details": "Image too small for noise analysis."}
    
    # IQR outlier detection
    q1 = np.percentile(block_variances, 25)
    q3 = np.percentile(block_variances, 75)
    iqr = q3 - q1
    lower_fence = q1 - 2.0 * iqr
    upper_fence = q3 + 2.0 * iqr
    
    # CRITICAL: Prevent false positives on completely digital images (0 noise background).
    # If the image is synthetic, the variance is 0, so any text edge triggers an outlier.
    # Enforce a minimum absolute variance threshold for noise to be considered anomalous.
    upper_fence = max(upper_fence, 50.0)
    
    outliers = np.sum((block_variances < lower_fence) | (block_variances > upper_fence))
    total = len(block_variances)
    outlier_ratio = outliers / total
    
    # Coefficient of variation — how spread out are the noise levels?
    global_median = float(np.median(block_variances))
    cv = float(np.std(block_variances) / (global_median + 1e-6))
    
    if global_median < 1.0 or cv > 5.0:
        return {
            "score": 95,
            "status": "pass",
            "details": f"Uniform digital flat image detected. No noise anomalies."
        }
        
    if outlier_ratio > 0.05 and cv > 0.6:
        return {
            "score": 20,
            "status": "fail",
            "details": f"Noise inconsistency: {outliers}/{total} blocks have anomalous noise levels (CV={cv:.2f}). Source mismatch detected."
        }
    elif outlier_ratio > 0.02 or cv > 0.45:
        return {
            "score": 50,
            "status": "warning",
            "details": f"Minor noise variance detected across {outliers} blocks."
        }
    else:
        return {
            "score": 90,
            "status": "pass",
            "details": f"Noise levels consistent across {total} blocks."
        }
