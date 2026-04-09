import { useState, useEffect } from "react";
import { Sparkles, MapPin, Compass, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Recommendation {
  destination: string;
  reason: string;
  experiences: string[];
  bestSeason: string;
  estimatedBudget: string;
  vibe: string;
}

interface AIRecommendWidgetProps {
  interests?: string[];
  travelStyles?: string[];
}

const vibeColors: Record<string, string> = {
  Cultural: "bg-primary/10 text-primary",
  Adventure: "bg-accent/10 text-accent",
  Spiritual: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Wellness: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Nature: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const AIRecommendWidget = ({ interests = [], travelStyles = [] }: AIRecommendWidgetProps) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-recommend", {
        body: {
          mode: "suggest",
          preferences: { interests, travelStyles, userId: user?.id },
          messages: [{ role: "user", content: `Suggest Indian travel destinations for someone interested in: ${interests.join(", ") || "diverse experiences"}. Travel style: ${travelStyles.join(", ") || "open to anything"}.` }],
        },
      });
      if (fnError) throw fnError;
      if (data?.result) {
        setRecommendations(data.result.recommendations || []);
        setTip(data.result.tip || "");
      }
    } catch (e: any) {
      setError(e.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-background border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">AI Travel Recommender</h3>
            <p className="text-[10px] text-muted-foreground">Personalized destination suggestions</p>
          </div>
        </div>
        <Button size="sm" className="rounded-full text-xs gap-1" onClick={fetchRecommendations} disabled={loading}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? "Thinking..." : recommendations.length ? "Refresh" : "Get Suggestions"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyzing your preferences...</p>
            </div>
          </motion.div>
        )}

        {!loading && recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.destination}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-card p-4 shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <h4 className="font-bold text-foreground">{rec.destination}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vibeColors[rec.vibe] || "bg-secondary text-secondary-foreground"}`}>
                        {rec.vibe}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.experiences.slice(0, 3).map(exp => (
                        <span key={exp} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{exp}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-semibold text-foreground">{rec.estimatedBudget}</p>
                    <p className="text-[10px] text-muted-foreground">{rec.bestSeason}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {tip && (
              <div className="rounded-lg bg-primary/5 p-3 flex items-start gap-2">
                <Compass className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{tip}</p>
              </div>
            )}
          </motion.div>
        )}

        {!loading && recommendations.length === 0 && !error && (
          <div className="text-center py-6">
            <Compass className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click "Get Suggestions" for AI-powered destination ideas</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIRecommendWidget;
