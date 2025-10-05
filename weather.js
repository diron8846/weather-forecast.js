// Import dependencies
const express = require("express");
const morgan = require("morgan");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware
app.use(morgan("dev")); // logs requests

// API key & base URLs
const API_KEY = "your_api_key_here"; // 👈 Replace with your real key
const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const GEOCODING_URL = "http://api.openweathermap.org/geo/1.0/direct";

// Route: Home
app.get("/", (req, res) => {
  res.send("🌤️ Welcome to Tiny Weather API Server");
});

// Route: Get current weather for a city
app.get("/weather/:city", async (req, res) => {
  const city = req.params.city;

  try {
    const response = await axios.get(CURRENT_WEATHER_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });

    const data = response.data;
    res.json({
      city: data.name,
      temperature: `${data.main.temp} °C`,
      condition: data.weather[0].description,
    });
  } catch (error) {
    res.status(404).json({ error: "City not found or API error" });
  }
});

// Route: Get 5-day forecast for a city
app.get("/forecast/:city", async (req, res) => {
  const city = req.params.city;

  try {
    const response = await axios.get(FORECAST_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });

    const data = response.data;
    const forecast = data.list.map(item => ({
      date: item.dt_txt,
      temperature: `${item.main.temp} °C`,
      condition: item.weather[0].description,
    }));

    res.json({
      city: data.city.name,
      forecast: forecast,
    });
  } catch (error) {
    res.status(404).json({ error: "City not found or API error" });
  }
});

// ✅ NEW ROUTE: Get city coordinates (latitude & longitude)
app.get("/coords/:city", async (req, res) => {
  const city = req.params.city;

  try {
    const response = await axios.get(GEOCODING_URL, {
      params: {
        q: city,
        appid: API_KEY,
      },
    });

    const data = response.data;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    const firstResult = data[0]; // Take the most relevant result

    res.json({
      city: firstResult.name,
      coordinates: {
        latitude: firstResult.lat,
        longitude: firstResult.lon,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coordinates" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});