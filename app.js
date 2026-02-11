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

stopBtn.addEventListener("click", async () => {
  clearInterval(timerInterval);
  navigator.geolocation.clearWatch(watchId);

  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);

  let paceText = "—";
  if (totalDistance > 0) {
    const paceSecondsPerKm = totalSeconds / totalDistance;
    const paceMinutes = Math.floor(paceSecondsPerKm / 60);
    const paceSeconds = Math.floor(paceSecondsPerKm % 60);

    paceText =
      String(paceMinutes).padStart(2, "0") +
      ":" +
      String(paceSeconds).padStart(2, "0");
  }

  const run = {
    name: runnerName,
    date: new Date().toISOString(),
    durationSeconds: totalSeconds,
    distanceKm: Number(totalDistance.toFixed(2)),
    pace: paceText
  };

  await saveRun(run);
  await loadRuns();


  document.getElementById("currentRunner").textContent =
    `Lauf gespeichert für: ${runnerName}`;

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

if (totalDistance >= 0.01) {
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

async function getSavedRuns() {
  const response = await fetch("http://localhost:3000/runs");

  if (!response.ok) {
    throw new Error("Fehler beim Laden der Läufe");
  }

  return await response.json();
}

async function saveRun(run) {
  try {
    const response = await fetch("http://localhost:3000/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(run)
    });

    if (!response.ok) {
      throw new Error("Fehler beim Speichern");
    }

    await response.json();
  } catch (error) {
    console.error("Fehler:", error);
  }
}

async function renderRunsTable() {
  const runs = await getSavedRuns();

  const tableBody = document.getElementById("runsTableBody");
  tableBody.innerHTML = "";

  runs.forEach(run => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${run.name}</td>
      <td>${new Date(run.date).toLocaleDateString()}</td>
      <td>${formatDuration(run.durationSeconds)}</td>
      <td>${run.distanceKm.toFixed(2)}</td>
      <td>${run.pace}</td>
    `;

    tableBody.appendChild(row);
  });
}


function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0")
  );
}

function formatPace(secondsPerKm) {
  if (!isFinite(secondsPerKm)) return "—";

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);

  return (
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0") + " min/km"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  renderRunsTable();
  renderPodium();

  document.getElementById("podiumMode")
  .addEventListener("change", renderPodium);
});


renderRunsTable();

async function renderPodium() {
  const runs = await getSavedRuns();
  const mode = document.getElementById("podiumMode").value;

  if (runs.length === 0) {
    return;
  }

  document.getElementById("top10").innerHTML = "";

  const statsByRunner = {};

  runs.forEach(run => {
    if (!statsByRunner[run.name]) {
      statsByRunner[run.name] = {
        totalDistance: 0,
        runCount: 0,
        totalSeconds: 0
      };
    }

    statsByRunner[run.name].totalDistance += run.distanceKm;
    statsByRunner[run.name].runCount += 1;
    statsByRunner[run.name].totalSeconds += run.durationSeconds;
  });

  let ranking = [];

  if (mode === "distance") {
    ranking = Object.entries(statsByRunner)
      .map(([name, s]) => ({
        name,
        value: s.totalDistance,
        label: `${s.totalDistance.toFixed(2)} km`
      }))
      .sort((a, b) => b.value - a.value);
  }

  if (mode === "count") {
    ranking = Object.entries(statsByRunner)
      .map(([name, s]) => ({
        name,
        value: s.runCount,
        label: `${s.runCount} Läufe`
      }))
      .sort((a, b) => b.value - a.value);
  }

  if (mode === "pace") {
    ranking = Object.entries(statsByRunner)
      .map(([name, s]) => {
        const avgSecondsPerKm = s.totalSeconds / s.totalDistance;
        return {
          name,
          value: avgSecondsPerKm,
          label: formatPace(avgSecondsPerKm)
        };
      })
      .sort((a, b) => a.value - b.value); // niedrigere Pace = besser
  }

  const podiumItems = document.querySelectorAll("#podium li");

  podiumItems.forEach((item, index) => {
  const place = index + 1;
  const medal = ["🥇", "🥈", "🥉"][index];

  if (ranking[index]) {
    item.textContent =
      `${medal} ${place}. ${ranking[index].name} – ${ranking[index].label}`;
  } else {
    item.textContent = `${medal} ${place}. —`;
  }
});
renderTop10(ranking);
}

function renderTop10(ranking) {
  const top10List = document.getElementById("top10");
  top10List.innerHTML = "";

  ranking.slice(3, 10).forEach((entry, index) => {
    const li = document.createElement("li");
    const place = index + 4;

    li.textContent = `${place}. ${entry.name} – ${entry.label}`;
    top10List.appendChild(li);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await renderRunsTable();
  await renderPodium();
});

async function loadRuns() {
  try {
    const response = await fetch("http://localhost:3000/runs");
    const runs = await response.json();

    renderRunsTable(runs);
    renderPodium(runs);
  } catch (error) {
    console.error("Fehler beim Laden der Läufe:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadRuns();
});

