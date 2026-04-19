import Navbar from "@/components/Navbar";
import { Upload, Loader2, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";

type PredictionResult = {
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
};

const PREDICTIONS_KEY = "lungsight_recent_predictions_v2";

const Predict = () => {
  const [uploading, setUploading] = useState(false);
  
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [ctFile, setCtFile] = useState<File | null>(null);
  const [age, setAge] = useState<string>("30");
  const [gender, setGender] = useState<string>("0"); // 0 for Male, 1 for Female
  
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [xrayPreview, setXrayPreview] = useState<string | null>(null);
  const [ctPreview, setCtPreview] = useState<string | null>(null);

  const xrayInputRef = useRef<HTMLInputElement | null>(null);
  const ctInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (xrayPreview) URL.revokeObjectURL(xrayPreview);
      if (ctPreview) URL.revokeObjectURL(ctPreview);
    };
  }, [xrayPreview, ctPreview]);

  const handleXrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (xrayPreview) URL.revokeObjectURL(xrayPreview);
    setXrayFile(file);
    setPredictionResult(null);
    setXrayPreview(URL.createObjectURL(file));
  };

  const handleCtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (ctPreview) URL.revokeObjectURL(ctPreview);
    setCtFile(file);
    setPredictionResult(null);
    setCtPreview(URL.createObjectURL(file));
  };

  const saveRecentPrediction = (
    label: string,
    confidence: number
  ) => {
    try {
      const raw = localStorage.getItem(PREDICTIONS_KEY);
      const arr = raw ? JSON.parse(raw) : [];

      arr.unshift({
        name: `Multimodal Analysis (Age: ${age})`,
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
    if (!xrayFile || !ctFile) {
        alert("Please upload both an X-ray and a CT Scan.");
        return;
    }

    setUploading(true);
    setPredictionResult(null);

    try {
      const formData = new FormData();
      formData.append("xray", xrayFile);
      formData.append("ctscan", ctFile);
      formData.append("age", age);
      formData.append("gender", gender);

      const BACKEND_URL =
        (import.meta.env as any).VITE_API_URL || "http://localhost:5000";

      const resp = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "Prediction failed");
      }

      const data = await resp.json();

      const label: string = data.prediction;
      const confidence = Math.round(data.confidence);
      const probabilities = data.all_probabilities || {};

      setPredictionResult({
        label,
        confidence,
        probabilities,
      });

      saveRecentPrediction(label, confidence);
    } catch (err: any) {
      console.error(err);
      alert(`Prediction failed: ${err.message || "Check backend logs."}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Multimodal Lung Disease Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Provide Patient Metadata, Chest X-ray, and CT Scan for an integrated prediction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Metadata Card */}
            <Card className="p-8 shadow-soft md:col-span-2">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Patient Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="age">Patient Age</Label>
                        <Input 
                            id="age"
                            type="number" 
                            min="0" 
                            max="120" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="e.g. 45"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Patient Gender</Label>
                        <select 
                            id="gender"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="0">Male</option>
                            <option value="1">Female</option>
                            <option value="2">Other</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* X-Ray Upload Card */}
            <Card className="p-8 shadow-soft flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 w-full text-center">Chest X-ray</h3>
              <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30 w-full flex-grow flex flex-col justify-center items-center">
                {xrayPreview ? (
                  <div className="space-y-4 w-full">
                    <img
                      src={xrayPreview}
                      alt="Uploaded X-ray"
                      className="mx-auto max-h-48 rounded-md shadow-md object-contain"
                    />
                    <p className="text-sm font-medium truncate px-2">{xrayFile?.name}</p>
                    <input
                      ref={xrayInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleXrayChange}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => xrayInputRef.current?.click()}>
                      Change X-ray
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <FileImage className="w-10 h-10 mx-auto text-primary" />
                    <p className="text-sm font-medium">
                      Upload Chest X-ray
                    </p>
                    <input
                      ref={xrayInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleXrayChange}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => xrayInputRef.current?.click()}>
                      Select X-ray
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* CT Scan Upload Card */}
            <Card className="p-8 shadow-soft flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4 w-full text-center">CT Scan</h3>
              <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30 w-full flex-grow flex flex-col justify-center items-center">
                {ctPreview ? (
                  <div className="space-y-4 w-full">
                    <img
                      src={ctPreview}
                      alt="Uploaded CT Scan"
                      className="mx-auto max-h-48 rounded-md shadow-md object-contain"
                    />
                    <p className="text-sm font-medium truncate px-2">{ctFile?.name}</p>
                    <input
                      ref={ctInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCtChange}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => ctInputRef.current?.click()}>
                      Change CT Scan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <Upload className="w-10 h-10 mx-auto text-primary" />
                    <p className="text-sm font-medium">
                      Upload CT Scan
                    </p>
                    <input
                      ref={ctInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCtChange}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => ctInputRef.current?.click()}>
                      Select CT Scan
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button
                className="w-full md:w-2/3 lg:w-1/2 bg-gradient-primary text-lg h-14"
                size="lg"
                onClick={handlePredict}
                disabled={uploading || !xrayFile || !ctFile}
            >
                {uploading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Multimodal Data...
                </>
                ) : (
                "Analyze Patient Data"
                )}
            </Button>
          </div>

          {/* Prediction Result */}
          {predictionResult && (
            <Card className="mt-8 p-8 shadow-glow max-w-2xl mx-auto">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold">Integrated Diagnosis</h2>

                <Badge variant="secondary" className="text-lg px-4 py-2 bg-primary/10 text-primary border-primary/20">
                  {predictionResult.label} • {predictionResult.confidence}% Confidence
                </Badge>

                <div className="max-w-md mx-auto text-left space-y-2">
                  {Object.entries(predictionResult.probabilities).map(
                    ([disease, prob]) => (
                      <div key={disease} className="flex justify-between text-sm p-3 bg-muted/50 rounded-md">
                        <span className="font-semibold text-foreground/80">{disease}</span>
                        <span className="font-mono">{prob}%</span>
                      </div>
                    )
                  )}
                </div>

                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  This multi-modal AI result combines X-ray, CT Scan, and metadata.
                  Results are for clinical assistance only. Please consult a certified medical professional.
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
