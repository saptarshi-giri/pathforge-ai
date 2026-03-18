"""
train_explainer.py — Run this ONCE to train and save the SHAP explainer model.

Saves to models/:
  - shap_model.pkl   : trained RandomForestRegressor on jobs_dataset.csv
  - shap_mlb.pkl     : fitted MultiLabelBinarizer (skill encoder)

Usage:
  cd backend
  python train_explainer.py
"""

import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MultiLabelBinarizer

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "data", "jobs_dataset.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Load dataset ──────────────────────────────────────────────────────────────
print("Loading jobs_dataset.csv...")
data = pd.read_csv(DATA_PATH)

# ── Encode skills ─────────────────────────────────────────────────────────────
data["Skills_List"] = data["Skills"].apply(lambda x: x.split(";"))

mlb = MultiLabelBinarizer()
skills_encoded = pd.DataFrame(
    mlb.fit_transform(data["Skills_List"]),
    columns=mlb.classes_
)

X = skills_encoded
y = data["Demand_Score"]

# ── Train model ───────────────────────────────────────────────────────────────
print("Training SHAP explainer model...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)
print("  Model trained.")

# ── Save both artefacts ───────────────────────────────────────────────────────
shap_model_path = os.path.join(MODEL_DIR, "shap_model.pkl")
shap_mlb_path   = os.path.join(MODEL_DIR, "shap_mlb.pkl")

joblib.dump(model, shap_model_path)
joblib.dump(mlb,   shap_mlb_path)

print(f"\n✅ Saved: {shap_model_path}")
print(f"✅ Saved: {shap_mlb_path}")
print("\nDone — you can now run api.py.")
