# Google Cloud Text-to-Speech Setup Guide

This guide will help you set up Google Cloud Text-to-Speech API for authentic Indian Marathi accent.

## Step 1: Create Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (or create one)
3. If prompted, enable billing (you get $300 free credit for 90 days)

## Step 2: Create a New Project

1. In the Google Cloud Console, click on the project dropdown at the top
2. Click "NEW PROJECT"
3. Name it "Smart Seeding TTS" (or any name you prefer)
4. Click "CREATE"

## Step 3: Enable Text-to-Speech API

1. Go to [Text-to-Speech API page](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com)
2. Make sure your project is selected
3. Click "ENABLE"

## Step 4: Create Service Account

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "+ CREATE SERVICE ACCOUNT"
3. Enter:
   - Service account name: `smart-seeding-tts`
   - Description: "TTS service for Smart Seeding app"
4. Click "CREATE AND CONTINUE"
5. For "Grant this service account access to project":
   - Select role: "Cloud Text-to-Speech API User"
6. Click "CONTINUE", then "DONE"

## Step 5: Create and Download Credentials

1. Find your newly created service account in the list
2. Click on it to open details
3. Go to the "KEYS" tab
4. Click "ADD KEY" → "Create new key"
5. Select "JSON" format
6. Click "CREATE"
7. A JSON file will download automatically - **save this file securely!**

## Step 6: Set Up Environment Variable

### Windows:
1. Place the downloaded JSON file in `ml-backend` folder
2. Rename it to `google-credentials.json`
3. Set environment variable:
   - Open PowerShell in the `ml-backend` folder
   - Run:
     ```powershell
     $env:GOOGLE_APPLICATION_CREDENTIALS="$(Get-Location)\google-credentials.json"
     ```
   - **For permanent setup**, add to system environment variables:
     - Search for "Environment Variables" in Windows
     - Add new System variable:
       - Name: `GOOGLE_APPLICATION_CREDENTIALS`
       - Value: Full path to `google-credentials.json`

## Step 7: Install Python Packages

1. Open PowerShell in the `ml-backend` folder
2. Install the new packages:
   ```powershell
   pip install google-cloud-texttospeech==2.14.1 flask-pymongo==2.3.0
   ```

## Step 8: Restart the Backend Server

1. Stop the current `python app.py` process (Ctrl+C)
2. Set the environment variable (if not permanently set):
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="$(Get-Location)\google-credentials.json"
   ```
3. Restart the server:
   ```powershell
   python app.py
   ```

## Step 9: Verify Setup

When you restart the backend, you should see:
```
✅ Google Cloud Text-to-Speech library found.
✅ Google Cloud TTS client initialized successfully.
```

If you see a warning instead, check:
1. The JSON file path is correct
2. The environment variable is set
3. You enabled the Text-to-Speech API

## Testing

Once setup is complete:
1. Go to the "Predict Yield" or "Weather" tab
2. Click the speaker icon
3. You should hear high-quality Indian voice instead of robotic browser voice

## Troubleshooting

### "Could not initialize Google Cloud TTS client"
- Check that `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
- Verify the JSON file exists at that path
- Make sure you enabled the Text-to-Speech API

### "TTS API unavailable, falling back to Web Speech API"
- The app will still work with browser voices as fallback
- Check backend console for error messages

## Free Tier Information

- **WaveNet voices**: 1 million characters/month FREE
- **Neural2 voices**: 1 million characters/month FREE
- This is more than enough for typical usage
- After free tier: ~₹1,200 per million characters

## Security Note

⚠️ **IMPORTANT**: Never commit the `google-credentials.json` file to Git!
Add it to `.gitignore` to keep your credentials safe.
