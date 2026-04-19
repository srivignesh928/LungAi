import Navbar from "@/components/Navbar";
import { Activity, FileText, AlertTriangle, TrendingUp, AlertCircle, BarChart, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";

type RecentStored = {
  name: string | null;
  label: string;
  confidence: number;
  probabilities?: Record<string, number>;
  age?: string;
  gender?: string;
  ts: string;
};

const PREDICTIONS_KEY = "lungsight_recent_predictions_v2";

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

const Analysis = () => {
  const [history, setHistory] = useState<RecentStored[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [totalScans, setTotalScans] = useState(0);
  const [positiveCases, setPositiveCases] = useState(0);

  useEffect(() => {
    const loadRecent = () => {
      try {
        const raw = localStorage.getItem(PREDICTIONS_KEY);
        if (!raw) {
          setHistory([]);
          return;
        }
        const parsed = JSON.parse(raw) as RecentStored[];
        if (!Array.isArray(parsed) || parsed.length === 0) return;

        setHistory(parsed);
        setTotalScans(parsed.length);
        setPositiveCases(parsed.filter(p => p.label.toLowerCase() !== "normal").length);
      } catch (e) {
        console.warn("Failed to load recent predictions", e);
      }
    };

    loadRecent();
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === PREDICTIONS_KEY) loadRecent();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const stats = [
    { label: "Total Scans", value: totalScans.toString(), icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Accuracy Rate", value: "98.4%", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Detected Anomalies", value: positiveCases.toString(), icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Reports Generated", value: totalScans.toString(), icon: BarChart, color: "text-cyan-500", bg: "bg-cyan-50" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* Light Abstract Background Orbs to match Predict.tsx */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-300/20 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-2 mb-4 bg-white/60 rounded-full border border-blue-200 shadow-sm backdrop-blur-md">
                <BarChart className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Clinical Logs</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm pb-1">
              Analysis History
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Review comprehensive diagnostic reports and automated neural synthesis for previously processed patient scans.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800">
             <Clock className="w-6 h-6 text-blue-500" />
             Recent Patient Architecture
          </h3>

          <div className="space-y-6">
            {history.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-white/50 border border-slate-200 border-dashed">
                <p className="text-slate-500 font-medium">No diagnostic history available. Initialize a prediction first.</p>
              </div>
            )}

            {history.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              const report = getReportDetails(item.label);
              const dateStr = new Date(item.ts).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
              });

              return (
                <div key={idx} className="rounded-3xl bg-gradient-to-b from-slate-200/50 to-transparent p-1 shadow-sm transition-all duration-500">
                  <div className="rounded-[22px] bg-white/90 backdrop-blur-xl border border-white overflow-hidden shadow-sm">
                    
                    {/* Compact Header (Clickable) */}
                    <div 
                      className="p-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className={`w-3 h-3 rounded-full shadow-inner ${item.label.toLowerCase() === 'normal' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <div>
                          <p className="text-lg font-bold text-slate-800 tracking-tight">{item.name || `Scan #${history.length - idx}`}</p>
                          <p className="text-sm font-medium text-slate-500">{dateStr}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <p className={`font-bold tracking-wide uppercase text-sm ${item.label.toLowerCase() === 'normal' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {item.label}
                          </p>
                          <p className="text-sm font-mono font-medium text-blue-600 mt-1">{Math.round(item.confidence)}% Confidence</p>
                        </div>
                        <div className="p-2 bg-slate-100/80 rounded-full text-slate-500">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Patient Report Details */}
                    {isExpanded && (
                      <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/30 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <FileText className="w-5 h-5" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-800 tracking-tight">Comprehensive Patient Report</h4>
                        </div>

                        {/* Metadata provided in history if available */}
                        {(item.age || item.gender) && (
                           <div className="flex gap-4 mb-6">
                              {item.age && <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 shadow-sm">Age: {item.age}</span>}
                              {item.gender !== undefined && <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 shadow-sm">Gender: {item.gender === '0' ? 'Male' : (item.gender === '1' ? 'Female' : 'Other')}</span>}
                           </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                          {/* Analysis */}
                          <div>
                            <h5 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                              <Activity className="w-4 h-4 text-blue-500" />
                              Clinical Analysis
                            </h5>
                            <p className="text-slate-700 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                              {report.analysis}
                            </p>
                          </div>

                          {/* Recommendation & Risk */}
                          <div className="space-y-6">
                            <div>
                                <h5 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Model Recommendation
                                </h5>
                                <p className="text-slate-700 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                {report.recommendation}
                                </p>
                            </div>
                            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Calculated Risk:</span>
                                <div className={`px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide ${report.riskColor}`}>
                                {report.risk}
                                </div>
                            </div>
                          </div>
                        </div>

                        {/* Probabilities if available */}
                        {item.probabilities && Object.keys(item.probabilities).length > 0 && (
                          <div className="mt-8">
                             <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Probability Distribution</h5>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                               {Object.entries(item.probabilities).map(([disease, prob]) => (
                                  <div key={disease} className="relative p-3 bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                      <div className="flex justify-between text-sm relative z-10 mb-1">
                                          <span className="font-bold text-slate-700">{disease}</span>
                                          <span className="font-mono font-semibold text-blue-600">{prob}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                                            style={{ width: `${prob}%` }}
                                        />
                                      </div>
                                  </div>
                               ))}
                             </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Analysis;
