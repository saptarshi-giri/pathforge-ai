from resume_parser import parse_resume
from engine.recommendation_engine import predict_career_ml
from engine.skill_gap_engine import calculate_skill_gap
from engine.roadmap_generator import generate_roadmap
from engine.model_loader import skill_demand
from report_generator import generate_report


def process_resume(pdf_path):
    """
    Full pipeline for a single resume:
      1. Extract skills from PDF
      2. Predict top 3 career matches
      3. Calculate skill gaps for the best career
      4. Compute priority scores
      5. Generate learning roadmap
      6. Save everything to a single JSON report file
    """

    print(f"\n{'='*50}")
    print(f"Processing: {pdf_path}")
    print(f"{'='*50}")

    # STEP 1 — Extract skills from resume
    user_skills = parse_resume(pdf_path)
    print("\nExtracted Skills:", user_skills)


    # STEP 2 — Predict top 3 career matches
    top_careers = predict_career_ml(user_skills)

    print("\n===== TOP 3 CAREER OPTIONS =====")
    for career, score in top_careers:
        print(f"  {career} → {score}%")

    best_career = top_careers[0][0]


    # STEP 3 — Calculate skill gap for best career
    skill_gap = calculate_skill_gap(user_skills, best_career)

    print("\n===== TOP SKILL GAPS =====")
    for skill, gap in skill_gap.items():
        print(f"  {skill} → Gap: {gap}")


    # STEP 4 — Compute priority scores (gap × market demand)
    priority = {}
    for skill, gap in skill_gap.items():
        demand = skill_demand.get(skill, 0)
        priority[skill] = round(gap * demand, 4)

    priority = dict(sorted(priority.items(), key=lambda x: x[1], reverse=True))


    # STEP 5 — Generate learning roadmap
    roadmap = generate_roadmap(priority)

    print("\n===== LEARNING ROADMAP =====")
    for month, items in roadmap.items():
        print(f"\n  {month}")
        for item in items:
            print(f"    {item}")


    # STEP 6 — Save full JSON report (one file per resume)
    report_path = generate_report(
        pdf_path=pdf_path,
        user_skills=user_skills,
        top_careers=top_careers,
        skill_gap=skill_gap,
        priority=priority,
        roadmap=roadmap
    )

    print(f"\n✅ Done — Report saved to: {report_path}")

    return report_path


# ── Entry point ───────────────────────────────────────────────────────────────
# To process multiple resumes, just add more paths to this list
if __name__ == "__main__":

    resumes = [
        # "resume1.pdf",
        # "resume2.pdf",   ← add more resumes here
        "resume2.pdf",
    ]

    for pdf_path in resumes:
        process_resume(pdf_path)