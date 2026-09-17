import cv2
import numpy as np
import qrcode

# Generate a dummy QR code
qr = qrcode.QRCode(version=1, box_size=4, border=1)
qr.add_data("Dummy Aadhaar Data: 1234 5678 9012")
qr.make(fit=True)
qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
qr_cv = np.array(qr_img)
qr_cv = qr_cv[:, :, ::-1].copy() # RGB to BGR
qr_h, qr_w, _ = qr_cv.shape

# 1. Genuine Aadhaar
img1 = np.ones((600, 950, 3), dtype=np.uint8) * 255
cv2.putText(img1, "AADHAAR CARD", (350, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3)
cv2.rectangle(img1, (50, 150), (250, 400), (200, 200, 200), -1) # Photo area
cv2.putText(img1, "Name: John Doe", (300, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.putText(img1, "DOB: 15/08/1990", (300, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.putText(img1, "Male", (300, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.putText(img1, "1234 5678 9012", (300, 400), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3)

# Paste QR code onto Aadhaar
img1[150:150+qr_h, 750:750+qr_w] = qr_cv

cv2.imwrite("../frontend/public/sample_docs/genuine_aadhaar.jpg", img1, [cv2.IMWRITE_JPEG_QUALITY, 95])

# 2. Tampered Aadhaar (Re-save a region to simulate tampering)
img2 = img1.copy()
fake_face = np.ones((250, 200, 3), dtype=np.uint8) * 150
cv2.putText(fake_face, "FACE", (50, 125), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)
_, enc = cv2.imencode('.jpg', fake_face, [cv2.IMWRITE_JPEG_QUALITY, 20])
fake_face_bad = cv2.imdecode(enc, cv2.IMREAD_COLOR)
img2[150:400, 50:250] = fake_face_bad
cv2.imwrite("../frontend/public/sample_docs/tampered_aadhaar.jpg", img2, [cv2.IMWRITE_JPEG_QUALITY, 95])

# 3. AI Generated PAN
img3 = np.ones((600, 950, 3), dtype=np.uint8) * 240
cv2.putText(img3, "INCOME TAX DEPARTMENT", (250, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 0), 2)
cv2.rectangle(img3, (700, 150), (900, 400), (180, 180, 180), -1)
cv2.putText(img3, "Name: AI Person", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.putText(img3, "DOB: 12/12/1985", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
cv2.putText(img3, "ABCDE1234F", (50, 400), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3)
noise = np.random.randint(0, 50, (600, 950, 3), dtype=np.uint8)
img3 = cv2.add(img3, noise)
cv2.imwrite("../frontend/public/sample_docs/ai_generated_pan.jpg", img3, [cv2.IMWRITE_JPEG_QUALITY, 90])
