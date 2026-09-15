// --- WEATHER ICONS (hand-drawn, monochrome, currentColor) ---
const WEATHER_ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.3"/><rect x="11" y="1" width="2" height="4" rx="1"/><rect x="11" y="19" width="2" height="4" rx="1"/><rect x="1" y="11" width="4" height="2" rx="1"/><rect x="19" y="11" width="4" height="2" rx="1"/></svg>',
  cloudSun: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="3.2"/><rect x="7" y="1.5" width="2" height="3" rx="1"/><rect x="1.5" y="7" width="3" height="2" rx="1"/><g transform="translate(2,3)"><circle cx="9" cy="13" r="3.6"/><circle cx="13.5" cy="11" r="4.4"/><circle cx="17" cy="13.5" r="3"/><rect x="7" y="12.8" width="12" height="5.4" rx="2.7"/></g></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="13" r="4"/><circle cx="13" cy="10.5" r="5"/><circle cx="17" cy="13.5" r="3.3"/><rect x="6" y="12.5" width="13" height="6" rx="3"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8.5" r="3.4"/><circle cx="13" cy="6.5" r="4.2"/><circle cx="16.5" cy="9" r="3"/><rect x="6" y="8" width="13" height="5" rx="2.5"/><rect x="7.5" y="16" width="1.8" height="4.5" rx="0.9" transform="rotate(15 8.4 18.25)"/><rect x="12" y="16.5" width="1.8" height="4.5" rx="0.9" transform="rotate(15 12.9 18.75)"/><rect x="16" y="16" width="1.8" height="4.5" rx="0.9" transform="rotate(15 16.9 18.25)"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8.5" r="3.4"/><circle cx="13" cy="6.5" r="4.2"/><circle cx="16.5" cy="9" r="3"/><rect x="6" y="8" width="13" height="5" rx="2.5"/><circle cx="8.5" cy="18" r="1.3"/><circle cx="13" cy="19.5" r="1.3"/><circle cx="17" cy="18" r="1.3"/></svg>',
  storm: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="7.5" r="3.1"/><circle cx="13" cy="5.8" r="3.8"/><circle cx="16.3" cy="8" r="2.7"/><rect x="6" y="7.2" width="13" height="4.6" rx="2.3"/><polygon points="13.5,12 9,18.5 12.3,18.5 10.8,23 16.5,15.5 13,15.5"/></svg>'
};

function weatherIconFor(code) {
  if (code === 0) return WEATHER_ICONS.sun;
  if (code >= 1 && code <= 3) return WEATHER_ICONS.cloudSun;
  if (code >= 45 && code <= 48) return WEATHER_ICONS.cloud;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return WEATHER_ICONS.rain;
  if (code >= 71 && code <= 77) return WEATHER_ICONS.snow;
  if (code >= 95) return WEATHER_ICONS.storm;
  return WEATHER_ICONS.cloud;
}

// --- 0. WEATHER ---
async function fetchWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.6238&longitude=2.4296&current_weather=true');
    const data = await res.json();
    const temp = Math.round(data.current_weather.temperature);
    const code = data.current_weather.weathercode;

    document.getElementById('weather-icon').innerHTML = weatherIconFor(code);
    document.getElementById('weather-temp').innerText = `${temp}°`;
  } catch (e) {
    console.log("Weather fetch failed", e);
  }
}
fetchWeather();
setInterval(fetchWeather, 1800000);

// --- 1. CLOCKS ---
function updateClocks() {
  const now = new Date();

  // Greeting
  const hour = now.getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  document.getElementById('greeting').innerText = `${greeting}, Atta`;
  // Main Clock
  document.getElementById('time').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('date').innerText = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  // World Clocks updated for London and Lahore
  const options = { hour: '2-digit', minute: '2-digit', hour12: false };
  document.getElementById('time-lon').innerText = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'Europe/London' }).format(now);
  document.getElementById('time-lhe').innerText = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'Asia/Karachi' }).format(now);
}
setInterval(updateClocks, 1000);
updateClocks();

// --- 2. HACKER NEWS TICKER ---
let hnStories = [];
let hnIndex = 0;
async function fetchHN() {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = (await res.json()).slice(0, 10); // Get top 10

    hnStories = await Promise.all(ids.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
    ));
    rotateHN();
  } catch (e) {
    document.getElementById('hn-link').innerText = "Unable to fetch news.";
  }
}
function rotateHN() {
  if (hnStories.length === 0) return;
  const story = hnStories[hnIndex];
  const linkEl = document.getElementById('hn-link');
  linkEl.innerText = story.title;
  linkEl.href = story.url || `https://news.ycombinator.com/item?id=${story.id}`;

  hnIndex = (hnIndex + 1) % hnStories.length;
}
fetchHN();
setInterval(rotateHN, 8000); // Rotate every 8 seconds
setInterval(fetchHN, 1800000); // Fetch fresh news every 30 mins

