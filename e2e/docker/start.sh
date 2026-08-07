#!/bin/sh
set -e

DISPLAY_NUM=99
export DISPLAY=":${DISPLAY_NUM}"
SCREEN_GEOMETRY="${SCREEN_GEOMETRY:-1920x1080x24}"
VNC_PORT="${VNC_PORT:-5900}"
NOVNC_PORT="${NOVNC_PORT:-7900}"
BASE_URL="${CYPRESS_baseUrl:-http://ruby:1942}"

echo "[start.sh] Starting Xvfb on display ${DISPLAY} (${SCREEN_GEOMETRY})..."
Xvfb "${DISPLAY}" -screen 0 "${SCREEN_GEOMETRY}" -nolisten tcp &
XVFB_PID=$!

# Give Xvfb a moment to create its socket before anything tries to connect.
for i in $(seq 1 30); do
	if [ -e "/tmp/.X11-unix/X${DISPLAY_NUM}" ]; then
		break
	fi
	sleep 0.5
done

echo "[start.sh] Starting fluxbox window manager..."
fluxbox >/tmp/fluxbox.log 2>&1 &

echo "[start.sh] Starting x11vnc on port ${VNC_PORT}..."
x11vnc -display "${DISPLAY}" -forever -shared -nopw -rfbport "${VNC_PORT}" -quiet >/tmp/x11vnc.log 2>&1 &

echo "[start.sh] Starting noVNC (websockify) on port ${NOVNC_PORT}..."
websockify --web=/usr/share/novnc/ "${NOVNC_PORT}" "localhost:${VNC_PORT}" >/tmp/novnc.log 2>&1 &

# Wait for the app (ruby backend serving the built Angular app) to answer
# before launching Cypress, so it doesn't race the rest of the stack coming up.
echo "[start.sh] Waiting for ${BASE_URL} to respond..."
until curl -sSf "${BASE_URL}" -o /dev/null 2>/dev/null; do
	sleep 1
done
echo "[start.sh] App is up."

echo "[start.sh] noVNC is ready - open http://localhost:${NOVNC_PORT}/vnc.html in any browser to watch/drive Cypress."

if [ "${CYPRESS_MODE:-open}" = "run" ]; then
	npx cypress run --config baseUrl="${BASE_URL}"
	EXIT_CODE=$?
else
	npx cypress open --project /e2e --config baseUrl="${BASE_URL}"
	EXIT_CODE=$?
fi

kill "${XVFB_PID}" 2>/dev/null || true
exit "${EXIT_CODE}"
