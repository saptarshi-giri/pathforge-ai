import numpy as np
from engine.model_loader import (
    career_model,
    label_encoder,
    tfidf_vectorizer,
    svd_model
)


def predict_career_ml(user_skills, top_n=3):

    # Convert skill dictionary to weighted text
    skill_text = []

    for skill, weight in user_skills.items():
        repeat = int(weight * 5)  # convert weight to repetition
        skill_text.extend([skill] * repeat)

    skill_text = " ".join(skill_text)

    # TF-IDF transform
    tfidf_vector = tfidf_vectorizer.transform([skill_text])

    # SVD transform
    svd_vector = svd_model.transform(tfidf_vector)

    # Predict probabilities
    probabilities = career_model.predict_proba(svd_vector)[0]

    # Get top N
    top_indices = probabilities.argsort()[::-1][:top_n]

    results = []

    for idx in top_indices:
        career = label_encoder.inverse_transform([idx])[0]
        score = round(probabilities[idx] * 100, 2)
        results.append((career, score))

    return results