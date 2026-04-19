import { useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [xray, setXray] = useState<File | null>(null);
  const [ct, setCt] = useState<File | null>(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("0");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!xray || !ct) {
      alert("Upload both X-ray and CT scan");
      return;
    }

    const formData = new FormData();
    formData.append("xray", xray);
    formData.append("ctscan", ct);
    formData.append("age", age);
    formData.append("gender", gender);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5001/predict",
        formData
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>🫁 Lung AI Multimodal Dashboard</h1>

      <div style={{ marginBottom: "15px" }}>
        <label>X-ray:</label>
        <input
          type="file"
          onChange={(e) => setXray(e.target.files?.[0] || null)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>CT Scan:</label>
        <input
          type="file"
          onChange={(e) => setCt(e.target.files?.[0] || null)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Age:</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Gender:</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="0">Male</option>
          <option value="1">Female</option>
        </select>
      </div>

      <button onClick={handleSubmit}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Result</h2>
          <p><strong>Prediction:</strong> {result.prediction}</p>
          <p><strong>Confidence:</strong> {result.confidence}%</p>

          <h3>All Probabilities:</h3>
          <ul>
            {Object.entries(result.all_probabilities).map(([key, value]) => (
              <li key={key}>
                {key}: {value as number}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
