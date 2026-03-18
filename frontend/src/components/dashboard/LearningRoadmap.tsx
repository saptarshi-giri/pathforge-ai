import { useState } from "react";
import { motion } from "framer-motion";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LearningRoadmap() {
  const { analysis } = useAnalysis();
  const learningPlan = analysis.learningPlan;
  const plans = Object.keys(learningPlan) as string[];
  const [plan, setPlan] = useState(plans[0] || "3 Month");

  const items = learningPlan[plan] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Personalized Learning Roadmap</h2>
          <p className="text-sm text-muted-foreground">Your structured plan with milestones and topics.</p>
        </div>
        <div className="flex gap-1 glass rounded-xl p-1">
          {plans.map((p) => (
            <Button
              key={p}
              variant={plan === p ? "default" : "ghost"}
              size="sm"
              onClick={() => setPlan(p)}
              className={`rounded-lg text-xs ${plan === p ? "gradient-bg text-primary-foreground" : ""}`}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={`${plan}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-5 flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full gradient-bg-subtle flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              {i < items.length - 1 && (
                <div className="w-px flex-1 bg-border mt-2" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-xs font-medium text-primary mb-1">{item.week}</p>
              <h4 className="font-semibold mb-1">{item.topic}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>Milestone: {item.milestone}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
