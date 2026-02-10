const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "jogging.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Fehler beim Öffnen der DB:", err);
  } else {
    console.log("SQLite Datenbank verbunden");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      durationSeconds INTEGER NOT NULL,
      distanceKm REAL NOT NULL,
      pace TEXT NOT NULL
    )
  `);
});

module.exports = db;
