import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cloud, CloudRain, Wind, Gauge, MapPin, Leaf, Waves, Loader } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PredictYieldTab from '@/components/dashboard/PredictYieldTab';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('weather');
  const [location, setLocation] = useState('Mumbai');
  const [weatherData, setWeatherData] = useState({
    rainfall: 0,
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    pressure: 0,
  });
  const [loadingWeather, setLoadingWeather] = useState(false);



  const fetchWeatherData = async (cityName: string) => {
    setLoadingWeather(true);
    try {
      // Use Geocoding API to get coordinates from city name
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) throw new Error('Failed to fetch city coordinates');

      const geoData = await geoResponse.json();
      console.log('Geocoding response:', geoData);

      if (!geoData.results || geoData.results.length === 0) {
        console.warn('City not found:', cityName);
        setLoadingWeather(false);
        return;
      }

      const { latitude, longitude } = geoData.results[0];
      console.log('City coordinates:', { latitude, longitude });

      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&timezone=Asia/Kolkata`
      );

      if (!response.ok) throw new Error('Failed to fetch weather');

      const data = await response.json();
      console.log('Weather data:', data);
      const current = data.current;

      // Fetch historical data for rainfall estimate (last 7 days)
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const historyResponse = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum&timezone=Asia/Kolkata`
      );

      const historyData = historyResponse.ok ? await historyResponse.json() : null;
      console.log('History data:', historyData);
      const totalRainfall = historyData?.daily?.precipitation_sum?.reduce((a: number, b: number) => a + b, 0) || 0;

      setWeatherData({
        rainfall: Math.round(totalRainfall),
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
        pressure: current.surface_pressure,
      });
      console.log('Weather data set successfully');
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Keep default values on error
    } finally {
      setLoadingWeather(false);
    }
  };

  // Weather data - initialized empty, populated when location is searched
  const currentWeather = {
    temp: weatherData.temperature,
    humidity: weatherData.humidity,
    windSpeed: weatherData.windSpeed,
    pressure: weatherData.pressure,
  };

  const temperatureData = location ? [
    { day: 'Today', temp: weatherData.temperature },
    { day: '+1 Day', temp: weatherData.temperature + (Math.random() * 4 - 2) },
    { day: '+2 Days', temp: weatherData.temperature + (Math.random() * 4 - 2) },
    { day: '+3 Days', temp: weatherData.temperature + (Math.random() * 4 - 2) },
  ] : [];

  const humidityRainfallData = location ? [
    { date: 'Today', humidity: weatherData.humidity, rainfall: weatherData.rainfall },
    { date: '+1 Day', humidity: weatherData.humidity - 5, rainfall: weatherData.rainfall * 0.8 },
    { date: '+2 Days', humidity: weatherData.humidity + 3, rainfall: weatherData.rainfall * 1.2 },
    { date: '+3 Days', humidity: weatherData.humidity - 2, rainfall: weatherData.rainfall * 0.9 },
  ] : [];

  const detailedForecast = location ? [
    { day: 'Today', temp: weatherData.temperature, minTemp: weatherData.temperature - 3, maxTemp: weatherData.temperature + 2, humidity: weatherData.humidity, icon: '☀️' },
    { day: '+1 Day', temp: weatherData.temperature + 1, minTemp: weatherData.temperature - 2, maxTemp: weatherData.temperature + 3, humidity: weatherData.humidity - 5, icon: '⛅' },
    { day: '+2 Days', temp: weatherData.temperature - 1, minTemp: weatherData.temperature - 4, maxTemp: weatherData.temperature + 1, humidity: weatherData.humidity + 3, icon: '🌤️' },
    { day: '+3 Days', temp: weatherData.temperature, minTemp: weatherData.temperature - 2, maxTemp: weatherData.temperature + 2, humidity: weatherData.humidity - 2, icon: '☀️' },
    { day: '+4 Days', temp: weatherData.temperature + 2, minTemp: weatherData.temperature - 1, maxTemp: weatherData.temperature + 4, humidity: weatherData.humidity - 8, icon: '🌞' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{t('heroTitle')}</h1>
          <p className="text-gray-600">{t('enterFarmDetails')}</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex gap-3 mb-8 justify-center md:justify-start flex-wrap">
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'weather'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Cloud className="w-5 h-5" />
              <span>{t('weatherForecast')}</span>
            </button>
            <button
              onClick={() => setActiveTab('yield')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'yield'
                ? 'bg-orange-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Leaf className="w-5 h-5" />
              <span>{t('yieldPrediction')}</span>
            </button>
          </div>
          <TabsList style={{ display: 'none' }}>
            <TabsTrigger value="weather" />
            <TabsTrigger value="yield" />
          </TabsList>

          {/* WEATHER FORECAST TAB */}
          <TabsContent value="weather" className="space-y-6">
            {/* Weather Location Search */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle>{t('searchLocation')}</CardTitle>
                    <CardDescription>{t('enterCityWeather')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder={t('placeholderCity')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 border-gray-300"
                  />
                  <Button
                    onClick={() => fetchWeatherData(location)}
                    disabled={loadingWeather || !location}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6"
                  >
                    {loadingWeather ? <Loader className="w-4 h-4 animate-spin" /> : t('search')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {location && (
              <>
                {/* Current Weather */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-blue-600" />
                      <div>
                        <CardTitle>{t('currentWeather')} - {location}</CardTitle>
                        <CardDescription>{t('realTimeConditions')}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700">{t('temperature')}</h4>
                          <span className="text-2xl">🌡️</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{currentWeather.temp}°C</p>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border border-cyan-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700">{t('humidity')}</h4>
                          <Waves className="w-6 h-6 text-cyan-600" />
                        </div>
                        <p className="text-3xl font-bold text-cyan-600">{currentWeather.humidity}%</p>
                      </div>

                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6 border border-teal-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700">{t('windSpeed')}</h4>
                          <Wind className="w-6 h-6 text-teal-600" />
                        </div>
                        <p className="text-3xl font-bold text-teal-600">{currentWeather.windSpeed} m/s</p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700">{t('pressure')}</h4>
                          <Gauge className="w-6 h-6 text-indigo-600" />
                        </div>
                        <p className="text-3xl font-bold text-indigo-600">{currentWeather.pressure} hPa</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Temperature Forecast Charts */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>{t('temperatureForecast')}</CardTitle>
                    <CardDescription>{t('next4Days')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={temperatureData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} name="Temperature (°C)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Humidity & Rainfall Forecast */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>{t('humidityRainfall')}</CardTitle>
                    <CardDescription>{t('next4Days')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={humidityRainfallData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="humidity" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="Humidity (%)" />
                        <Area type="monotone" dataKey="rainfall" stackId="2" stroke="#0284c7" fill="#0284c7" fillOpacity={0.6} name="Rainfall (mm)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Detailed 5-Day Forecast */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>{t('detailedForecast')}</CardTitle>
                    <CardDescription>{t('fiveDayOutlook')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {detailedForecast.map((day, index) => (
                        <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 text-center">
                          <p className="text-sm font-semibold text-gray-700 mb-2">{day.day}</p>
                          <div className="text-4xl mb-3">{day.icon}</div>
                          <p className="text-2xl font-bold text-blue-600">{day.temp}°C</p>
                          <p className="text-xs text-gray-600 mt-1">{day.minTemp}° / {day.maxTemp}°</p>
                          <div className="flex items-center justify-center gap-1 text-xs text-cyan-600 mt-2">
                            <Waves className="w-3 h-3" />
                            <span>{day.humidity}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!location && (
              <Card className="border-0 shadow-md bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Cloud className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('noLocationSelected')}</h3>
                    <p className="text-gray-600">{t('enterCityAbove')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* YIELD PREDICTION TAB */}
          <TabsContent value="yield" className="space-y-6">
            <PredictYieldTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
