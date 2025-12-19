import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Droplets,
    Wind,
    Gauge,
    CloudRain,
    Sun,
    Cloud,
    Eye,
    Sunrise,
    Sunset,
} from "lucide-react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTTS } from '@/hooks/useTTS';
import { Volume2, VolumeX } from "lucide-react";

interface WeatherData {
    location: {
        name: string;
        country: string;
        lat: number;
        lon: number;
    };
    current: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
        wind_speed: number;
        visibility: number;
        weather: { description: string; icon: string; main: string }[];
        sunrise: number;
        sunset: number;
    };
    forecast: Array<{
        dt: number;
        date: string;
        temp: { day: number; min: number; max: number };
        humidity: number;
        wind_speed: number;
        weather: { description: string; icon: string; main: string }[];
        pop: number; // Probability of precipitation
    }>;
}

// 3D Bar for temperature visualization (Green Theme)
function TemperatureBar({ position, min, max, label }: any) {
    // Scale factor to make the bars visible in the scene
    const scale = 0.15;
    const minHeight = Math.max(0.1, min * scale);
    const maxHeight = Math.max(0.1, max * scale);

    // Green-themed colors based on temperature
    const getTempColor = (t: number) => {
        if (t > 35) return "#166534"; // green-800
        if (t > 25) return "#15803d"; // green-700
        if (t > 15) return "#22c55e"; // green-500
        return "#86efac"; // green-300
    };

    return (
        <group position={position}>
            {/* Max Temp Bar */}
            <mesh position={[0.2, maxHeight / 2, 0]}>
                <boxGeometry args={[0.3, maxHeight, 0.3]} />
                <meshStandardMaterial color={getTempColor(max)} opacity={0.9} transparent />
            </mesh>
            <Text
                position={[0.2, maxHeight + 0.4, 0]}
                fontSize={0.25}
                color="#15803d"
                anchorX="center"
                anchorY="middle"
            >
                {Math.round(max)}°
            </Text>

            {/* Min Temp Bar */}
            <mesh position={[-0.2, minHeight / 2, 0]}>
                <boxGeometry args={[0.3, minHeight, 0.3]} />
                <meshStandardMaterial color={getTempColor(min)} opacity={0.6} transparent />
            </mesh>
            <Text
                position={[-0.2, minHeight + 0.4, 0]}
                fontSize={0.25}
                color="#86efac"
                anchorX="center"
                anchorY="middle"
            >
                {Math.round(min)}°
            </Text>

            {/* Day Label */}
            <Text
                position={[0, -0.5, 0]}
                fontSize={0.2}
                color="#064e3b"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
        </group>
    );
}

// 3D Temperature Chart Component
function Temperature3DChart({ data }: { data: WeatherData["forecast"] }) {
    return (
        <Canvas
            camera={{ position: [0, 4, 8], fov: 45 }}
            style={{ height: "350px", borderRadius: "0.75rem", background: "linear-gradient(to bottom, #f0fdf4, #dcfce7)" }}
        >
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <spotLight position={[0, 10, 0]} angle={0.5} intensity={0.8} />

            <group position={[-3.5, -1, 0]}>
                {data.slice(0, 7).map((day, index) => (
                    <TemperatureBar
                        key={index}
                        position={[index * 1.2, 0, 0]}
                        min={day.temp.min}
                        max={day.temp.max}
                        label={new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}
                    />
                ))}
            </group>

            <OrbitControls
                enableZoom={true}
                enablePan={true}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
            />
            <gridHelper args={[15, 15, "#86efac", "#bbf7d0"]} position={[0, -1, 0]} />
        </Canvas>
    );
}

