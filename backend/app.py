from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

# =========================
# Load model (compile=False FIX)
# =========================
MODEL_PATH = r"D:\Pnemonia_Project\lungsight-ai\backend\lung_multiclass_densenet121.h5"

print("🔄 Loading model...")
model = tf.keras.models.load_model(MODEL_PATH, compile=False)
print("✅ Model loaded successfully")

# =========================
# MUST match training folder order
# =========================
CLASS_NAMES = [
    "Covid-19",
    "Emphysema",
    "Normal",
    "Pneumonia",
    "Tuberculosis"
]

# =========================
# Image preprocessing
# =========================
def preprocess_pil(img_pil):
    img = img_pil.convert("RGB").resize((224, 224))
    arr = image.img_to_array(img) / 255.0
    arr = np.expand_dims(arr, axis=0).astype(np.float32)
    return arr

# =========================
# Prediction endpoint
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        file = request.files["file"]
        img_pil = Image.open(BytesIO(file.read()))

        x = preprocess_pil(img_pil)
        preds = model.predict(x, verbose=0)[0]

        class_index = int(np.argmax(preds))
        confidence = float(preds[class_index])

        return jsonify({
            "prediction": CLASS_NAMES[class_index],
            "confidence": round(confidence * 100, 2),
            "all_probabilities": {
                CLASS_NAMES[i]: round(float(preds[i]) * 100, 2)
                for i in range(len(CLASS_NAMES))
            }
        })

    except Exception as e:
        print("❌ Prediction error:", e)
        return jsonify({"error": "Prediction failed"}), 500

# =========================
# Run server
# =========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
