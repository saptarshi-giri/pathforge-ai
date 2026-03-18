import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Upload, Play, Sparkles, ArrowRight, BarChart3, Route, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle radial gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />
    </div>
  );
}

const features = [
  { icon: Upload, title: "Smart Analysis", desc: "Upload your resume and get instant AI-powered insights" },
  { icon: Route, title: "Custom Roadmap", desc: "Personalized learning path based on your goals" },
  { icon: BarChart3, title: "Skill Gap Analysis", desc: "See exactly where you stand vs industry standards" },
  { icon: Brain, title: "AI Explanation", desc: "Understand why this path is right for you" },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4">
        <HeroBackground />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground mb-8">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-Powered Career Intelligence
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Turn Your Resume Into a{" "}
              <span className="gradient-text">Career Roadmap</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your resume and get a personalized learning path, skill gap analysis, and AI-generated explanation tailored to your goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/upload">
                <Button size="lg" className="gradient-bg text-primary-foreground rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Resume
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="rounded-xl px-8 h-12 text-base font-semibold hover:scale-[1.02] transition-all duration-200 hover:bg-secondary">
                  <Play className="mr-2 h-4 w-4" />
                  See Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From resume to roadmap in minutes — powered by AI that understands your unique career trajectory.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="h-10 w-10 rounded-xl gradient-bg-subtle flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/3" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to forge your path?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of professionals who've accelerated their careers with AI-powered guidance.
            </p>
            <Link to="/upload">
              <Button size="lg" className="gradient-bg text-primary-foreground rounded-xl px-8 h-12 font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02]">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
