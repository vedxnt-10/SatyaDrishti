import cv2
import sys
import json
import os

# Add analyzer to path
sys.path.append('/Users/vedant/.gemini/antigravity-ide/scratch/truthlens/backend')

from analyzer.ela import run_ela
from analyzer.noise_analysis import analyze_noise_consistency
from analyzer.structural import check_structure
from analyzer.qr_check import check_qr
from analyzer.ocr import run_ocr
from analyzer.mock_layers import mock_ai_detection

from analyzer.face_detect import detect_face
from analyzer.face_forensics import analyze_face_splicing

def test_image(img_path):
    print(f"Testing {os.path.basename(img_path)}")
    image = cv2.imread(img_path)
    if image is None:
        print("Could not read image.")
        return
        
    print("--- FACE SPLICING ---")
    face_res = detect_face(image)
    if face_res["detected"]:
        splice_res = analyze_face_splicing(image, face_res["box"])
        print(json.dumps(splice_res, indent=2))
    else:
        print("No face detected.")
        
    print("--- ELA ---")
    ela_res, _, _ = run_ela(image)
    print(json.dumps(ela_res, indent=2))
    
    print("--- NOISE ---")
    noise_res = analyze_noise_consistency(image)
    print(json.dumps(noise_res, indent=2))

if __name__ == "__main__":
    test_image("/Users/vedant/.gemini/antigravity-ide/brain/60211e6e-1b6b-4c16-b560-c3d5e4908bde/.user_uploaded/media_1787731868352.png")
    test_image("/Users/vedant/.gemini/antigravity-ide/brain/60211e6e-1b6b-4c16-b560-c3d5e4908bde/.user_uploaded/media_1787731868352.png")
