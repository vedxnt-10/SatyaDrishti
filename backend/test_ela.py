import os
import cv2
from analyzer.ela import run_ela

sample_path = os.path.join(os.path.dirname(__file__), '../frontend/public/sample_docs/tampered_aadhaar.jpg')
img = cv2.imread(sample_path)
if img is not None:
    res, raw, overlay = run_ela(img)
    print("ELA Result:", res)
else:
    print(f"Sample image not found at {sample_path}")
