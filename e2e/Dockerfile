# Fully dockerized Cypress runner with a virtual display + noVNC, so the
# corrector can watch/drive Cypress UI mode from any browser at
# http://localhost:7900 with no local Node.js, VNC client, or X server needed.
#
# cypress/included already bundles Node.js, Cypress, and Chrome/Electron/
# Firefox - the "no Node.js required" promise is about the *host* machine
# only; everything Cypress needs lives inside this container.
FROM cypress/included:15.20.0

USER root

# - xvfb: virtual framebuffer X server (Cypress needs a display even for
#   "headed"/UI mode when there's no real one attached to the container).
# - x11vnc: exposes that virtual display over VNC.
# - fluxbox: a minimal window manager, so the Cypress app window isn't
#   left undecorated/unfocusable under noVNC.
# - novnc + websockify: turn the VNC socket into a plain web page.
# - docker.io / docker-compose-plugin: the Cypress tasks in
#   e2e/cypress.config.ts (readMailLink, dbUserCount, dbGeolocation,
#   dbSetLastConnected, generateUsers) shell out to `docker compose` to
#   control the sibling postgres/ruby containers from inside this one.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        xvfb \
        x11vnc \
        fluxbox \
        novnc \
        websockify \
        docker.io \
        docker-cli \
        docker-compose \
        curl \
        net-tools \
        procps && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /e2e

# package*.json only, so `npm ci` is cached separately from the spec files
# (which change far more often) - the compose volume mount at runtime
# overlays the rest of the project on top of this anyway (see
# docker-compose.e2e.yml), this just keeps rebuilds fast during development.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 7900

ENTRYPOINT ["/start.sh"]
