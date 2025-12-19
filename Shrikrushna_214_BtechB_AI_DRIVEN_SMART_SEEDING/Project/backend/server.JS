// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.VITE_OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error("❌ Missing VITE_OPENWEATHER_API_KEY in backend/.env");
  process.exit(1);
}

// ---------------------------
// 1) GEOCODING
// ---------------------------
app.get("/api/geocode", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "City (q) is required" });

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      q
    )}&limit=1&appid=${API_KEY}`;

    const r = await fetch(url);
    const data = await r.json();

    res.status(r.status).json(data);
  } catch (err) {
    console.error("Geo error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// 2) ONECALL WEATHER
// ---------------------------
app.get("/api/onecall", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon)
      return res.status(400).json({ error: "lat & lon required" });

    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`;

    const r = await fetch(url);
    const data = await r.json();

    res.status(r.status).json(data);
  } catch (err) {
    console.error("OneCall error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT, () => {
  console.log(`🚀 Weather backend running on port ${PORT}`);
});
