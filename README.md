# LungAI - Multimodal Lung Disease Prediction System

## Description

LungAI is a full-stack AI-based healthcare web application designed to assist in lung disease prediction using multimodal medical inputs. The system accepts Chest X-ray images, CT scan images, and patient metadata such as age and gender to generate an AI-assisted diagnostic prediction with confidence scores.

This project is built as a placement portfolio project to demonstrate skills in frontend development, backend API integration, machine learning workflow integration, and healthcare-focused application design.

---

## Project Overview

LungAI provides a clean and interactive interface where users can upload medical images and patient details to receive a predicted lung condition.

The application focuses on three major classes:

* Normal
* Pneumonia
* Covid

The system combines medical image inputs and patient metadata to simulate a multimodal diagnostic workflow.

---

## Features

* Upload Chest X-ray image
* Upload CT scan image
* Enter patient metadata (age and gender)
* AI-based lung disease prediction
* Confidence score display
* Probability distribution for each disease class
* Automated patient report generation
* Grad-CAM style visual activation preview
* Recent prediction history using browser local storage
* Responsive UI
* React frontend with Flask backend API

---

## Tech Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router
* Lucide React Icons

### Backend

* Python
* Flask
* NumPy
* Pillow
* TensorFlow / Keras

### Machine Learning

* Multimodal deep learning approach
* Chest X-ray input
* CT scan input
* Patient metadata input
* Model format: `.keras`

---

## Folder Structure

```text
LungAi/
│
├── backend/
│   ├── app.py
│   ├── train.py
│   └── models/
│       └── final_model.keras
│
├── public/
│   ├── lungs.png
│   └── placeholder.svg
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── Predict.tsx
│   │   └── Analysis.tsx
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/LungAi.git
cd LungAi
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Run the Backend Server

```bash
py backend/app.py
```

Backend will run on:

```
http://localhost:5001
```

### 4. Run the Frontend

```bash
npm run dev -- --host 127.0.0.1
```

Frontend will run on:

```
http://127.0.0.1:5173/
```

---

## Usage

1. Open the application in your browser
2. Navigate to the prediction page
3. Upload a Chest X-ray image
4. Upload a CT scan image
5. Enter patient age and gender
6. Click the prediction button
7. View results including prediction, confidence score, probabilities, and report

---

## API Endpoint

### POST /predict

Backend URL:

```
http://localhost:5001/predict
```

### Request Format

* `xray` → File (Chest X-ray image)
* `ctscan` → File (CT scan image)
* `age` → Number
* `gender` → Number

### Sample Response

```json
{
  "prediction": "Normal",
  "confidence": 86.33,
  "all_probabilities": {
    "Normal": 86.33,
    "Pneumonia": 6.84,
    "Covid": 6.84
  }
}
```

---

## Project Highlights

* Full-stack healthcare AI application
* React frontend integrated with Flask backend
* Multimodal input handling (image + metadata)
* Clean UI with diagnostic insights
* Structured for GitHub portfolio and placement use

---

## Learning Outcomes

* Full-stack development
* React and TypeScript
* Flask API development
* Machine learning integration
* Image handling in web apps
* REST API communication
* Healthcare AI workflow
* GitHub documentation

---

## Future Enhancements

* User authentication
* Database integration for reports
* PDF report generation
* Real Grad-CAM visualization
* Improved model accuracy
* Cloud deployment
* Doctor/admin dashboard

---

## Disclaimer

This project is developed for academic and placement portfolio purposes only. It is not intended for real medical diagnosis.

---

## Author

Sri Vignesh R
Developer

GitHub: https://github.com/srivignesh928

---

## License

This project is licensed under the MIT License.
