#!/bin/bash
# Serves the booth app over local network — use this if the venue has no internet
# or if you want to avoid depending on GitHub Pages.
#
# Everyone (laptop + phones) must be on the same WiFi.
# For zero-dependency: turn on your Mac hotspot first, then run this script.

PORT=8080
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Detect local IP (tries WiFi, then ethernet)
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
BOOTH_URL="http://$IP:$PORT/receipt-engine/?booth"
VISITOR_URL="http://$IP:$PORT/receipt-engine/"

echo ""
echo "  ◈ AI WASTE BOOTH — LOCAL SERVER"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Booth laptop: $BOOTH_URL"
echo "  Visitor QR:   $VISITOR_URL"
echo ""
echo "  Print or display this URL as a QR code:"
echo "  → qr.new (type the URL in) or your phone's camera QR generator"
echo ""
echo "  ─────────────────────────────────────────"
echo "  If phones can't connect:"
echo "  1. Check they're on the same WiFi as this Mac"
echo "  2. No internet? System Settings → General → Sharing"
echo "     → turn on Internet Sharing (WiFi → to other devices)"
echo "     The Mac hotspot usually gives IP 192.168.2.1"
echo "  ─────────────────────────────────────────"
echo ""
echo "  Press Ctrl+C to stop the server."
echo ""

# Open booth mode on this machine
open "$BOOTH_URL" 2>/dev/null || true

# Start server from repo root so ../assets paths resolve correctly
cd "$ROOT"
python3 -m http.server "$PORT"
