import { motion } from "framer-motion";
import { User, GraduationCap, Briefcase, Target, TrendingUp, DollarSign, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { RecommendedPath } from "@/components/dashboard/RecommendedPath";
import { SkillGapAnalysis } from "@/components/dashboard/SkillGapAnalysis";
import { LearningRoadmap } from "@/components/dashboard/LearningRoadmap";
import { WhyThisPath } from "@/components/dashboard/WhyThisPath";

function ConfidenceCircle({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
        <motion.circle
          cx="40" cy="40" r="36" fill="none"
          stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{value}%</span>
      </div>
    </div>
  );
}

function formatSalary(amount: number | null): string {
  if (!amount) return "N/A";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
  const { analysis } = useAnalysis();
  const { profile }  = analysis;
  const topMatch     = analysis.careerRecommendations?.[0] ?? null;
  const careerInsight = analysis.careerInsight ?? null;

  return (
    <div className="min-h-[80vh] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Profile card */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-full gradient-bg flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{profile.name}</h3>
                  <p className="text-xs text-muted-foreground">{profile.role}</p>
                </div>
              </div>

              {profile.education && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {profile.education}
                </div>
              )}

              {topMatch && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Top Career Match</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium">
                        {topMatch.career.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      {topMatch.match_score_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-secondary mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${topMatch.match_score_percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Career stats */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Level</p>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {profile.level || "—"}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Career Path</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium">{profile.careerPath || "—"}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Confidence Score</p>
                <div className="flex justify-center">
                  <ConfidenceCircle value={profile.confidenceScore} />
                </div>
              </div>

              {careerInsight?.demand_score != null && (
                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Market Insight
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart2 className="h-3.5 w-3.5 text-primary" />
                      <span>Demand</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 w-14 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${careerInsight.demand_score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-primary">
                        {careerInsight.demand_score}
                      </span>
                    </div>
                  </div>

                  {careerInsight.average_salary_inr != null && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        <span>Avg. Salary</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">
                        {formatSalary(careerInsight.average_salary_inr)}
                      </span>
                    </div>
                  )}

                  {careerInsight.key_skills && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Key Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {careerInsight.key_skills.split(";").map((skill: string) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.aside>

          {/* Main content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Tabs defaultValue="path" className="w-full">
              <TabsList className="glass w-full justify-start rounded-xl h-11 p-1 mb-6">
                <TabsTrigger value="path" className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors duration-150">
                  <Target className="h-3.5 w-3.5 mr-1.5" /> Recommended Path
                </TabsTrigger>
                <TabsTrigger value="skills" className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors duration-150">
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Skill Gap
                </TabsTrigger>
                <TabsTrigger value="roadmap" className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors duration-150">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Roadmap
                </TabsTrigger>
                <TabsTrigger value="why" className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors duration-150">
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" /> Why This Path
                </TabsTrigger>
              </TabsList>

              <TabsContent value="path"><RecommendedPath /></TabsContent>
              <TabsContent value="skills"><SkillGapAnalysis /></TabsContent>
              <TabsContent value="roadmap"><LearningRoadmap /></TabsContent>
              <TabsContent value="why"><WhyThisPath /></TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
