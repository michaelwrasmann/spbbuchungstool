# SPB Desksharing/Buchungstool 🏢

Ein modernes Raumbuchungstool mit Glassmorphism-Design für Desksharing und Raumverwaltung.

## ✨ Features

- **Modern Glassmorphism UI** mit Dark Mode und Neon-Akzenten
- **Responsive Design** für Desktop und Mobile
- **Echtzeitbuchungen** mit SQLite Datenbank
- **Visuelle Raumauswahl** mit SVG-Grafiken
- **Buchungsaufteilung** - einzelne Tage löschen
- **Docker Support** für einfaches Deployment

## 🚀 Quick Start mit Docker

### Voraussetzungen
- Docker und Docker Compose installiert
- Git

### 1. Repository klonen
```bash
git clone https://github.com/michaelwrasmann/spbbuchungstool.git
cd spbbuchungstool
```

### 2. Docker Container starten
```bash
# Einfacher Start
docker-compose up -d

# Mit Build (falls Änderungen vorgenommen wurden)
docker-compose up --build -d

# Logs anzeigen
docker-compose logs -f
```

### 3. Anwendung öffnen
Öffne `http://localhost:7002` in deinem Browser.

## 🛠️ Lokale Entwicklung

### Voraussetzungen
- Node.js 18+ 
- npm

### Installation
```bash
# Dependencies installieren
npm install

# Server starten
npm start
```

Die Anwendung läuft dann auf `http://localhost:7002`.

## 🐳 Docker Commands

```bash
# Container stoppen
docker-compose down

# Container und Volumes löschen (⚠️ Daten gehen verloren!)
docker-compose down -v

# Nur die App ohne nginx
docker-compose up spb-buchungstool

# Production Mode mit nginx
docker-compose --profile production up

# Container neu bauen
docker-compose build

# Container Status prüfen
docker-compose ps
```

## 📊 Datenbank

- **SQLite** Datenbank in `./data/bookings.db` (Docker) oder `./bookings.db` (lokal)
- **Persistente Daten** durch Docker Volume
- **Automatische Tabellenerstellung** beim ersten Start

### Datenbankstruktur
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roomId TEXT,      -- z.B. "1.30", "1.40-1"
  name TEXT,        -- Name der Person  
  startDate TEXT,   -- Start-Datum (YYYY-MM-DD)
  endDate TEXT      -- End-Datum (YYYY-MM-DD)
);
```

## 🏗️ Architektur

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Container**: Docker + Alpine Linux
- **Proxy**: Optional Nginx (Production)

## 🎨 Design

Das moderne Glassmorphism-Design verwendet:
- **Backdrop-filter blur** für Glaseffekte
- **CSS Custom Properties** für konsistente Farben
- **CSS Animations** für smooth Übergänge
- **SVG Gradients** für die Raumdarstellung
- **Responsive Grid Layout**

## 📝 API Endpoints

- `GET /bookings` - Alle Buchungen abrufen
- `POST /bookings` - Neue Buchung erstellen  
- `DELETE /bookings/:id` - Buchung löschen
- `POST /bookings/:id/split` - Buchung aufteilen

## 🔧 Konfiguration

### Umgebungsvariablen
- `PORT` - Server Port (default: 7002)
- `NODE_ENV` - Environment (development/production)

### Docker Volumes
- `./data` - Persistente SQLite Datenbank
- `./nginx.conf` - Nginx Konfiguration (optional)

## 🚦 Deployment auf Ubuntu Server

```bash
# 1. Docker installieren (falls nicht vorhanden)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Repository klonen
git clone https://github.com/michaelwrasmann/spbbuchungstool.git
cd spbbuchungstool

# 3. Data-Verzeichnis erstellen
mkdir -p data

# 4. Container starten
docker-compose up -d

# 5. Firewall konfigurieren (falls erforderlich)
sudo ufw allow 7002
```

## 🔒 Sicherheit

- Container läuft als **non-root user**
- Persistente Datenbank außerhalb des Containers
- **Healthcheck** für Container-Monitoring
- Optional: nginx Reverse Proxy mit SSL

## 📞 Support

Bei Fragen oder Problemen:
1. Logs prüfen: `docker-compose logs`
2. Container Status: `docker-compose ps`  
3. GitHub Issues erstellen

## 📄 License

MIT License - siehe LICENSE Datei für Details.