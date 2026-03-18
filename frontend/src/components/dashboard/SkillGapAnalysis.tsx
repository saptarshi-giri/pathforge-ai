import { motion } from "framer-motion";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";

export function SkillGapAnalysis() {
  const { analysis } = useAnalysis();
  const skills = analysis.skillGap;

  const chartData = skills.map((s) => ({
    name: s.skill,
    current: s.current,
    required: s.required,
    gap: s.required - s.current,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Skill Gap Analysis</h2>
        <p className="text-sm text-muted-foreground">Your current skills compared to industry requirements.</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="current" name="Your Level" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            <Bar dataKey="required" name="Required" radius={[4, 4, 0, 0]} fill="hsl(var(--accent) / 0.5)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {skills.map((skill, i) => {
          const isMissing = skill.current < skill.required * 0.5;
          return (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-xl p-4 ${isMissing ? "border-destructive/30" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{skill.skill}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  skill.importance === "Critical"
                    ? "bg-destructive/10 text-destructive"
                    : skill.importance === "High"
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {skill.importance}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{skill.reason}</p>
              <div className="flex items-center gap-2 text-xs">
                {isMissing ? (
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-primary" />
                )}
                <span className="text-muted-foreground">
                  {skill.current}% → {skill.required}% needed
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
