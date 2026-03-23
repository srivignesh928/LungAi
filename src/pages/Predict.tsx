import Navbar from "@/components/Navbar";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";

type PredictionResult = {
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
};

const PREDICTIONS_KEY = "lungsight_recent_predictions_v2";

const Predict = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const openFilePicker = () => inputRef.current?.click();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPredictionResult(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveRecentPrediction = (
    fileName: string | null,
    label: string,
    confidence: number
  ) => {
    try {
      const raw = localStorage.getItem(PREDICTIONS_KEY);
      const arr = raw ? JSON.parse(raw) : [];

      arr.unshift({
        name: fileName ?? "Uploaded Image",
        label,
        confidence,
        ts: new Date().toISOString(),
      });

      localStorage.setItem(PREDICTIONS_KEY, JSON.stringify(arr.slice(0, 10)));
    } catch {
      console.warn("LocalStorage save failed");
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setPredictionResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const BACKEND_URL =
        (import.meta.env as any).VITE_API_URL || "http://localhost:5000";

      const resp = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) throw new Error("Prediction failed");

      const data = await resp.json();

      const label: string = data.prediction;
      const confidence = Math.round(data.confidence);
      const probabilities = data.all_probabilities || {};

      setPredictionResult({
        label,
        confidence,
        probabilities,
      });

      saveRecentPrediction(selectedFile.name, label, confidence);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Check backend logs.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Lung Disease Classification
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a chest X-ray to analyze multiple lung conditions
            </p>
          </div>

          {/* Upload Card */}
          <Card className="p-8 shadow-soft">
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">

              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Uploaded X-ray"
                    className="mx-auto max-h-96 rounded-md shadow-md object-contain"
                  />

                  <p className="text-sm font-medium">{selectedFile?.name}</p>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <Button variant="outline" onClick={openFilePicker}>
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-12">
                  <Upload className="w-10 h-10 mx-auto text-primary" />
                  <p className="text-sm font-medium">
                    Drop your X-ray image or click below
                  </p>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <Button variant="outline" onClick={openFilePicker}>
                    Select File
                  </Button>
                </div>
              )}
            </div>

            {selectedFile && (
              <Button
                className="w-full mt-6 bg-gradient-primary"
                size="lg"
                onClick={handlePredict}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze X-ray"
                )}
              </Button>
            )}
          </Card>

          {/* Prediction Result */}
          {predictionResult && (
            <Card className="mt-8 p-8 shadow-glow">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Diagnosis Result</h2>

                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {predictionResult.label} • {predictionResult.confidence}%
                </Badge>

                <div className="max-w-md mx-auto text-left space-y-2">
                  {Object.entries(predictionResult.probabilities).map(
                    ([disease, prob]) => (
                      <div key={disease} className="flex justify-between text-sm">
                        <span className="font-medium">{disease}</span>
                        <span>{prob}%</span>
                      </div>
                    )
                  )}
                </div>

                <p className="text-muted-foreground max-w-md mx-auto">
                  This AI-based result is for clinical assistance only.
                  Please consult a certified medical professional.
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Predict;
