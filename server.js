const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = process.env.PORT || 7000; // z. B. Glitch liefert den Port

// CORS aktivieren – alle Origins erlauben
app.use(cors({ origin: '*' }));
app.options('*', cors());

// Middleware zum Verarbeiten von JSON- und URLencoded-Daten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien (z.B. index.html) bereitstellen
app.use(express.static(__dirname));

// Verbindung zur SQLite-Datenbank herstellen
// In Docker: persistente Datenbank im data Volume
const dbPath = process.env.NODE_ENV === 'production' ? './data/bookings.db' : './bookings.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Fehler beim Verbinden mit der Datenbank:', err.message);
  } else {
    console.log(`Verbunden mit der SQLite-Datenbank: ${dbPath}`);
  }
});

// Tabelle "bookings" erstellen, falls sie nicht existiert
db.run(`CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roomId TEXT,
  name TEXT,
  startDate TEXT,
  endDate TEXT
)`);

// API-Endpunkt: Alle Buchungen abrufen
app.get('/bookings', (req, res) => {
  db.all("SELECT * FROM bookings", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API-Endpunkt: Neue Buchung speichern
app.post('/bookings', (req, res) => {
  const { roomId, name, startDate, endDate } = req.body;
  const sql = `INSERT INTO bookings (roomId, name, startDate, endDate) VALUES (?, ?, ?, ?)`;
  db.run(sql, [roomId, name, startDate, endDate], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// API-Endpunkt: Buchung vollständig löschen
app.delete('/bookings/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM bookings WHERE id = ?`;
  db.run(sql, id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deletedID: id });
  });
});

/*
Neuer Endpunkt: Buchung aufteilen (split)
Erwartet im Request-Body ein JSON-Objekt mit einem Array "deleteDates", z.B.:
{
  "deleteDates": ["2025-04-14", "2025-04-15"]
}
Logik:
  - Fall 1: Alle Tage löschen → komplette Buchung löschen.
  - Fall 2: deleteDates bildet ein zusammenhängendes Segment am Anfang → neues Startdatum setzen.
  - Fall 3: Segment am Ende → neues Enddatum setzen.
  - Fall 4: Löschen in der Mitte → Aufspaltung in zwei Buchungen.
*/
app.post('/bookings/:id/split', (req, res) => {
  const id = req.params.id;
  const { deleteDates } = req.body;
  if (!deleteDates || !Array.isArray(deleteDates) || deleteDates.length === 0) {
    res.status(400).json({ error: "deleteDates muss ein Array mit mindestens einem Datum sein." });
    return;
  }
  
  // Bestehende Buchung laden
  const selectSql = `SELECT * FROM bookings WHERE id = ?`;
  db.get(selectSql, [id], (err, booking) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!booking) {
      res.status(404).json({ error: "Buchung nicht gefunden." });
      return;
    }
    
    // Alle Tage der Buchung ermitteln
    let start = new Date(booking.startDate);
    let end = new Date(booking.endDate);
    let allDates = [];
    let d = new Date(start);
    while (d <= end) {
      let year = d.getFullYear();
      let month = String(d.getMonth() + 1).padStart(2, '0');
      let day = String(d.getDate()).padStart(2, '0');
      allDates.push(`${year}-${month}-${day}`);
      d.setDate(d.getDate() + 1);
    }
    
    deleteDates.sort();
    
    // Fall 1: Alle Tage löschen → komplette Buchung löschen
    if (deleteDates.length === allDates.length) {
      const deleteSql = `DELETE FROM bookings WHERE id = ?`;
      db.run(deleteSql, id, function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: "Buchung vollständig gelöscht." });
      });
      return;
    }
    
    const firstDelete = deleteDates[0];
    const lastDelete = deleteDates[deleteDates.length - 1];
    
    // Fall 2: Segment am Anfang
    if (allDates[0] === firstDelete) {
      let count = 0;
      for (let date of allDates) {
        if (deleteDates.includes(date)) {
          count++;
        } else {
          break;
        }
      }
      if (count === deleteDates.length) {
        let newStart = new Date(deleteDates[deleteDates.length - 1]);
        newStart.setDate(newStart.getDate() + 1);
        const updatedBooking = {
          ...booking,
          startDate: `${newStart.getFullYear()}-${String(newStart.getMonth()+1).padStart(2,'0')}-${String(newStart.getDate()).padStart(2,'0')}`
        };
        db.serialize(() => {
          db.run(`DELETE FROM bookings WHERE id = ?`, id, function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            db.run(
              `INSERT INTO bookings (roomId, name, startDate, endDate) VALUES (?, ?, ?, ?)`,
              [updatedBooking.roomId, updatedBooking.name, updatedBooking.startDate, updatedBooking.endDate],
              function(err) {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                res.json({ message: "Buchung aktualisiert (Anfang entfernt)." });
              }
            );
          });
        });
        return;
      }
    }
    
    // Fall 3: Segment am Ende
    if (allDates[allDates.length - 1] === lastDelete) {
      let count = 0;
      for (let i = allDates.length - 1; i >= 0; i--) {
        if (deleteDates.includes(allDates[i])) {
          count++;
        } else {
          break;
        }
      }
      if (count === deleteDates.length) {
        let newEnd = new Date(lastDelete);
        newEnd.setDate(newEnd.getDate() - 1);
        const updatedBooking = {
          ...booking,
          endDate: `${newEnd.getFullYear()}-${String(newEnd.getMonth()+1).padStart(2,'0')}-${String(newEnd.getDate()).padStart(2,'0')}`
        };
        db.serialize(() => {
          db.run(`DELETE FROM bookings WHERE id = ?`, id, function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            db.run(
              `INSERT INTO bookings (roomId, name, startDate, endDate) VALUES (?, ?, ?, ?)`,
              [updatedBooking.roomId, updatedBooking.name, updatedBooking.startDate, updatedBooking.endDate],
              function(err) {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                res.json({ message: "Buchung aktualisiert (Ende entfernt)." });
              }
            );
          });
        });
        return;
      }
    }
    
    // Fall 4: DeleteDates liegen in der Mitte – Aufspaltung in zwei Buchungen
    const firstIndex = allDates.indexOf(firstDelete);
    const lastIndex = allDates.indexOf(lastDelete);
    const expectedSegment = allDates.slice(firstIndex, lastIndex + 1);
    if (JSON.stringify(expectedSegment) !== JSON.stringify(deleteDates)) {
      res.status(400).json({ error: "Die zu löschenden Tage müssen zusammenhängend sein." });
      return;
    }
    
    let bookingsToInsert = [];
    if (firstIndex > 0) {
      let newEnd = new Date(allDates[firstIndex]);
      newEnd.setDate(newEnd.getDate() - 1);
      bookingsToInsert.push({
        roomId: booking.roomId,
        name: booking.name,
        startDate: booking.startDate,
        endDate: `${newEnd.getFullYear()}-${String(newEnd.getMonth()+1).padStart(2,'0')}-${String(newEnd.getDate()).padStart(2,'0')}`
      });
    }
    if (lastIndex < allDates.length - 1) {
      let newStart = new Date(allDates[lastIndex]);
      newStart.setDate(newStart.getDate() + 1);
      bookingsToInsert.push({
        roomId: booking.roomId,
        name: booking.name,
        startDate: `${newStart.getFullYear()}-${String(newStart.getMonth()+1).padStart(2,'0')}-${String(newStart.getDate()).padStart(2,'0')}`,
        endDate: booking.endDate
      });
    }
    
    if (bookingsToInsert.length === 0) {
      res.status(400).json({ error: "Nach der Löschung würden keine Buchungszeiträume übrig bleiben." });
      return;
    }
    
    db.serialize(() => {
      db.run(`DELETE FROM bookings WHERE id = ?`, id, function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        let inserted = 0;
        bookingsToInsert.forEach(bk => {
          db.run(
            `INSERT INTO bookings (roomId, name, startDate, endDate) VALUES (?, ?, ?, ?)`,
            [bk.roomId, bk.name, bk.startDate, bk.endDate],
            function(err) {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              inserted++;
              if (inserted === bookingsToInsert.length) {
                res.json({ message: "Buchung erfolgreich aufgeteilt." });
              }
            }
          );
        });
      });
    });
  });
});

// Root-URL liefert index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
