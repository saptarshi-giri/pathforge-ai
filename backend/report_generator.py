import json
import os
import numpy as np
from datetime import datetime


class NumpyEncoder(json.JSONEncoder):
    """
    Custom JSON encoder that converts numpy scalar types (float32, float64,
    int32, int64 etc.) to native Python types before serialization.
    Without this, json.dump raises TypeError on any numpy value.
    """
    def default(self, obj):
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def generate_report(pdf_path, user_skills, top_careers, skill_gap, priority, roadmap):
    """
    Builds a single structured JSON report combining:
    - Extracted skills
    - Top 3 career recommendations
    - Top skill gaps
    - Learning roadmap

    A separate JSON file is created for each resume, named after the PDF file.

    Args:
        pdf_path     (str):   Path to the source resume PDF
        user_skills  (dict):  Extracted skills with weights  e.g. {"python": 0.9}
        top_careers  (list):  List of (career, score) tuples e.g. [("Data Scientist", 72.4)]
        skill_gap    (dict):  Skill gaps for the best career e.g. {"tensorflow": 0.42}
        priority     (dict):  Priority-sorted skill gaps      e.g. {"tensorflow": 0.38}
        roadmap      (dict):  Monthly learning plan

    Returns:
        str: Path to the saved JSON report file
    """

    # ── Derive a clean filename from the PDF name ──────────────────────────────
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    os.makedirs("reports", exist_ok=True)
    output_path = os.path.join("reports", f"{base_name}_report.json")

    # ── Build career recommendations block ────────────────────────────────────
    career_recommendations = [
        {
            "rank": rank + 1,
            "career": career,
            "match_score_percent": round(float(score), 2)   # float() handles float32
        }
        for rank, (career, score) in enumerate(top_careers)
    ]

    # ── Build skill gaps block ────────────────────────────────────────────────
    skill_gaps_list = [
        {
            "skill": skill,
            "gap_score": round(float(gap), 4)               # float() handles float32
        }
        for skill, gap in skill_gap.items()
    ]

    # ── Build priority skills block ───────────────────────────────────────────
    priority_skills_list = [
        {
            "skill": skill,
            "priority_score": round(float(score), 4)        # float() handles float32
        }
        for skill, score in priority.items()
    ]

    # ── Build roadmap block ───────────────────────────────────────────────────
    roadmap_block = {
        month: [
            {
                "skill": item["Skill"],
                "course": item["Course"],
                "difficulty": item["Difficulty"],
                "priority_score": round(float(item["Priority Score"]), 4)  # float() handles float32
            }
            for item in items
        ]
        for month, items in roadmap.items()
    }

    # ── Assemble full report ──────────────────────────────────────────────────
    report = {
        "meta": {
            "resume_file": os.path.basename(pdf_path),
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "best_career_match": top_careers[0][0] if top_careers else None
        },
        "extracted_skills": user_skills,
        "career_recommendations": career_recommendations,
        "skill_gaps": skill_gaps_list,
        "priority_skills": priority_skills_list,
        "learning_roadmap": roadmap_block
    }

    # ── Save to file using NumpyEncoder as safety net for any remaining numpy types
    with open(output_path, "w") as f:
        json.dump(report, f, indent=4, cls=NumpyEncoder)

    print(f"Report saved → {output_path}")

    return output_path