const NewWeatherTab: React.FC = () => {
    const { t, language } = useLanguage();
    const { speak, cancel, isSpeaking, supported } = useTTS(language);
    const [city, setCity] = useState("Mumbai");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchWeatherData = async (cityName: string) => {
        setLoading(true);
        try {
            const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

            if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
                toast.error("API Key is missing! Please add VITE_OPENWEATHER_API_KEY to your .env file.");
                setLoading(false);
                return;
            }

            // Step 1: Geocode the city
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
                cityName.trim()
            )}&limit=1&appid=${API_KEY}`;

            const geoResponse = await fetch(geoUrl);
            if (!geoResponse.ok) throw new Error("Failed to find location");

            const geoData = await geoResponse.json();
            if (!geoData || geoData.length === 0) {
                toast.error("City not found. Please try another name.");
                setLoading(false);
                return;
            }

            const { lat, lon, name, country } = geoData[0];

            // Step 2: Fetch current weather
            const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
            const currentResponse = await fetch(currentUrl);
            if (!currentResponse.ok) throw new Error("Failed to fetch current weather");
            const currentData = await currentResponse.json();

            // Step 3: Fetch forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
            const forecastResponse = await fetch(forecastUrl);
            if (!forecastResponse.ok) throw new Error("Failed to fetch forecast");
            const forecastData = await forecastResponse.json();

            // Aggregate forecast by day
            const dailyForecast: { [key: string]: any } = {};
            forecastData.list.forEach((item: any) => {
                const date = new Date(item.dt * 1000).toLocaleDateString();
                if (!dailyForecast[date]) {
                    dailyForecast[date] = {
                        dt: item.dt,
                        date,
                        temps: [],
                        humidity: [],
                        wind_speed: [],
                        weather: item.weather,
                        pop: item.pop || 0,
                    };
                }
                dailyForecast[date].temps.push(item.main.temp);
                dailyForecast[date].humidity.push(item.main.humidity);
                dailyForecast[date].wind_speed.push(item.wind.speed);
            });

            const forecast = Object.values(dailyForecast).slice(0, 7).map((day: any) => ({
                dt: day.dt,
                date: day.date,
                temp: {
                    day: day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length,
                    min: Math.min(...day.temps),
                    max: Math.max(...day.temps),
                },
                humidity: day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length,
                wind_speed: day.wind_speed.reduce((a: number, b: number) => a + b, 0) / day.wind_speed.length,
                weather: day.weather,
                pop: day.pop,
            }));

            const weather: WeatherData = {
                location: { name, country, lat, lon },
                current: {
                    temp: currentData.main.temp,
                    feels_like: currentData.main.feels_like,
                    humidity: currentData.main.humidity,
                    pressure: currentData.main.pressure,
                    wind_speed: currentData.wind.speed,
                    visibility: currentData.visibility,
                    weather: currentData.weather,
                    sunrise: currentData.sys.sunrise,
                    sunset: currentData.sys.sunset,
                },
                forecast,
            };

            setWeatherData(weather);
            toast.success(`Weather data loaded for ${name}, ${country}`);
        } catch (error) {
            console.error("Error fetching weather:", error);
            toast.error("Failed to fetch weather data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherData(city);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) fetchWeatherData(city);
        else toast.error("Please enter a city name");
    };

    if (!weatherData && loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-xl text-muted-foreground animate-pulse">Loading weather data...</p>
            </div>
        );
    }

    // Prepare data for Recharts
    const chartData = weatherData ? weatherData.forecast.map((day) => ({
        date: new Date(day.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        }),
        temp: Math.round(day.temp.day),
        minTemp: Math.round(day.temp.min),
        maxTemp: Math.round(day.temp.max),
        humidity: Math.round(day.humidity),
        rainfall: Math.round(day.pop * 100),
    })) : [];

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <Card className="shadow-medium border-border/50">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter city name..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="bg-gradient-primary hover:opacity-90">
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {weatherData && (
                <>
                    {/* Current Weather */}
                    <Card className="shadow-medium border-primary/20 bg-gradient-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CloudRain className="w-5 h-5 text-primary" />
                                    Current Weather - {weatherData.location.name}, {weatherData.location.country}
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
                                                    ${t('currentWeather')} ${t('in')} ${weatherData.location.name}.
                                                    ${t('temperature')}: ${Math.round(weatherData.current.temp)} degrees Celsius.
                                                    ${t('humidity')}: ${weatherData.current.humidity} percent.
                                                    ${t('windSpeed')}: ${weatherData.current.wind_speed.toFixed(1)} meters per second.
                                                    ${t('pressure')}: ${weatherData.current.pressure} hectopascals.
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
                            <CardDescription>Real-time weather conditions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🌡️</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{Math.round(weatherData.current.temp)}°C</p>
                                        <p className="text-xs text-muted-foreground">Temperature</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                                        <Droplets className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{weatherData.current.humidity}%</p>
                                        <p className="text-xs text-muted-foreground">Humidity</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                                        <Wind className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{weatherData.current.wind_speed.toFixed(1)} m/s</p>
                                        <p className="text-xs text-muted-foreground">Wind Speed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Gauge className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-foreground">{weatherData.current.pressure} hPa</p>
                                        <p className="text-xs text-muted-foreground">Pressure</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3D Temperature Chart */}
                    <Card className="shadow-medium border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="text-xl">📊</span> 3D Temperature Forecast
                            </CardTitle>
                            <CardDescription>Interactive 3D visualization of Min/Max temperatures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Temperature3DChart data={weatherData.forecast} />
                        </CardContent>
                    </Card>

                    {/* 2D Charts */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="shadow-medium">
                            <CardHeader>
                                <CardTitle className="text-lg">Temperature Trend (7 Days)</CardTitle>
                                <CardDescription>Daily temperature trends</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(142, 45%, 35%)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(142, 45%, 35%)" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="temp"
                                            stroke="hsl(142, 45%, 35%)"
                                            fillOpacity={1}
                                            fill="url(#tempGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="shadow-medium">
                            <CardHeader>
                                <CardTitle className="text-lg">Humidity & Rainfall (7 Days)</CardTitle>
                                <CardDescription>Moisture and precipitation forecast</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="humidity"
                                            stroke="hsl(200, 75%, 50%)"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(200, 75%, 50%)" }}
                                            name="Humidity %"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="rainfall"
                                            stroke="hsl(35, 80%, 58%)"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(35, 80%, 58%)" }}
                                            name="Rainfall %"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 7-Day Forecast Cards */}
                    <Card className="shadow-medium">
                        <CardHeader>
                            <CardTitle>7-Day Detailed Forecast</CardTitle>
                            <CardDescription>Complete weather outlook for the week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {weatherData.forecast.map((day, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-gradient-card rounded-lg border border-border/50 hover:shadow-soft transition-all hover:scale-105"
                                    >
                                        <p className="text-sm font-semibold text-center mb-2">
                                            {new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}
                                        </p>
                                        <div className="text-center mb-2">
                                            <span className="text-3xl">
                                                {day.weather[0].main.toLowerCase().includes("rain") ? "🌧️" :
                                                    day.weather[0].main.toLowerCase().includes("cloud") ? "☁️" : "☀️"}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <p className="text-xl font-bold text-foreground">{Math.round(day.temp.day)}°C</p>
                                            <p className="text-xs text-muted-foreground">
                                                {Math.round(day.temp.min)}° / {Math.round(day.temp.max)}°
                                            </p>
                                            <div className="flex items-center justify-center gap-1 text-xs text-accent">
                                                <Droplets className="w-3 h-3" />
                                                <span>{Math.round(day.humidity)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default NewWeatherTab;
