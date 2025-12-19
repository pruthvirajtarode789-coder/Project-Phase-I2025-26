# 🩺 AI Health Assistant - Zero-Shot Medical Diagnosis System

<div align="center">

![AI Health Assistant](https://img.shields.io/badge/AI-Health%20Assistant-00d4ff?style=for-the-badge&logo=artificial-intelligence&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**An intelligent AI-powered health assistant using zero-shot learning for medical symptom analysis and disease prediction**

[📖 Documentation](#-features) • [🚀 Quick Start](#-quick-start) • [🎯 Demo](#-how-it-works) • [🤝 Contributing](#-project-structure)

</div>

---

## 🌟 Overview

**AI Health Assistant** is an advanced medical diagnostic system that leverages **Zero-Shot Learning (ZSL)** with state-of-the-art Natural Language Processing (NLP) to analyze patient symptoms and predict potential diseases. The system combines semantic embeddings, FAISS vector search, and transformer-based models to provide accurate, real-time health insights — even for conditions not explicitly seen during training.

### ✨ Key Highlights

- 🧠 **Zero-Shot Learning** - Diagnose diseases without explicit training data
- 🎤 **Multi-Language Voice Input** - English, हिन्दी, and मराठी support
- 📍 **Smart Location Services** - Find nearby doctors and hospitals using OpenStreetMap
- 🔍 **Semantic Search** - FAISS-powered vector similarity search
- 🎯 **Triage System** - Intelligent urgency classification (low, medium, high, critical)
- 📋 **Medical History Management** - Track previous visits, medications, and documents
- 🌐 **Modern Web UI** - Beautiful glassmorphic design with responsive layout

---

## 🎯 Features

### 🔬 Core AI Capabilities

| Feature | Description |
|---------|-------------|
| **Symptom Analysis** | Advanced NLP-based symptom understanding and normalization |
| **Disease Prediction** | Zero-shot inference using multilingual embeddings (E5-base) |
| **Entailment Scoring** | XLM-RoBERTa-based Natural Language Inference for confidence scoring |
| **Specialist Recommendations** | AI-suggested medical specialists based on predicted conditions |
| **Test Recommendations** | Suggested diagnostic tests for comprehensive evaluation |
| **Triage Classification** | Automated urgency assessment from symptoms |

### 🌍 User Experience

- ✅ **Voice Recognition** - Hands-free symptom description
- ✅ **Multi-Language Support** - English, Hindi (हिन्दी), Marathi (मराठी)
- ✅ **Nearby Doctor Finder** - Geolocation-based clinic and hospital search
- ✅ **Medical Document Upload** - Store reports, prescriptions, and medical records
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices
- ✅ **Real-time Analysis** - Instant predictions via REST API

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **AI Models**: 
  - `intfloat/multilingual-e5-base` - Multilingual embeddings
  - `joeddav/xlm-roberta-large-xnli` - Natural Language Inference
- **Vector Search**: FAISS (Facebook AI Similarity Search)
- **Libraries**: PyTorch, Transformers, Sentence-Transformers

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Design**: Glassmorphism UI with animated gradients
- **APIs**: Geolocation API, Web Speech API, OpenStreetMap Nominatim

### Data
- **Knowledge Base**: 1000+ medical concepts and diseases in JSONL format
- **Embeddings**: Pre-computed FAISS indices for instant retrieval
- **Multi-lingual**: Phrase book for Hindi and Marathi translations

---

## 🚀 Quick Start

### Prerequisites

```bash
# Python 3.8 or higher
python --version

# Git (for cloning)
git --version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-health-assistant.git
cd ai-health-assistant

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Build FAISS Indices

Before running the server, you need to build the FAISS indices for fast similarity search:

```bash
# Build symptom concepts index
python build_index.py

# Build disease knowledge index
python build_disease_index.py
```

This will create:
- `models/faiss_index.bin` - Symptom concept embeddings
- `models/faiss_index_diseases.bin` - Disease knowledge embeddings

### Run the Application

#### 1. Start the Backend Server

```bash
python server.py
```

The FastAPI server will start at `http://127.0.0.1:8000`

#### 2. Serve the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Using Python's built-in HTTP server
python -m http.server 8080

# Or using Node.js http-server (if installed)
npx http-server -p 8080
```

The frontend will be available at `http://localhost:8080`

---

## 📖 How It Works

### 🔄 System Architecture

```
┌─────────────────┐
│   User Input    │
│  (Symptoms)     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Normalization  │ ← Text cleaning & standardization
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Embedding     │ ← E5-Base multilingual encoder
└────────┬────────┘
         │
         v
┌─────────────────┐
│  FAISS Search   │ ← Vector similarity retrieval
└────────┬────────┘
         │
         v
┌─────────────────┐
│ NLI Entailment  │ ← XLM-RoBERTa confidence scoring
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Predictions   │ → Diseases + Specialists + Tests
└─────────────────┘
```

### 🧪 Inference Pipeline

1. **Text Normalization**: User symptoms are cleaned and standardized
2. **Embedding Generation**: Text converted to high-dimensional vectors using E5-Base
3. **FAISS Retrieval**: Top-K similar medical concepts retrieved via inner product search
4. **Lexical Boosting**: Exact keyword matches receive additional scoring
5. **Entailment Verification**: NLI model validates predictions with confidence scores
6. **Ranking & Filtering**: Results sorted by score and filtered by threshold
7. **Enrichment**: Specialists and diagnostic tests added to predictions

---

## 📂 Project Structure

```
Pruthviraj_ZSL_Medical_Assistant/
│
├── 📁 data/                          # Knowledge base and datasets
│   ├── concepts.jsonl                # Medical symptom concepts (1000+)
│   ├── diseases.jsonl                # Disease descriptions and metadata
│   └── phrasebook.csv                # Multi-language translations
│
├── 📁 src/                           # Core AI pipeline modules
│   ├── pipeline.py                   # Main symptom inference pipeline
│   ├── pipeline_disease.py           # Disease-specific predictions
│   ├── normalise.py                  # Text normalization utilities
│   ├── triage.py                     # Urgency classification logic
│   ├── recommend.py                  # Specialist & test recommendations
│   └── places_client.py              # OpenStreetMap integration
│
├── 📁 frontend/                      # Web UI
│   ├── index.html                    # Main application page
│   ├── style.css                     # Glassmorphic styling
│   └── script.js                     # Frontend logic and API calls
│
├── 📁 models/                        # Pre-built FAISS indices
│   ├── faiss_index.bin               # Symptom concept vectors
│   └── faiss_index_diseases.bin      # Disease knowledge vectors
│
├── 📄 server.py                      # FastAPI backend server
├── 📄 build_index.py                 # FAISS index builder for symptoms
├── 📄 build_disease_index.py         # FAISS index builder for diseases
├── 📄 requirements.txt               # Python dependencies
│
├── 📁 diagrams/                      # UML and system diagrams
├── 📄 Research_Paper.pdf             # Academic research paper
├── 📄 ProjectPhase1_Report.pdf       # Project documentation
├── 📄 ProjectPoster.pdf              # Visual project summary
└── 📄 README.md                      # This file
```

---

## 🎮 Usage Examples

### API Endpoints

#### 1. Predict Symptoms (Merged Endpoint)

**POST** `/predict`

```json
{
  "symptoms": "fever and severe headache with nausea"
}
```

**Response:**
```json
{
  "normalized_text": "fever severe headache nausea",
  "predictions": [
    {
      "label": "Migraine",
      "score": 0.94,
      "system": "neurological",
      "desc": "Severe recurring headaches with nausea",
      "specialists": ["Neurologist", "Pain Management"],
      "recommended_tests": ["MRI Brain", "CT Scan"]
    }
  ],
  "diseases": [
    {
      "label": "Meningitis",
      "score": 0.87,
      "description": "Inflammation of protective membranes",
      "specialists": ["Infectious Disease Specialist"],
      "recommended_tests": ["Lumbar Puncture", "Blood Culture"]
    }
  ],
  "triage": "high",
  "disclaimer": "Informational only; not a medical diagnosis."
}
```

#### 2. Disease-Only Prediction

**POST** `/predict_disease`

```json
{
  "text": "persistent cough for 2 weeks"
}
```

### Frontend Usage

1. **Describe Symptoms**: Type or speak your symptoms in the text area
2. **Add Details**: Optionally add age, severity, and prior medications
3. **Analyze**: Click "Analyze" to get AI predictions
4. **Find Doctors**: Use "Find Nearby Doctors" to locate healthcare providers
5. **Medical History**: Click "Triage Table" to manage medical records

---

## 🧪 Sample Demo

### Input
```
"Running nose, sore throat, and mild fever since yesterday"
```

### Output
```
✅ Predicted Conditions:
   1. Common Cold (Score: 0.96) - Viral infection of upper respiratory tract
      👨‍⚕️ Specialists: General Practitioner, ENT Specialist
      🔬 Tests: Rapid Antigen Test, Complete Blood Count

   2. Allergic Rhinitis (Score: 0.89) - Inflammation of nasal passages
      👨‍⚕️ Specialists: Allergist, Immunologist
      🔬 Tests: Allergy Panel, IgE Test

🚨 Triage Level: LOW
📍 Found 5 nearby clinics within 2 km
```

---

## ⚙️ Configuration

### Modifying AI Parameters

Edit `src/pipeline.py` to adjust:

```python
# Line 28-33
MAX_LEN = 512                  # Maximum input token length
RETR_SIM_MIN = 0.85           # Minimum semantic similarity threshold
LEXICAL_BOOST = 0.35          # Score boost for exact keyword matches
MARGIN_MIN = 0.15             # Minimum entailment margin
STRICT_EXACT_WINS = True      # Prioritize exact matches
TOPK = 30                     # Number of candidates to retrieve
```

### Adding Medical Concepts

Edit `data/concepts.jsonl`:
```json
{
  "label": "Condition Name",
  "description": "Detailed medical description",
  "system": "body_system",
  "synonyms": "alternative1|alternative2"
}
```

Then rebuild the index:
```bash
python build_index.py
```

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| **Embedding Dimension** | 768 (E5-Base) |
| **Concept Database Size** | 1000+ medical terms |
| **Disease Database Size** | 500+ conditions |
| **Average Response Time** | < 2 seconds |
| **Supported Languages** | 3 (English, Hindi, Marathi) |
| **FAISS Index Type** | Inner Product (IP) |

---

## 🔐 Security & Privacy

- ⚠️ **No Data Storage**: User symptom data is not stored permanently
- 🔒 **Local Processing**: All AI inference happens locally on your machine
- 🌐 **HTTPS Recommended**: Use SSL certificates for production deployment
- 📋 **Medical Disclaimer**: This tool is for informational purposes only

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guide for Python code
- Add docstrings to all functions
- Update README.md for significant changes
- Test thoroughly before submitting PR

---

## 📝 Research & References

This project is based on cutting-edge research in:

- **Zero-Shot Learning** for medical diagnosis
- **Semantic Text Embeddings** with multilingual support
- **Natural Language Inference** for confidence estimation
- **FAISS Vector Search** for real-time retrieval

See `Research_Paper.pdf` and `ProjectPhase1_Report.pdf` for detailed academic documentation.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Pruthviraj Tarode**

- 🎓 Student Researcher in AI & Medical Informatics
- 📧 Email: pruthvirajtarode789@gmail.com
- 💼 LinkedIn: [Pruthviraj Tarode](https://linkedin.com/in/pruthvirajtarode)
- 🌐 Portfolio: [pruthvirajtarode.github.io](https://pruthvirajtarode.github.io)

---

## 🙏 Acknowledgments

- **Hugging Face** for transformer models
- **Facebook AI Research** for FAISS library
- **OpenStreetMap** for location services
- **UPenn & NIST** for NLI research

---

## ⚠️ Medical Disclaimer

**IMPORTANT**: This software is provided for **educational and informational purposes only**. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment.

- ❌ Do not use this tool for medical emergencies
- ❌ Do not rely solely on AI predictions for health decisions
- ✅ Always consult a qualified healthcare professional
- ✅ In case of emergency, call local emergency services immediately

The developers assume no liability for any decisions made based on this software.

---

<div align="center">

**Made with ❤️ and 🧠 AI** 

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/ai-health-assistant?style=social)](https://github.com/yourusername/ai-health-assistant)
[![GitHub Forks](https://img.shields.io/github/forks/yourusername/ai-health-assistant?style=social)](https://github.com/yourusername/ai-health-assistant/fork)

</div>
