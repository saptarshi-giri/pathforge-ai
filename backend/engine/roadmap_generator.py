from engine.model_loader import learning_resources, skill_difficulty

# ── Fallback courses for skills not in learning_resource_model.pkl ────────────
# These cover the most common gap skills that the pkl was not trained on.
# Keys are lowercase to match how skills come through the pipeline.
FALLBACK_COURSES = {
    # Dev tools & infrastructure
    "docker":        "Docker Mastery: with Kubernetes & Swarm — Udemy",
    "kubernetes":    "Kubernetes for the Absolute Beginners — Udemy",
    "git":           "Git & GitHub Bootcamp — Udemy",
    "npm":           "Node.js & NPM Crash Course — freeCodeCamp",
    "linux":         "Linux Command Line Basics — Coursera",
    "ci/cd":         "CI/CD with GitHub Actions — GitHub Learning Lab",
    "scripting":     "Bash Scripting & Shell Programming — Udemy",
    "terraform":     "Terraform for Beginners — HashiCorp Learn",

    # Databases
    "postgresql":    "PostgreSQL for Everybody — Coursera",
    "mysql":         "MySQL Bootcamp: Go from SQL Beginner to Expert — Udemy",
    "mongodb":       "MongoDB: The Complete Developer's Guide — Udemy",
    "sql":           "SQL for Data Analysis — Mode Analytics",

    # Microsoft / .NET
    "microsoft":     "Microsoft Azure Fundamentals (AZ-900) — Microsoft Learn",
    "net":           ".NET Core Fundamentals — Microsoft Learn",
    "azure":         "Microsoft Azure Administrator — Microsoft Learn",

    # Cloud
    "aws":           "AWS Certified Cloud Practitioner — AWS Skill Builder",
    "gcp":           "Google Cloud Fundamentals — Coursera",

    # Languages
    "python":        "Python for Everybody — Coursera",
    "java":          "Java Programming Masterclass — Udemy",
    "javascript":    "JavaScript: The Complete Guide — Udemy",
    "typescript":    "Understanding TypeScript — Udemy",
    "c":             "C Programming For Beginners — Udemy",

    # Frontend
    "react":         "React: The Complete Guide — Udemy",
    "html":          "Responsive Web Design — freeCodeCamp",
    "css":           "CSS: The Complete Guide — Udemy",
    "figma":         "Figma UI/UX Design Essentials — Udemy",

    # Data / ML
    "ml":            "Machine Learning Specialization — Coursera",
    "deep learning": "Deep Learning Specialization — Coursera",
    "tensorflow":    "TensorFlow Developer Certificate — Coursera",
    "pandas":        "Data Analysis with Pandas — Kaggle",
    "statistics":    "Statistics with Python — Coursera",
    "powerbi":       "Microsoft Power BI Desktop — Udemy",
    "excel":         "Microsoft Excel: Data Analysis & Dashboards — Udemy",
    "visualization": "Data Visualization with Tableau — Coursera",

    # Soft / other
    "communication": "Business Communication Skills — Coursera",
    "networking":    "Computer Networking: A Top-Down Approach — Coursera",
    "security":      "Cybersecurity Fundamentals — IBM SkillsBuild",
    "ethical hacking":"Ethical Hacking Bootcamp — Udemy",
    "system design": "Grokking the System Design Interview — Educative",
    "dsa":           "Data Structures and Algorithms — Coursera",
    "api":           "REST API Design & Development — Udemy",
    "rest":          "REST API Design & Development — Udemy",
    "nlp":           "Natural Language Processing Specialization — Coursera",
    "mlops":         "MLOps Fundamentals — Coursera",
}


def generate_roadmap(priority_skills: dict, top_n: int = 6) -> dict:
    """
    Generates a monthly learning roadmap from the top N priority skills.

    Course lookup order:
      1. learning_resource_model.pkl  (trained pkl)
      2. FALLBACK_COURSES dict        (hardcoded for common skills)
      3. "Self Study Recommended"     (last resort)
    """
    roadmap = {}
    month   = 1

    top_skills = list(priority_skills.items())[:top_n]

    for i, (skill, score) in enumerate(top_skills):
        skill_lower = skill.lower()

        # ── 1. Try pkl ────────────────────────────────────────────────────────
        course_list = learning_resources.get(skill_lower, [])

        if course_list:
            course_name = course_list[0]["Course"]
            difficulty  = course_list[0]["Difficulty"]

        # ── 2. Try fallback dict ──────────────────────────────────────────────
        elif skill_lower in FALLBACK_COURSES:
            course_name = FALLBACK_COURSES[skill_lower]
            difficulty  = skill_difficulty.get(skill_lower, "Intermediate")

        # ── 3. Last resort ────────────────────────────────────────────────────
        else:
            course_name = "Self Study Recommended"
            difficulty  = skill_difficulty.get(skill_lower, "Intermediate")

        roadmap.setdefault(f"Month {month}", []).append({
            "Skill":          skill,
            "Course":         course_name,
            "Difficulty":     difficulty,
            "Priority Score": score,
        })

        if (i + 1) % 2 == 0:
            month += 1

    return roadmap