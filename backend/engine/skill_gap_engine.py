from engine.model_loader import career_skill_matrix


def calculate_skill_gap(user_skills, career_name, top_n=6):

    if career_name not in career_skill_matrix.index:
        print("Career not found in skill matrix")
        return {}

    required = career_skill_matrix.loc[career_name]

    gap = {}

    for skill, required_level in required.items():

        user_level = user_skills.get(skill.lower(), 0)

        diff = required_level - user_level

        if diff > 0:
            gap[skill] = round(diff, 2)

    sorted_gap = dict(
        sorted(gap.items(), key=lambda x: x[1], reverse=True)
    )

    return dict(list(sorted_gap.items())[:top_n])