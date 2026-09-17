import cv2
import numpy as np
from PIL import Image
import io

def analyze_fft(image):
    """
    Perform a 2D Fast Fourier Transform on the image to detect high-frequency 
    periodic patterns often left by generative AI (convolutional upsampling artifacts).
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Compute 2D FFT
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    
    # Calculate magnitude spectrum
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
    
    # Analyze the high frequency rings (edges of the spectrum)
    h, w = gray.shape
    cy, cx = h // 2, w // 2
    
    # Mask out the low frequencies (center)
    r = min(cx, cy) // 2
    y, x = np.ogrid[-cy:h-cy, -cx:w-cx]
    mask = x*x + y*y >= r*r
    
    high_freq_mag = magnitude_spectrum[mask]
    
    if len(high_freq_mag) == 0:
        return 0, 0
        
    mean_hf = np.mean(high_freq_mag)
    std_hf = np.std(high_freq_mag)
    
    # AI generated images often have unusual spikes in the high frequency domain
    # resulting in a higher standard deviation relative to the mean.
    cv_hf = std_hf / (mean_hf + 1e-6)
    
    return mean_hf, cv_hf

def analyze_exif(file_bytes):
    """
    Extract EXIF metadata to check if the image has been stripped (common in AI/fakes)
    or explicitly saved by editing software.
    """
    has_exif = False
    software_tag = None
    
    try:
        img = Image.open(io.BytesIO(file_bytes))
        exif_data = img.getexif()
        
        if exif_data is not None and len(exif_data) > 0:
            has_exif = True
            # EXIF tag 305 is "Software"
            software_tag = exif_data.get(305, "").lower()
            if not software_tag:
                # Sometimes it's in the 0th IFD under 0x0131
                software_tag = exif_data.get(0x0131, "").lower()
    except Exception as e:
        pass
        
    return has_exif, software_tag

def run_ai_detection(image, file_bytes):
    """
    Combines FFT and EXIF analysis to produce a real heuristic for AI generation.
    """
    mean_hf, cv_hf = analyze_fft(image)
    has_exif, software_tag = analyze_exif(file_bytes)
    
    score = 85
    status = "pass"
    details_parts = []
    
    # 1. Check EXIF for obvious editing software
    if software_tag and ("photoshop" in software_tag or "midjourney" in software_tag or "dall-e" in software_tag):
        score = min(score, 20)
        status = "fail"
        details_parts.append(f"Image saved by digital editing software: {software_tag}.")
    
    # 2. Lack of EXIF metadata on an "ID card" is highly suspicious
    if not has_exif:
        score = min(score, 25)
        status = "fail"
        details_parts.append("Missing EXIF metadata (highly indicative of a scraped, synthetic, or screenshot image).")
        
    # 3. FFT Analysis
    # Extremely low high-frequency variance usually means a very clean, noise-free 
    # synthetic background. Conversely, weird spikes push cv_hf very high.
    if cv_hf > 0.35: # Example threshold for unnatural periodic artifacts
        score = min(score, 30)
        status = "fail"
        details_parts.append(f"Abnormal high-frequency spectrum (CV: {cv_hf:.2f}). Grid artifacts detected.")
    elif mean_hf < 50 and cv_hf < 0.05: # Unnaturally clean
        score = min(score, 45)
        if status != "fail":
            status = "warning"
        details_parts.append(f"Unnaturally clean frequency domain (Mean: {mean_hf:.1f}). Possible synthetic origin.")
        
    if score >= 80:
        details = "Natural frequency spectrum and metadata consistency. No synthetic fingerprints."
    else:
        details = " ".join(details_parts)
        
    return {
        "score": int(score),
        "status": status,
        "details": details,
        "_diagnostics": {
            "fft_mean_hf": float(mean_hf),
            "fft_cv_hf": float(cv_hf),
            "has_exif": has_exif,
            "software": software_tag
        }
    }
