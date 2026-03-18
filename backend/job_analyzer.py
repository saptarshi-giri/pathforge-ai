"""
job_analyzer.py — Career-specific insights from jobs_dataset.csv.

Usage:
    from job_analyzer import JobAnalyzer
    analyzer = JobAnalyzer()
    insight  = analyzer.analyze_career("Software Engineer")
"""

import os
import pandas as pd
from collections import Counter

# ── Absolute path so it works from any working directory ─────────────────────
BASE_DIR          = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DATA_PATH = os.path.join(BASE_DIR, "data", "jobs_dataset.csv")


class JobAnalyzer:

    def __init__(self, dataset_path: str = DEFAULT_DATA_PATH):
        self.data = pd.read_csv(dataset_path)
        self._analyze_skills()

    # ── 1. SKILL POPULARITY ───────────────────────────────────────────────────
    def _analyze_skills(self):
        all_skills = []
        for skills in self.data["Skills"]:
            all_skills.extend(skills.split(";"))
        self.skill_count = Counter(all_skills)

    def get_top_skills(self, top_n: int = 10):
        return self.skill_count.most_common(top_n)

    # ── 2. CAREER DEMAND ──────────────────────────────────────────────────────
    def get_career_demand(self, career_name: str):
        career_data = self.data[self.data["Job_Role"] == career_name]
        if career_data.empty:
            return None
        return round(float(career_data["Demand_Score"].mean()), 1)

    # ── 3. SALARY TREND ───────────────────────────────────────────────────────
    def get_average_salary(self, career_name: str):
        career_data = self.data[self.data["Job_Role"] == career_name]
        if career_data.empty:
            return None
        return round(float(career_data["Average_Salary_INR"].mean()), 0)

    # ── 4. FULL CAREER INSIGHT ────────────────────────────────────────────────
    def analyze_career(self, career_name: str) -> dict:
        """
        Returns demand score, salary, and key skills for a given career.

        Tries an exact match first, then falls back to a case-insensitive
        partial match (handles "fullstack_developer" vs "Software Engineer").

        Response shape:
        {
            "career":            "Software Engineer",
            "demand_score":      87.0,
            "average_salary_inr": 1300000.0,
            "key_skills":        "Java;DSA;System Design;Git"
        }
        """
        # Exact match
        career_data = self.data[self.data["Job_Role"] == career_name]

        # Fuzzy fallback — normalise underscores and case
        if career_data.empty:
            normalised = career_name.replace("_", " ").lower()
            career_data = self.data[
                self.data["Job_Role"].str.replace("_", " ").str.lower() == normalised
            ]

        # Partial match as last resort
        if career_data.empty:
            career_data = self.data[
                self.data["Job_Role"].str.lower().str.contains(
                    normalised.split()[0], na=False
                )
            ]

        if career_data.empty:
            return {
                "career":             career_name,
                "demand_score":       None,
                "average_salary_inr": None,
                "key_skills":         None,
            }

        row = career_data.iloc[0]

        return {
            "career":             row["Job_Role"],
            "demand_score":       round(float(career_data["Demand_Score"].mean()), 1),
            "average_salary_inr": round(float(career_data["Average_Salary_INR"].mean()), 0),
            "key_skills":         row["Skills"],
        }
