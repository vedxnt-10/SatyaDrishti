import cv2
from analyzer.ela import run_ela
img = cv2.imread('/Users/vedant/.gemini/antigravity-ide/brain/60211e6e-1b6b-4c16-b560-c3d5e4908bde/scratch/sample_docs/tampered_aadhaar.jpg')
res, raw, overlay = run_ela(img)
cv2.imwrite('overlay_test.jpg', overlay)
print(res)
