# SPB Buchungstool - Docker Container
FROM node:18-alpine

# Arbeitsverzeichnis im Container erstellen
WORKDIR /app

# Package.json und package-lock.json kopieren (falls vorhanden)
COPY package*.json ./

# Node.js Abhängigkeiten installieren
RUN npm install --production

# Alle App-Dateien kopieren
COPY . .

# SQLite Datenbank-Verzeichnis erstellen und Berechtigungen setzen
RUN mkdir -p /app/data && \
    chown -R node:node /app

# Port 7002 freigeben
EXPOSE 7002

# Als non-root user ausführen für Sicherheit
USER node

# Volume für persistente Datenbank
VOLUME ["/app/data"]

# Gesundheitscheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7002/bookings || exit 1

# App starten
CMD ["npm", "start"]