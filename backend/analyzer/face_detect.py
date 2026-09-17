import cv2
import os

def detect_face(image):
    """
    Face detection using Haar cascade (SEMI-REAL).
    """
    # Load the cascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) > 0:
        # Return the first face detected
        x, y, w, h = faces[0]
        return {
            "detected": True,
            "box": (int(x), int(y), int(w), int(h))
        }
    
    return {
        "detected": False,
        "box": None
    }
