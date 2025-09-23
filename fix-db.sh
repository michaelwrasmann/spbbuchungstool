#!/bin/bash

echo "🔧 SPB Booking Tool - Datenbank Migration & Fix"
echo "================================================"

# Backup der alten Datenbank
echo "📦 Erstelle Backup der alten Datenbank..."
cp bookings.db bookings_old_$(date +%Y%m%d_%H%M%S).db 2>/dev/null || echo "⚠️ Alte DB nicht gefunden oder bereits gesichert"

# Neue Datenbank erstellen
echo "🆕 Erstelle neue Datenbank: bookings_new.db"
rm -f bookings_new.db

# SQLite3 verwenden um Daten zu migrieren
echo "📋 Exportiere alte Daten..."
sqlite3 bookings.db ".dump" > bookings_export.sql 2>/dev/null || {
    echo "⚠️ Keine alten Daten gefunden. Erstelle leere Datenbank..."
    echo "CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roomId TEXT,
        name TEXT,
        startDate TEXT,
        endDate TEXT
    );" > bookings_export.sql
}

# In neue Datenbank importieren
echo "📥 Importiere Daten in neue Datenbank..."
sqlite3 bookings_new.db < bookings_export.sql

# Berechtigungen setzen
echo "🔐 Setze korrekte Berechtigungen..."
chmod 666 bookings_new.db

# Alte DB umbenennen und neue aktivieren
echo "🔄 Aktiviere neue Datenbank..."
mv bookings.db bookings_replaced.db 2>/dev/null || echo "⚠️ Alte DB bereits verschoben"
mv bookings_new.db bookings.db

# Aufräumen
rm -f bookings_export.sql

echo "✅ Fertig! Die neue Datenbank ist bereit."
echo ""
echo "📊 Datenbank-Status:"
ls -la bookings*.db
echo ""
echo "📈 Anzahl der Buchungen:"
sqlite3 bookings.db "SELECT COUNT(*) as 'Anzahl Buchungen' FROM bookings;" 2>/dev/null || echo "0"

echo ""
echo "🚀 Sie können jetzt den Server starten mit:"
echo "   docker-compose up -d --build"
echo "   oder"
echo "   npm start"