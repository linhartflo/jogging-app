let startTime;
let timerInterval;
let watchId;
let lastPosition = null;
let totalDistance = 0;
let runnerName = "";


const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const timeDisplay = document.getElementById("time");

startBtn.addEventListener("click", () => {
  const nameInput = document.getElementById("runnerName");
  runnerName = nameInput.value.trim();

  if (runnerName === "") {
    alert("Bitte gib deinen Namen ein");
    return;
  }

  if (!navigator.geolocation) {
    alert("GPS wird von deinem Browser nicht unterstützt");
    return;
  }

  document.getElementById("currentRunner").textContent =
    `Läufer: ${runnerName}`;

  startTime = Date.now();
  totalDistance = 0;
  lastPosition = null;

  timerInterval = setInterval(updateTime, 1000);

  watchId = navigator.geolocation.watchPosition(
    handlePosition,
    handleError,
    { enableHighAccuracy: true }
  );

  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  navigator.geolocation.clearWatch(watchId);

  document.getElementById("currentRunner").textContent =
    `Lauf beendet für: ${runnerName}`;

  startBtn.disabled = false;
  stopBtn.disabled = true;
});

function updateTime() {
  const elapsedMs = Date.now() - startTime;
  const totalSeconds = Math.floor(elapsedMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime =
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");

  let paceText = "—";

  if (totalDistance > 0) {
    const paceSecondsPerKm = totalSeconds / totalDistance;
    const paceMinutes = Math.floor(paceSecondsPerKm / 60);
    const paceSeconds = Math.floor(paceSecondsPerKm % 60);

    paceText =
      String(paceMinutes).padStart(2, "0") + ":" +
      String(paceSeconds).padStart(2, "0");
  }

  timeDisplay.textContent =
    `Zeit: ${formattedTime} | Distanz: ${totalDistance.toFixed(2)} km | Pace: ${paceText} min/km`;
}


function handlePosition(position) {
  const { latitude, longitude } = position.coords;

  if (lastPosition) {
    const distance = calculateDistance(
      lastPosition.latitude,
      lastPosition.longitude,
      latitude,
      longitude
    );
    totalDistance += distance;
  }

  lastPosition = { latitude, longitude };
}

function handleError(error) {
  alert("GPS-Fehler: " + error.message);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Erdradius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

