let startTime;
let timerInterval;
let watchId;
let lastPosition = null;
let totalDistance = 0;

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const timeDisplay = document.getElementById("time");

startBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("GPS wird von deinem Browser nicht unterstützt");
    return;
  }

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
  startBtn.disabled = false;
  stopBtn.disabled = true;
});

function updateTime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  timeDisplay.textContent = `Zeit: ${seconds} Sekunden | Distanz: ${totalDistance.toFixed(2)} km`;
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

