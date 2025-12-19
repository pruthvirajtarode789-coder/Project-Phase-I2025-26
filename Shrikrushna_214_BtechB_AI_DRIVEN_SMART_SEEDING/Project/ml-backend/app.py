import os
from flask import Flask, request, jsonify, render_template, url_for, session, redirect, send_from_directory
import requests
from datetime import datetime
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pandas as pd
import pickle
import base64

# --- TRY IMPORTING XGBOOST ---
try:
    import xgboost
    print("✅ XGBoost library found.")
except ImportError:
    print("❌ ERROR: XGBoost library NOT found. Please run 'pip install xgboost'")

# --- TRY IMPORTING GOOGLE CLOUD TTS ---
try:
    from google.cloud import texttospeech
    TTS_AVAILABLE = True
    print("✅ Google Cloud Text-to-Speech library found.")
except ImportError:
    TTS_AVAILABLE = False
    print("⚠️ WARNING: Google Cloud Text-to-Speech library NOT found.")
    print("   Text-to-Speech will not be available. Install with: pip install google-cloud-texttospeech")

# --- TRY IMPORTING GOOGLE CLOUD VISION ---
try:
    from google.cloud import vision
    from PIL import Image
    import io
    VISION_AVAILABLE = True
    print("✅ Google Cloud Vision library found.")
except ImportError:
    VISION_AVAILABLE = False
    print("⚠️ WARNING: Google Cloud Vision library NOT found.")
    print("   Image verification will not be available. Install with: pip install google-cloud-vision pillow")

app = Flask(__name__)

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.secret_key = 'your_super_secret_key_for_sessions'
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['MONGO_URI'] = "mongodb://localhost:27017/agricare"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
mongo = PyMongo(app)

# Initialize Google Cloud TTS client if available
if TTS_AVAILABLE:
    try:
        tts_client = texttospeech.TextToSpeechClient()
        print("✅ Google Cloud TTS client initialized successfully.")
    except Exception as e:
        print(f"⚠️ WARNING: Could not initialize Google Cloud TTS client: {e}")
        print("   Make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly.")
        tts_client = None
else:
    tts_client = None

# Initialize Google Cloud Vision client if available
if VISION_AVAILABLE:
    try:
        vision_client = vision.ImageAnnotatorClient()
        print("✅ Google Cloud Vision client initialized successfully.")
    except Exception as e:
        print(f"⚠️ WARNING: Could not initialize Google Cloud Vision client: {e}")
        print("   Make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly.")
        vision_client = None
else:
    vision_client = None

# --- Helper Functions ---

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_pickle(filename):
    """Loads a pickle file using an absolute path."""
    file_path = os.path.join(BASE_DIR, 'models', filename)
    print(f"🔍 Attempting to load: {file_path}")
    try:
        with open(file_path, 'rb') as f:
            model = pickle.load(f)
            print(f"   ✅ Successfully loaded: {filename}")
            return model
    except FileNotFoundError:
        print(f"   ❌ ERROR: File not found at: {file_path}")
        return None
    except Exception as e:
        print(f"   ❌ ERROR loading {filename}: {e}")
        return None

# --- Load Models ---
print("\n--- LOADING MODELS ---")
classification_model = load_pickle('xgboost_classification_model.pkl')
regression_model = load_pickle('xgboost_regression_model.pkl')
seed_model_data = load_pickle('seed_quantity_model.pkl')
if seed_model_data and isinstance(seed_model_data, dict):
    seed_quantity_model = seed_model_data.get('model')
    seed_model_columns = seed_model_data.get('columns', [])
else:
    seed_quantity_model = seed_model_data
    seed_model_columns = []
print("----------------------\n")

# --- Load Dataset for Dropdowns ---
try:
    csv_path = os.path.join(BASE_DIR, 'dataset', 'village_crop_yield_2000.csv')
    df_vals = pd.read_csv(csv_path)
    print(f"✅ Dataset loaded: {csv_path}")
    unique_values = {
        'Season': sorted(df_vals['Season'].dropna().unique().tolist()),
        'Crop_Variety': sorted(df_vals['Crop_Variety'].dropna().unique().tolist()),
        'Soil_Type': sorted(df_vals['Soil_Type'].dropna().unique().tolist())
    }
    taluka_data = {}
    for _, r in df_vals[['District', 'Taluka']].drop_duplicates().dropna().iterrows():
        taluka_data.setdefault(r['District'], []).append(r['Taluka'])
    taluka_data = {k: sorted(set(v)) for k, v in taluka_data.items()}
