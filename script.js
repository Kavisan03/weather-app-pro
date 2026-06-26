// 🛑 ඔබගේ අලුත් API Key එක මෙතන දාන්න (OpenWeatherMap එකෙන් අලුතින් හදාගන්න)
const API_KEY = '9b7aedec1e44e6e36542435098051b10'; 

const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('errorMsg');

// Elements
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weatherIcon');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const feelsLike = document.getElementById('feelsLike');
const bgOverlay = document.getElementById('bgOverlay');

// 🌤️ Main Function
async function getWeather() {
    const city = cityInput.value.trim();

    if (city === '') {
        showError('⚠️ කරුණාකර නගරයක් ඇතුළත් කරන්න!');
        return;
    }

    // Show loader, hide card, clear errors
    loader.style.display = 'block';
    weatherResult.classList.remove('show');
    errorMsg.textContent = '';

    // 🛠️ URL එක හරියටම Encoder කරමු (Spaces/Special characters handle කරන්න)
    const encodedCity = encodeURIComponent(city);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url, { mode: 'cors' }); // CORS mode එක පැහැදිලිව දාමු
        
        // 🚨 Response එක හරිදැයි පරීක්ෂා කරමු (උදා: 404, 401, 500)
        if (!response.ok) {
            // Response එක JSON නොවෙන්නත් පුළුවන්, ඒක handle කරමු
            let errorMessage = `HTTP Error: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMessage = errorData.message;
            } catch (e) {
                // JSON නැත්නම් text එක ගනිමු
                errorMessage = await response.text() || errorMessage;
            }
            throw new Error(`API Error (${response.status}): ${errorMessage}`);
        }

        const data = await response.json();

        // ✅ SUCCESS: Populate Data
        populateUI(data);

        // 🎨 Change Background based on weather
        changeBackground(data.weather[0].main);

        // Show card with animation
        loader.style.display = 'none';
        weatherResult.classList.add('show');
        errorMsg.textContent = ''; // Clear errors

    } catch (error) {
        // ❌ මෙතනදි තමයි ඔබට "අන්තර්ජාල" කියලා පෙන්නේ. දැන් හරියටම Error එක පෙන්වමු.
        console.error('Full Fetch Error:', error); // F12 Console එකේ බලන්න
        showError(`❌ දෝෂය: ${error.message || 'Unknown error'}. (Console එක බලන්න)`);
        loader.style.display = 'none';
    }
}

// 📊 Populate UI Elements
function populateUI(data) {
    const d = new Date();
    dateTime.textContent = d.toLocaleDateString('si-LK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = data.weather[0].description;
}

// 🎨 Dynamic Background Changer
function changeBackground(condition) {
    let gradient = '';
    switch (condition.toLowerCase()) {
        case 'clear': gradient = 'linear-gradient(135deg, #f7971e, #ffd200)'; break;
        case 'rain':
        case 'drizzle': gradient = 'linear-gradient(135deg, #1a2a6c, #4a00e0)'; break;
        case 'snow': gradient = 'linear-gradient(135deg, #e6e9f0, #b8c6db)'; break;
        case 'clouds': gradient = 'linear-gradient(135deg, #4b6cb7, #182848)'; break;
        case 'thunderstorm': gradient = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)'; break;
        case 'mist':
        case 'fog': gradient = 'linear-gradient(135deg, #606c88, #3f4c6b)'; break;
        default: gradient = 'linear-gradient(135deg, #1e3c72, #2a5298)';
    }
    document.body.style.background = gradient;
    bgOverlay.style.background = gradient;
}

// ❌ Show Error
function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.animation = 'none';
    void errorMsg.offsetWidth; // Re-trigger animation
    errorMsg.style.animation = 'shake 0.5s ease';
    weatherResult.classList.remove('show');
    loader.style.display = 'none';
}

// ⌨️ Enter Key Support
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeather();
});

// 🌅 Load Default City on Startup
window.onload = () => {
    cityInput.value = 'Colombo';
    getWeather();
};