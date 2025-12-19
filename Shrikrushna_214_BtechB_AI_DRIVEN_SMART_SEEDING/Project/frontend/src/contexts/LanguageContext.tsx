import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    title: 'AgriCare',
    subtitle: 'Sustainable farming • Smart insights',
    login: 'Login',

    // Hero
    heroTitle: 'Agriculture Dashboard',
    heroDescription: 'Smart tools and local knowledge to increase yield, reduce risk and make farming profitable. Forecast weather, pick ideal crops and estimate seed rates — all in one place.',
    getStarted: 'Get Started',
    explore: 'Explore',

    // Features
    predictWeather: 'Predict Weather',
    predictWeatherDesc: 'Short-term forecasts tailored to your field coordinates.',
    predictCrop: 'Predict Crop',
    predictCropDesc: 'AI suggestions for best-fit crops based on soil and history.',
    predictSeedRate: 'Predict Seed Rate',
    predictSeedRateDesc: 'Accurate seed-rate estimates to optimize input costs.',

    // Live sections
    liveWeather: 'Live Weather',
    liveWeatherDesc: 'Temperature, rainfall & wind predictions',
    cropAdvisor: 'Crop Advisor',
    cropAdvisorDesc: 'Crop rotations and fertilization plans',
    tipsAlerts: 'Tips & Alerts',
    tipsAlertsDesc: 'Pest warnings and harvest reminders',

    // Detailed features
    weatherIntelligence: 'Weather Intelligence',
    weatherIntelligenceDesc: 'Receive hyperlocal forecasts and irrigation recommendations to save water and improve crop quality.',
    cropSuitability: 'Crop Suitability',
    cropSuitabilityDesc: 'Enter soil and historical yields to get ranked crop suggestions that maximize return.',
    seedRateCalculator: 'Seed Rate Calculator',
    seedRateCalculatorDesc: 'Dynamic seed-rate calculator that adapts to row-spacing and germination rates.',

    // Footer
    freeForSmallFarms: 'Free for small farms',

    // Login Page
    backToHome: 'Back to Home',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    loginDescription: 'Sign in to access your agriculture dashboard',
    signupDescription: 'Join AgriCare to manage your farm efficiently',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    phoneNumber: 'Phone Number',
    phoneNumberPlaceholder: 'Enter your 10-digit phone number',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signup: 'Sign Up',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    loginFooter: 'By continuing, you agree to our Terms of Service and Privacy Policy',

    // Footer
    footerCopyright: `© ${new Date().getFullYear()} AgriCare. All Rights Reserved.`,
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',

    // Forgot Password Page
    forgotPasswordTitle: 'Forgot Your Password?',
    forgotPasswordDescription: "No worries, we'll send you reset instructions.",
    sendResetLink: 'Send Reset Link',
    resetLinkSent: 'Reset link sent! Check your email.',
    backToLogin: 'Back to Login',

    // Dashboard
    enterFarmDetails: 'Enter your farm details to get personalized insights',
    weatherForecast: 'Weather Forecast',
    yieldPrediction: 'Yield Prediction',
    searchLocation: 'Search Location',
    enterCityWeather: 'Enter a city name to get real-time weather data',
    placeholderCity: 'Enter city name...',
    search: 'Search',
    currentWeather: 'Current Weather',
    realTimeConditions: 'Real-time weather conditions',
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    pressure: 'Pressure',
    temperatureForecast: 'Temperature Forecast',
    next4Days: 'Next 4 Days',
    humidityRainfall: 'Humidity & Rainfall',
    detailedForecast: 'Detailed Forecast',
    fiveDayOutlook: '5-Day Outlook',
    noLocationSelected: 'No Location Selected',
    enterCityAbove: 'Enter a city name above to see the weather forecast.',

    // Predict Yield Tab
    cropYieldPrediction: 'Crop Yield Prediction',
    enterFarmDetailsYield: 'Enter farm details to get AI‑powered yield predictions',
    locationDetails: 'Location Details',
    season: 'Season',
    selectSeason: 'Select season',
    district: 'District',
    selectDistrict: 'Select district',
    taluka: 'Taluka',
    selectTaluka: 'Select taluka',
    village: 'Village',
    villagePlaceholder: 'e.g., Vassa',
    cropSoilInfo: 'Crop & Soil Information',
    cropVariety: 'Crop Variety',
    selectCrop: 'Select crop',
    soilType: 'Soil Type',
    selectSoilType: 'Select soil type',
    farmArea: 'Farm Area',
    predictYield: 'Predict Yield',
    predicting: 'Predicting...',
    weatherContextFor: 'Weather Context for',
    avgTemp: 'Avg Temp',
    rainfall: 'Rainfall',
    predictionResults: 'Prediction Results',
    aiRecommendations: 'AI‑powered recommendations for optimal farming',
    sowingRecommendation: 'Sowing Recommendation',
    sowingRecommended: 'Sowing Recommended ✅',
    notRecommended: 'Not Recommended ❌',
    predictedYield: 'Predicted Yield',
    rowSpacing: 'Row Spacing',
    plantSpacing: 'Plant Spacing',
    seedQuantity: 'Seed Quantity',
    recommendedPlantingLayout: 'Recommended Planting Layout',
    topView: 'Top View',
    plantToPlant: 'Plant-to-Plant',
    maintainPlantSpacing: 'Maintain {spacing} cm between each plant in a row.',
    rowToRow: 'Row-to-Row',
    maintainRowSpacing: 'Maintain {spacing} cm between each row.',
    retry: 'Retry',
    failedToLoadOptions: 'Failed to load options. Please ensure the backend is running.',
    settings: 'Settings',
    logout: 'Logout',

    // Dropdowns
    season_Kharif: 'Kharif',
    season_Rabi: 'Rabi',
    season_Summer: 'Summer',
    season_WholeYear: 'Whole Year',

    soil_MediumBlack: 'Medium Black',
    soil_ClayLoam: 'Clay Loam',
    soil_DeepBlack: 'Deep Black',
    soil_ShallowBlack: 'Shallow Black',
    soil_Laterite: 'Laterite',

    crop_Chickpea: 'Chickpea',
    crop_PearlMillet: 'Pearl Millet',
    crop_Pigeonpea: 'Pigeonpea',
    crop_Groundnut: 'Groundnut',
    crop_Soybean: 'Soybean',
    crop_Sorghum: 'Sorghum',
    crop_Cotton: 'Cotton',
    crop_Wheat: 'Wheat',
    crop_Rice: 'Rice',
    crop_Safflower: 'Safflower',
    crop_Sunflower: 'Sunflower',
    crop_Maize: 'Maize',
    crop_Sugarcane: 'Sugarcane',

    // Seed Comparison
    seedOptimizationComparison: 'Seed Quantity Optimization',
    traditionalMethod: 'Traditional Method',
    optimizedMethod: 'ML Optimized',
    quantitySaved: 'Quantity Saved',
    percentageSaved: 'Optimization',
    estimatedCostSavings: 'Estimated Cost Savings',
    comparisonDescription: 'Comparison of traditional vs ML-optimized seed quantities',

    // Image Verification
    uploadSeedImage: 'Upload Seed Image',
    uploadCropImage: 'Upload Crop Seed Image',
    dragDropImage: 'Drag & drop or click to upload',
    verifyingImage: 'Verifying image...',
    cropVerified: '✓ Crop verified successfully!',
    cropMismatch: '✗ Crop mismatch detected',
    selectedCrop: 'Selected',
    detectedCrop: 'Detected',
    pleaseUploadCorrectSeed: 'Please upload the correct seed image',
    uploadRequired: 'Image verification required',
    imageVerification: 'Image Verification',
    verifyImage: 'Verify Image',
    changeImage: 'Change Image',
    uploadImageFirst: 'Please upload a crop seed image to continue',
    imageTooLarge: 'Image file is too large. Maximum size is 5MB',
    invalidImageFormat: 'Invalid image format. Please upload JPG, PNG, or JPEG',
    verificationFailed: 'Verification failed. Please try again',
  },
  hi: {
    // Header
    title: 'एग्रीकेयर',
    subtitle: 'टिकाऊ खेती • स्मार्ट जानकारी',
    login: 'लॉगिन',

    // Hero
    heroTitle: 'कृषि डैशबोर्ड',
    heroDescription: 'उपज बढ़ाने, जोखिम कम करने और खेती को लाभदायक बनाने के लिए स्मार्ट उपकरण और स्थानीय ज्ञान। मौसम का पूर्वानुमान लगाएं, आदर्श फसलें चुनें और बीज दर का अनुमान लगाएं — सब एक ही जगह।',
    getStarted: 'शुरू करें',
    explore: 'एक्सप्लोर करें',

    // Features
    predictWeather: 'मौसम का पूर्वानुमान',
    predictWeatherDesc: 'आपके खेत के निर्देशांक के अनुरूप अल्पकालिक पूर्वानुमान।',
    predictCrop: 'फसल की भविष्यवाणी',
    predictCropDesc: 'मिट्टी और इतिहास के आधार पर सबसे उपयुक्त फसलों के लिए AI सुझाव।',
    predictSeedRate: 'बीज दर की भविष्यवाणी',
    predictSeedRateDesc: 'इनपुट लागत को अनुकूलित करने के लिए सटीक बीज-दर अनुमान।',

    // Live sections
    liveWeather: 'लाइव मौसम',
    liveWeatherDesc: 'तापमान, वर्षा और हवा की भविष्यवाणी',
    cropAdvisor: 'फसल सलाहकार',
    cropAdvisorDesc: 'फसल चक्र और उर्वरीकरण योजनाएं',
    tipsAlerts: 'सुझाव और अलर्ट',
    tipsAlertsDesc: 'कीट चेतावनी और कटाई रिमाइंडर',

    // Detailed features
    weatherIntelligence: 'मौसम बुद्धिमत्ता',
    weatherIntelligenceDesc: 'पानी बचाने और फसल की गुणवत्ता में सुधार के लिए हाइपरलोकल पूर्वानुमान और सिंचाई सिफारिशें प्राप्त करें।',
    cropSuitability: 'फसल उपयुक्तता',
    cropSuitabilityDesc: 'अधिकतम रिटर्न के लिए रैंक की गई फसल सुझाव प्राप्त करने के लिए मिट्टी और ऐतिहासिक उपज दर्ज करें।',
    seedRateCalculator: 'बीज दर कैलकुलेटर',
    seedRateCalculatorDesc: 'गतिशील बीज-दर कैलकुलेटर जो पंक्ति-स्पेसिंग और अंकुरण दर के अनुकूल होता है।',

    // Footer
    freeForSmallFarms: 'छोटे खेतों के लिए मुफ्त',

    // Login Page
    backToHome: 'होम पर वापस जाएं',
    welcomeBack: 'वापसी पर स्वागत है',
    createAccount: 'खाता बनाएं',
    loginDescription: 'अपने कृषि डैशबोर्ड तक पहुंचने के लिए साइन इन करें',
    signupDescription: 'अपने फार्म को कुशलता से प्रबंधित करने के लिए एग्रीकेयर में शामिल हों',
    email: 'ईमेल',
    emailPlaceholder: 'अपना ईमेल दर्ज करें',
    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    phoneNumber: 'फ़ोन नंबर',
    phoneNumberPlaceholder: 'अपना 10-अंकीय फ़ोन नंबर दर्ज करें',
    rememberMe: 'मुझे याद रखें',
    forgotPassword: 'पासवर्ड भूल गए?',
    signup: 'साइन अप करें',
    noAccount: 'खाता नहीं है?',
    haveAccount: 'पहले से खाता है?',
    loginFooter: 'जारी रखकर, आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं',

    // Footer
    footerCopyright: `© ${new Date().getFullYear()} एग्रीकेयर. सर्वाधिकार सुरक्षित.`,
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'गोपनीयता नीति',

    // Forgot Password Page
    forgotPasswordTitle: 'अपना पासवर्ड भूल गए?',
    forgotPasswordDescription: 'कोई बात नहीं, हम आपको रीसेट निर्देश भेजेंगे।',
    sendResetLink: 'रीसेट लिंक भेजें',
    resetLinkSent: 'रीसेट लिंक भेजा गया! अपना ईमेल जांचें।',
    backToLogin: 'लॉगिन पर वापस जाएं',

    // Dashboard
    enterFarmDetails: 'व्यक्तिगत जानकारी प्राप्त करने के लिए अपने खेत का विवरण दर्ज करें',
    weatherForecast: 'मौसम पूर्वानुमान',
    yieldPrediction: 'उपज भविष्यवाणी',
    searchLocation: 'स्थान खोजें',
    enterCityWeather: 'वास्तविक समय का मौसम डेटा प्राप्त करने के लिए शहर का नाम दर्ज करें',
    placeholderCity: 'शहर का नाम दर्ज करें...',
    search: 'खोजें',
    currentWeather: 'वर्तमान मौसम',
    realTimeConditions: 'वास्तविक समय की मौसम की स्थिति',
    temperature: 'तापमान',
    humidity: 'नमी',
    windSpeed: 'हवा की गति',
    pressure: 'दबाव',
    temperatureForecast: 'तापमान पूर्वानुमान',
    next4Days: 'अगले 4 दिन',
    humidityRainfall: 'नमी और वर्षा',
    detailedForecast: 'विस्तृत पूर्वानुमान',
    fiveDayOutlook: '5-दिवसीय दृष्टिकोण',
    noLocationSelected: 'कोई स्थान नहीं चुना गया',
    enterCityAbove: 'मौसम का पूर्वानुमान देखने के लिए ऊपर शहर का नाम दर्ज करें।',

    // Predict Yield Tab
    cropYieldPrediction: 'फसल उपज भविष्यवाणी',
    enterFarmDetailsYield: 'AI-संचालित उपज भविष्यवाणी प्राप्त करने के लिए खेत का विवरण दर्ज करें',
    locationDetails: 'स्थान विवरण',
    season: 'मौसम',
    selectSeason: 'मौसम चुनें',
    district: 'जिला',
    selectDistrict: 'जिला चुनें',
    taluka: 'तालुका',
    selectTaluka: 'तालुका चुनें',
    village: 'गाँव',
    villagePlaceholder: 'जैसे, वस्सा',
    cropSoilInfo: 'फसल और मिट्टी की जानकारी',
    cropVariety: 'फसल की किस्म',
    selectCrop: 'फसल चुनें',
    soilType: 'मिट्टी का प्रकार',
    selectSoilType: 'मिट्टी का प्रकार चुनें',
    farmArea: 'खेत का क्षेत्रफल',
    predictYield: 'उपज की भविष्यवाणी करें',
    predicting: 'भविष्यवाणी कर रहा है...',
    weatherContextFor: 'के लिए मौसम संदर्भ',
    avgTemp: 'औसत तापमान',
    rainfall: 'वर्षा',
    predictionResults: 'भविष्यवाणी परिणाम',
    aiRecommendations: 'इष्टतम खेती के लिए AI-संचालित सिफारिशें',
    sowingRecommendation: 'बुवाई की सिफारिश',
    sowingRecommended: 'बुवाई की सिफारिश की गई ✅',
    notRecommended: 'सिफारिश नहीं की गई ❌',
    predictedYield: 'अनुमानित उपज',
    rowSpacing: 'पंक्ति रिक्ति',
    plantSpacing: 'पौधे की रिक्ति',
    seedQuantity: 'बीज की मात्रा',
    recommendedPlantingLayout: 'अनुशंसित रोपण लेआउट',
    topView: 'शीर्ष दृश्य',
    plantToPlant: 'पौधे-से-पौधे',
    maintainPlantSpacing: 'एक पंक्ति में प्रत्येक पौधे के बीच {spacing} सेमी बनाए रखें।',
    rowToRow: 'पंक्ति-से-पंक्ति',
    maintainRowSpacing: 'प्रत्येक पंक्ति के बीच {spacing} सेमी बनाए रखें।',
    retry: 'पुनः प्रयास करें',
    failedToLoadOptions: 'विकल्प लोड करने में विफल। कृपया सुनिश्चित करें कि बैकएंड चल रहा है।',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',

    // Dropdowns
    season_Kharif: 'खरीफ',
    season_Rabi: 'रबी',
    season_Summer: 'ग्रीष्म',
    season_WholeYear: 'पूरा साल',

    soil_MediumBlack: 'मध्यम काली',
    soil_ClayLoam: 'चिकनी दोमट',
    soil_DeepBlack: 'गहरी काली',
    soil_ShallowBlack: 'उथली काली',
    soil_Laterite: 'लैटेराइट',

    crop_Chickpea: 'चना',
    crop_PearlMillet: 'बाजरा',
    crop_Pigeonpea: 'अरहर (तूर)',
    crop_Groundnut: 'मूंगफली',
    crop_Soybean: 'सोयाबीन',
    crop_Sorghum: 'ज्वार',
    crop_Cotton: 'कपास',
    crop_Wheat: 'गेहूं',
    crop_Rice: 'चावल',
    crop_Safflower: 'कुसुम',
    crop_Sunflower: 'सूरजमुखी',
    crop_Maize: 'मक्का',
    crop_Sugarcane: 'गन्ना',

    // Seed Comparison
    seedOptimizationComparison: 'बीज मात्रा अनुकूलन',
    traditionalMethod: 'पारंपरिक विधि',
    optimizedMethod: 'ML अनुकूलित',
    quantitySaved: 'मात्रा बचत',
    percentageSaved: 'अनुकूलन',
    estimatedCostSavings: 'अनुमानित लागत बचत',
    comparisonDescription: 'पारंपरिक बनाम ML-अनुकूलित बीज मात्रा की तुलना',

    // Image Verification
    uploadSeedImage: 'बीज की छवि अपलोड करें',
    uploadCropImage: 'फसल बीज की छवि अपलोड करें',
    dragDropImage: 'खींचें और छोड़ें या अपलोड करने के लिए क्लिक करें',
    verifyingImage: 'छवि सत्यापित कर रहा है...',
    cropVerified: '✓ फसल सफलतापूर्वक सत्यापित!',
    cropMismatch: '✗ फसल बेमेल पाया गया',
    selectedCrop: 'चुनी गई फसल',
    detectedCrop: 'पहचानी गई फसल',
    pleaseUploadCorrectSeed: 'कृपया सही बीज की छवि अपलोड करें',
    uploadRequired: 'छवि सत्यापन आवश्यक',
    imageVerification: 'छवि सत्यापन',
    verifyImage: 'छवि सत्यापित करें',
    changeImage: 'छवि बदलें',
    uploadImageFirst: 'जारी रखने के लिए कृपया फसल बीज की छवि अपलोड करें',
    imageTooLarge: 'छवि फ़ाइल बहुत बड़ी है। अधिकतम आकार 5MB है',
    invalidImageFormat: 'अमान्य छवि प्रारूप। कृपया JPG, PNG, या JPEG अपलोड करें',
    verificationFailed: 'सत्यापन विफल रहा। कृपया पुनः प्रयास करें',
  },
  mr: {
    // Header
    title: 'अॅग्रीकेअर',
    subtitle: 'शाश्वत शेती • स्मार्ट माहिती',
    login: 'लॉगिन',

    // Hero
    heroTitle: 'शेती डॅशबोर्ड',
    heroDescription: 'उत्पन्न वाढवण्यासाठी, जोखीम कमी करण्यासाठी आणि शेती फायदेशीर बनवण्यासाठी स्मार्ट साधने आणि स्थानिक ज्ञान। हवामानाचा अंदाज लावा, आदर्श पिके निवडा आणि बियाणे दराचा अंदाज लावा — सर्व एकाच ठिकाणी।',
    getStarted: 'सुरू करा',
    explore: 'एक्सप्लोर करा',

    // Features
    predictWeather: 'हवामान अंदाज',
    predictWeatherDesc: 'तुमच्या शेताच्या निर्देशांकांनुसार अल्पकालीन अंदाज.',
    predictCrop: 'पीक अंदाज',
    predictCropDesc: 'माती आणि इतिहासावर आधारित सर्वोत्तम पिकांसाठी AI सूचना.',
    predictSeedRate: 'बियाणे दर अंदाज',
    predictSeedRateDesc: 'इनपुट खर्च ऑप्टिमाइझ करण्यासाठी अचूक बियाणे-दर अंदाज.',

    // Live sections
    liveWeather: 'लाइव्ह हवामान',
    liveWeatherDesc: 'तापमान, पाऊस आणि वाऱ्याचे अंदाज',
    cropAdvisor: 'पीक सल्लागार',
    cropAdvisorDesc: 'पीक फेरफार आणि खत योजना',
    tipsAlerts: 'टिप्स आणि सूचना',
    tipsAlertsDesc: 'कीटक चेतावणी आणि कापणी स्मरणपत्रे',

    // Detailed features
    weatherIntelligence: 'हवामान बुद्धिमत्ता',
    weatherIntelligenceDesc: 'पाणी वाचवण्यासाठी आणि पिकाची गुणवत्ता सुधारण्यासाठी हायपरलोकल अंदाज आणि सिंचन शिफारसी मिळवा.',
    cropSuitability: 'पीक योग्यता',
    cropSuitabilityDesc: 'जास्तीत जास्त परतावा मिळवण्यासाठी रँक केलेले पीक सूचना मिळवण्यासाठी माती आणि ऐतिहासिक उत्पन्न प्रविष्ट करा.',
    seedRateCalculator: 'बियाणे दर कॅल्क्युलेटर',
    seedRateCalculatorDesc: 'डायनॅमिक बियाणे-दर कॅल्क्युलेटर जो ओळ-अंतर आणि अंकुरण दरानुसार जुळवून घेतो.',

    // Footer
    freeForSmallFarms: 'लहान शेतांसाठी मोफत',

    // Login Page
    backToHome: 'होमवर परत जा',
    welcomeBack: 'परत आपले स्वागत आहे',
    createAccount: 'खाते तयार करा',
    loginDescription: 'तुमच्या शेती डॅशबोर्डमध्ये प्रवेश करण्यासाठी साइन इन करा',
    signupDescription: 'तुमच्या शेताचे कार्यक्षमतेने व्यवस्थापन करण्यासाठी अॅग्रीकेअरमध्ये सामील व्हा',
    email: 'ईमेल',
    emailPlaceholder: 'तुमचा ईमेल प्रविष्ट करा',
    password: 'पासवर्ड',
    passwordPlaceholder: 'तुमचा पासवर्ड प्रविष्ट करा',
    phoneNumber: 'फोन नंबर',
    phoneNumberPlaceholder: 'तुमचा १०-अंकी फोन नंबर प्रविष्ट करा',
    rememberMe: 'मला लक्षात ठेवा',
    forgotPassword: 'पासवर्ड विसरलात?',
    signup: 'साइन अप करा',
    noAccount: 'खाते नाही?',
    haveAccount: 'आधीच खाते आहे?',
    loginFooter: 'सुरू ठेवून, तुम्ही आमच्या सेवा अटी आणि गोपनीयता धोरणाशी सहमत आहात',

    // Footer
    footerCopyright: `© ${new Date().getFullYear()} अॅग्रीकेअर. सर्व हक्क राखीव.`,
    termsOfService: 'सेवा अटी',
    privacyPolicy: 'गोपनीयता धोरण',

    // Forgot Password Page
    forgotPasswordTitle: 'तुमचा पासवर्ड विसरलात?',
    forgotPasswordDescription: 'काळजी करू नका, आम्ही तुम्हाला रीसेट सूचना पाठवू.',
    sendResetLink: 'रीसेट लिंक पाठवा',
    resetLinkSent: 'रीसेट लिंक पाठवली! तुमचा ईमेल तपासा.',
    backToLogin: 'लॉगिनवर परत जा',

    // Dashboard
    enterFarmDetails: 'वैयक्तिकृत माहिती मिळवण्यासाठी तुमच्या शेताचे तपशील प्रविष्ट करा',
    weatherForecast: 'हवामान अंदाज',
    yieldPrediction: 'उत्पन्न अंदाज',
    searchLocation: 'स्थान शोधा',
    enterCityWeather: 'रिअल-टाइम हवामान डेटा मिळवण्यासाठी शहराचे नाव प्रविष्ट करा',
    placeholderCity: 'शहराचे नाव प्रविष्ट करा...',
    search: 'शोधा',
    currentWeather: 'सध्याचे हवामान',
    realTimeConditions: 'रिअल-टाइम हवामान स्थिती',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    windSpeed: 'वाऱ्याचा वेग',
    pressure: 'दाब',
    temperatureForecast: 'तापमान अंदाज',
    next4Days: 'पुढील ४ दिवस',
    humidityRainfall: 'आर्द्रता आणि पाऊस',
    detailedForecast: 'तपशीलवार अंदाज',
    fiveDayOutlook: '५-दिवसीय दृष्टीकोन',
    noLocationSelected: 'कोणतेही स्थान निवडलेले नाही',
    enterCityAbove: 'हवामान अंदाज पाहण्यासाठी वर शहराचे नाव प्रविष्ट करा.',

    // Predict Yield Tab
    cropYieldPrediction: 'पीक उत्पन्न अंदाज',
    enterFarmDetailsYield: 'AI-आधारित उत्पन्न अंदाज मिळवण्यासाठी शेताचे तपशील प्रविष्ट करा',
    locationDetails: 'स्थान तपशील',
    season: 'हंगाम',
    selectSeason: 'हंगाम निवडा',
    district: 'जिल्हा',
    selectDistrict: 'जिल्हा निवडा',
    taluka: 'तालुका',
    selectTaluka: 'तालुका निवडा',
    village: 'गाव',
    villagePlaceholder: 'उदा., वस्सा',
    cropSoilInfo: 'पीक आणि माती माहिती',
    cropVariety: 'पिकाची जात',
    selectCrop: 'पीक निवडा',
    soilType: 'मातीचा प्रकार',
    selectSoilType: 'मातीचा प्रकार निवडा',
    farmArea: 'शेताचे क्षेत्रफळ',
    predictYield: 'उत्पन्न अंदाज करा',
    predicting: 'अंदाज करत आहे...',
    weatherContextFor: 'साठी हवामान संदर्भ',
    avgTemp: 'सरासरी तापमान',
    rainfall: 'पाऊस',
    predictionResults: 'अंदाज परिणाम',
    aiRecommendations: 'इष्टतम शेतीसाठी AI-आधारित शिफारसी',
    sowingRecommendation: 'पेरणी शिफारस',
    sowingRecommended: 'पेरणी शिफारस केली ✅',
    notRecommended: 'शिफारस केलेली नाही ❌',
    predictedYield: 'अंदाजित उत्पन्न',
    rowSpacing: 'ओळ अंतर',
    plantSpacing: 'रोप अंतर',
    seedQuantity: 'बियाणे प्रमाण',
    recommendedPlantingLayout: 'शिफारस केलेले लागवड लेआउट',
    topView: 'वरचे दृश्य',
    plantToPlant: 'रोप-ते-रोप',
    maintainPlantSpacing: 'एका ओळीत प्रत्येक रोपाच्या दरम्यान {spacing} सेमी अंतर ठेवा.',
    rowToRow: 'ओळ-ते-ओळ',
    maintainRowSpacing: 'प्रत्येक ओळीच्या दरम्यान {spacing} सेमी अंतर ठेवा.',
    retry: 'पुन्हा प्रयत्न करा',
    failedToLoadOptions: 'पर्याय लोड करण्यात अयशस्वी. कृपया बॅकएंड चालू असल्याची खात्री करा.',
    settings: 'सेटिंग्ज',
    logout: 'लॉगआउट',

    // Dropdowns
    season_Kharif: 'खरीप',
    season_Rabi: 'रब्बी',
    season_Summer: 'उन्हाळी',
    season_WholeYear: 'पूर्ण वर्ष',

    soil_MediumBlack: 'मध्यम काळी',
    soil_ClayLoam: 'चिकणमाती',
    soil_DeepBlack: 'खोल काळी',
    soil_ShallowBlack: 'उथळ काळी',
    soil_Laterite: 'जांभा',

    crop_Chickpea: 'हरभरा',
    crop_PearlMillet: 'बाजरी',
    crop_Pigeonpea: 'तूर',
    crop_Groundnut: 'भुईमूग',
    crop_Soybean: 'सोयाबीन',
    crop_Sorghum: 'ज्वारी',
    crop_Cotton: 'कापूस',
    crop_Wheat: 'गहू',
    crop_Rice: 'तांदूळ',
    crop_Safflower: 'करडई',
    crop_Sunflower: 'सूर्यफूल',
    crop_Maize: 'मका',
    crop_Sugarcane: 'ऊस',

    // Seed Comparison
    seedOptimizationComparison: 'बियाणे प्रमाण ऑप्टिमायझेशन',
    traditionalMethod: 'पारंपरिक पद्धत',
    optimizedMethod: 'ML ऑप्टिमाइझ्ड',
    quantitySaved: 'प्रमाण बचत',
    percentageSaved: 'ऑप्टिमायझेशन',
    estimatedCostSavings: 'अंदाजित खर्च बचत',
    comparisonDescription: 'पारंपरिक विरुद्ध ML-ऑप्टिमाइझ्ड बियाणे प्रमाणाची तुलना',

    // Image Verification
    uploadSeedImage: 'बियाणे प्रतिमा अपलोड करा',
    uploadCropImage: 'पीक बियाणे प्रतिमा अपलोड करा',
    dragDropImage: 'ड्रॅग आणि ड्रॉप करा किंवा अपलोड करण्यासाठी क्लिक करा',
    verifyingImage: 'प्रतिमा सत्यापित करत आहे...',
    cropVerified: '✓ पीक यशस्वीरित्या सत्यापित!',
    cropMismatch: '✗ पीक जुळत नाही',
    selectedCrop: 'निवडलेले पीक',
    detectedCrop: 'ओळखलेले पीक',
    pleaseUploadCorrectSeed: 'कृपया योग्य बियाणे प्रतिमा अपलोड करा',
    uploadRequired: 'प्रतिमा सत्यापन आवश्यक आहे',
    imageVerification: 'प्रतिमा सत्यापन',
    verifyImage: 'प्रतिमा सत्यापित करा',
    changeImage: 'प्रतिमा बदला',
    uploadImageFirst: 'सुरू ठेवण्यासाठी कृपया पीक बियाणे प्रतिमा अपलोड करा',
    imageTooLarge: 'प्रतिमा फाइल खूप मोठी आहे. कमाल आकार 5MB आहे',
    invalidImageFormat: 'अवैध प्रतिमा स्वरूप. कृपया JPG, PNG, किंवा JPEG अपलोड करा',
    verificationFailed: 'सत्यापन अयशस्वी. कृपया पुन्हा प्रयत्न करा',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
