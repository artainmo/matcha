# testRoutes

A lightweight raw-REST smoke tester for the backend's `/rest/*` API
(`backend/myapp.rb`), using plain `axios` HTTP calls. It is **not** a
replacement for the Cypress E2E suite in `../../e2e/` (which drives complete
user flows through the actual frontend) - this is a much smaller, quick tool
for poking individual endpoints by hand while working on the backend.

## Requirements

The backend must be running with `EMAILPASS` set to an **empty string**
(`export EMAILPASS=""`), so verification/password-reset links get logged to
its console instead of emailed - the same "testing mode" the e2e suite
relies on (see `send_mail()` in `backend/myapp.rb`). When this script hits
the register/reset-password step, it will pause and ask you to paste the
token from that console output (the last path segment of the logged link),
since - unlike Cypress - it has no way to reach into `docker compose logs`
itself.

There is currently no "delete account" REST route, so accounts created by
this script accumulate in the database across runs (each run uses a random
suffix on its usernames to avoid collisions). Periodically reset the
database if that's undesirable, e.g. `docker compose down -v`.

## Running locally

```sh
npm install
node appRoutesTest.js [table]
```

`table` is optional and one of: `account`, `token`, `blocked`, `liked`,
`message`, `notification`, `tag`, `picture`. Omit it to run every table's
tests.

Env vars:
- `TEST_BASE_URL` - base URL of the running backend (default
  `http://localhost:1942`)
- `TEST_PASSWORD` - password used for every test account (default `pass`)

## Running via Docker

The image is standalone (not part of `docker-compose.yml`) - build and run
it manually. The build context must be `backend/` (one level up from this
folder) so the image can also bundle the sample picture used by the
liked/message/notification tests:

```sh
# From the repository root:
docker build -f backend/testRoutes/Dockerfile -t matcha-test-routes backend
```

To run it against a backend started via `docker compose up` (from the repo
root), join the same network so `matcha-ruby` resolves by container name -
use `-it` so you can answer the verification-token prompts interactively:

```sh
docker run --rm -it --network matcha_default \
  -e TEST_BASE_URL=http://matcha-ruby:1942 \
  -e TEST_PASSWORD=pass \
  matcha-test-routes [table]
```

To run it against a backend running directly on the host (non-dockerized),
use `host.docker.internal` instead:

```sh
docker run --rm -it \
  -e TEST_BASE_URL=http://host.docker.internal:1942 \
  -e TEST_PASSWORD=pass \
  matcha-test-routes [table]
```
