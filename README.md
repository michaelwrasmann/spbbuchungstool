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
- OpenSSL (für SSL Zertifikate)

### 1. Repository klonen
```bash
git clone https://github.com/michaelwrasmann/spbbuchungstool.git
cd spbbuchungstool
```

### 2. Deployment-Optionen

#### Option A: Einfacher Start (HTTP)
```bash
# Nur die App starten (Port 7000)
docker-compose up spb-buchungstool -d

# Zugriff: http://localhost:7000
```

#### Option B: Production mit SSL (HTTPS) 🔐
```bash
# 1. SSL Zertifikat generieren
./generate-ssl.sh

# 2. Container mit nginx + SSL starten
docker-compose --profile ssl up -d

# 3. Zugriff über HTTPS
# https://localhost (Port 443)
# https://server-ip (von anderen Rechnern)
```

### 3. Anwendung öffnen
- **HTTP**: `http://localhost:7000`
- **HTTPS**: `https://localhost` oder `https://server-ip`

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

Die Anwendung läuft dann auf `http://localhost:7000`.

## 🐳 Docker Commands

```bash
# Container stoppen
docker-compose down

# Container mit SSL stoppen
docker-compose --profile ssl down

# Container und Volumes löschen (⚠️ Daten gehen verloren!)
docker-compose down -v

# Verschiedene Deployment Modi:
docker-compose up spb-buchungstool -d        # Nur App (HTTP)
docker-compose --profile ssl up -d           # App + nginx + SSL
docker-compose --profile production up -d    # App + nginx (HTTP)

# Container neu bauen
docker-compose build

# Container Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs -f
docker-compose logs nginx  # Nur nginx logs
```

## 🔐 SSL Konfiguration

### Selbst-signiertes Zertifikat
```bash
# SSL Zertifikat generieren
./generate-ssl.sh

# Server IP eingeben (z.B. 192.168.1.100)
# Zertifikate werden in ./ssl/ erstellt
```

### Browser SSL-Warnung
Da selbst-signierte Zertifikate verwendet werden:
1. Browser zeigt Sicherheitswarnung
2. Klicken Sie "Erweitert"
3. Klicken Sie "Weiter zu [server-ip]"
4. Zertifikat wird dauerhaft akzeptiert

### Externes Zugriff (andere Rechner)
```bash
# 1. SSL Zertifikat mit Server-IP generieren
./generate-ssl.sh  # Server-IP eingeben: 192.168.1.100

# 2. Container mit SSL starten
docker-compose --profile ssl up -d

# 3. Firewall öffnen
sudo ufw allow 80   # HTTP (redirect zu HTTPS)
sudo ufw allow 443  # HTTPS

# 4. Zugriff von anderen Rechnern:
# https://192.168.1.100
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
- `PORT` - Server Port (default: 7000)
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

# 5. SSL Zertifikat generieren (für HTTPS)
./generate-ssl.sh  # Server-IP eingeben

# 6. Container mit SSL starten
docker-compose --profile ssl up -d

# 7. Firewall konfigurieren
sudo ufw allow 80    # HTTP (redirect)
sudo ufw allow 443   # HTTPS
# Oder nur HTTP: sudo ufw allow 7000
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