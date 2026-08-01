import { useState, useEffect } from "react";
import "./App.css";

const API_KEY = "YOUR_API_KEY_HERE"; // Replace with your OpenWeatherMap API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export default function App() {
  const [city, setCity] = useState("London");
  const [query, setQuery] = useState("London");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      try {
        const [currentRes, forecastRes] = await Promise.all([
          fetch(`${BASE_URL}/weather?q=${query}&appid=${API_KEY}&units=metric`),
          fetch(`${BASE_URL}/forecast?q=${query}&appid=${API_KEY}&units=metric`),
        ]);

        if (!currentRes.ok) throw new Error("City not found. Please try again.");

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        setWeather(currentData);

        // Get one forecast per day (every 8th item = 24h apart)
        const daily = forecastData.list.filter((_, i) => i % 8 === 0).slice(0, 5);
        setForecast(daily);
      } catch (err) {
        setError(err.message);
        setWeather(null);
        setForecast([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) setQuery(city.trim());
  };

  const getIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div className="app">
      <h1>🌤 Weather App</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="status error">{error}</p>}

      {weather && (
        <div className="current-weather">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <img src={getIcon(weather.weather[0].icon)} alt={weather.weather[0].description} />
          <p className="temp">{Math.round(weather.main.temp)}°C</p>
          <p className="desc">{weather.weather[0].description}</p>
          <div className="details">
            <span>💧 {weather.main.humidity}%</span>
            <span>💨 {weather.wind.speed} m/s</span>
            <span>🌡 Feels like {Math.round(weather.main.feels_like)}°C</span>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecast.map((day) => (
              <div key={day.dt} className="forecast-card">
                <p>{new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                <img src={getIcon(day.weather[0].icon)} alt={day.weather[0].description} />
                <p className="temp">{Math.round(day.main.temp)}°C</p>
                <p className="desc">{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