except Exception as e:
    print(f"⚠️ Warning: Could not load CSV dataset: {e}")
    unique_values = {'Season': [], 'Crop_Variety': [], 'Soil_Type': []}
    taluka_data = {}

def fetch_avg_weather_data(district):
    """Fetch historical weather data for a district."""
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={district}&count=1&language=en&format=json"
        geo_resp = requests.get(geo_url, timeout=5)
        if not (geo_resp.status_code == 200 and geo_resp.json().get("results")):
            print(f"⚠️ Geocoding failed for {district}, using defaults")
            return 25.0, 60.0, 600.0
        loc = geo_resp.json()["results"][0]
        lat, lon = loc["latitude"], loc["longitude"]
        weather_url = (
            f"https://archive-api.open-meteo.com/v1/archive?"
            f"latitude={lat}&longitude={lon}"
            f"&start_date=2023-01-01&end_date=2023-12-31"
            f"&daily=temperature_2m_mean,relativehumidity_2m_mean,precipitation_sum"
            f"&timezone=Asia%2FKolkata"
        )
        wresp = requests.get(weather_url, timeout=8)
        if wresp.status_code != 200:
            print("⚠️ Weather API failed, using defaults")
            return 25.0, 60.0, 600.0
        daily = wresp.json().get('daily', {})
        temps = daily.get('temperature_2m_mean', [])
        humidity = daily.get('relativehumidity_2m_mean', [])
        precip = daily.get('precipitation_sum', [])
        if temps and humidity and precip:
            avg_temp = round(sum(temps) / len(temps), 2)
            avg_humidity = round(sum(humidity) / len(humidity), 2)
            total_rainfall = round(sum(precip), 2)
            print(f"✅ Weather fetched for {district}: Temp={avg_temp}°C, Humidity={avg_humidity}%, Rainfall={total_rainfall}mm")
            return avg_temp, avg_humidity, total_rainfall
    except Exception as e:
        print(f"❌ Weather fetch error: {e}")
    return 25.0, 60.0, 600.0

def calculate_traditional_seed_quantity(crop_variety):
    """
    Calculate traditional/baseline seed quantity based on crop type.
    Returns kg/acre based on standard agricultural practices.
    Traditional methods typically use more seeds than optimized spacing.
    """
    # Traditional seed rates (kg/acre) - these are typical rates without optimization
    traditional_rates = {
        # Cereals
        'Rice': 40.0,
        'Wheat': 50.0,
        'Maize': 20.0,
        'Bajra': 4.0,
        'Jowar': 10.0,
        
        # Pulses
        'Arhar': 10.0,
        'Moong': 8.0,
        'Urad': 12.0,
        'Masoor': 15.0,
        'Gram': 30.0,
        'Tur': 10.0,
        
        # Oilseeds
        'Groundnut': 50.0,
        'Soybean': 35.0,
        'Sunflower': 5.0,
        'Safflower': 10.0,
        
        # Cash crops
        'Cotton': 10.0,
        'Sugarcane': 6000.0,  # Sets per acre
        
        # Vegetables
        'Tomato': 0.2,
        'Potato': 1200.0,
        'Onion': 8.0,
    }
    
    # Extract base crop name (remove variety in parentheses)
    crop_base = crop_variety.split('(')[0].strip()
    
    # Check if crop exists in our mapping
    for crop_key, rate in traditional_rates.items():
        if crop_key.lower() in crop_base.lower():
            return rate
    
    # Default rate if crop not found (average seed rate)
    return 25.0

# --- Routes ---

@app.route('/')
def index():
    user = None
    if 'user_email' in session:
        user = mongo.db.users.find_one({"email": session['user_email']})
    return render_template('index.html', user=user)

