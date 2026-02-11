const cors = require("cors");
const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔽 HIER MUSS /runs EXISTIEREN
app.get("/runs", (req, res) => {
  db.all("SELECT * FROM runs ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/runs", (req, res) => {
  const { name, date, durationSeconds, distanceKm, pace } = req.body;

  if (
  !name ||
  !date ||
  durationSeconds == null ||
  distanceKm == null ||
  !pace
) {
  return res.status(400).json({ error: "Ungültige Daten" });
}


  const sql = `
    INSERT INTO runs (name, date, durationSeconds, distanceKm, pace)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, date, durationSeconds, distanceKm, pace], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});

