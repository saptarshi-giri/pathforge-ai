import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Star, Trophy, TrendingUp } from "lucide-react";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function CareerMatchCards() {
  const { analysis } = useAnalysis();
  const recs = analysis.careerRecommendations;

  if (!recs || recs.length === 0) return null;

  const icons = [Trophy, TrendingUp, Star];
  const labels = ["Best Match", "2nd Match", "3rd Match"];
  const colors = [
    "from-primary to-accent",
    "from-accent/80 to-primary/60",
    "from-muted-foreground/40 to-muted-foreground/20",
  ];
  const textColors = [
    "text-primary-foreground",
    "text-primary-foreground",
    "text-foreground",
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-1">Career Match Overview</h2>
      <p className="text-sm text-muted-foreground mb-4">Based on your resume analysis</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recs.map((rec, i) => {
          const Icon = icons[i] ?? Star;
          const isTop = i === 0;

          return (
            <motion.div
              key={rec.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-5 overflow-hidden ${
                isTop ? `bg-gradient-to-br ${colors[i]} shadow-lg shadow-primary/20` : "glass"
              }`}
            >
              {/* Background glow for top card */}
              {isTop && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90" />
              )}

              <div className={`relative z-10 ${isTop ? textColors[i] : ""}`}>
                {/* Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${
                  isTop
                    ? "bg-white/20 text-white"
                    : i === 1
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="h-3 w-3" />
                  {labels[i]}
                </div>

                {/* Career name */}
                <h3 className={`font-bold text-lg leading-tight mb-3 ${
                  isTop ? "text-white" : "text-foreground"
                }`}>
                  {rec.career.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </h3>

                {/* Match score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isTop ? "text-white/70" : "text-muted-foreground"}`}>
                      Match Score
                    </span>
                    <span className={`text-sm font-bold ${isTop ? "text-white" : "text-primary"}`}>
                      {rec.match_score_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${
                    isTop ? "bg-white/20" : "bg-muted"
                  }`}>
                    <motion.div
                      className={`h-full rounded-full ${
                        isTop ? "bg-white" : "bg-gradient-to-r from-primary to-accent"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.match_score_percent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 + 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function RecommendedPath() {
  const { analysis } = useAnalysis();
  const stages = analysis.roadmapStages;

  return (
    <div className="space-y-4">
      {/* Career match cards */}
      <CareerMatchCards />

      {/* Roadmap stages */}
      <div>
        <h2 className="text-xl font-bold mb-1">Your Recommended Path</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A structured roadmap from where you are to where you want to be.
        </p>
        <Accordion type="multiple" defaultValue={["1", "2"]} className="space-y-3">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <AccordionItem value={String(stage.id)} className="glass rounded-xl border-0 overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      stage.progress === 100
                        ? "gradient-bg text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{stage.title}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {stage.duration}
                        </span>
                      </div>
                      <Progress value={stage.progress} className="h-1.5 mt-2 w-48" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{stage.progress}%</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <ul className="space-y-2 ml-14">
                    {stage.tasks.map((task, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        {task.done ? (
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={task.done ? "text-muted-foreground line-through" : ""}>
                          {task.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
