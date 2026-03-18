import joblib
import os

# Resolve models/ relative to this file's location (project root)
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

def load_model(name):
    return joblib.load(os.path.join(MODEL_PATH, name))


career_model = load_model("career_model.pkl")
career_similarity = load_model("career_similarity_model.pkl")
career_skill_matrix = load_model("career_skill_matrix.pkl")
label_encoder = load_model("label_encoder.pkl")
learning_resources = load_model("learning_resource_model.pkl")
skill_demand = load_model("skill_demand_model.pkl")
skill_difficulty = load_model("skill_difficulty_model.pkl")
skill_priority = load_model("skill_priority_model.pkl")
svd_model = load_model("svd_model.pkl")
tfidf_vectorizer = load_model("tfidf_vectorizer.pkl")

print("All models loaded successfully")