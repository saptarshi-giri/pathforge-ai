"""
explainable_ai.py — Personalised SHAP-based career explanation.

Exposes one public function:
    explain_career(user_skills, best_career, top_careers) -> dict

Returns an explanation dict shaped for the frontend WhyThisPath component:
{
    "quote": "...",
    "reasons": [
        { "title": "...", "description": "..." },
        ...
    ]
}
"""

import os
import numpy as np
import pandas as pd
import joblib
import shap

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")


def _load_explainer_models():
    """Load pre-trained SHAP model and MLB encoder from models/."""
    shap_model = joblib.load(os.path.join(MODEL_DIR, "shap_model.pkl"))
    shap_mlb   = joblib.load(os.path.join(MODEL_DIR, "shap_mlb.pkl"))
    return shap_model, shap_mlb


def explain_career(user_skills: dict, best_career: str, top_careers: list) -> dict:
    """
    Generate a personalised SHAP-based explanation for why the user
    matched their top career recommendation.

    Args:
        user_skills  : dict of { skill_name: weight }  e.g. {"python": 0.9}
        best_career  : str  e.g. "fullstack_developer"
        top_careers  : list of (career, score) tuples from recommendation_engine

    Returns:
        dict with keys: quote (str), reasons (list of {title, description})
    """

    try:
        shap_model, shap_mlb = _load_explainer_models()

        # ── Encode user skills into the same feature space as the MLB ─────────
        known_classes = set(shap_mlb.classes_)

        # Normalise user skill keys to match MLB class names (strip/lower)
        normalised_skills = {k.strip().lower() for k in user_skills.keys()}

        # Map to MLB classes (case-insensitive match)
        matched_skills = [
            cls for cls in known_classes
            if cls.strip().lower() in normalised_skills
        ]

        # Build a one-row binary skill vector
        user_vector = shap_mlb.transform([matched_skills])
        user_df = pd.DataFrame(user_vector, columns=shap_mlb.classes_)

        # ── Run SHAP on this user's skill vector ──────────────────────────────
        explainer   = shap.TreeExplainer(shap_model)
        shap_values = explainer.shap_values(user_df)

        # shap_values is shape (1, n_features) for a single row
        shap_row = shap_values[0] if shap_values.ndim > 1 else shap_values

        # ── Build skill impact table ──────────────────────────────────────────
        impact_df = pd.DataFrame({
            "skill":  shap_mlb.classes_,
            "shap":   shap_row,
            "has":    user_df.values[0],  # 1 if user has it, 0 if not
        })

        # Positive SHAP + user has skill  → strength
        # Positive SHAP + user lacks it   → gap / opportunity
        strengths = (
            impact_df[(impact_df["has"] == 1) & (impact_df["shap"] > 0)]
            .sort_values("shap", ascending=False)
            .head(3)
        )

        gaps = (
            impact_df[(impact_df["has"] == 0) & (impact_df["shap"] > 0)]
            .sort_values("shap", ascending=False)
            .head(3)
        )

        # ── Format career name for display ────────────────────────────────────
        career_display = best_career.replace("_", " ").title()
        confidence     = round(float(top_careers[0][1]), 1) if top_careers else 0

        # ── Build quote ───────────────────────────────────────────────────────
        strength_names = strengths["skill"].tolist()
        if strength_names:
            skills_str = ", ".join(s.title() for s in strength_names)
            quote = (
                f"Your {skills_str} skills are strong drivers for your "
                f"{career_display} match ({confidence}% confidence). "
                f"Focus on closing the identified gaps to accelerate your growth."
            )
        else:
            quote = (
                f"You matched {career_display} with {confidence}% confidence. "
                f"Building the identified skill gaps will significantly improve your match."
            )

        # ── Build reasons list ────────────────────────────────────────────────
        reasons = []

        # Top matching strengths
        for _, row in strengths.iterrows():
            reasons.append({
                "title": row["skill"].title(),
                "description": (
                    f"This skill has a strong positive impact on your {career_display} match "
                    f"(SHAP score: {round(float(row['shap']), 3)}). "
                    f"It is one of the key drivers of demand in this career."
                )
            })

        # Top skill gaps with high industry impact
        for _, row in gaps.iterrows():
            reasons.append({
                "title": f"{row['skill'].title()} (Gap)",
                "description": (
                    f"This skill is highly valued in {career_display} roles "
                    f"(industry impact score: {round(float(row['shap']), 3)}) "
                    f"but is not yet in your profile. Prioritise learning this."
                )
            })

        # Fallback if no reasons generated
        if not reasons:
            for career, score in top_careers[:3]:
                reasons.append({
                    "title": career.replace("_", " ").title(),
                    "description": f"Match score: {round(float(score), 1)}%."
                })

        return {"quote": quote, "reasons": reasons}

    except Exception as e:
        # Graceful fallback — never crash the API because of explainability
        career_display = best_career.replace("_", " ").title()
        confidence     = round(float(top_careers[0][1]), 1) if top_careers else 0

        return {
            "quote": (
                f"You matched {career_display} with {confidence}% confidence "
                f"based on your current skill profile."
            ),
            "reasons": [
                {
                    "title": career.replace("_", " ").title(),
                    "description": f"Career match score: {round(float(score), 1)}%."
                }
                for career, score in top_careers[:3]
            ]
        }
