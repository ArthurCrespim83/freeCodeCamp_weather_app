let isCelsius = true;

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityField").value.trim();
  if (city) {
    getCoordinates(city);
  } else {
    showError("Please enter a city name");
  }
});

document.getElementById("unitToggle").addEventListener("click", () => {
  isCelsius = !isCelsius;
  updateTemperatures();
  document.getElementById("unitToggle").textContent = isCelsius ? "°F" : "°C";
});

const weatherDescriptions = {
  0: "Céu limpo",
  1: "Principalmente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Nevoeiro",
  48: "Nevoeiro de névoa depositada",
  51: "Garoa: Leve",
  53: "Garoa: Moderada",
  55: "Garoa: Intensa",
  56: "Garoa congelante: Leve",
  57: "Garoa congelante: Intensa",
  61: "Chuva: Leve",
  63: "Chuva: Moderada",
  65: "Chuva: Intensa",
  66: "Chuva congelante: Leve",
  67: "Chuva congelante: Intensa",
  71: "Queda de neve: Leve",
  73: "Queda de neve: Moderada",
  75: "Queda de neve: Intensa",
  77: "Grãos de neve",
  80: "Aguaceiros de chuva: Leve",
  81: "Aguaceiros de chuva: Moderados",
  82: "Aguaceiros de chuva: Violentos",
  85: "Aguaceiros de neve: Leves",
  86: "Aguaceiros de neve: Intensos",
  95: "Trovoada: Leve ou moderada",
  96: "Trovoada com granizo leve",
  99: "Trovoada com granizo intenso",
};

const weatherIcons = {
  0: "fa-sun",
  1: "fa-cloud-sun",
  2: "fa-cloud-sun",
  3: "fa-cloud",
  45: "fa-smog",
  48: "fa-smog",
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
  71: "fa-snowflake",
  73: "fa-snowflake",
  75: "fa-snowflake",
  77: "fa-snowflake",
  80: "fa-cloud-showers-heavy",
  81: "fa-cloud-showers-heavy",
  82: "fa-cloud-showers-heavy",
  85: "fa-snowflake",
  86: "fa-snowflake",
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
      throw new Error("Cidade não encontrada");
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("Localização não encontrada");
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
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    if (!response.ok) {
      throw new Error("Dados de tempo não disponíveis");
    }

    const data = await response.json();
    // Armazena os dados brutos para conversão
    window.weatherData = data;
    displayWeather(data.current_weather, city, country);
    displayForecast(data.daily);
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
    weatherDescriptions[weather.weathercode] || "Condição Desconhecida";
  const iconClass = weatherIcons[weather.weathercode] || "fa-cloud-question";

  weatherContainer.style.display = "block";
  cityHeader.textContent = `${city}, ${country}`;
  condition.textContent = `${weatherCondition}`;
  windSpeed.textContent = `Vento: ${weather.windspeed} km/h`;

  weatherIcon.className = `fa-solid ${iconClass}`;
  updateCurrentTemp(weather.temperature);

  window.originalCurrentTempCelsius = weather.temperature;
  updateCurrentTemp(weather.temperature);
}

function displayForecast(daily) {
  const forecastContainer = document.getElementById("dailyForecast");
  forecastContainer.innerHTML = ""; // Limpa a previsão anterior

  // Converte as datas para o dia da semana
  const dateOptions = { weekday: "short" };
  const today = new Date();

  // Exibe a previsão para os próximos 5 dias
  for (let i = 1; i <= 5; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    const dayName = day.toLocaleDateString("pt-BR", dateOptions);
    const weathercode = daily.weathercode[i];
    const iconClass = weatherIcons[weathercode] || "fa-cloud-question";

    const forecastCard = document.createElement("div");
    forecastCard.className = "forecast-card";
    forecastCard.innerHTML = `
      <h4>${dayName}</h4>
      <i class="fa-solid ${iconClass} forecast-icon"></i>
      <p><span class="temp-max" id="maxTemp-${i}"></span> / <span class="temp-min" id="minTemp-${i}"></span></p>
    `;
    forecastContainer.appendChild(forecastCard);
  }

  updateTemperatures(); // Atualiza as temperaturas com a unidade correta
}

function convertTemperature(temp, toFahrenheit) {
  if (toFahrenheit) {
    // Fórmula: (°C × 9/5) + 32 = °F
    return (temp * 9) / 5 + 32;
  } else {
    // Fórmula: (°F - 32) × 5/9 = °C
    return (temp - 32) * 5 / 9;
  }
}

function updateCurrentTemp(tempCelsius) {
  const currentTemp = document.getElementById("temperature");
  let displayTemp = isCelsius ? tempCelsius : convertTemperature(tempCelsius, true);
  currentTemp.textContent = `${displayTemp.toFixed(1)}°${isCelsius ? "C" : "F"}`;
}

function updateTemperatures() {
  const currentTempElement = document.getElementById("temperature");
  // Precisamos obter o valor da temperatura como um número, não como string formatada
  // Vamos assumir que o valor original (em Celsius) está armazenado ou pode ser recuperado
  // Uma maneira mais robusta é guardar o valor em Celsius original em uma variável global

  // --- SOLUÇÃO RECOMENDADA: Guardar o valor em Celsius original ---
  if (typeof window.originalCurrentTempCelsius === 'undefined') {
      // Se ainda não foi definido, pegue do elemento e armazene
      // Isso pode acontecer se o usuário alternar antes de ter dados
      const tempStr = currentTempElement.textContent.replace(/[^0-9.-]/g, ''); // Remove caracteres não numéricos
      if (tempStr) {
          window.originalCurrentTempCelsius = parseFloat(tempStr);
      } else {
          window.originalCurrentTempCelsius = 0; // Valor padrão caso não haja temperatura
      }
  }
  // --- FIM SOLUÇÃO RECOMENDADA ---


  let tempToDisplay;
  if (isCelsius) {
    tempToDisplay = window.originalCurrentTempCelsius;
  } else {
    tempToDisplay = convertTemperature(window.originalCurrentTempCelsius, true);
  }

  currentTempElement.textContent = `${tempToDisplay.toFixed(1)}°${isCelsius ? "C" : "F"}`;


  // Update forecast temperatures
  if (window.weatherData && window.weatherData.daily) {
    for (let i = 1; i <= 5; i++) {
      const maxTempElement = document.getElementById(`maxTemp-${i}`);
      const minTempElement = document.getElementById(`minTemp-${i}`);

      let maxTempCelsius = window.weatherData.daily.temperature_2m_max[i];
      let minTempCelsius = window.weatherData.daily.temperature_2m_min[i];

      let maxTempToDisplay = isCelsius ? maxTempCelsius : convertTemperature(maxTempCelsius, true);
      let minTempToDisplay = isCelsius ? minTempCelsius : convertTemperature(minTempCelsius, true);

      maxTempElement.textContent = `${maxTempToDisplay.toFixed(1)}°`;
      minTempElement.textContent = `${minTempToDisplay.toFixed(1)}°`;
    }
  }
}

function showError(message) {
  const weatherContainer = document.getElementById("weatherContainer");
  const dailyForecastContainer = document.getElementById("dailyForecast");
  weatherContainer.style.display = "none";
  dailyForecastContainer.innerHTML = "";
  const errorPara = document.getElementById("errorMessage");
  errorPara.textContent = message;
}
