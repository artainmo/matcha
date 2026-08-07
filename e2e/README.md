# Matcha E2E tests (Cypress)

Cypress E2E suite covering every point of the 42 correction sheet
(`correction.pdf`): registration/verification, login/logout & password reset,
extended profile completion, consultations, suggestions, search/sort/filter,
geolocation, fame rating, notifications, other users' profiles, connections
(like/match), reporting/blocking, chat, security, mobile/responsive layout,
browser compatibility, and the >=500-profile seeding requirement.

There are **two ways to run it** - pick whichever fits your machine:

| | No local Node.js needed | Requires local Node.js >=24 |
|---|---|---|
| **Mode A - fully dockerized** | ✅ Cypress + noVNC run in a container | ❌ |
| **Mode B - host Node.js (fast path)** | ❌ | ✅ Cypress runs natively, app still dockerized |

Both modes run the exact same spec files against the exact same dockerized
app (Postgres + Ruby backend) - nothing behaves differently between them.

## Mode A - fully dockerized (no Node.js required)

Everything - the app *and* Cypress itself, complete with a virtual display
and noVNC so you can watch (and interact with) Cypress UI mode from any
browser - runs in containers.

From the repository root:

```sh
docker compose -p matcha-e2e -f docker-compose.yml -f docker-compose.e2e.yml \
  --profile docker-cypress up --build
```

Then open **http://localhost:7900/vnc.html** in any browser. You'll see the
Cypress app window (via noVNC) already running in "open" (UI) mode - pick a
spec from the list to run it and watch it live.

To run everything headlessly instead (e.g. for a quick pass/fail check
without watching), set `CYPRESS_MODE=run` before starting the `cypress`
service, or run a one-off command against the built image:

```sh
docker compose -p matcha-e2e -f docker-compose.yml -f docker-compose.e2e.yml \
  run --rm cypress sh -c "CYPRESS_MODE=run /start.sh"
```

Tear everything down with:

```sh
docker compose -p matcha-e2e -f docker-compose.yml -f docker-compose.e2e.yml down
```

Add `-v` to also drop the Postgres volume (a clean slate for the next run).

A `make` shortcut for the app-only half of this (used by Mode B below) also
exists: `make docker-e2e-app`.

## Mode B - host Node.js >=24 (fast path for iterating on specs)

If you already have Node.js >=24 installed locally, you can skip the Cypress
container entirely and run Cypress natively - it's noticeably faster to
iterate with (instant spec reloads, no noVNC/virtual-display overhead).

1. Start just the app (Postgres + Ruby, dockerized either way):

   ```sh
   make docker-e2e-app
   ```

   This uses `docker-compose.e2e.yml` to set `EMAILPASS=""` on the backend,
   so account-verification / password-reset links get logged to the `ruby`
   container's stdout instead of emailed - Cypress reads them straight from
   `docker compose logs ruby` (see the `readMailLink` task in
   `cypress.config.ts`). No real SMTP access is ever needed, in either mode.

2. In another terminal, run Cypress against it:

   ```sh
   make e2e
   ```

   which is equivalent to:

   ```sh
   cd e2e
   npm install
   CYPRESS_baseUrl=http://localhost:1942 npx cypress open
   ```

   Swap `cypress open` for `cypress run` (optionally with `--browser chrome`
   or `--browser firefox`) for a headless/CI-style run.

Tear down the app with `make docker-e2e-down` (add `-v` to the underlying
compose command, or `docker compose -p matcha-e2e ... down -v`, to also drop
the Postgres volume).

## Seeding >=500 profiles

The correction requires the app to be able to seed at least 500 realistic
profiles. `cypress/e2e/16-seeding.cy.ts` checks this automatically (and
seeds more via the generator script if the current count is below 500) - or
seed manually ahead of time with:

```sh
make docker-e2e-generate_users AMOUNT=500
```

(seeding 500 users takes a couple of minutes - each one does a real,
rate-limited Nominatim geocoding lookup).

## Project layout

```
e2e/
  Dockerfile                # Mode A image: cypress/included + Xvfb/x11vnc/noVNC/docker-cli
  docker/start.sh           # Mode A container entrypoint
  cypress.config.ts         # baseUrl, tasks (mail-link reading, DB helpers, seeding)
  cypress/
    e2e/                    # one spec file per correction section, numbered 00-16
    support/commands.ts     # cy.createFullUser(), cy.uiLogin(), multi-user cookie helpers, etc.
    fixtures/               # sample images, canned registration payloads
```

## Notes / troubleshooting

- Every spec registers its own fresh, uniquely-named throwaway users through
  the UI/API, so specs are independent and repeatable against the same
  database - no manual cleanup needed between runs.
- The `docker-cypress` Cypress container needs access to the Docker socket
  (`/var/run/docker.sock`) because several Cypress tasks (`readMailLink`,
  `dbUserCount`, `dbGeolocation`, `dbSetLastConnected`, `generateUsers`) shell
  out to `docker compose` to inspect/control the sibling `postgres`/`ruby`
  containers - this is already wired up in `docker-compose.e2e.yml`.
- If a spec run leaves stray `cypress/screenshots` or `cypress/videos`
  behind, they're gitignored - safe to delete freely.
