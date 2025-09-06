document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityField").value.trim();
  if (city) {
    getCoordinates(city);
  } else {
    showError("Please enter a city name");
  }
});

const weatherDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle: Light",
  53: "Drizzle: Moderate",
  55: "Drizzle: Dense intensity",
  56: "Freezing Drizzle: Light",
  57: "Freezing Drizzle: Dense intensity",
  61: "Rain: Slight",
  63: "Rain: Moderate",
  65: "Rain: Heavy intensity",
  66: "Freezing Rain: Light",
  67: "Freezing Rain: Heavy intensity",
  71: "Snow fall: Slight",
  73: "Snow fall: Moderate",
  75: "Snow fall: Heavy intensity",
  77: "Snow grains",
  80: "Rain showers: Slight",
  81: "Rain showers: Moderate",
  82: "Rain showers: Violent",
  85: "Snow showers: Slight",
  86: "Snow showers: Heavy",
  95: "Thunderstorm: Slight or moderate",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const weatherIcons = {
  // Ícones para céu limpo e parcialmente nublado
  0: "fa-sun",
  1: "fa-cloud-sun",
  2: "fa-cloud-sun",
  3: "fa-cloud",
  // Ícones para nevoeiro
  45: "fa-smog",
  48: "fa-smog",
  // Ícones para garoa e chuva
  51: "fa-cloud-drizzle",
  53: "fa-cloud-drizzle",
  55: "fa-cloud-showers-heavy",
  56: "fa-cloud-showers-heavy",
  57: "fa-cloud-showers-heavy",
  61: "fa-cloud-rain",
  63: "fa-cloud-rain",
  65: "fa-cloud-showers-heavy",
  66: "fa-cloud-rain",
  67: "fa-cloud-showers-heavy",
  // Ícones para neve
  71: "fa-snowflake",
  73: "fa-snowflake",
  75: "fa-snowflake",
  77: "fa-snowflake",
  80: "fa-cloud-showers-heavy",
  81: "fa-cloud-showers-heavy",
  82: "fa-cloud-showers-heavy",
  85: "fa-snowflake",
  86: "fa-snowflake",
  // Ícones para tempestades
  95: "fa-cloud-bolt",
  96: "fa-cloud-bolt",
  99: "fa-cloud-bolt",
};

async function getCoordinates(city) {
  showError("");
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("Location not found");
    }

    const { latitude, longitude, name, country } = data.results[0];
    getWeather(latitude, longitude, name, country);
  } catch (error) {
    showError(error.message);
  }
}

async function getWeather(latitude, longitude, city, country) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!response.ok) {
      throw new Error("Weather data not available");
    }

    const data = await response.json();
    displayWeather(data.current_weather, city, country);
  } catch (error) {
    showError(error.message);
  }
}

function displayWeather(weather, city, country) {
  const weatherContainer = document.getElementById("weatherContainer");
  const cityHeader = document.getElementById("cityName");
  const temp = document.getElementById("temperature");
  const condition = document.getElementById("condition");
  const windSpeed = document.getElementById("windSpeed");
  const weatherIcon = document.getElementById("weatherIcon");

  const weatherCondition =
    weatherDescriptions[weather.weathercode] || "Unknown Condition";
  const iconClass = weatherIcons[weather.weathercode] || "fa-cloud-question";

  weatherContainer.style.display = "block";
  cityHeader.textContent = `${city}, ${country}`;
  temp.textContent = `${weather.temperature}°C`;
  condition.textContent = `${weatherCondition}`;
  windSpeed.textContent = `${weather.windspeed} km/h`;

  weatherIcon.className = `fa-solid ${iconClass}`;
}

function showError(message) {
  const weatherContainer = document.getElementById("weatherContainer");
  weatherContainer.style.display = "none";
  const errorPara = document.getElementById("errorMessage");
  errorPara.textContent = message;
}
