const apiKey = "67162415a67f255e6a86c4fc0cc080d4"; 
const SERVER_URL = "https://lofi-weather-server.onrender.com";

/* === Работа с userId === */
function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = "user-" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("userId", id);
  }
  return id;
}

/* === Работа с сервером === */
async function saveLocationServer(id, lat, lon) {
  await fetch(`${SERVER_URL}/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, lat, lon })
  });
}

async function loadLocationServer(id) {
  const res = await fetch(`${SERVER_URL}/location/${id}`);
  if (res.ok) return await res.json();
  return null;
}

/* === Работа с погодой === */
async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ru&units=metric`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Ошибка запроса");
    return await res.json();
  } catch (err) {
    console.error("Не удалось получить погоду:", err);
    document.getElementById("weather").innerText = "Ошибка загрузки погоды 😢";
    return null;
  }
}

/* === Смена фона === */
function setTheme(weather) {
  const body = document.body;
  const weatherText = document.getElementById("weather");
  let background = "default.jpg";

  if (weather.includes("clear")) background = "clear.jpg";
  else if (weather.includes("cloud")) background = "clouds.jpg";
  else if (weather.includes("rain")) background = "rain.jpg";
  else if (weather.includes("snow")) background = "snow.jpg";

  body.style.background = `url('backgrounds/${background}') no-repeat center center/cover`;
  weatherText.innerText = `Погода: ${weather}`;
}

/* === Музыка === */
const player = document.getElementById("lofiPlayer");
const toggleBtn = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeControl");

player.volume = 0.2;

toggleBtn.addEventListener("click", () => {
  if (player.paused) {
    player.play();
    toggleBtn.innerText = "⏸ Выключить";
  } else {
    player.pause();
    toggleBtn.innerText = "▶ Включить";
  }
});

volumeSlider.addEventListener("input", (e) => {
  player.volume = e.target.value;
});

/* === Запуск === */
async function initWeather() {
  const id = getUserId();
  const saved = await loadLocationServer(id);

  if (saved) {
    console.log("Используем сохранённую локацию:", saved);
    const weatherData = await getWeather(saved.lat, saved.lon);
    if (weatherData) {
      setTheme(weatherData.weather[0].main.toLowerCase());
    }
  } else {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      await saveLocationServer(id, lat, lon);
      const weatherData = await getWeather(lat, lon);
      if (weatherData) {
        setTheme(weatherData.weather[0].main.toLowerCase());
      }
    }, () => {
      document.getElementById("weather").innerText = "Геолокация отключена 🚫";
    });
  }
}

initWeather();
