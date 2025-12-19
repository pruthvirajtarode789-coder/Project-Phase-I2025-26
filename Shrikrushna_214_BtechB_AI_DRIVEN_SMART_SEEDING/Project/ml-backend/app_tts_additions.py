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
from io import BytesIO

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
