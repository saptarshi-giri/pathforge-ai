import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, FileText, Map, Download, RefreshCw, Calendar, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ResumeRow {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; role: string | null; education: string | null } | null>(null);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role, education")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: resumeData } = await supabase
        .from("resumes")
        .select("id, file_name, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setResumes(resumeData || []);
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-[80vh] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="glass rounded-2xl p-6 flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{profile?.full_name || user?.email}</h1>
              <p className="text-sm text-muted-foreground">{profile?.role || "No role set"}</p>
              <p className="text-xs text-muted-foreground">{profile?.education || ""}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>

          {/* Resumes */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Uploaded Resumes
            </h2>
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {resumes.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{r.file_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.status === "analyzed" ? "bg-primary/10 text-primary" :
                      r.status === "failed" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/upload" className="flex-1">
              <Button className="gradient-bg text-primary-foreground rounded-xl w-full h-11 font-semibold shadow-lg shadow-primary/25">
                <RefreshCw className="h-4 w-4 mr-2" /> Upload New Resume
              </Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button variant="outline" className="rounded-xl w-full h-11 font-semibold">
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
