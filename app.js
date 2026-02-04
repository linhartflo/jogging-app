let startTime;
let timerInterval;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const timeDisplay = document.getElementById("time");

startBtn.addEventListener("click", () => {
  startTime = Date.now();
  timerInterval = setInterval(updateTime, 1000);
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

function updateTime() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timeDisplay.textContent = `Zeit: ${elapsedSeconds} Sekunden`;
}
