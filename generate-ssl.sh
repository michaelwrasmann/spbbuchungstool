#!/bin/bash

# SSL Zertifikat Generator für SPB Buchungstool
# Generiert selbst-signierte SSL Zertifikate für lokale/interne Nutzung

echo "🔐 SPB Buchungstool - SSL Zertifikat Generator"
echo "=============================================="

# SSL Verzeichnis erstellen
mkdir -p ssl
cd ssl

# Server IP/Domain abfragen
echo ""
echo "Geben Sie die Server IP-Adresse oder Domain ein:"
echo "(z.B. 192.168.1.100 oder spb-server.local)"
read -r SERVER_HOST

if [ -z "$SERVER_HOST" ]; then
    SERVER_HOST="localhost"
    echo "Verwende Standard: localhost"
fi

echo ""
echo "Generiere SSL Zertifikat für: $SERVER_HOST"
echo ""

# OpenSSL Konfigurationsdatei erstellen
cat > server.conf << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=DE
ST=Deutschland
L=SPB
O=SPB Institut
OU=Buchungstool
CN=$SERVER_HOST

[v3_req]
basicConstraints = CA:FALSE
keyUsage = keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $SERVER_HOST
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

# Wenn SERVER_HOST eine IP ist, füge sie zu den alt_names hinzu
if [[ $SERVER_HOST =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "IP.2 = $SERVER_HOST" >> server.conf
fi

# Private Key generieren
echo "🔑 Generiere privaten Schlüssel..."
openssl genrsa -out server.key 2048

# CSR (Certificate Signing Request) generieren
echo "📄 Generiere Certificate Signing Request..."
openssl req -new -key server.key -out server.csr -config server.conf

# Selbst-signiertes Zertifikat generieren (gültig für 1 Jahr)
echo "📜 Generiere selbst-signiertes Zertifikat..."
openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365 -extensions v3_req -extfile server.conf

# Berechtigungen setzen
chmod 600 server.key
chmod 644 server.crt

# Aufräumen
rm server.csr server.conf

echo ""
echo "✅ SSL Zertifikat erfolgreich generiert!"
echo ""
echo "📁 Dateien:"
echo "   - ssl/server.key (privater Schlüssel)"
echo "   - ssl/server.crt (Zertifikat)"
echo ""
echo "🚀 Starten Sie nun den Container mit SSL:"
echo "   docker-compose --profile ssl up -d"
echo ""
echo "🌐 Zugriff über: https://$SERVER_HOST"
echo ""
echo "⚠️  Hinweis: Da es sich um ein selbst-signiertes Zertifikat handelt,"
echo "   wird der Browser eine Sicherheitswarnung anzeigen."
echo "   Klicken Sie auf 'Erweitert' und dann 'Weiter zu $SERVER_HOST'."
echo ""