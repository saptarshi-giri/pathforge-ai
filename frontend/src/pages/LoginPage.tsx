import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isForgot) {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email for a password reset link." });
        setIsForgot(false);
      }
      return;
    }

    if (isSignup) {
      const { error } = await signUp(email, password, fullName);
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created! Check your email to confirm." });
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate("/upload");
      }
    }
  };

  if (isForgot) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className="rounded-xl h-11" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-bg text-primary-foreground rounded-xl h-11 font-semibold shadow-lg shadow-primary/25">
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <button type="button" onClick={() => setIsForgot(false)} className="text-primary font-medium hover:underline">Back to sign in</button>
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignup ? "Start your career transformation" : "Sign in to continue your journey"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Johnson" className="rounded-xl h-11" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className="rounded-xl h-11" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup && (
                  <button type="button" onClick={() => setIsForgot(true)} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-11" required />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full gradient-bg text-primary-foreground rounded-xl h-11 font-semibold shadow-lg shadow-primary/25">
            {loading ? "Please wait…" : isSignup ? "Create Account" : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
