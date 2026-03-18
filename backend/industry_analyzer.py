"""
industry_analyzer.py — Callable industry insights module.

Exposes one public function:
    get_industry_insights() -> dict

Returns structured market data with no plots or prints,
suitable for inclusion in the API response.
"""

import os
import pandas as pd
from collections import Counter

# ── Path ──────────────────────────────────────────────────────────────────────
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "jobs_dataset.csv")

# ── Cache — load once at import time ─────────────────────────────────────────
_data = None

def _load_data() -> pd.DataFrame:
    global _data
    if _data is None:
        _data = pd.read_csv(DATA_PATH)
    return _data


def get_industry_insights() -> dict:
    """
    Returns market-wide industry insights derived from jobs_dataset.csv.

    Response shape:
    {
        "top_skills": [
            { "skill": "Python", "frequency": 6 }, ...
        ],
        "career_demand_ranking": [
            { "career": "AI Engineer", "demand_score": 90.0 }, ...
        ],
        "salary_trends": [
            { "career": "AI Engineer", "average_salary_inr": 1500000.0 }, ...
        ]
    }
    """
    data = _load_data()

    # ── Top skills by frequency across all job roles ──────────────────────────
    all_skills = []
    for skills in data["Skills"]:
        all_skills.extend(skills.split(";"))

    skill_count = Counter(all_skills)
    top_skills = [
        {"skill": skill, "frequency": count}
        for skill, count in skill_count.most_common(10)
    ]

    # ── Career demand ranking ─────────────────────────────────────────────────
    career_demand = (
        data.groupby("Job_Role")["Demand_Score"]
        .mean()
        .sort_values(ascending=False)
        .reset_index()
    )
    career_demand_ranking = [
        {
            "career": row["Job_Role"],
            "demand_score": round(float(row["Demand_Score"]), 1)
        }
        for _, row in career_demand.iterrows()
    ]

    # ── Salary trends ─────────────────────────────────────────────────────────
    salary_trend = (
        data.groupby("Job_Role")["Average_Salary_INR"]
        .mean()
        .sort_values(ascending=False)
        .reset_index()
    )
    salary_trends = [
        {
            "career": row["Job_Role"],
            "average_salary_inr": round(float(row["Average_Salary_INR"]), 0)
        }
        for _, row in salary_trend.iterrows()
    ]

    return {
        "top_skills":             top_skills,
        "career_demand_ranking":  career_demand_ranking,
        "salary_trends":          salary_trends,
    }