@app.route('/register', methods=['POST'])
def register():
    if 'profile_photo' not in request.files:
        return jsonify({"message": "No profile photo part"}), 400
    photo = request.files['profile_photo']
    fullname = request.form.get('fullname')
    email = request.form.get('email')
    password = request.form.get('password')
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 409
    photo_path = None
    if photo and allowed_file(photo.filename):
        filename = secure_filename(photo.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        photo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        photo_path = filename
    mongo.db.users.insert_one({
        "fullname": fullname, "email": email,
        "password": generate_password_hash(password), "profile_photo_path": photo_path
    })
    session['user_email'] = email
    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({"email": data.get('email')})
    if user and check_password_hash(user['password'], data.get('password')):
        session['user_email'] = user['email']
        return jsonify({"message": "Login successful!", "user": {"fullname": user['fullname']}}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout')
def logout():
    session.pop('user_email', None)
    return redirect(url_for('index'))

@app.route('/prediction', endpoint='prediction')
def prediction_page():
    if 'user_email' not in session:
        return redirect(url_for('login'))
    user = mongo.db.users.find_one({"email": session['user_email']})
    return render_template('prediction.html', user=user, unique_values=unique_values,
                           talukaData=taluka_data, prediction_made=False)

# --- Prediction Endpoint ---
@app.route('/predict', methods=['POST'])
def predict_yield():
    if not (classification_model and regression_model and seed_quantity_model):
        print("❌ Prediction Blocked: Models are missing.")
        return jsonify({'error': 'ML models not loaded. Please check server console for details.'}), 500
    try:
        payload = request.get_json(force=True)
        print(f"\n📥 Received prediction request: {payload}")
        district = payload.get('District') or payload.get('district')
        season = payload.get('Season') or payload.get('season')
        taluka = payload.get('Taluka') or payload.get('taluka')
        village = payload.get('Village') or payload.get('village', '')
        crop_variety = payload.get('Crop_Variety') or payload.get('crop_variety')
        soil_type = payload.get('Soil_Type') or payload.get('soil_type')
        farm_area = float(payload.get('Farm_Area_hectares') or payload.get('farm_area_hectares') or 1.0)
        # Optional weather fields
        temp = payload.get('Avg_Temp_C') or payload.get('avg_temp_c')
        humidity = payload.get('Avg_Humidity_pct') or payload.get('avg_humidity_pct')
        rainfall = payload.get('Rainfall_mm') or payload.get('rainfall_mm')
        if temp is None or humidity is None or rainfall is None:
            fetched_temp, fetched_humidity, fetched_rainfall = fetch_avg_weather_data(district)
            temp = temp if temp is not None else fetched_temp
            humidity = humidity if humidity is not None else fetched_humidity
            rainfall = rainfall if rainfall is not None else fetched_rainfall
        if not all([district, season, taluka, crop_variety, soil_type]):
            return jsonify({'error': 'Missing required fields'}), 400
        input_df = pd.DataFrame({
            'Season': [season],
            'District': [district],
            'Taluka': [taluka],
            'Village': [village],
            'Crop_Variety': [crop_variety],
            'Soil_Type': [soil_type],
            'Farm_Area_hectares': [farm_area],
            'Rainfall_mm': [rainfall],
            'Avg_Temp_C': [temp],
            'Avg_Humidity_pct': [humidity]
        })
        print(f"📊 Input DataFrame:\n{input_df}")
        # Classification
        clf_pred = classification_model.predict(input_df)
        sowing_recommendation = "Yes" if int(clf_pred[0]) == 1 else "No"
        # Regression
        reg_pred = regression_model.predict(input_df)
        if hasattr(reg_pred[0], '__len__') and len(reg_pred[0]) >= 3:
            row_spacing, plant_spacing, yield_kg = reg_pred[0]
        else:
            row_spacing = float(reg_pred[0]) if len(reg_pred) > 0 else 50.0
            plant_spacing = float(reg_pred[1]) if len(reg_pred) > 1 else 20.0
            yield_kg = float(reg_pred[2]) if len(reg_pred) > 2 else 3000.0
        # Seed quantity
        seed_input = input_df.copy()
        seed_input['Row_Spacing_cm'] = row_spacing
        seed_input['Plant_Spacing_cm'] = plant_spacing
        seed_encoded = pd.get_dummies(seed_input, drop_first=False)
        if seed_model_columns:
            seed_aligned = pd.DataFrame(0, index=seed_encoded.index, columns=seed_model_columns)
            common_cols = seed_encoded.columns.intersection(seed_model_columns)
            seed_aligned[common_cols] = seed_encoded[common_cols]
        else:
            seed_aligned = seed_encoded
        seed_pred = seed_quantity_model.predict(seed_aligned)
        predicted_seed_qty_ha = float(seed_pred[0])
        # Convert kg/hectare to kg/acre (1 hectare = 2.47105 acres)
        predicted_seed_qty_acre = predicted_seed_qty_ha / 2.47105
        
        # Calculate traditional seed quantity for comparison
        traditional_seed_qty = calculate_traditional_seed_quantity(crop_variety)
        
        # Calculate savings and optimization percentage
        quantity_saved = traditional_seed_qty - predicted_seed_qty_acre
        percentage_saved = (quantity_saved / traditional_seed_qty * 100) if traditional_seed_qty > 0 else 0
        
        # Estimate cost savings (average seed cost in INR per kg - varies by crop)
        # Using conservative average of ₹50/kg for general estimation
        avg_seed_cost_per_kg = 50
        cost_savings = quantity_saved * avg_seed_cost_per_kg
        
        response = {
            'sowing_recommendation': str(sowing_recommendation),
            'yield_kg': round(float(yield_kg), 2),
            'row_spacing': round(float(row_spacing), 1),
            'plant_spacing': round(float(plant_spacing), 1),
            'seed_quantity': round(float(predicted_seed_qty_acre), 2),
            'weather_data': {
                'temperature': float(temp) if temp is not None else 0.0,
                'humidity': float(humidity) if humidity is not None else 0.0,
                'rainfall': float(rainfall) if rainfall is not None else 0.0
            },
            'seed_comparison': {
                'traditional_quantity': round(float(traditional_seed_qty), 2),
                'optimized_quantity': round(float(predicted_seed_qty_acre), 2),
                'quantity_saved': round(float(quantity_saved), 2),
                'percentage_saved': round(float(percentage_saved), 1),
                'estimated_cost_savings': round(float(cost_savings), 2)
            }
        }
        print(f"📤 Sending response: {response}\n")
        return jsonify(response), 200
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server Error: {str(e)}'}), 500

@app.route('/weather-forecast')
def weather_forecast():
    return jsonify({"message": "Weather route placeholder"})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- Health Check ---
@app.route('/health', methods=['GET'])
def health_check():
    models_status = {
        'classification_model': classification_model is not None,
        'regression_model': regression_model is not None,
        'seed_quantity_model': seed_quantity_model is not None
    }
    return jsonify({
        'status': 'running',
        'models_loaded': all(models_status.values()),
        'models': models_status
    }), 200

# --- Dropdown Data ---
@app.route('/dropdowns', methods=['GET'])
def get_dropdowns():
    return jsonify({
        "seasons": unique_values.get('Season', []),
        "crop_varieties": unique_values.get('Crop_Variety', []),
        "soil_types": unique_values.get('Soil_Type', []),
        "districts": list(taluka_data.keys()),
        "talukas_by_district": taluka_data
    })

# --- Crop Seed Image Verification Endpoint ---
@app.route('/verify_crop_image', methods=['POST'])
def verify_crop_image():
    """
    Verify that the uploaded seed image matches the selected crop variety.
    Uses Google Cloud Vision API if available, otherwise falls back to simple verification.
    """
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        selected_crop = request.form.get('selected_crop', '')
        
        if not selected_crop:
            return jsonify({'error': 'No crop variety specified'}), 400
        
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Read image content
        image_content = image_file.read()
        
        # Validate image with PIL if available
        if VISION_AVAILABLE:
            try:
                img = Image.open(io.BytesIO(image_content))
                img.verify()
            except Exception as e:
                return jsonify({'error': f'Invalid image file: {str(e)}'}), 400
        
        # Try Google Cloud Vision API if available
        if vision_client:
            try:
                return verify_with_vision_api(image_content, selected_crop, image_file.filename)
            except Exception as e:
                print(f"⚠️ Vision API failed, using fallback: {e}")
                # Fall through to fallback method
        
        # Fallback verification method (simple but works without API)
        return verify_with_fallback(image_file.filename, selected_crop)
        
    except Exception as e:
        print(f"❌ Image Verification Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'Verification failed: {str(e)}',
            'verified': False
        }), 500


def verify_with_vision_api(image_content, selected_crop, filename):
    """Verify using Google Cloud Vision API"""
    # Prepare image for Vision API
    image = vision.Image(content=image_content)
    
    # Perform label detection
    response = vision_client.label_detection(image=image)
    labels = response.label_annotations
    
    if response.error.message:
        raise Exception(response.error.message)
    
    # Extract crop name from selected variety (remove variety in parentheses)
    selected_crop_base = selected_crop.split('(')[0].strip().lower()
    
    # Crop name mappings for better matching
    crop_keywords = get_crop_keywords()
    
    # Get keywords for selected crop
    selected_keywords = []
    for crop_key, keywords in crop_keywords.items():
        if crop_key in selected_crop_base:
            selected_keywords = keywords
            break
    
    # If no specific keywords found, use the crop name itself
    if not selected_keywords:
        selected_keywords = [selected_crop_base]
    
    # Check if any label matches the selected crop
    detected_labels = [label.description.lower() for label in labels[:10]]
    confidence_score = 0
    detected_crop = None
    
    print(f"\n🔍 Image Verification (Vision API):")
    print(f"   Selected Crop: {selected_crop}")
    print(f"   Keywords: {selected_keywords}")
    print(f"   Detected Labels: {detected_labels}")
    
    # Check for matches
    for label in labels[:10]:
        label_text = label.description.lower()
        label_score = label.score * 100
        
        for keyword in selected_keywords:
            if keyword.lower() in label_text:
                if label_score > confidence_score:
                    confidence_score = label_score
                    detected_crop = label.description
    
    # Determine verification result
    verified = confidence_score >= 30
    
    if verified:
        print(f"   ✅ Verified: {detected_crop} (Confidence: {confidence_score:.1f}%)")
    else:
        if labels:
            detected_crop = labels[0].description
            print(f"   ❌ Not Verified: Detected '{detected_crop}' instead")
        else:
            detected_crop = "Unknown"
            print(f"   ❌ Not Verified: Could not identify seed")
    
    return jsonify({
        'verified': verified,
        'selected_crop': selected_crop,
        'detected_crop': detected_crop or 'Unknown',
        'confidence': round(confidence_score, 1),
        'all_labels': [{'label': l.description, 'confidence': round(l.score * 100, 1)} for l in labels[:5]],
        'method': 'vision_api'
    }), 200


def verify_with_fallback(filename, selected_crop):
    """
    Fallback verification using filename matching.
    This is a simple method that works without Google Cloud Vision API.
    For better results, set up Google Cloud credentials.
    """
    selected_crop_base = selected_crop.split('(')[0].strip().lower()
    filename_lower = filename.lower()
    
    # Get crop keywords
    crop_keywords = get_crop_keywords()
    
    # Get keywords for selected crop
    selected_keywords = []
    for crop_key, keywords in crop_keywords.items():
        if crop_key in selected_crop_base:
            selected_keywords = keywords
            break
    
    if not selected_keywords:
        selected_keywords = [selected_crop_base]
    
    # Check if filename contains any crop keywords (from ANY crop)
    verified = False
    detected_crop = "Unknown"
    confidence = 50.0
    detected_crop_key = None
    
    print(f"\n🔍 Image Verification (Fallback):")
    print(f"   Selected Crop: {selected_crop}")
    print(f"   Keywords: {selected_keywords}")
    print(f"   Filename: {filename}")
    
    # First, check if filename matches the SELECTED crop
    for keyword in selected_keywords:
        if keyword in filename_lower:
            verified = True
            detected_crop = selected_crop_base.capitalize()
            confidence = 75.0
            print(f"   ✅ Match found: '{keyword}' in filename matches selected crop")
            break
    
    # If not matched, check if it matches ANY OTHER crop (mismatch case)
    if not verified:
        for crop_key, keywords in crop_keywords.items():
            for keyword in keywords:
                if keyword in filename_lower:
                    # Found a different crop in the filename
                    verified = False
                    detected_crop = crop_key.capitalize()
                    confidence = 70.0
                    detected_crop_key = crop_key
                    print(f"   ❌ Mismatch: '{keyword}' found in filename (indicates {crop_key})")
                    break
            if detected_crop_key:
                break
    
    # If still no match found, reject as unknown
    if not verified and detected_crop == "Unknown":
        print(f"   ⚠️ No crop keywords found in filename - rejecting as unclear")
        confidence = 20.0
    
    return jsonify({
        'verified': verified,
        'selected_crop': selected_crop,
        'detected_crop': detected_crop,
        'confidence': round(confidence, 1),
        'all_labels': [{'label': detected_crop, 'confidence': confidence}],
        'method': 'fallback',
        'note': 'Using filename-based verification. For accurate image analysis, set up Google Cloud Vision API credentials.'
    }), 200


def get_crop_keywords():
    """Get crop keyword mappings"""
    return {
        'rice': ['rice', 'paddy', 'grain', 'cereal'],
        'wheat': ['wheat', 'grain', 'cereal'],
        'maize': ['maize', 'corn', 'grain', 'cereal'],
        'bajra': ['millet', 'pearl millet', 'bajra', 'grain'],
        'jowar': ['sorghum', 'jowar', 'grain', 'cereal'],
        'arhar': ['pigeon pea', 'arhar', 'pulse', 'legume'],
        'moong': ['mung bean', 'green gram', 'moong', 'pulse', 'legume'],
        'urad': ['black gram', 'urad', 'pulse', 'legume'],
        'masoor': ['lentil', 'masoor', 'pulse', 'legume'],
        'gram': ['chickpea', 'gram', 'pulse', 'legume'],
        'tur': ['pigeon pea', 'tur', 'pulse', 'legume'],
        'groundnut': ['peanut', 'groundnut', 'nut', 'legume'],
        'soybean': ['soybean', 'soy', 'legume'],
        'sunflower': ['sunflower', 'flower', 'seed'],
        'cotton': ['cotton', 'fiber'],
        'sugarcane': ['sugarcane', 'cane', 'sugar'],
        'tomato': ['tomato', 'vegetable'],
        'potato': ['potato', 'vegetable'],
        'onion': ['onion', 'vegetable']
    }

# --- Text-to-Speech Endpoint ---
@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    """
    Generate speech audio from text using Google Cloud Text-to-Speech.
    Supports English, Hindi, and Marathi with native Indian voices.
    """
    if not tts_client:
        return jsonify({
            'error': 'Text-to-Speech service is not available',
            'fallback': True
        }), 503
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'en')  # 'en', 'hi', or 'mr'
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Voice configuration based on language
        voice_configs = {
            'en': {
                'language_code': 'en-IN',  # Indian English
                'name': 'en-IN-Wavenet-D',  # Female voice
                'ssml_gender': texttospeech.SsmlVoiceGender.FEMALE
            },
            'hi': {
                'language_code': 'hi-IN',  # Hindi (India)
                'name': 'hi-IN-Wavenet-A',  # Female voice
                'ssml_gender': texttospeech.SsmlVoiceGender.FEMALE
            },
            'mr': {
                'language_code': 'mr-IN',  # Marathi (India)
                'name': 'mr-IN-Wavenet-A',  # Female voice
                'ssml_gender': texttospeech.SsmlVoiceGender.FEMALE
            }
        }
        
        # Get voice config for requested language, default to English
        voice_config = voice_configs.get(language, voice_configs['en'])
        
        # Set the text input to be synthesized
        synthesis_input = texttospeech.SynthesisInput(text=text)
        
        # Build the voice request
        voice = texttospeech.VoiceSelectionParams(
            language_code=voice_config['language_code'],
            name=voice_config['name'],
            ssml_gender=voice_config['ssml_gender']
        )
        
        # Select the type of audio file (MP3 for better compatibility)
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.95,  # Slightly slower for clarity
            pitch=0.0
        )
        
        # Perform the text-to-speech request
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Encode audio content as base64 for transmission
        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
        
        return jsonify({
            'audio': audio_base64,
            'language': language,
            'voice_name': voice_config['name']
        }), 200
        
    except Exception as e:
        print(f"❌ TTS Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'TTS generation failed: {str(e)}',
            'fallback': True
        }), 500


# --- CORS Preflight ---
@app.route('/predict', methods=['OPTIONS'])
def options():
    return '', 204

if __name__ == '__main__':
    print("\n🚀 Starting Flask ML Backend Server...")
    print(f"📁 Base Directory: {BASE_DIR}")
    print(f"🌐 CORS enabled for: http://localhost:5173")
    print(f"🔗 Server running at: http://localhost:5001\n")
    app.run(debug=True, port=5001, host='0.0.0.0')
