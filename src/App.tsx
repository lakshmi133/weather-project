import { useState, useEffect } from 'react';

function App() {
  const [city, setCity] = useState(() => localStorage.getItem('lastCity') || '');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateTime, setDateTime] = useState(new Date());

  const apiKey = '0ce7b62b6dbd86862c670d118a1fe7c4';

  // Update date/time every second
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load last searched city weather on mount
  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, []);

  const fetchWeather = async (searchCity?: string) => {
    const queryCity = searchCity ?? city;

    if (!queryCity.trim()) {
      setErrorMessage('Please enter a city name.');
      setWeather(null);
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('City not found or API error');
      }

      const data = await response.json();
      setWeather(data);
      setCity(queryCity);
      localStorage.setItem('lastCity', queryCity);
    } catch (error: any) {
      setErrorMessage(error.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Background color based on temperature (in Celsius)
  const getBackgroundColor = () => {
    if (!weather) return '#e0e0e0';

    const temp = weather.main.temp;
    if (temp <= 0) return '#74b9ff';      // cold - blue
    if (temp <= 15) return '#55efc4';     // cool - teal
    if (temp <= 25) return '#ffeaa7';     // mild - yellow
    if (temp <= 35) return '#fab1a0';     // warm - orange
    return '#ff7675';                     // hot - red
  };

  // Handle Enter key press on input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial',
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: getBackgroundColor(),
        transition: 'background-color 0.5s ease',
        color: '#2d3436',
      }}
    >
      <h1>🌦️ Weather Dashboard</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter city"
        style={{ padding: '10px', fontSize: '16px', width: '250px', borderRadius: 4 }}
      />
      <button
        onClick={() => fetchWeather()}
        style={{ padding: '10px 16px', marginLeft: '10px', borderRadius: 4, cursor: 'pointer' }}
      >
        Get Weather
      </button>

      {/* Show date and time */}
      <div style={{ marginTop: 20, fontSize: '18px', fontWeight: 'bold' }}>
        {dateTime.toLocaleString()}
      </div>

      {/* Error message */}
      {errorMessage && (
        <p style={{ color: 'red', marginTop: 20 }}>{errorMessage}</p>
      )}

      {loading && (
        <div style={{ marginTop: '20px' }}>
          {/* Simple CSS spinner */}
          <div
            style={{
              border: '6px solid #f3f3f3',
              borderTop: '6px solid #3498db',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: 'auto',
            }}
          />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {weather && !loading && (
        <div style={{ marginTop: '20px' }}>
          <h2>{weather.name}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather Icon"
          />
          <p>🌡️ Temp: {weather.main.temp} °C</p>
          <p>💧 Humidity: {weather.main.humidity} %</p>
          <p>💨 Wind Speed: {weather.wind.speed} m/s</p>
          <p>📝 Condition: {weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