// --- 3. AMBIENT AUDIO (timer removed — use Tomobar; transport removed — use boringnotch) ---
const player = document.getElementById('ambient-player');
let currentAudio = '';

const audioDetails = {
  'rain': 'Heavy Rain',
  'cafe': 'Coffee Shop',
  'forest': 'Woodland Stream'
};

function toggleAudio(id, url, volumeLevel) {
  const btnRain = document.getElementById('btn-rain');
  const btnCafe = document.getElementById('btn-cafe');
  const btnForest = document.getElementById('btn-forest');

  const ambientPanel = document.querySelector('.ambient-panel');
  const trackName = document.getElementById('track-name');

  // Reset all buttons
  btnRain.classList.remove('playing');
  btnCafe.classList.remove('playing');
  btnForest.classList.remove('playing');

  if (currentAudio === id) {
    player.pause();
    currentAudio = '';

    if (ambientPanel) {
      ambientPanel.classList.remove('playing');
      trackName.innerText = 'Not playing';
    }
  } else {
    player.src = url;
    player.volume = volumeLevel;
    player.play().catch(() => console.log('Audio playback prevented by browser'));
    document.getElementById(`btn-${id}`).classList.add('playing');
    currentAudio = id;

    if (ambientPanel) {
      ambientPanel.classList.add('playing');
      trackName.innerText = audioDetails[id];
    }
  }
}
window.toggleAudio = toggleAudio;

// --- 4. TOAST (shared by Reminders + Notes confirmations) ---
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// --- 5. TASKS (Standalone Local Storage) ---
function getLocalTasks() {
  const saved = localStorage.getItem('plash_tasks');
  return saved ? JSON.parse(saved) : [];
}

function saveLocalTasks(tasks) {
  localStorage.setItem('plash_tasks', JSON.stringify(tasks));
}

function renderTasks() {
  const ul = document.getElementById('task-list');
  ul.innerHTML = '';
  const tasks = getLocalTasks();
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.textContent = task;
    li.onclick = () => {
      removeTask(index);
    };
    ul.appendChild(li);
  });
}

function removeTask(index) {
  const tasks = getLocalTasks();
  tasks.splice(index, 1);
  saveLocalTasks(tasks);
  renderTasks();
}

window.addTask = function () {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (!text) return;
  
  const tasks = getLocalTasks();
  tasks.push(text);
  saveLocalTasks(tasks);
  renderTasks();
  
  input.value = '';
};

// Initial render
renderTasks();

window.handleTaskSubmit = function (e) {
  if (e.key === 'Enter') addTask();
};

// Notes functionality uses standalone localStorage logic below

// --- 6. TABS ---
window.switchTab = function (tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  document.getElementById(`btn-tab-${tabName}`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');
};

// Scratchpad stays as a local draft until it's sent to Notes
const pad = document.getElementById('scratchpad');
if (pad) {
  pad.value = localStorage.getItem('plash_scratchpad') || '';
  pad.addEventListener('input', () => {
    localStorage.setItem('plash_scratchpad', pad.value);
  });
}

// --- 7. FLASHCARDS ---
let flashcards = [];
let currentCardIndex = 0;
let isFlipped = false;

async function loadFlashcards() {
  try {
    if (typeof windowFlashcards !== 'undefined' && windowFlashcards.length > 0) {
      flashcards = [...windowFlashcards];
      // Shuffle the flashcards for randomness each reload
      flashcards = flashcards.sort(() => Math.random() - 0.5);
      updateFlashcardUI();
    } else {
      document.getElementById('french-word').innerText = "No cards found";
    }
  } catch (e) {
    console.error("Failed to load flashcards", e);
    document.getElementById('french-word').innerText = "Error loading";
  }
}

function updateFlashcardUI() {
  if (flashcards.length === 0) return;
  const card = flashcards[currentCardIndex];
  
  const cardEl = document.getElementById('french-card');
  cardEl.classList.remove('flipped');
  isFlipped = false;
  
  document.getElementById('french-word').innerText = card.front;
  document.getElementById('french-translation').innerText = card.back;
}

window.frenchFlip = function() {
  if (flashcards.length === 0) return;
  const cardEl = document.getElementById('french-card');
  if (isFlipped) {
    cardEl.classList.remove('flipped');
  } else {
    cardEl.classList.add('flipped');
  }
  isFlipped = !isFlipped;
};

window.frenchNext = function(e) {
  if (e) e.stopPropagation();
  if (flashcards.length === 0) return;
  
  let nextIndex;
  if (flashcards.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * flashcards.length);
    } while (nextIndex === currentCardIndex);
  } else {
    nextIndex = 0;
  }
  
  currentCardIndex = nextIndex;
  updateFlashcardUI();
};

window.frenchToggleKnown = function(e) {
  e.stopPropagation();
  showToast("Not synced to Anki");
};

// Initialize flashcards
loadFlashcards();
