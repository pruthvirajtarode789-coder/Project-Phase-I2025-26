import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Sprout, MapPin, RefreshCw, CloudRain, Thermometer, Droplets, Volume2, VolumeX, Trees, Upload, CheckCircle, XCircle, Camera, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTTS } from '@/hooks/useTTS';
import { LocationService, LocationItem } from '@/services/LocationService';
import './PredictYieldTab.css';
import './FuturisticFarmingVisualization.css';

interface DropdownData {
    seasons: string[];
    crop_varieties: string[];
    soil_types: string[];
    districts: string[];
    talukas_by_district: Record<string, string[]>;
}

interface PredictionResult {
    sowing_recommendation: string;
    yield_kg: number;
    row_spacing: number;
    plant_spacing: number;
    seed_quantity: number;
    weather_data: {
        temperature: number;
        humidity: number;
        rainfall: number;
    };
    seed_comparison?: {
        traditional_quantity: number;
        optimized_quantity: number;
        quantity_saved: number;
        percentage_saved: number;
        estimated_cost_savings: number;
    };
}

const PredictYieldTab = () => {
    const { t, language } = useLanguage();
    const { speak, cancel, isSpeaking, supported } = useTTS(language);
    // Dropdown options fetched from backend
    const [dropdownData, setDropdownData] = useState<DropdownData>({
        seasons: [],
        crop_varieties: [],
        soil_types: [],
        districts: [],
        talukas_by_district: {},
    });

    const [formData, setFormData] = useState({
        Season: "",
        Crop_Variety: "",
        Soil_Type: "",
        District: "",
        Taluka: "",
        Village: "",
        Farm_Area_Acres: "2.5",
    });

    const [availableTalukas, setAvailableTalukas] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTalukas, setLoadingTalukas] = useState(false);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Robot Visualization State
    const [robotPosition, setRobotPosition] = useState({ x: 5, y: 70 });
    const [currentRow, setCurrentRow] = useState(0);
    const [distanceTraveled, setDistanceTraveled] = useState(0);
    const [seedsPlanted, setSeedsPlanted] = useState(0);
    const [isPlanting, setIsPlanting] = useState(false);
    const [plantedSeeds, setPlantedSeeds] = useState<{ x: number, y: number, id: number }[]>([]);
    const [robotStatus, setRobotStatus] = useState('Starting seeding operation...');

    // Image Verification State
    const [cropImage, setCropImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageVerified, setImageVerified] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{
        verified: boolean;
        detected_crop: string;
        confidence: number;
    } | null>(null);

    // Visualization Constants
    const plantSpacing = prediction?.plant_spacing || 25;
    const rowSpacing = prediction?.row_spacing || 30;
    const fieldWidth = 85;
    const fieldStartX = 10;
    const totalRows = 6;

    // Load dropdown data on mount
    const fetchDropdowns = () => {
        setFetchError(null);
        fetch("http://localhost:5001/dropdowns")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch dropdown data");
                return res.json();
            })
            .then((data) => {
                if (!data || Object.keys(data).length === 0) {
                    throw new Error("Empty data received from server");
                }
                setDropdownData({
                    seasons: data.seasons || [],
                    crop_varieties: data.crop_varieties || [],
                    soil_types: data.soil_types || [],
                    districts: [], // Will be fetched from OSM
                    talukas_by_district: {}, // Will be fetched from OSM
                });
            })
            .catch((err) => {
                console.error("Failed to load dropdown data", err);
                setFetchError(t('failedToLoadOptions'));
            });
    };

    // Fetch districts from OSM
    useEffect(() => {
        const loadDistricts = async () => {
            setLoadingDistricts(true);
            try {
                const fetchedDistricts = await LocationService.getDistricts();
                setDistricts(fetchedDistricts);
            } catch (error) {
                console.error("Failed to load districts", error);
                toast.error("Failed to load districts from map service");
            } finally {
                setLoadingDistricts(false);
            }
        };
        loadDistricts();
    }, []);

    useEffect(() => {
        fetchDropdowns();
    }, []);

    // Robot Animation Effect
    useEffect(() => {
        if (!prediction) return; // Only animate if we have a prediction

        let animationId: number;
        let lastTime = 0;
        const speed = 0.3; // pixels per frame

        const animate = (currentTime: number) => {
            if (currentTime - lastTime > 50) { // Throttle to ~20fps
                setRobotPosition(prev => {
                    let newX = prev.x + speed;
                    let newY = prev.y;
                    let newRow = currentRow;

                    // Check if robot reached end of current row
                    if (newX >= fieldStartX + fieldWidth) {
                        if (newRow < totalRows - 1) {
                            // Move to next row
                            newRow++;
                            newX = fieldStartX;
                            newY = 70 + (newRow * (rowSpacing / 2));
                            setCurrentRow(newRow);
                        } else {
                            // Reset to beginning
                            newRow = 0;
                            newX = fieldStartX;
                            newY = 70;
                            setCurrentRow(0);
                            setDistanceTraveled(0);
                            setSeedsPlanted(0);
                            setPlantedSeeds([]);
                        }
                    }

                    // Update distance traveled
                    setDistanceTraveled(prev => prev + speed * 0.5); // Convert to meters

                    // Plant seeds at regular intervals
                    if (newX > fieldStartX && (newX - fieldStartX) % (plantSpacing / 4) < 1) {
                        setIsPlanting(true);
                        setSeedsPlanted(prev => prev + 1);
                        setPlantedSeeds(prev => [...prev, {
                            x: newX,
                            y: newY + 15,
                            id: Date.now() + Math.random()
                        }]);

                        setTimeout(() => setIsPlanting(false), 500);
                    }

                    return { x: newX, y: newY };
                });

                lastTime = currentTime;
            }
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        // Update robot status
        const statusMessages = [
            'Analyzing soil conditions...',
            'Calculating optimal seed depth...',
            'Precision seeding in progress...',
            'Monitoring plant spacing...',
            'Adjusting for soil moisture...',
            'Recording planting data...'
        ];

        let statusIndex = 0;
        const statusInterval = setInterval(() => {
            setRobotStatus(statusMessages[statusIndex]);
            statusIndex = (statusIndex + 1) % statusMessages.length;
        }, 3000);

        return () => {
            cancelAnimationFrame(animationId);
            clearInterval(statusInterval);
        };
    }, [currentRow, plantSpacing, rowSpacing, prediction]);

    const translateOption = (option: string, type: 'season' | 'soil' | 'crop') => {
        if (!option) return "";

        // Normalize key by removing spaces
        const key = option.replace(/\s+/g, '');

        if (type === 'season') {
            const translationKey = `season_${key}`;
            const translated = t(translationKey);
            return translated !== translationKey ? translated : option;
        }

        if (type === 'soil') {
            const translationKey = `soil_${key}`;
            const translated = t(translationKey);
            return translated !== translationKey ? translated : option;
        }

        if (type === 'crop') {
            // Extract crop name (part before parenthesis)
            const match = option.match(/^([^(]+)(\s*\(.*\))?$/);
            if (match) {
                const cropName = match[1].trim();
                const variety = match[2] || "";
                const cropKey = `crop_${cropName.replace(/\s+/g, '')}`;
                const translatedCrop = t(cropKey);

                if (translatedCrop !== cropKey) {
                    return `${translatedCrop} ${variety}`.trim();
                }
            }
            return option;
        }

        return option;
    };

    const getLocalizedName = (item: LocationItem) => {
        if (language === 'mr') return item.localNames.mr || item.name;
        if (language === 'hi') return item.localNames.hi || item.name;
        return item.name;
    };

    const handleInputChange = async (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "District") {
            // Reset taluka and load new options
            setFormData((prev) => ({ ...prev, Taluka: "" }));
            setAvailableTalukas([]);
            setLoadingTalukas(true);
            try {
                const talukas = await LocationService.getTalukas(value);
                setAvailableTalukas(talukas);
            } catch (error) {
                console.error("Failed to load talukas", error);
                toast.error(`Failed to load talukas for ${value}`);
            } finally {
                setLoadingTalukas(false);
            }
        }
        // Reset image verification when crop changes
        if (field === "Crop_Variety") {
            setCropImage(null);
            setImagePreview(null);
            setImageVerified(false);
            setVerificationResult(null);
        }
    };

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('imageTooLarge'));
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error(t('invalidImageFormat'));
            return;
        }

        // Set image and generate preview
        setCropImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Auto-verify if crop is already selected
        if (formData.Crop_Variety) {
            verifyImage(file, formData.Crop_Variety);
        }
    };

    // Verify the uploaded image
    const verifyImage = async (file: File, selectedCrop: string) => {
        setVerificationLoading(true);
        setImageVerified(false);
        setVerificationResult(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('image', file);
            formDataToSend.append('selected_crop', selectedCrop);

            const res = await fetch('http://localhost:5001/verify_crop_image', {
                method: 'POST',
                body: formDataToSend,
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Verification failed');
            }

            setVerificationResult(result);
            setImageVerified(result.verified);

            if (result.verified) {
                toast.success(t('cropVerified'));
            } else {
                toast.error(`${t('cropMismatch')}: ${t('selectedCrop')}: ${selectedCrop}`);
            }
        } catch (error: any) {
            console.error('Image verification error:', error);
            toast.error(t('verificationFailed'));
        } finally {
            setVerificationLoading(false);
        }
    };

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            Season: formData.Season,
            Crop_Variety: formData.Crop_Variety,
            Soil_Type: formData.Soil_Type,
            District: formData.District,
            Taluka: formData.Taluka,
            Village: formData.Village,
            Farm_Area_hectares: (parseFloat(formData.Farm_Area_Acres) || 1.0) * 0.404686,
        };
        try {
            const res = await fetch("http://localhost:5001/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Prediction failed");
            setPrediction({
                sowing_recommendation: json.sowing_recommendation ?? json.sowing ?? "Unknown",
                yield_kg: json.yield_kg ?? json.yield ?? 0,
                row_spacing: json.row_spacing ?? 0,
                plant_spacing: json.plant_spacing ?? 0,
                seed_quantity: json.seed_quantity ?? 0,
                weather_data: json.weather_data || { temperature: 0, humidity: 0, rainfall: 0 },
                seed_comparison: json.seed_comparison  // Add comparison data from backend
            });
            toast.success("Yield prediction generated successfully!");

            // Reset visualization state when new prediction comes
            setSeedsPlanted(0);
            setPlantedSeeds([]);
            setDistanceTraveled(0);
            setCurrentRow(0);
            setRobotPosition({ x: fieldStartX, y: 70 });
        } catch (err: any) {
            console.error("Yield predict error", err);
            toast.error(err.message || "Prediction error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-medium border-secondary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                        {t('cropYieldPrediction')}
                    </CardTitle>
                    <CardDescription>{t('enterFarmDetailsYield')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Error Message */}
                    {fetchError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center justify-between">
                            <span className="text-sm font-medium">{fetchError}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchDropdowns}
                                className="border-red-200 hover:bg-red-50 text-red-600"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {t('retry')}
                            </Button>
                        </div>
                    )}

                    <form onSubmit={handlePredict} className="space-y-6">
                        {/* Location Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {t('locationDetails')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="season">{t('season')} *</Label>
                                    <Select
                                        value={formData.Season}
                                        onValueChange={(v) => handleInputChange("Season", v)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectSeason')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dropdownData.seasons.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {translateOption(s, 'season')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="district">{t('district')} *</Label>
                                    <Select
                                        value={formData.District}
                                        onValueChange={(v) => handleInputChange("District", v)}
                                        required
                                        disabled={loadingDistricts}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingDistricts ? "Loading districts..." : t('selectDistrict')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map((d) => (
                                                <SelectItem key={d.name} value={d.name}>
                                                    {getLocalizedName(d)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taluka">{t('taluka')} *</Label>
                                    <Select
                                        value={formData.Taluka}
                                        onValueChange={(v) => handleInputChange("Taluka", v)}
                                        disabled={!formData.District || loadingTalukas}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingTalukas ? "Loading talukas..." : t('selectTaluka')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTalukas.map((t) => (
                                                <SelectItem key={t.name} value={t.name}>
                                                    {getLocalizedName(t)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="village">{t('village')} (Optional)</Label>
                                    <Input
                                        id="village"
                                        placeholder={t('villagePlaceholder')}
                                        value={formData.Village}
                                        onChange={(e) => handleInputChange("Village", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Crop & Soil Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Sprout className="w-4 h-4 text-primary" />
                                {t('cropSoilInfo')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cropVariety">{t('cropVariety')} *</Label>
                                    <Select
                                        value={formData.Crop_Variety}
                                        onValueChange={(v) => handleInputChange("Crop_Variety", v)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectCrop')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dropdownData.crop_varieties.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {translateOption(c, 'crop')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="soilType">{t('soilType')} *</Label>
                                    <Select
                                        value={formData.Soil_Type}
                                        onValueChange={(v) => handleInputChange("Soil_Type", v)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectSoilType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dropdownData.soil_types.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {translateOption(s, 'soil')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="farmArea">{t('farmArea')} (Acres) *</Label>
                                    <Input
                                        id="farmArea"
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="1000"
                                        placeholder="e.g., 2.5"
                                        value={formData.Farm_Area_Acres}
                                        onChange={(e) => handleInputChange("Farm_Area_Acres", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Verification Section */}
                        {formData.Crop_Variety && (
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-primary" />
                                    {t('imageVerification')}
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="cropImage" className="flex items-center gap-2">
                                        {t('uploadCropImage')} *
                                    </Label>

                                    {/* Upload Area */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${imageVerified ? 'border-green-400 bg-green-50' :
                                            cropImage ? 'border-orange-400 bg-orange-50' :
                                                'border-gray-300 hover:border-primary'
                                            }`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) {
                                                const input = document.getElementById('cropImage') as HTMLInputElement;
                                                const dataTransfer = new DataTransfer();
                                                dataTransfer.items.add(file);
                                                input.files = dataTransfer.files;
                                                handleImageChange({ target: input } as any);
                                            }
                                        }}
                                    >
                                        <input
                                            type="file"
                                            id="cropImage"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />

                                        {imagePreview ? (
                                            <div className="space-y-3">
                                                <img
                                                    src={imagePreview}
                                                    alt="Crop seed preview"
                                                    className="w-full h-40 object-cover rounded-md"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById('cropImage')?.click()}
                                                    >
                                                        {t('changeImage')}
                                                    </Button>

                                                    {verificationLoading && (
                                                        <div className="flex items-center gap-2 text-blue-600">
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                            <span className="text-sm">{t('verifyingImage')}</span>
                                                        </div>
                                                    )}

                                                    {!verificationLoading && verificationResult && (
                                                        <div className={`flex items-center gap-2 ${imageVerified ? 'text-green-600' : 'text-red-600'}`}>
                                                            {imageVerified ? (
                                                                <>
                                                                    <CheckCircle className="w-5 h-5" />
                                                                    <span className="text-sm font-medium">{t('cropVerified')}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-5 h-5" />
                                                                    <span className="text-sm font-medium">{t('cropMismatch')}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {!imageVerified && verificationResult && (
                                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                                        <p className="text-xs text-red-700">
                                                            {t('selectedCrop')}: <strong>{formData.Crop_Variety}</strong>
                                                        </p>
                                                        <p className="text-xs text-red-600 mt-1">{t('pleaseUploadCorrectSeed')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="cropImage"
                                                className="flex flex-col items-center justify-center cursor-pointer"
                                            >
                                                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                                <p className="text-sm text-gray-600 font-medium">{t('dragDropImage')}</p>
                                                <p className="text-xs text-gray-500 mt-1">JPG, PNG (max 5MB)</p>
                                            </label>
                                        )}
                                    </div>

                                    {!cropImage && (
                                        <p className="text-xs text-orange-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {t('uploadRequired')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !imageVerified || !formData.Crop_Variety}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('predicting') : !imageVerified && formData.Crop_Variety ? t('uploadImageFirst') : t('predictYield')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Prediction Results */}
            {prediction && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Robot Visualization */}
                    <div className="robot-seeding-container">
                        {/* Farm Field Background */}
                        <div className="farm-field">
                            <div className="soil-surface"></div>

                            {/* Planting Rows Grid */}
                            <div className="planting-grid">
                                {Array.from({ length: totalRows }).map((_, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className={`planting-row ${rowIndex === currentRow ? 'active-row' : ''}`}
                                        style={{
                                            top: `${70 + (rowIndex * (rowSpacing / 2))}px`,
                                            left: `${fieldStartX}%`,
                                            width: `${fieldWidth}%`
                                        }}
                                    >
                                        <div className="row-line"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Planted Seeds */}
                            <div className="planted-seeds">
                                {plantedSeeds.map(seed => (
                                    <div
                                        key={seed.id}
                                        className="planted-seed"
                                        style={{
                                            left: `${seed.x}%`,
                                            top: `${seed.y}px`
                                        }}
                                    >
                                        <div className="seed-dot"></div>
                                        <div className="underground-root">
                                            <div className="root-growth"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Seeding Robot */}
                            <div
                                className={`seeding-robot ${isPlanting ? 'planting' : ''}`}
                                style={{
                                    left: `${robotPosition.x}%`,
                                    top: `${robotPosition.y}px`
                                }}
                            >
                                {/* Robot Base */}
                                <div className="robot-base">
                                    <div className="robot-body">
                                        <div className="status-indicator active"></div>
                                        <div className="camera-sensor"></div>
                                    </div>

                                    {/* Wheels */}
                                    <div className="robot-wheels">
                                        <div className="wheel left-wheel"></div>
                                        <div className="wheel right-wheel"></div>
                                    </div>
                                </div>

                                {/* Robotic Arm */}
                                <div className="robotic-arm">
                                    <div className="arm-base"></div>
                                    <div className="arm-segment segment-1">
                                        <div className="joint joint-1"></div>
                                    </div>
                                    <div className="arm-segment segment-2">
                                        <div className="joint joint-2"></div>
                                    </div>

                                    {/* Seed Dispenser */}
                                    <div className="seed-dispenser">
                                        <div className="dispenser-head">
                                            <div className="nozzle"></div>
                                            {isPlanting && (
                                                <div className="seed-stream">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="falling-seed"
                                                            style={{ animationDelay: `${i * 0.1}s` }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {isPlanting && <div className="planting-beam"></div>}
                                    </div>
                                </div>

                                {/* Robot Shadow */}
                                <div className="robot-shadow"></div>
                            </div>

                            {/* Distance Markers */}
                            <div className="distance-markers">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="distance-marker"
                                        style={{ left: `${fieldStartX + (i * fieldWidth / 9)}%` }}
                                    >
                                        <div className="marker-line"></div>
                                        <div className="marker-label">{(i * plantSpacing / 10).toFixed(1)}m</div>
                                    </div>
                                ))}
                            </div>

                            {/* Movement Trail */}
                            <div
                                className="movement-trail"
                                style={{
                                    left: `${fieldStartX}%`,
                                    top: `${robotPosition.y + 25}px`,
                                    width: `${((robotPosition.x - fieldStartX) / fieldWidth) * 100}%`
                                }}
                            ></div>
                        </div>

                        {/* Information Display */}
                        <div className="info-display">
                            <div className="status-panel">
                                <h3 className="panel-title">Robot Status</h3>
                                <div className="status-text">{robotStatus}</div>
                                <div className="metrics">
                                    <div className="metric">
                                        <span className="metric-label">Current Row:</span>
                                        <span className="metric-value">{currentRow + 1} of {totalRows}</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Distance Traveled:</span>
                                        <span className="metric-value">{distanceTraveled.toFixed(1)}m</span>
                                    </div>
                                    <div className="metric">
                                        <span className="metric-label">Seeds Planted:</span>
                                        <span className="metric-value">{seedsPlanted}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="planting-specs">
                                <h3 className="panel-title">Planting Specifications</h3>
                                <div className="specs-grid">
                                    <div className="spec-item">
                                        <span className="spec-label">Plant Spacing</span>
                                        <span className="spec-value">{prediction.plant_spacing.toFixed(1)}cm</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Row Spacing</span>
                                        <span className="spec-value">{prediction.row_spacing.toFixed(1)}cm</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Expected Yield (Total)</span>
                                        <span className="spec-value">{((prediction.yield_kg * ((parseFloat(formData.Farm_Area_Acres) || 0) * 0.404686))).toFixed(0)}kg</span>
                                    </div>
                                    <div className="spec-item">
                                        <span className="spec-label">Seed Quantity</span>
                                        <span className="spec-value">{prediction.seed_quantity}kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Weather Context Card */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                                <CloudRain className="w-5 h-5" />
                                {t('weatherContextFor')} {formData.District}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                                <Thermometer className="w-6 h-6 text-orange-500 mb-1" />
                                <span className="text-2xl font-bold text-gray-800">{prediction.weather_data.temperature.toFixed(1)}°C</span>
                                <span className="text-xs text-gray-500">{t('avgTemp')}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                                <Droplets className="w-6 h-6 text-blue-500 mb-1" />
                                <span className="text-2xl font-bold text-gray-800">{prediction.weather_data.humidity.toFixed(1)}%</span>
                                <span className="text-xs text-gray-500">{t('humidity')}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                                <CloudRain className="w-6 h-6 text-indigo-500 mb-1" />
                                <span className="text-2xl font-bold text-gray-800">{prediction.weather_data.rainfall.toFixed(1)}mm</span>
                                <span className="text-xs text-gray-500">{t('rainfall')}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-strong border-primary/20 bg-gradient-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <TrendingUp className="w-5 h-5" />
                                    {t('predictionResults')}
                                </CardTitle>
                                {supported && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (isSpeaking) {
                                                cancel();
                                            } else {
                                                const textToSpeak = `
                                                    ${t('sowingRecommendation')}: ${prediction.sowing_recommendation}.
                                                    ${t('predictedYield')}: ${((prediction.yield_kg * ((parseFloat(formData.Farm_Area_Acres) || 0) * 0.404686))).toFixed(0)} kg.
                                                    ${t('rowSpacing')}: ${prediction.row_spacing.toFixed(1)} cm.
                                                    ${t('plantSpacing')}: ${prediction.plant_spacing.toFixed(1)} cm.
                                                    ${t('seedQuantity')}: ${prediction.seed_quantity.toFixed(1)} kg.
                                                `;
                                                speak(textToSpeak);
                                            }
                                        }}
                                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                    >
                                        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </Button>
                                )}
                            </div>
                            <CardDescription>{t('aiRecommendations')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-sm font-semibold text-yellow-800 mb-2">{t('sowingRecommendation')}</p>
                                <p className="text-lg font-bold text-yellow-900">
                                    {prediction.sowing_recommendation === "Yes"
                                        ? t('sowingRecommended')
                                        : prediction.sowing_recommendation === "No"
                                            ? t('notRecommended')
                                            : prediction.sowing_recommendation}
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-soft">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{t('predictedYield')} (Total)</span>
                                        <span className="text-2xl">⚖️</span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {((prediction.yield_kg * ((parseFloat(formData.Farm_Area_Acres) || 0) * 0.404686))).toFixed(0)}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        kg (based on {formData.Farm_Area_Acres} acres)
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-blue-200/50">
                                        <p className="text-xs font-medium text-blue-800">
                                            {prediction.yield_kg.toFixed(0)} kg / hectare
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-soft">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{t('rowSpacing')}</span>
                                        <span className="text-2xl">📏</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">{prediction.row_spacing.toFixed(1)}</p>
                                    <p className="text-xs text-gray-600 mt-1">cm</p>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 shadow-soft">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{t('plantSpacing')}</span>
                                        <span className="text-2xl">🌱</span>
                                    </div>
                                    <p className="text-3xl font-bold text-teal-600">{prediction.plant_spacing.toFixed(1)}</p>
                                    <p className="text-xs text-gray-600 mt-1">cm</p>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-soft">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{t('seedQuantity')}</span>
                                        <span className="text-2xl">🌾</span>
                                    </div>
                                    <p className="text-3xl font-bold text-purple-600">{prediction.seed_quantity.toFixed(1)}</p>
                                    <p className="text-xs text-gray-600 mt-1">kg / acre</p>
                                </div>
                            </div>

                            {/* Enhanced Visual Spacing Representation */}
                            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <Sprout className="w-4 h-4 text-primary" />
                                    {t('recommendedPlantingLayout')}
                                </h4>

                                <div className="flex flex-col gap-8">
                                    {/* Plant Spacing Visual */}
                                    <div className="relative p-8 bg-gradient-to-b from-sky-50 to-green-50 rounded-xl border-2 border-green-100 overflow-hidden shadow-inner">
                                        <div className="absolute top-3 right-3 text-xs font-bold text-green-700 bg-white/90 px-3 py-1.5 rounded-full shadow-sm border border-green-200 z-10">
                                            {t('topView')}
                                        </div>
                                        <div className="grid grid-cols-[repeat(4,min-content)] justify-center gap-y-24 gap-x-32 py-8">
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <div key={i} className="flex flex-col items-center relative group">
                                                    {/* Plant Icon with Sway Animation - ENLARGED */}
                                                    <div className="filter drop-shadow-lg transform transition-transform hover:scale-110 duration-300 cursor-help"
                                                        title="Crop Position">
                                                        <Sprout className="w-20 h-20 text-green-700 fill-green-100" strokeWidth={1.5} />
                                                    </div>

                                                    {/* Row Spacing Indicator (Horizontal) - Diagrammatic Style */}
                                                    {i % 4 !== 3 && (
                                                        <div className="absolute top-1/2 -right-32 w-32 h-0 border-t-2 border-dashed border-slate-500 flex items-center justify-center">
                                                            {/* Arrowheads */}
                                                            <div className="absolute -left-1 w-2 h-2 border-l-2 border-b-2 border-slate-500 transform rotate-45"></div>
                                                            <div className="absolute -right-1 w-2 h-2 border-r-2 border-t-2 border-slate-500 transform rotate-45"></div>

                                                            <span className="absolute -top-7 text-sm font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded border-2 border-slate-300 shadow-sm whitespace-nowrap z-20">
                                                                {prediction.row_spacing.toFixed(0)}cm
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Plant Spacing Indicator (Vertical) - Diagrammatic Style */}
                                                    {i < 4 && (
                                                        <div className="absolute -bottom-24 left-1/2 w-0 h-24 border-l-2 border-dashed border-slate-500 flex items-center justify-center">
                                                            {/* Arrowheads */}
                                                            <div className="absolute -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-500 transform -rotate-45"></div>
                                                            <div className="absolute -bottom-1 w-2 h-2 border-b-2 border-l-2 border-slate-500 transform -rotate-45"></div>

                                                            <span className="absolute left-3 text-sm font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded border-2 border-slate-300 shadow-sm whitespace-nowrap z-20">
                                                                {prediction.plant_spacing.toFixed(0)}cm
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                                        <p className="text-sm font-medium text-teal-900 mb-1">{t('plantToPlant')}</p>
                                        <p className="text-xs text-teal-700">
                                            {t('maintainPlantSpacing').replace('{spacing}', prediction.plant_spacing.toFixed(1))}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                        <p className="text-sm font-medium text-green-900 mb-1">{t('rowToRow')}</p>
                                        <p className="text-xs text-green-700">
                                            {t('maintainRowSpacing').replace('{spacing}', prediction.row_spacing.toFixed(1))}
                                        </p>
                                    </div>
                                </div>
                            </div>


                            {/* Seed Quantity Optimization Comparison Table */}
                            {prediction.seed_comparison && (
                                <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2 text-amber-900">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                        {t('seedOptimizationComparison')}
                                    </h4>
                                    <p className="text-sm text-amber-700 mb-6">{t('comparisonDescription')}</p>

                                    {/* Comparison Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-amber-100 border-b-2 border-amber-300">
                                                    <th className="text-left p-3 text-sm font-semibold text-amber-900">Method</th>
                                                    <th className="text-center p-3 text-sm font-semibold text-amber-900">Seed Quantity (kg/acre)</th>
                                                    <th className="text-center p-3 text-sm font-semibold text-amber-900">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Traditional Method Row */}
                                                <tr className="border-b border-amber-200 bg-white/50 hover:bg-white/80 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">📚</span>
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{t('traditionalMethod')}</p>
                                                                <p className="text-xs text-gray-500">Standard agricultural practice</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-2xl font-bold text-gray-700">
                                                            {prediction.seed_comparison.traditional_quantity.toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                                            Baseline
                                                        </span>
                                                    </td>
                                                </tr>

                                                {/* Optimized Method Row */}
                                                <tr className="border-b border-amber-200 bg-green-50/50 hover:bg-green-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">🤖</span>
                                                            <div>
                                                                <p className="font-semibold text-green-800">{t('optimizedMethod')}</p>
                                                                <p className="text-xs text-green-600">AI-powered precision</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-2xl font-bold text-green-700">
                                                            {prediction.seed_comparison.optimized_quantity.toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                                                            ✓ Optimized
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Savings Metrics */}
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Quantity Saved */}
                                        <div className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">{t('quantitySaved')}</span>
                                                <span className="text-2xl">💰</span>
                                            </div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {prediction.seed_comparison.quantity_saved > 0
                                                    ? `${prediction.seed_comparison.quantity_saved.toFixed(1)} kg`
                                                    : '0 kg'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">per acre</p>
                                        </div>

                                        {/* Percentage Saved */}
                                        <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">{t('percentageSaved')}</span>
                                                <span className="text-2xl">📊</span>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {prediction.seed_comparison.percentage_saved > 0
                                                    ? `${prediction.seed_comparison.percentage_saved.toFixed(1)}%`
                                                    : '0%'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">efficiency gain</p>
                                        </div>
                                    </div>

                                    {/* Success Message */}
                                    {prediction.seed_comparison.quantity_saved > 0 && (
                                        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                                            <p className="text-sm text-green-800 font-medium text-center">
                                                🎉 By using ML-optimized seed quantity, you can save{' '}
                                                <strong>{prediction.seed_comparison.quantity_saved.toFixed(1)} kg</strong> of seeds per acre!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )
            }
        </div >
    );
};

export default PredictYieldTab;
