// --- 1. CLOCKS ---
function updateClocks() {
  const now = new Date();
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
  if(hnStories.length === 0) return;
  const story = hnStories[hnIndex];
  const linkEl = document.getElementById('hn-link');
  linkEl.innerText = story.title;
  linkEl.href = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
  
  hnIndex = (hnIndex + 1) % hnStories.length;
}
fetchHN();
setInterval(rotateHN, 8000); // Rotate every 8 seconds
setInterval(fetchHN, 1800000); // Fetch fresh news every 30 mins

// --- 3. FOCUS TIMER ---
let timerInt;
let secondsLeft = 25 * 60;

function updateTimerDisplay() {
  const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const s = (secondsLeft % 60).toString().padStart(2, '0');
  document.getElementById('timer-display').innerText = `${m}:${s}`;
}

function startTimer(minutes) {
  clearInterval(timerInt);
  secondsLeft = minutes * 60;
  updateTimerDisplay();
  
  timerInt = setInterval(() => {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) {
      clearInterval(timerInt);
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
      audio.play().catch(() => console.log('Audio playback prevented by browser'));
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInt);
  secondsLeft = 25 * 60;
  updateTimerDisplay();
}

// --- 4. AMBIENT AUDIO ---
const player = document.getElementById('ambient-player');
let currentAudio = '';

function toggleAudio(id, url, volumeLevel) {
  const btnRain = document.getElementById('btn-rain');
  const btnCafe = document.getElementById('btn-cafe');
  const btnForest = document.getElementById('btn-forest');
  
  // Reset all buttons
  btnRain.classList.remove('playing');
  btnCafe.classList.remove('playing');
  btnForest.classList.remove('playing');

  if (currentAudio === id) {
    player.pause();
    currentAudio = '';
  } else {
    player.src = url;
    player.volume = volumeLevel; 
    player.play().catch(() => console.log('Audio playback prevented by browser'));
    document.getElementById(`btn-${id}`).classList.add('playing');
    currentAudio = id;
  }
}

// Make functions available globally for inline onclick handlers
window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.toggleAudio = toggleAudio;

// --- 5. HABIT TRACKER ---
function buildHabits() {
  const grid = document.getElementById('habit-grid');
  let habits = JSON.parse(localStorage.getItem('plash_habits')) || {};
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const cell = document.createElement('div');
    cell.className = 'habit-cell';
    cell.title = dateStr;
    
    if (habits[dateStr]) cell.classList.add('done');
    
    // Only allow clicking today's cell to prevent cheating!
    if (i === 0) {
      cell.onclick = () => {
        habits[dateStr] = !habits[dateStr];
        localStorage.setItem('plash_habits', JSON.stringify(habits));
        cell.classList.toggle('done');
      };
    } else {
      cell.style.cursor = 'default';
    }
    
    grid.appendChild(cell);
  }
}
buildHabits();

// --- 6. MINI CALENDAR ---
function buildCalendar() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const today = now.getDate();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  document.getElementById('cal-month-title').innerText = `${monthNames[currentMonth]} ${currentYear}`;

  const calGrid = document.getElementById('cal-days');
  calGrid.innerHTML = '';

  const dayHeaders = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  dayHeaders.forEach(d => {
    const span = document.createElement('div');
    span.className = 'cal-header';
    span.innerText = d;
    calGrid.appendChild(span);
  });

  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  firstDay = (firstDay === 0) ? 6 : firstDay - 1;

  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calGrid.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= totalDays; d++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day' + (d === today ? ' today' : '');
    dayDiv.innerText = d;
    calGrid.appendChild(dayDiv);
  }
}
buildCalendar();

// --- 7. SCRATCHPAD ---
const pad = document.getElementById('scratchpad');
if (pad) {
  pad.value = localStorage.getItem('plash_scratchpad') || '';
  pad.addEventListener('input', () => {
    localStorage.setItem('plash_scratchpad', pad.value);
  });
}
