import { motion } from "framer-motion";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { Quote, TrendingUp, Target, Rocket } from "lucide-react";

const icons = [TrendingUp, Target, Rocket];

export function WhyThisPath() {
  const { analysis } = useAnalysis();
  const explanation = analysis.explanation;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Why This Path?</h2>
        <p className="text-sm text-muted-foreground">AI-generated explanation of your personalized recommendation.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-0.5 h-full bg-primary rounded-full" />
        <Quote className="h-8 w-8 text-primary/20 mb-3" />
        <p className="text-base leading-relaxed italic text-foreground/90">
          "{explanation.quote}"
        </p>
      </motion.div>

      <div className="space-y-3">
        {explanation.reasons.map((reason, i) => {
          const Icon = icons[i] || TrendingUp;
          return (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="glass rounded-xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg gradient-bg-subtle flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">{reason.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                {reason.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
