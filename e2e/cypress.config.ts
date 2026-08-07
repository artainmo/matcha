import { defineConfig } from 'cypress';
import { execSync } from 'child_process';
import * as path from 'path';

// The e2e/ project lives one level below the repo root, where
// docker-compose.yml / docker-compose.e2e.yml live. All docker compose
// commands below are run with that as their cwd so this works whether this
// config is invoked from inside the dockerized Cypress container (Mode A,
// see e2e/README.md) or natively via a local Node.js >=24 install (Mode B).
const REPO_ROOT = path.resolve(__dirname, '..');
// Pinning an explicit project name (rather than letting Compose derive one
// from the containing directory's name) keeps every `docker compose`
// invocation below in sync with the makefile's e2e targets, regardless of
// what folder name the repository was cloned into.
const COMPOSE_CMD =
	process.env['E2E_COMPOSE_CMD'] ||
	'docker compose -p matcha-e2e -f docker-compose.yml -f docker-compose.e2e.yml';

function sh(cmd: string): string {
	return execSync(cmd, { cwd: REPO_ROOT, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
}

export default defineConfig({
	e2e: {
		baseUrl: process.env['CYPRESS_baseUrl'] || 'http://localhost:1942',
		supportFile: 'cypress/support/e2e.ts',
		specPattern: 'cypress/e2e/**/*.cy.ts',
		defaultCommandTimeout: 10000,
		requestTimeout: 10000,
		responseTimeout: 15000,
		// Notifications/chat poll every 10s (see notifications.service.ts /
		// message.service.ts) so a couple of retries comfortably cover that
		// window without slowing down already-passing runs.
		retries: {
			runMode: 2,
			openMode: 0
		},
		setupNodeEvents(on) {
			on('task', {
				// Backend logs the full verification/reset link to stdout instead
				// of sending a real email whenever EMAILPASS is empty (see
				// send_mail() in backend/myapp.rb). docker-compose.e2e.yml sets
				// EMAILPASS="" on the ruby service specifically so this works.
				// Each logged mail is 3 consecutive lines ("To: ...", "Subject:
				// ...", "Content: ..."), so we anchor on the last "To: <toEmail>"
				// line and pull the link out of the following "Content:" line -
				// this stays correct even if several users register in the same
				// test run and their log blocks end up interleaved by Puma's
				// thread pool.
				readMailLink({
					toEmail,
					urlPattern,
					sinceSeconds = 120,
					retries = 5,
					retryDelayMs = 1000
				}: {
					toEmail: string;
					urlPattern: string;
					sinceSeconds?: number;
					retries?: number;
					retryDelayMs?: number;
				}) {
					// Uses a time window (`--since`) rather than a fixed line
					// count (`--tail`): with 500+ seeded accounts, background
					// traffic (search/suggestions/etc. across specs) can push
					// thousands of log lines through in seconds, so a fixed
					// `--tail=N` can miss the target registration's mail block
					// entirely even moments after it was logged. `--since` scales
					// with wall-clock time instead of log volume, so it stays
					// correct regardless of how much traffic the app is under.
					//
					// Even with `--since`, there can be a short delay between the
					// backend writing the log line and `docker compose logs`
					// surfacing it (stdout buffering under heavy concurrent
					// request load from other specs running in parallel), so the
					// very first attempt right after the register/reset request
					// can still race the log. Retry a few times with a short
					// delay instead of failing immediately on a single miss.
					const toLine = `To: ${toEmail}`;
					for (let attempt = 0; attempt <= retries; attempt++) {
						const logs = sh(
							`${COMPOSE_CMD} logs ruby --no-color --since=${sinceSeconds}s`
						);
						const lines = logs.split('\n');
						for (let i = lines.length - 1; i >= 0; i--) {
							if (!lines[i].includes(toLine)) continue;
							for (let j = i; j < Math.min(i + 6, lines.length); j++) {
								const match = lines[j].match(new RegExp(urlPattern));
								if (match) return match[0];
							}
						}
						if (attempt < retries) sh(`sleep ${retryDelayMs / 1000}`);
					}
					return null;
				},
				// Counts distinct profiles in the account table, used by the
				// seeding spec to confirm make docker-generate_users seeded >=500.
				dbUserCount() {
					const out = sh(
						`${COMPOSE_CMD} exec -T postgres psql -U postgres -d matcha -t -A -c "SELECT COUNT(*) FROM account;"`
					);
					return parseInt(out.trim(), 10);
				},
				// Runs the same seeding script as `make docker-e2e-generate_users`,
				// scoped to the e2e project's own containers (COMPOSE_CMD already
				// includes `-p matcha-e2e`), for the "Installation and Seeding"
				// correction point.
				generateUsers({ amount, mail }: { amount: number; mail?: string }) {
					sh(
						`${COMPOSE_CMD} run --rm --name matcha-e2e-ruby-generate_users ruby sh -c ` +
							`"bundle install && cd database/tests_and_scripts && bundle exec ruby generateUsers.rb ${amount} ${mail ?? ''}"`
					);
					return null;
				},
				// Returns the raw stored geolocation point ("(lat,lng)") for a
				// user. Used instead of asserting on the human-readable
				// reverse-geocoded address text, which depends on the free/rate
				// -limited Nominatim API (called on every profile view) and can
				// flake or return an error placeholder under rapid test load -
				// the underlying coordinate change on save is what's actually
				// under test, so we check that directly at the DB level.
				dbGeolocation(username: string) {
					const out = sh(
						`${COMPOSE_CMD} exec -T postgres psql -U postgres -d matcha -t -A -c "SELECT geolocation FROM account WHERE username='${username}';"`
					);
					return out.trim();
				},
				// Backdates a user's last_connected timestamp so the "online"
				// (last_connected < 2 minutes ago, see is-online.pipe.ts)
				// vs. "offline/last connected at ..." UI states can be asserted
				// deterministically, instead of racing the 2-minute window in
				// real time.
				dbSetLastConnected({ username, minutesAgo }: { username: string; minutesAgo: number }) {
					sh(
						`${COMPOSE_CMD} exec -T postgres psql -U postgres -d matcha -t -A -c ` +
							`"UPDATE account SET last_connected = NOW() - INTERVAL '${minutesAgo} minutes' WHERE username='${username}';"`
					);
					return null;
				},
				log(message: unknown) {
					// eslint-disable-next-line no-console
					console.log(message);
					return null;
				}
			});
		}
	}
});
