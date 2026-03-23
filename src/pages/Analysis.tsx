// src/pages/Analysis.tsx
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { BarChart, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

type RecentStored = {
  name: string | null;
  label: string;          // e.g. "NORMAL", "PNEUMONIA", "TUBERCULOSIS"
  confidence: number;     // 0–100
  ts: string;             // ISO timestamp
};

// 🔑 must match Predict.tsx
const PREDICTIONS_KEY = "lungsight_recent_predictions_v2";

const Analysis = () => {
  const [recentAnalysis, setRecentAnalysis] = useState<
    Array<{
      id: number;
      date: string;
      result: string;
      confidence: string;
      name?: string;
    }>
  >([]);

  const [totalScans, setTotalScans] = useState(0);
  const [positiveCases, setPositiveCases] = useState(0);
  const [reportsGenerated, setReportsGenerated] = useState(0);

  useEffect(() => {
    const loadRecent = () => {
      try {
        const raw = localStorage.getItem(PREDICTIONS_KEY);

        if (!raw) {
          setRecentAnalysis([]);
          setTotalScans(0);
          setPositiveCases(0);
          setReportsGenerated(0);
          return;
        }

        const parsed = JSON.parse(raw) as RecentStored[];
        if (!Array.isArray(parsed) || parsed.length === 0) return;

        const mapped = parsed.map((p, idx) => {
          const date = new Date(p.ts).toLocaleDateString();

          return {
            id: idx + 1,
            date,
            result: p.label === "NORMAL" ? "Negative" : p.label,
            confidence: `${Math.round(p.confidence)}%`,
            name: p.name ?? undefined,
          };
        });

        setRecentAnalysis(mapped);

        // 📊 stats
        setTotalScans(parsed.length);
        setPositiveCases(parsed.filter(p => p.label !== "NORMAL").length);
        setReportsGenerated(parsed.length);

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
    {
      label: "Total Scans",
      value: totalScans.toString(),
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Accuracy Rate",
      value: "—",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      label: "Positive Cases",
      value: positiveCases.toString(),
      icon: AlertCircle,
      color: "text-secondary",
    },
    {
      label: "Reports Generated",
      value: reportsGenerated.toString(),
      icon: BarChart,
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Analysis & Reports
            </h1>
            <p className="text-lg text-muted-foreground">
              Multi-class lung disease prediction history
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12 animate-slide-up">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-6 hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Recent Analysis */}
          <Card className="p-8 shadow-soft animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Recent Analysis
            </h2>

            <div className="space-y-4">
              {recentAnalysis.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No predictions yet.
                </p>
              )}

              {recentAnalysis.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow"></div>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.name ?? `Scan #${item.id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        item.result === "Negative"
                          ? "text-accent"
                          : "text-secondary"
                      }`}
                    >
                      {item.result}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {item.confidence}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
