import os
import sys
import uuid
import tempfile
import json
import numpy as np
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ── Path setup ────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# ── ML pipeline imports ───────────────────────────────────────────────────────
from resume_parser import parse_resume
from engine.recommendation_engine import predict_career_ml
from engine.skill_gap_engine import calculate_skill_gap
from engine.roadmap_generator import generate_roadmap
from engine.model_loader import skill_demand
from explainable_ai import explain_career
from job_analyzer import JobAnalyzer
from industry_analyzer import get_industry_insights

# ── Load once at startup (not on every request) ───────────────────────────────
job_analyzer      = JobAnalyzer()
industry_insights = get_industry_insights()

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PathForge AI — Career Recommendation API",
    description="Accepts a resume PDF and returns career recommendations, skill gaps, roadmap, SHAP explanation, and industry insights.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helper: NumpyEncoder ──────────────────────────────────────────────────────
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.floating):  return float(obj)
        if isinstance(obj, np.integer):   return int(obj)
        if isinstance(obj, np.ndarray):   return obj.tolist()
        return super().default(obj)

def make_serializable(obj):
    return json.loads(json.dumps(obj, cls=NumpyEncoder))


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":  "ok",
        "message": "PathForge AI backend is running. All models loaded."
    }


@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """
    Full analysis pipeline:
      1. Extract skills from PDF
      2. Predict top 3 career matches
      3. Calculate skill gaps
      4. Compute priority scores (gap × demand)
      5. Generate learning roadmap
      6. SHAP-based personalised explanation
      7. Career insight (demand score + salary for best career)  ← NEW
      8. Industry insights (market-wide trends)                  ← NEW
    """

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    tmp_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}.pdf")

    try:
        contents = await file.read()
        with open(tmp_path, "wb") as f:
            f.write(contents)

        # STEP 1 — Extract skills
        user_skills = parse_resume(tmp_path)
        if not user_skills:
            raise HTTPException(
                status_code=422,
                detail="No recognizable skills found in the resume. Please upload a more detailed resume."
            )

        # STEP 2 — Predict careers
        top_careers = predict_career_ml(user_skills)
        best_career = top_careers[0][0]

        # STEP 3 — Skill gap
        skill_gap = calculate_skill_gap(user_skills, best_career)

        # STEP 4 — Priority scores
        priority = {}
        for skill, gap in skill_gap.items():
            demand = skill_demand.get(skill, 0)
            priority[skill] = round(gap * demand, 4)
        priority = dict(sorted(priority.items(), key=lambda x: x[1], reverse=True))

        # STEP 5 — Roadmap
        roadmap = generate_roadmap(priority)

        # STEP 6 — SHAP explanation
        explanation = explain_career(user_skills, best_career, top_careers)

        # STEP 7 — Career insight (demand + salary for best matched career)
        career_insight = job_analyzer.analyze_career(best_career)

        # STEP 8 — Industry insights (cached at startup, same for all users)
        # No extra compute cost per request

        # ── Assemble response ─────────────────────────────────────────────────
        response = {
            "meta": {
                "resume_file":       file.filename,
                "generated_at":      datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "best_career_match": best_career,
            },
            "extracted_skills": user_skills,
            "career_recommendations": [
                {
                    "rank":                rank + 1,
                    "career":              career,
                    "match_score_percent": round(float(score), 2),
                }
                for rank, (career, score) in enumerate(top_careers)
            ],
            "skill_gaps": [
                {"skill": skill, "gap_score": round(float(gap), 4)}
                for skill, gap in skill_gap.items()
            ],
            "priority_skills": [
                {"skill": skill, "priority_score": round(float(score), 4)}
                for skill, score in priority.items()
            ],
            "learning_roadmap": {
                month: [
                    {
                        "skill":          item["Skill"],
                        "course":         item["Course"],
                        "difficulty":     item["Difficulty"],
                        "priority_score": round(float(item["Priority Score"]), 4),
                    }
                    for item in items
                ]
                for month, items in roadmap.items()
            },
            "explanation":      explanation,
            "career_insight":   career_insight,
            "industry_insight": industry_insights,
        }

        return make_serializable(response)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)