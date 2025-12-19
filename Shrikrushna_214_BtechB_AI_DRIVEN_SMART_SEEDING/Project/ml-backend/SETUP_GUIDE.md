# 🚀 Quick Start Guide - ML Backend Setup

## ✅ Step 1: Install Python Dependencies

Open a terminal in the `ml-backend` folder and run:

```bash
cd "e:\Smart seeding\Smart seeding\ml-backend"
pip install -r requirements.txt
```

## 📦 Step 2: Add Your ML Models

Copy your 3 pickle files into the `models/` folder:

```
ml-backend/
└── models/
    ├── xgboost_classification_model.pkl
    ├── xgboost_regression_model.pkl
    └── seed_quantity_model.pkl
```

**How your models should be structured:**

### 1. Classification Model (Sowing Recommendation)
- **File:** `xgboost_classification_model.pkl`
- **Type:** XGBoost Classifier or sklearn model
- **Inputs:** Season, District, Taluka, Village, Crop_Variety, Soil_Type, Farm_Area_hectares, Rainfall_mm, Avg_Temp_C, Avg_Humidity_pct
- **Output:** 0 (No) or 1 (Yes)

### 2. Regression Model (Yield + Spacing)
- **File:** `xgboost_regression_model.pkl`
- **Type:** XGBoost Regressor or MultiOutput model
- **Inputs:** Same as classification
- **Output:** Array with 3 values [Row_Spacing_cm, Plant_Spacing_cm, Yield_kg]

### 3. Seed Quantity Model
- **File:** `seed_quantity_model.pkl`
- **Type:** Can be saved as dictionary OR just the model
- **Inputs:** All features + Row_Spacing_cm + Plant_Spacing_cm
- **Output:** Seed_Quantity_kg

**Recommended save format for seed model:**
```python
import pickle

# When saving:
model_data = {
    'model': trained_model,
    'columns': list(X_train.columns)  # Feature names after one-hot encoding
}

with open('seed_quantity_model.pkl', 'wb') as f:
    pickle.dump(model_data, f)
```

## 📊 Step 3: Add Your Dataset

Copy your CSV file into the `dataset/` folder:

```
ml-backend/
└── dataset/
    └── village_crop_yield_2000.csv
```

**Required CSV columns:**
- Season
- District
- Taluka
- Village
- Crop_Variety
- Soil_Type
- Farm_Area_hectares
- Rainfall_mm
- Avg_Temp_C
- Avg_Humidity_pct

## 🏃 Step 4: Run the Flask Server

```bash
python app.py
```

You should see:
```
🚀 Starting Flask ML Backend Server...
📁 Base Directory: e:\Smart seeding\Smart seeding\ml-backend
🌐 CORS enabled for: http://localhost:5173
🔗 Server running at: http://localhost:5000

--- LOADING MODELS ---
🔍 Attempting to load: ...\models\xgboost_classification_model.pkl
   ✅ Successfully loaded: xgboost_classification_model.pkl
🔍 Attempting to load: ...\models\xgboost_regression_model.pkl
   ✅ Successfully loaded: xgboost_regression_model.pkl
🔍 Attempting to load: ...\models\seed_quantity_model.pkl
   ✅ Successfully loaded: seed_quantity_model.pkl
----------------------
```

## 🧪 Step 5: Test the API

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "running",
  "models_loaded": true,
  "models": {
    "classification_model": true,
    "regression_model": true,
    "seed_quantity_model": true
  }
}
```

### Test 2: Make a Prediction
```bash
curl -X POST http://localhost:5000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"Season\":\"Kharif\",\"District\":\"Pune\",\"Taluka\":\"Haveli\",\"Village\":\"Vassa\",\"Crop_Variety\":\"Cotton\",\"Soil_Type\":\"Black Soil\",\"Farm_Area_hectares\":2.5}"
```

**Expected response:**
```json
{
  "sowing_recommendation": "Yes",
  "yield_kg": 3245.5,
  "row_spacing": 52.3,
  "plant_spacing": 21.7,
  "seed_quantity": 15.8,
  "weather_data": {
    "temperature": 26.5,
    "humidity": 65.2,
    "rainfall": 850.0
  }
}
```

## 🔧 Step 6: Connect Frontend

Your React frontend is already configured! Just make sure:

1. ✅ Flask backend is running on `http://localhost:5000`
2. ✅ React frontend is running on `http://localhost:5173`
3. ✅ CORS is enabled (already done in `app.py`)

The frontend will automatically call the `/predict` endpoint when you fill out the form.

## 🐛 Troubleshooting

### Problem: "Models not loaded"
**Solution:** Make sure your `.pkl` files are in `ml-backend/models/` folder

### Problem: "CORS error"
**Solution:** Make sure Flask app.py has `CORS(app, origins=["http://localhost:5173"])`

### Problem: "Weather API timeout"
**Solution:** The app will use default values automatically. No action needed.

### Problem: "ModuleNotFoundError: No module named 'xgboost'"
**Solution:** Run `pip install xgboost`

### Problem: Prediction returns wrong format
**Solution:** Check your regression model output. It should return shape (n, 3) with [row_spacing, plant_spacing, yield]

## 📁 Final Folder Structure

```
Smart seeding/
├── frontend/                  # React app (already running on :5173)
├── backend/                   # Node.js backend (not used for ML)
└── ml-backend/               # Python Flask ML backend ⭐
    ├── app.py                # Main Flask app
    ├── requirements.txt      # Dependencies
    ├── README.md            # Setup guide
    ├── .gitignore           # Git ignore
    ├── models/              # 🔴 PUT YOUR 3 .pkl FILES HERE
    │   ├── xgboost_classification_model.pkl
    │   ├── xgboost_regression_model.pkl
    │   └── seed_quantity_model.pkl
    └── dataset/             # 🔴 PUT YOUR CSV HERE
        └── village_crop_yield_2000.csv
```

## 🎉 You're Done!

Once the Flask server is running and showing "✅ Successfully loaded" for all 3 models, your React app will be able to make predictions!
