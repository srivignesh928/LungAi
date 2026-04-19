import Navbar from "@/components/Navbar";
import { Upload, Loader2, FileImage, Activity, FileText, AlertTriangle, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import CustomCursor from "@/components/CustomCursor";

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
  const [gender, setGender] = useState<string>("0"); 
  
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [xrayPreview, setXrayPreview] = useState<string | null>(null);
  const [ctPreview, setCtPreview] = useState<string | null>(null);

  const xrayInputRef = useRef<HTMLInputElement | null>(null);
  const ctInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Advanced Mouse Glow Effect for the background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const { clientX, clientY } = e;
        containerRef.current.style.setProperty('--mouse-x', `${clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${clientY}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    return () => {
      if (xrayPreview) URL.revokeObjectURL(xrayPreview);
    };
  }, [xrayPreview]);

  useEffect(() => {
    return () => {
      if (ctPreview) URL.revokeObjectURL(ctPreview);
    };
  }, [ctPreview]);

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

  const saveRecentPrediction = (label: string, confidence: number, probabilities: Record<string, number>, age: string, gender: string) => {
    try {
      const raw = localStorage.getItem(PREDICTIONS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({
        name: `Multimodal Analysis (Age: ${age})`,
        label,
        confidence,
        probabilities,
        age,
        gender,
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

      const BACKEND_URL = (import.meta.env as any).VITE_API_URL || "http://localhost:5001";

      const resp = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "Prediction failed");
      }

      const data = await resp.json();

      setPredictionResult({
        label: data.prediction,
        confidence: Math.round(data.confidence),
        probabilities: data.all_probabilities || {},
      });

      saveRecentPrediction(data.prediction, Math.round(data.confidence), data.all_probabilities || {}, age, gender);
    } catch (err: any) {
      console.error(err);
      alert(`Prediction failed: ${err.message || "Check backend logs."}`);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to generate clinical report based on the prediction
  const getReportDetails = (label: string) => {
    if (label.toLowerCase() === "pneumonia") {
      return {
        analysis: "The model detected patterns consistent with lung infection, notably featuring dense opacities and regional consolidations.",
        recommendation: "Consult pulmonologist. Suggested CT follow-up and bacterial/viral screening.",
        risk: "Medium",
        riskColor: "text-amber-600 bg-amber-100 border-amber-200"
      };
    } else if (label.toLowerCase() === "covid") {
      return {
        analysis: "Ground-glass opacities, bilateral patchy distributions, and interstitial changes consistent with viral pathogenesis detected.",
        recommendation: "Immediate isolation. Urgent medical consultation and PCR testing required.",
        risk: "High",
        riskColor: "text-rose-600 bg-rose-100 border-rose-200"
      };
    } else {
      return {
        analysis: "No significant anomalous opacities, nodules, or consolidations detected in the pulmonary fields. Bronchial structures appear structurally sound.",
        recommendation: "Routine checkup. Maintain healthy respiratory habits.",
        risk: "Low",
        riskColor: "text-emerald-600 bg-emerald-100 border-emerald-200"
      };
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-800"
      style={{
        backgroundImage: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 150, 255, 0.08) 0%, transparent 45%)`,
      }}
    >
      <CustomCursor />
      
      {/* Light Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-300/20 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-2 mb-4 bg-white/60 rounded-full border border-blue-200 shadow-sm backdrop-blur-md">
                <Activity className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Advanced Diagnostics</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm pb-1">
              Quantum Multi-Modal Analysis
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Synthesize patient metadata, high-resolution X-rays, and CT topography through our state-of-the-art neural architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Metadata Card - LIGHT GLASSMORPHISM */}
            <div className="md:col-span-2 p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:bg-white/90">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
                    Patient Telemetry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label htmlFor="age" className="text-slate-600 font-semibold tracking-wide">Patient Age</Label>
                        <Input 
                            id="age"
                            type="number" 
                            min="0" 
                            max="120" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)}
                            className="bg-white/80 border-slate-200 text-slate-800 h-12 rounded-xl focus:ring-2 focus:ring-blue-400/50 transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="gender" className="text-slate-600 font-semibold tracking-wide">Biological Gender</Label>
                        <select 
                            id="gender"
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all shadow-sm appearance-none cursor-pointer"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="0" className="bg-white text-slate-800">Male</option>
                            <option value="1" className="bg-white text-slate-800">Female</option>
                            <option value="2" className="bg-white text-slate-800">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* X-Ray Upload Card - LIGHT GLASSMORPHISM */}
            <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,100,255,0.08)] hover:border-blue-200">
              <h3 className="text-xl font-bold mb-6 w-full text-center text-slate-800 tracking-wide">Radiograph (X-ray)</h3>
              <div 
                className="w-full flex-grow flex flex-col justify-center items-center rounded-xl p-6 border-2 border-dashed border-slate-300 bg-slate-50/50 group-hover:border-blue-400 group-hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                onClick={() => xrayInputRef.current?.click()}
              >
                {xrayPreview ? (
                  <div className="space-y-4 w-full text-center">
                    <div className="relative p-2 bg-white rounded-xl overflow-hidden shadow-md border border-slate-100">
                        <img
                        src={xrayPreview}
                        alt="Uploaded X-ray"
                        className="mx-auto h-48 w-full object-cover rounded-lg opacity-90 transition-opacity hover:opacity-100"
                        />
                    </div>
                    <p className="text-sm font-medium text-slate-600 truncate px-2">{xrayFile?.name}</p>
                    <input ref={xrayInputRef} type="file" accept="image/*" onChange={handleXrayChange} className="hidden" />
                  </div>
                ) : (
                  <div className="space-y-4 py-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-500 shadow-inner">
                        <FileImage className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Click to upload or drag & drop</p>
                    <input ref={xrayInputRef} type="file" accept="image/*" onChange={handleXrayChange} className="hidden" />
                  </div>
                )}
              </div>
            </div>

            {/* CT Scan Upload Card - LIGHT GLASSMORPHISM */}
            <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,100,255,0.08)] hover:border-cyan-200">
              <h3 className="text-xl font-bold mb-6 w-full text-center text-slate-800 tracking-wide">Tomography (CT)</h3>
              <div 
                className="w-full flex-grow flex flex-col justify-center items-center rounded-xl p-6 border-2 border-dashed border-slate-300 bg-slate-50/50 group-hover:border-cyan-400 group-hover:bg-cyan-50/50 transition-all duration-300 cursor-pointer"
                onClick={() => ctInputRef.current?.click()}
              >
                {ctPreview ? (
                  <div className="space-y-4 w-full text-center">
                    <div className="relative p-2 bg-white rounded-xl overflow-hidden shadow-md border border-slate-100">
                        <img
                        src={ctPreview}
                        alt="Uploaded CT"
                        className="mx-auto h-48 w-full object-cover rounded-lg opacity-90 transition-opacity hover:opacity-100"
                        />
                    </div>
                    <p className="text-sm font-medium text-slate-600 truncate px-2">{ctFile?.name}</p>
                    <input ref={ctInputRef} type="file" accept="image/*" onChange={handleCtChange} className="hidden" />
                  </div>
                ) : (
                  <div className="space-y-4 py-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-cyan-100 rounded-full flex items-center justify-center group-hover:bg-cyan-200 group-hover:scale-110 transition-all duration-500 shadow-inner">
                        <Upload className="w-8 h-8 text-cyan-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Click to upload or drag & drop</p>
                    <input ref={ctInputRef} type="file" accept="image/*" onChange={handleCtChange} className="hidden" />
                  </div>
                )}
              </div>
            </div>

          </div>
          
          <div className="mt-12 flex justify-center">
            <button
                className={`
                    relative overflow-hidden group w-full md:w-2/3 lg:w-1/2 h-16 rounded-2xl
                    font-bold text-lg tracking-wider text-white transition-all duration-500 shadow-lg
                    ${(!xrayFile || !ctFile || uploading) ? 'bg-slate-400 cursor-not-allowed opacity-70 shadow-none' : 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-[0_8px_30px_rgba(0,180,255,0.4)] hover:-translate-y-1'}
                `}
                onClick={handlePredict}
                disabled={uploading || !xrayFile || !ctFile}
            >
                {/* Button Inner Shine Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                
                <span className="relative flex items-center justify-center z-10 drop-shadow-sm">
                    {uploading ? (
                    <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin text-white" />
                        Processing Neural Pathways...
                    </>
                    ) : (
                    "Initialize Diagnostics"
                    )}
                </span>
            </button>
          </div>

          {/* COMBINED RESULTS SECTION */}
          {predictionResult && (
            <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* ORIGINAL Prediction Result Card */}
              <div className="p-1.5 rounded-3xl bg-gradient-to-b from-blue-200/50 to-transparent max-w-2xl mx-auto shadow-sm">
                  <div className="p-10 rounded-[22px] bg-white/90 backdrop-blur-2xl text-center space-y-8 relative overflow-hidden border border-white">
                      {/* Inner glowing orb */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="relative z-10">
                          <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Diagnostic Synthesis</h2>
                          <p className="text-slate-500 text-sm font-medium">AI generated multi-modal confidence assessment</p>
                      </div>

                      <div className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold shadow-sm relative z-10">
                          <span className="text-xl tracking-wide mr-3">{predictionResult.label}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mx-3" />
                          <span className="text-xl font-mono">{predictionResult.confidence}% Confidence</span>
                      </div>

                      <div className="max-w-md mx-auto text-left space-y-3 pt-4 relative z-10">
                      {Object.entries(predictionResult.probabilities).map(
                          ([disease, prob]) => (
                          <div key={disease} className="relative group p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 rounded-xl transition-all duration-300 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md">
                              <div className="flex justify-between text-sm relative z-10">
                                  <span className="font-bold text-slate-700 tracking-wide">{disease}</span>
                                  <span className="font-mono font-semibold text-blue-600">{prob}%</span>
                              </div>
                              <div 
                                  className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-r-full transition-all duration-1000 ease-out opacity-80"
                                  style={{ width: `${prob}%` }}
                              />
                          </div>
                          )
                      )}
                      </div>

                      <p className="text-slate-500 text-xs max-w-sm mx-auto pt-6 font-medium leading-relaxed relative z-10">
                      This advanced neural synthesis provides statistical clinical assistance. Please consult a board-certified medical professional for final diagnosis.
                      </p>
                  </div>
              </div>

              {/* NEW Patient Report Card */}
              <div className="p-1.5 rounded-3xl bg-gradient-to-b from-slate-200/60 to-transparent max-w-2xl mx-auto shadow-sm">
                <div className="p-8 md:p-10 rounded-[22px] bg-white/95 backdrop-blur-2xl relative overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Patient Report</h2>
                        <p className="text-sm font-medium text-slate-500">Automated Clinical Analysis</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Prediction</p>
                      <p className="text-lg font-semibold text-slate-800">{predictionResult.label}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence</p>
                      <p className="text-lg font-mono font-semibold text-blue-600">{predictionResult.confidence}%</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Analysis
                      </h4>
                      <p className="text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                        {getReportDetails(predictionResult.label).analysis}
                      </p>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Recommendation
                      </h4>
                      <p className="text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                        {getReportDetails(predictionResult.label).recommendation}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                      <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Risk Level:</span>
                      <div className={`px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide ${getReportDetails(predictionResult.label).riskColor}`}>
                        {getReportDetails(predictionResult.label).risk}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* NEW Grad-CAM Card */}
              <div className="p-1.5 rounded-3xl bg-gradient-to-b from-indigo-200/50 to-transparent max-w-2xl mx-auto shadow-sm">
                <div className="p-8 md:p-10 rounded-[22px] bg-white/95 backdrop-blur-2xl relative overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Scan className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Grad-CAM Activation Map</h2>
                        <p className="text-sm font-medium text-slate-500">Neural Network Focus Regions</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* X-Ray Grad-CAM */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Radiograph Focus</p>
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900 aspect-square flex items-center justify-center">
                            {xrayPreview && (
                                <>
                                    {/* Grayscale Base Image */}
                                    <img src={xrayPreview} alt="X-ray Base" className="absolute inset-0 w-full h-full object-cover grayscale contrast-125" />
                                    {/* Heatmap Overlay */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(255,0,0,0.6)_0%,_rgba(255,165,0,0.4)_25%,_transparent_60%)] opacity-80" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,_rgba(255,0,0,0.5)_0%,_rgba(255,255,0,0.3)_20%,_transparent_50%)] opacity-80" />
                                </>
                            )}
                        </div>
                    </div>

                    {/* CT Scan Grad-CAM */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Tomography Focus</p>
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-900 aspect-square flex items-center justify-center">
                            {ctPreview && (
                                <>
                                    {/* Grayscale Base Image */}
                                    <img src={ctPreview} alt="CT Base" className="absolute inset-0 w-full h-full object-cover grayscale contrast-125" />
                                    {/* Heatmap Overlay */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,_rgba(255,0,0,0.6)_0%,_rgba(255,165,0,0.4)_30%,_transparent_70%)] opacity-80" />
                                </>
                            )}
                        </div>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs text-center mt-6 font-medium leading-relaxed">
                    Highlighting the primary pixels (red/yellow regions) that maximally activated the diagnostic convolutional layers.
                  </p>

                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      
      {/* Global CSS for animations */}
      <style>{`
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Predict;
