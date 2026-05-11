// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const startPauseBtn = document.getElementById('btn-start-pause');
const lapResetBtn = document.getElementById('btn-lap-reset');
const lapsList = document.getElementById('laps-list');
const startPauseText = document.getElementById('start-pause-text');
const iconPlay = document.querySelector('.icon-play');
const iconPause = document.querySelector('.icon-pause');
const currentLapDisplay = document.getElementById('current-lap-display');

// Stopwatch State
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let laps = [];
let lastLapTime = 0;

// Format time utility
function formatTime(time) {
  const date = new Date(time);
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
  return { minutes, seconds, milliseconds };
}

// Update display
function updateDisplay(time) {
  const { minutes, seconds, milliseconds } = formatTime(time);
  minutesDisplay.textContent = minutes;
  secondsDisplay.textContent = seconds;
  millisecondsDisplay.textContent = milliseconds;
}

// Main loop
function updateStopwatch() {
  const currentTime = Date.now();
  elapsedTime = currentTime - startTime;
  updateDisplay(elapsedTime);
  timerInterval = requestAnimationFrame(updateStopwatch);
}

// Start / Pause
function toggleStartPause() {
  if (isRunning) {
    // Pause
    cancelAnimationFrame(timerInterval);
    isRunning = false;
    startPauseBtn.classList.remove('pause');
    startPauseText.textContent = 'Start';
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
    lapResetBtn.textContent = 'Reset';
    currentLapDisplay.classList.remove('visible');
  } else {
    // Start
    startTime = Date.now() - elapsedTime;
    timerInterval = requestAnimationFrame(updateStopwatch);
    isRunning = true;
    startPauseBtn.classList.add('pause');
    startPauseText.textContent = 'Pause';
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
    lapResetBtn.textContent = 'Lap';
    lapResetBtn.disabled = false;
    currentLapDisplay.textContent = `Lap ${laps.length + 1}`;
    currentLapDisplay.classList.add('visible');
  }
}

// Lap / Reset
function handleLapReset() {
  if (isRunning) {
    // Lap
    const currentTotalTime = elapsedTime;
    const lapTime = currentTotalTime - lastLapTime;
    lastLapTime = currentTotalTime;
    
    laps.unshift({ lapTime, totalTime: currentTotalTime });
    renderLaps();
    currentLapDisplay.textContent = `Lap ${laps.length + 1}`;
  } else {
    // Reset
    elapsedTime = 0;
    lastLapTime = 0;
    laps = [];
    updateDisplay(0);
    renderLaps();
    lapResetBtn.disabled = true;
    lapResetBtn.textContent = 'Lap';
    currentLapDisplay.classList.remove('visible');
  }
}

// Render Laps
function renderLaps() {
  lapsList.innerHTML = '';
  
  if (laps.length === 0) return;
  
  // Find best and worst laps if there are more than 1 lap
  let bestLapIndex = -1;
  let worstLapIndex = -1;
  
  if (laps.length > 1) {
    let minLap = Infinity;
    let maxLap = -1;
    
    laps.forEach((lap, i) => {
      if (lap.lapTime < minLap) { minLap = lap.lapTime; bestLapIndex = i; }
      if (lap.lapTime > maxLap) { maxLap = lap.lapTime; worstLapIndex = i; }
    });
  }

  laps.forEach((lap, index) => {
    const lapNumber = laps.length - index;
    const formattedLapTime = formatTime(lap.lapTime);
    const formattedTotalTime = formatTime(lap.totalTime);
    
    const li = document.createElement('li');
    li.className = 'lap-item';
    
    if (index === bestLapIndex) li.classList.add('best-lap');
    if (index === worstLapIndex) li.classList.add('worst-lap');
    
    li.innerHTML = `
      <span>Lap ${lapNumber}</span>
      <span>${formattedLapTime.minutes}:${formattedLapTime.seconds}.${formattedLapTime.milliseconds}</span>
      <span>${formattedTotalTime.minutes}:${formattedTotalTime.seconds}.${formattedTotalTime.milliseconds}</span>
    `;
    
    lapsList.appendChild(li);
  });
}

// Event Listeners
startPauseBtn.addEventListener('click', toggleStartPause);
lapResetBtn.addEventListener('click', handleLapReset);

// Initialize
updateDisplay(0);
lapResetBtn.disabled = true;
