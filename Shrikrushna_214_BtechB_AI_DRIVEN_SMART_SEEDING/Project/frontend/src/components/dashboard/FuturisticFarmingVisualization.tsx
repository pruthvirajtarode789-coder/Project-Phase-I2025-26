import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Sprout, MapPin, RefreshCw, CloudRain, Thermometer, Droplets } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
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
}

const FuturisticFarmingVisualization: React.FC = () => {
    const { t } = useLanguage();

    // Robot Visualization State
    const [robotPosition, setRobotPosition] = useState({ x: 5, y: 70 });
    const [currentRow, setCurrentRow] = useState(0);
    const [distanceTraveled, setDistanceTraveled] = useState(0);
    const [seedsPlanted, setSeedsPlanted] = useState(0);
    const [isPlanting, setIsPlanting] = useState(false);
    const [plantedSeeds, setPlantedSeeds] = useState<{ x: number, y: number, id: number }[]>([]);
    const [robotStatus, setRobotStatus] = useState('Starting seeding operation...');

    // Form & Prediction State
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
        Farm_Area_hectares: "1.0",
    });

    const [availableTalukas, setAvailableTalukas] = useState<string[]>([]);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

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
                    districts: data.districts || [],
                    talukas_by_district: data.talukas_by_district || {},
                });
            })
            .catch((err) => {
                console.error("Failed to load dropdown data", err);
                setFetchError(t('failedToLoadOptions'));
            });
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "District") {
            // Reset taluka and load new options
            setFormData((prev) => ({ ...prev, Taluka: "" }));
            const talukas = dropdownData.talukas_by_district[value] || [];
            setAvailableTalukas(talukas.sort());
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
            Farm_Area_hectares: parseFloat(formData.Farm_Area_hectares) || 1.0,
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
                weather_data: json.weather_data || { temperature: 0, humidity: 0, rainfall: 0 }
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
                                                    {s}
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
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectDistrict')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dropdownData.districts.sort().map((d) => (
                                                <SelectItem key={d} value={d}>
                                                    {d}
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
                                        disabled={!formData.District}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectTaluka')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTalukas.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
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
                                                    {c}
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
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="farmArea">{t('farmArea')} *</Label>
                                    <Input
                                        id="farmArea"
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="1000"
                                        placeholder="e.g., 2.5"
                                        value={formData.Farm_Area_hectares}
                                        onChange={(e) => handleInputChange("Farm_Area_hectares", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 font-semibold"
                        >
                            {loading ? t('predicting') : t('predictYield')}
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
                    <span className="spec-label">Expected Yield</span>
                    <span className="spec-value">{prediction.yield_kg}kg</span>
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
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                {t('predictionResults')}
              </CardTitle>
              <CardDescription>{t('aiRecommendations')}</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <span className="text-sm font-medium text-gray-700">{t('predictedYield')}</span>
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{prediction.yield_kg.toFixed(0)}</p>
                  <p className="text-xs text-gray-600 mt-1">kg</p>
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
                    <div className="relative p-6 bg-gradient-to-b from-sky-50 to-green-50 rounded-lg border border-green-100 overflow-hidden">
                        <div className="absolute top-2 right-2 text-xs text-green-600 font-medium bg-white/80 px-2 py-1 rounded">
                            {t('topView')}
                        </div>

                        <div className="grid grid-cols-4 gap-y-8 gap-x-4 justify-items-center">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center relative group">
                                    {/* Plant Icon with Sway Animation */}
                                    <div className="text-3xl animate-sway" style={{ animationDelay: `${i * 0.2}s` }}>
                                        🌱
                                    </div>

                                    {/* Plant Spacing Indicator (Horizontal) */}
                                    {i % 4 !== 3 && (
                                        <div className="absolute top-1/2 -right-4 w-8 h-px bg-teal-400/50 flex items-center justify-center">
                                            <span className="text-[10px] text-teal-700 bg-white/90 px-1 rounded shadow-sm transform -translate-y-2">
                                                {prediction.plant_spacing.toFixed(0)}cm
                                            </span>
                                        </div>
                                    )}

                                    {/* Row Spacing Indicator (Vertical) */}
                                    {i < 4 && (
                                        <div className="absolute -bottom-8 left-1/2 w-px h-8 bg-green-400/50 flex items-center justify-center">
                                            <span className="text-[10px] text-green-700 bg-white/90 px-1 rounded shadow-sm transform translate-x-4">
                                                {prediction.row_spacing.toFixed(0)}cm
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
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
            </div>
        </CardContent>
          </Card >
        </div >
      )}
    </div >
  );
};

export default FuturisticFarmingVisualization;