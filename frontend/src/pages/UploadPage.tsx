import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Shield, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { useToast } from "@/hooks/use-toast";

type Stage = "upload" | "uploading" | "analyzing";

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setAnalysisFromResponse } = useAnalysis();
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!user) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or DOCX file.", variant: "destructive" });
      return;
    }

    setStage("uploading");
    setProgress(10);

    try {
      // 1. Upload to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setProgress(40);

      // 2. Create resume record
      const { data: resumeRow, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          status: "pending",
        })
        .select()
        .single();

      if (resumeError) throw resumeError;
      setProgress(60);

      // 3. Call edge function
      setStage("analyzing");
      const { data: analysisData, error: fnError } = await supabase.functions.invoke(
        "analyze-resume",
        { body: { resume_id: resumeRow.id } }
      );

      if (fnError) throw fnError;
      setProgress(100);

      // 4. Store in context
      setAnalysisFromResponse(analysisData);

      // Navigate to dashboard
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setStage("upload");
      setProgress(0);
    }
  }, [user, navigate, setAnalysisFromResponse, toast]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Your Resume</h1>
          <p className="text-muted-foreground">We'll analyze your skills and build a personalized roadmap.</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onFileSelect}
          className="hidden"
        />

        <div className="glass rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {stage === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="h-12 w-12 rounded-xl gradient-bg-subtle flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium mb-1">Drag & drop your resume here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Accepts PDF, DOCX
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-center">
                  <Shield className="h-3.5 w-3.5" />
                  Your resume is securely processed and never shared.
                </div>
              </motion.div>
            )}

            {stage === "uploading" && (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center">
                <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
                <p className="font-medium mb-4">Uploading resume…</p>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}%</p>
              </motion.div>
            )}

            {stage === "analyzing" && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 text-center">
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full gradient-bg animate-ping opacity-20" />
                  <div className="absolute inset-0 rounded-full gradient-bg opacity-30 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="font-semibold text-lg mb-2">Analyzing your profile</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building your roadmap…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
