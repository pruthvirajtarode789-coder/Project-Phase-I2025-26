# ML Backend Folder Structure

This folder contains the Python Flask backend for crop yield predictions using ML models.

## 📁 Folder Structure

```
ml-backend/
├── app.py                                    # Main Flask application
├── requirements.txt                          # Python dependencies
├── models/                                   # ML model files (CREATE THIS FOLDER)
│   ├── xgboost_classification_model.pkl     # Sowing recommendation model
│   ├── xgboost_regression_model.pkl         # Yield, row & plant spacing model
│   └── seed_quantity_model.pkl              # Seed quantity prediction model
├── dataset/                                  # Dataset files (CREATE THIS FOLDER)
│   └── village_crop_yield_2000.csv          # Training dataset
└── README.md                                 # This file
```

## 🚀 Setup Instructions

### 1. Create Required Folders
```bash
mkdir models
mkdir dataset
```

### 2. Add Your ML Models
Place these 3 pickle files in the `models/` folder:
- `xgboost_classification_model.pkl`
- `xgboost_regression_model.pkl`
- `seed_quantity_model.pkl`

### 3. Add Your Dataset
Place your CSV file in the `dataset/` folder:
- `village_crop_yield_2000.csv`

### 4. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the Flask Server
```bash
python app.py
```

The server will start at: **http://localhost:5000**

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Prediction Request
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Season": "Kharif",
    "District": "Pune",
    "Taluka": "Haveli",
    "Village": "Vassa",
    "Crop_Variety": "Cotton",
    "Soil_Type": "Black Soil",
    "Farm_Area_hectares": 2.5
  }'
```

## 📤 API Response Format

```json
{
  "sowing_recommendation": "Yes",
  "yield_kg": 3245.50,
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

## 🔧 Model File Format

### Classification Model
- **Input:** Season, District, Taluka, Village, Crop_Variety, Soil_Type, Farm_Area_hectares, Rainfall_mm, Avg_Temp_C, Avg_Humidity_pct
- **Output:** Binary (0 = No, 1 = Yes)

### Regression Model
- **Input:** Same as classification
- **Output:** [Row_Spacing_cm, Plant_Spacing_cm, Yield_kg]

### Seed Quantity Model
- **Input:** All features + Row_Spacing_cm + Plant_Spacing_cm
- **Output:** Seed_Quantity_kg
- **Note:** Should be saved as a dict with 'model' and 'columns' keys

## 🐛 Troubleshooting

- **Models not loading?** Check that pickle files are in `models/` folder
- **CORS errors?** Make sure frontend is running on `http://localhost:5173`
- **Weather API failing?** Default values will be used (Temp=25°C, Humidity=60%, Rainfall=600mm)

## 📊 Dataset Requirements

Your CSV should have these columns:
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
- Row_Spacing_cm
- Plant_Spacing_cm
- Yield_kg
- Seed_Quantity_kg
