const SERVER_URL = "https://lofi-weather-server.onrender.com"; // Render сервер
const apiKey = "ВСТАВЬ_СВОЙ_OPENWEATHER_API_KEY";

const player = document.getElementById("lofiPlayer");
const toggleBtn = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeControl");
const weatherDiv = document.getElementById("weather");

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

// --- userId ---
function getUserId() {
    let id = localStorage.getItem("userId");
    if (!id) {
        id = "user-" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("userId", id);
    }
    return id;
}

// --- сервер ---
async function saveLocationServer(id, lat, lon) {
    try {
        await fetch(`${SERVER_URL}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, lat, lon })
        });
    } catch (e) {
        console.error("Ошибка fetch сервера:", e);
    }
}

async function loadLocationServer(id) {
    try {
        const res = await fetch(`${SERVER_URL}/location/${id}`);
        if (res.ok) return await res.json();
        return null;
    } catch (e) {
        console.error("Ошибка fetch сервера:", e);
        return null;
    }
}

// --- погода ---
async function getWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ru&units=metric`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Ошибка запроса");
        return await res.json();
    } catch (err) {
        console.error("Не удалось получить погоду:", err);
        weatherDiv.innerText = "Ошибка загрузки погоды 😢";
        return null;
    }
}

// --- смена фона ---
function setTheme(weather) {
    const body = document.body;
    let background = "default.jpg";

    if (weather.includes("clear")) background = "clear.jpg";
    else if (weather.includes("cloud")) background = "clouds.jpg";
    else if (weather.includes("rain")) background = "rain.jpg";
    else if (weather.includes("snow")) background = "snow.jpg";

    body.style.background = `url('backgrounds/${background}') no-repeat center center/cover`;
    weatherDiv.innerText = `Погода: ${weather}`;
}

// --- инициализация ---
async function initWeather() {
    const id = getUserId();
    let saved = await loadLocationServer(id);

    if (saved) {
        const weatherData = await getWeather(saved.lat, saved.lon);
        if (weatherData) setTheme(weatherData.weather[0].main.toLowerCase());
    } else {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            await saveLocationServer(id, lat, lon);
            const weatherData = await getWeather(lat, lon);
            if (weatherData) setTheme(weatherData.weather[0].main.toLowerCase());
        }, () => {
            weatherDiv.innerText = "Геолокация отключена 🚫";
        });
    }
}

initWeather();
