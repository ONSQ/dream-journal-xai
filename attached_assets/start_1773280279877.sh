# 🌙 Vigilant Spirit Dream Journal — Full Stack with Real XAI

Complete dream journaling app with **real trained ML model** and **SHAP + LIME explainability**.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│                   (localhost:5173)                       │
│  - Dream journal UI                                      │
│  - Calls /api/classify for XAI analysis                  │
└───────────────────────┬─────────────────────────────────┘
                        │ fetch('/api/classify')
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Python Backend                         │
│                   (localhost:5000)                       │
│  - Flask API server                                      │
│  - Loads dream_classifier_model.pkl (6MB trained model) │
│  - SHAP LinearExplainer for Shapley values              │
│  - LIME TextExplainer for local surrogate               │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start on Replit

1. Import this folder to Replit
2. Click **Run**
3. Wait for dependencies to install (~60 seconds)
4. Both servers start automatically
5. App opens in webview

## Model Details

**Trained on:** 6,090 labeled dream narratives
**Model:** OneVsRestClassifier(LogisticRegression(C=0.5))
**Features:** TF-IDF with 2000 features, unigrams + bigrams
**Cross-validated F1 Scores:**
- Spiritual: 0.894 ± 0.013
- Trauma: 0.887 ± 0.004  
- Maintenance: 0.791 ± 0.014

## XAI Methods

### SHAP (SHapley Additive exPlanations)
- Game-theoretic feature attribution
- Shows exact contribution of each word
- LinearExplainer optimized for logistic regression

### LIME (Local Interpretable Model-agnostic Explanations)
- Perturbs input and fits local surrogate model
- Provides alternative explanation for validation
- Method agreement score shows confidence

## API Endpoints

```bash
# Health check
GET /api/health
{
  "status": "healthy",
  "model_loaded": true,
  "shap_available": true,
  "lime_available": true,
  "features": 2000
}

# Classify dream
POST /api/classify
{
  "text": "I saw Jesus in heaven with angels..."
}
# Returns probabilities, SHAP features, LIME features, interpretation
```

## Project Structure

```
vigilant-spirit-fullstack/
├── .replit                 # Replit configuration
├── replit.nix              # System dependencies
├── start.sh                # Startup script
├── README.md               # This file
├── backend/
│   ├── main.py             # Flask API with XAI
│   └── dream_classifier_model.pkl  # Trained model (6MB)
└── frontend/
    ├── package.json        # NPM dependencies
    ├── vite.config.js      # Vite with API proxy
    ├── index.html          # Entry HTML
    └── src/
        ├── main.jsx        # React entry
        ├── index.css       # Tailwind styles
        └── App.jsx         # Main app with API calls
```

## Local Development

```bash
# Terminal 1: Backend
cd backend
pip install flask flask-cors scikit-learn shap lime
python main.py

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev
```

## Based On

- **The Vigilant Spirit Dream Journal** (Owen Eskew, ONSQ Press)
- **The Restored Night Workbook** (Owen Eskew, ONSQ Press)
- CS5823: Trust, Confidence and Explainability in AI

## License

© 2026 ONSQ Enterprises. All rights reserved.
