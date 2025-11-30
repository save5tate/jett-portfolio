

const NAME_KEY = 'jf_name';
const VISIT_KEY = 'jf_last_visit';

document.addEventListener('DOMContentLoaded', () => {
  
  document.getElementById('year')?.textContent = new Date().getFullYear();
  document.getElementById('year2')?.textContent = new Date().getFullYear();

  
  const nameForm = document.getElementById('nameForm');
  const nameInput = document.getElementById('nameInput');
  const welcomeEl = document.getElementById('welcome');
  const lastVisitEl = document.getElementById('lastVisit');

  
  const savedName = localStorage.getItem(NAME_KEY);
  const lastVisit = localStorage.getItem(VISIT_KEY);

  if (savedName) {
    nameInput.value = savedName;
  }

  if (lastVisit && lastVisitEl) {
    lastVisitEl.textContent = `Btw, you last visited on ${lastVisit}`;
  }

  
  nameForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = nameInput.value?.trim();
    if (!val) {
      // show small hint
      welcomeEl.textContent = 'Please enter a name.';
      return;
    }
    localStorage.setItem(NAME_KEY, val);
    updateGreeting(val);
  });

  
  let weatherCache = { desc: 'loading...' };

  
  async function loadWeather() {
    try {
      const resp = await fetch('https://api.open-meteo.com/v1/forecast?latitude=42.3314&longitude=-83.0458&current_weather=true');
      const data = await resp.json();
      const code = data?.current_weather?.weathercode;
      weatherCache.desc = mapWeatherCodeToDescription(code);
    } catch (err) {
      weatherCache.desc = 'unavailable';
      console.error('Weather fetch error', err);
    }
  }
  loadWeather();
  setInterval(loadWeather, 10 * 60 * 1000); // refresh every 10 minutes

  function getCurrentEST() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: true });
    const date = now.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
    const hour = Number(now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }));
    return { time, date, hour };
  }

  function greetingForHour(h) {
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function updateGreeting(nameOverride) {
    const name = nameOverride || localStorage.getItem(NAME_KEY) || '';
    const { time, date, hour } = getCurrentEST();
    const greet = greetingForHour(hour);
    const weatherDesc = weatherCache.desc || 'unknown';
    if (name) {
      welcomeEl.textContent = `${greet} ${name}! It's ${time} EST on ${date}, and it's ${weatherDesc} right now.`;
    } else {
      welcomeEl.textContent = `${greet}! It's ${time} EST on ${date}, and it's ${weatherDesc} right now.`;
    }
  }

  // Update time every second and greeting
  updateGreeting();
  setInterval(() => {
    updateGreeting();
  }, 1000);

  
  // We update on load with previous value. Set new last visit now for next time.
  const nowEST = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  localStorage.setItem(VISIT_KEY, nowEST);
});


function mapWeatherCodeToDescription(code) {
  const weatherDescriptions = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    56: 'light freezing drizzle',
    57: 'dense freezing drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    66: 'light freezing rain',
    67: 'heavy freezing rain',
    71: 'slight snow fall',
    73: 'moderate snow fall',
    75: 'heavy snow fall',
    77: 'snow grains',
    80: 'slight rain showers',
    81: 'moderate rain showers',
    82: 'violent rain showers',
    85: 'slight snow showers',
    86: 'heavy snow showers',
    95: 'thunderstorm',
    96: 'thunderstorm with slight hail',
    99: 'thunderstorm with heavy hail'
  };
  return weatherDescriptions[code] || 'unknown';
}
