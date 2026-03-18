import pdfplumber
from skills_list import SKILLS


def extract_text_from_pdf(pdf_path):

    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    return text


def extract_skills(text):

    text_lower = text.lower()
    skills_found = {}

    for skill in SKILLS:

        skill_lower = skill.lower()
        count = text_lower.count(skill_lower)

        if count == 0:
            continue

        if count >= 3:
            weight = 0.9
        elif count == 2:
            weight = 0.8
        else:
            weight = 0.7

        skills_found[skill_lower] = weight

    return skills_found


def parse_resume(pdf_path):

    text = extract_text_from_pdf(pdf_path)
    skills = extract_skills(text)

    return skills
