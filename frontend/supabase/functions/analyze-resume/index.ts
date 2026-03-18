declare global {
  namespace Deno {
    function serve(handler: (req: Request) => Response | Promise<Response>): void;
    namespace env {
      function get(key: string): string | undefined;
    }
  }
}

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};


// ── Transform raw Python API response → frontend data shapes ─────────────────
function transformAnalysis(apiResponse: any) {

  const bestCareer      = apiResponse.meta?.best_career_match ?? "Unknown Career";
  const confidenceScore = apiResponse.career_recommendations?.[0]?.match_score_percent ?? 0;

  // ── profile ───────────────────────────────────────────────────────────────
  const profile = {
    name:            "",
    role:            "Job Seeker",
    education:       "",
    level:           confidenceScore >= 70 ? "Advanced" : confidenceScore >= 40 ? "Intermediate" : "Beginner",
    careerPath:      bestCareer.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    confidenceScore: Math.round(confidenceScore),
  };

  // ── career_recommendations — pass through directly ────────────────────────
  const career_recommendations = apiResponse.career_recommendations ?? [];

  // ── recommended_path ──────────────────────────────────────────────────────
  const roadmapEntries   = Object.entries(apiResponse.learning_roadmap ?? {});
  const recommended_path = roadmapEntries.map(([month, items]: [string, any], index: number) => ({
    id:       index + 1,
    title:    month,
    duration: `${(items as any[]).length * 2} weeks`,
    progress: 0,
    tasks:    (items as any[]).map((item: any) => ({
      label: `${item.skill.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} — ${item.course}`,
      done:  false,
    })),
  }));

  // ── skill_gap ─────────────────────────────────────────────────────────────
  const skill_gap = (apiResponse.skill_gaps ?? []).map((item: any) => {
    const required = 85;
    const current  = Math.round((1 - item.gap_score) * required);
    return {
      skill:      item.skill.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      current,
      required,
      importance: item.gap_score >= 0.7 ? "Critical" : item.gap_score >= 0.5 ? "High" : "Medium",
      reason:     `Strengthen ${item.skill} to match ${profile.careerPath} requirements.`,
    };
  });

  // ── learning_plan ─────────────────────────────────────────────────────────
  const allSkills = (apiResponse.priority_skills ?? []) as any[];
  const buildPlan = (skills: any[], label: string) =>
    skills.map((item: any, i: number) => ({
      week:      `${label} ${i + 1}`,
      topic:     item.skill.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      milestone: `Achieve proficiency in ${item.skill}`,
    }));

  const learning_plan = {
    "3 Month": buildPlan(allSkills.slice(0, 6),  "Week"),
    "6 Month": buildPlan(allSkills.slice(0, 12), "Month"),
    "1 Year":  buildPlan(allSkills,              "Quarter"),
  };

  // ── explanation ───────────────────────────────────────────────────────────
  const explanation = apiResponse.explanation ?? {
    quote:   `You matched ${profile.careerPath} with ${Math.round(confidenceScore)}% confidence.`,
    reasons: career_recommendations.map((c: any) => ({
      title:       c.career.replace(/_/g, " ").replace(/\b\w/g, (ch: string) => ch.toUpperCase()),
      description: `Match score: ${c.match_score_percent}%.`,
    })),
  };

  const career_insight   = apiResponse.career_insight   ?? null;
  const industry_insight = apiResponse.industry_insight ?? null;

  return {
    profile,
    career_recommendations,
    recommended_path,
    skill_gap,
    learning_plan,
    explanation,
    career_insight,
    industry_insight,
  };
}


// ── Edge function entry point ─────────────────────────────────────────────────
Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const { resume_id } = await req.json();

    if (!resume_id) {
      return new Response(JSON.stringify({ error: "resume_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("resumes")
      .update({ status: "analyzing" })
      .eq("id", resume_id)
      .eq("user_id", userId);

    const { data: resumeRow, error: resumeError } = await supabase
      .from("resumes")
      .select("file_path, file_name")
      .eq("id", resume_id)
      .eq("user_id", userId)
      .single();

    if (resumeError || !resumeRow) throw new Error("Resume record not found.");

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(resumeRow.file_path);

    if (downloadError || !fileBlob) throw new Error("Failed to download resume from storage.");

    const ML_API_URL = Deno.env.get("ML_API_BASE_URL");
    if (!ML_API_URL) throw new Error("ML_API_BASE_URL secret is not set in Supabase.");

    const formData = new FormData();
    formData.append("file", new File([fileBlob], resumeRow.file_name, { type: "application/pdf" }));

    const mlResponse = await fetch(`${ML_API_URL}/analyze`, {
      method: "POST",
      body:   formData,
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      throw new Error(`ML API error (${mlResponse.status}): ${errText}`);
    }

    const mlResult = await mlResponse.json();
    const analysis = transformAnalysis(mlResult);

    const { data: analysisRow, error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id:                userId,
        resume_id,
        recommended_path:       analysis.recommended_path,
        skill_gap:              analysis.skill_gap,
        learning_plan:          analysis.learning_plan,
        explanation:            analysis.explanation,
        career_recommendations: analysis.career_recommendations,
        career_insight:         analysis.career_insight,
        industry_insight:       analysis.industry_insight,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("full_name, education")
      .eq("id", userId)
      .maybeSingle();

    await supabase
      .from("profiles")
      .update({
        role: analysis.profile.role,
        ...(existingProfile?.full_name ? {} : { full_name: analysis.profile.name }),
        ...(existingProfile?.education ? {} : { education: analysis.profile.education }),
      })
      .eq("id", userId);

    await supabase
      .from("resumes")
      .update({ status: "analyzed" })
      .eq("id", resume_id)
      .eq("user_id", userId);

    const resolvedName = existingProfile?.full_name || analysis.profile.name;

    return new Response(
      JSON.stringify({
        success:     true,
        analysis_id: analysisRow.id,
        ...analysis,
        profile: {
          ...analysis.profile,
          name:      resolvedName,
          education: existingProfile?.education || analysis.profile.education,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});