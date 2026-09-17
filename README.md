# 👁️ SatyaDrishti

SatyaDrishti is a lightweight, 5-layer forensic analysis engine built to detect forged, AI-generated, and digitally manipulated identity documents. 

Developed for the **Smart India Hackathon (SIH)**, this prototype demonstrates a multi-modal approach to document verification, moving beyond simple OCR to actual pixel-level forensics and frequency-domain analysis.

## 🔬 Core Pipeline

The verification engine processes documents through 5 distinct heuristic layers:

1. 🟩 **Pixel Forensics (ELA):** Computes block-wise standard deviations of JPEG compression ratios to detect regional splicing (e.g., pasted faces).
2. 🟨 **AI Generation Check:** Performs a 2D Fast Fourier Transform (FFT) to analyze the high-frequency spectrum for convolutional upsampling artifacts typical of diffusion models. Extracts EXIF metadata to flag scrubbed or software-altered origins.
3. 🟦 **Structural Validation:** Analyzes document aspect ratios, border geometries, and standard ID dimensions.
4. 🟪 **Security Features:** Scans for physical security markers, micro-printing zones, and valid QR payload structures.
5. 🟥 **OCR Consistency:** Verifies biometric data against MRZ (Machine Readable Zone) and secondary text fields for logical consistency.

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, OpenCV (`cv2`), NumPy, Pillow
- **Frontend:** React, Vite, TailwindCSS (v4), Framer Motion
- **Architecture:** Stateless REST API decoupling the heavy OpenCV forensic processing from the client.

## 🚀 Local Development

### ⚙️ Backend Setup
Requires Python 3.9+.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 💻 Frontend Setup
Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## ⚖️ Legal / Disclaimer
This repository contains a prototype built for demonstration purposes during a hackathon. The forensic heuristics implemented (such as ELA and FFT) are simplified models and should not be used in production identity verification systems without rigorous validation and tuning.
