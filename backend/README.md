# AI Health Copilot - FastAPI Backend Service

Production-grade AI-powered personal healthcare navigation backend built with Python FastAPI.

## Features
- **AI Agent Orchestrator**: Language detection (English, Telugu, Hindi, Tamil, Kannada), symptom triage classification, and specialist routing.
- **Emergency Safety Engine**: Immediate alert and 108/911 escalation when high-risk symptoms are detected.
- **Vision AI Endpoint**: Computer vision observation mock/LLM service for skin/wound/eye visual analysis.
- **Food & Nutrition AI**: Nutritional breakdown & personalized suitability filter based on user medical conditions/allergies.
- **Document OCR & Report Summarizer**: Structured parameter extraction with reference range highlighting.
- **Secure Tokenized QR Medical Card**: Patient consent management & doctor portal access control.

## Setup & Running Locally

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run Server**:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

3. **API Documentation**:
Open browser at `http://localhost:8000/docs` to test endpoints via Swagger UI.
