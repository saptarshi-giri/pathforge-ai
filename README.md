# pathforgeAI — AI Career Recommendation System

Analyze resumes. Predict careers. Bridge skill gaps. Build learning paths.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![ML](https://img.shields.io/badge/ML-Scikit--learn-orange)
![XGBoost](https://img.shields.io/badge/Model-XGBoost-red)
![Explainable AI](https://img.shields.io/badge/XAI-SHAP-purple)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

---

## Overview

CareerLens is an end-to-end AI-powered system that analyzes resumes and recommends suitable career paths using machine learning. It identifies skill gaps, prioritizes them based on industry demand, and generates structured learning roadmaps.

The system integrates NLP, ML, and Explainable AI to provide accurate and interpretable career guidance.

---

## Features

- Resume parsing using NLP
- Career prediction using ML models
- Skill gap identification
- Industry demand-based prioritization
- Explainable AI using SHAP
- Personalized roadmap generation

---

## Tech Stack

Python • Scikit-learn • XGBoost • SHAP • Pandas • NumPy • TF-IDF • SVD • Joblib • PostgreSQL

---

## Architecture

Resume (PDF)
↓
Resume Parser (NLP)
↓
Skill Extraction
↓
ML Prediction Engine
↓
Skill Gap Analysis
↓
Industry Demand Analyzer
↓
Explainable AI (SHAP)
↓
Roadmap Generator


---

## Project Structure

.
├── engine/
├── models/
├── test/
├── resume_parser.py
├── skills_list.py
├── main.py


---

## Run

```bash
python main.py

Notes
Models are pre-trained and stored in /models
Resume input handled via resume_parser.py
Modular pipeline architecture for scalability


Future Work
Real-time job market integration
Advanced NLP using transformer models
Web-based dashboard
Personalized adaptive recommendations
