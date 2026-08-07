/*
 * Lightweight raw-REST smoke tester for the backend's `/rest/*` routes
 * (backend/myapp.rb). This is NOT a replacement for the Cypress E2E suite in
 * `e2e/` (which drives full user flows through the actual frontend) - it's a
 * quick, script-level way to poke individual endpoints by hand while working
 * on the backend.
 *
 * Usage:
 *   node appRoutesTest.js [table]
 *
 * `table` is optional and one of: account, token, blocked, liked, message,
 * notification, tag, picture. When omitted, every table's tests run.
 *
 * Env vars:
 *   TEST_BASE_URL  Base URL of the running backend (default http://localhost:1942)
 *   TEST_PASSWORD  Password used for every test account (default 'pass')
 *
 * Requirements on the running backend:
 *   - EMAILPASS must be set to an empty string (`export EMAILPASS=""`) so
 *     verification/password-reset links are logged to the backend's console
 *     instead of emailed (same "testing mode" the e2e suite relies on - see
 *     send_mail() in backend/myapp.rb). This script prompts you to paste the
 *     token/link printed there, since (unlike the Cypress suite) it has no
 *     way to reach into `docker compose logs`.
 *   - There is currently no "delete account" REST route, so test accounts
 *     accumulate in the database across runs. Usernames are suffixed with a
 *     random id per run to avoid collisions; periodically reset the
 *     database (e.g. `docker compose down -v`) if that's undesirable.
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');

axios.defaults.baseURL = process.env.TEST_BASE_URL || 'http://localhost:1942';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'pass';
// Distinguishes this run's accounts from any left over by previous runs,
// since there is no "delete account" route to clean them up afterwards.
const RUN_ID = Math.random().toString(36).slice(2, 8);
// Small sample picture reused from the seeding scripts, used by the
// liked/message/notification tests below for a more realistic profile.
const SAMPLE_PICTURE = path.join(
	__dirname, '..', 'database', 'tests_and_scripts', 'resources', 'MALE.jpg'
);

function view_result(res) {
	console.log('Request: ' + res.config.method + ' ' + res.config.url);
	console.log('Response status code: ' + res.status);
	console.log('Response body: ' + JSON.stringify(res.data));
	console.log('');
}

function view_error(error) {
	if (!error.response) throw error;
	view_result(error.response);
}

async function prompt(question) {
	const rl = readline.createInterface({ input, output });
	try {
		return (await rl.question(question)).trim();
	} finally {
		rl.close();
	}
}

// Registers, verifies (asking the user to paste the token logged by the
// backend) and logs in an account, returning the "username" cookie header
// (as a "name=value" string) to attach to subsequent authenticated requests.
async function registerVerifyLogin(username) {
	console.log(`\x1b[36mRegistering ${username}\x1b[0m`);
	try {
		await axios.post('/rest/account/register', {
			username,
			password: TEST_PASSWORD,
			email: `${username}@example.com`,
			firstname: username,
			lastname: 'test'
		});
	} catch (error) {
		// With EMAILPASS="" (test mode) the backend always answers 417 here -
		// the account is still created and the verify link is logged to
		// stdout instead of emailed (see send_mail() in backend/myapp.rb).
		if (!error.response || error.response.status !== 417) throw error;
	}
	const token = await prompt(
		`Paste the verification token for ${username} ` +
		`(look for "Click on the following link..." in the backend's console, ` +
		`the token is the last path segment of that link): `
	);
	await axios.post('/rest/account/verify', token, {
		headers: { 'Content-Type': 'text/plain' }
	});
	const res = await axios.post('/rest/account/login', { username, password: TEST_PASSWORD });
	const setCookie = res.headers['set-cookie'];
	if (!setCookie || setCookie.length === 0) throw new Error('Login did not set a cookie');
	return setCookie[0].split(';')[0]; // "username=<jwt>"
}

// Fills in the extended profile fields required before most other routes
// behave usefully (gender/orientation/geolocation/tags/etc).
async function fillProfile(cookie, overrides = {}) {
	const body = Object.assign({
		gender: 'MALE',
		sexual_orientation: 'BI',
		biography: 'Test account created by testRoutes/appRoutesTest.js',
		birthday: '1995-06-15',
		profile_picture: '',
		tags: ['school19', 'proximus'],
		geolocation: 'Brussels'
	}, overrides);
	return axios.patch('/rest/account/fill', body, { headers: { Cookie: cookie } });
}

async function uploadPicture(cookie) {
	const form = new FormData();
	form.append('file', fs.createReadStream(SAMPLE_PICTURE));
	const res = await axios.post('/rest/picture', form, {
		headers: { Cookie: cookie, ...form.getHeaders() }
	});
	return res.data; // storage_path
}

async function testAccount() {
	console.log('\x1b[32mAccount table tests\x1b[0m');

	const userA = `acctA_${RUN_ID}`;
	const userB = `acctB_${RUN_ID}`;

	try {
		await axios.post('/rest/account/register',
			{ username: userA, password: TEST_PASSWORD, email: 'not-an-email', firstname: 'a<', lastname: 'b' });
	} catch (error) { view_error(error); } // Expected 400: forbidden char in firstname

	const cookieA = await registerVerifyLogin(userA);
	const cookieB = await registerVerifyLogin(userB);

	view_result(await fillProfile(cookieA, { geolocation: 'Brussels' }));
	view_result(await fillProfile(cookieB, { geolocation: 'Paris' }));

	view_result(await axios.get(`/rest/account/find/${userB}`, { headers: { Cookie: cookieA } }));
	try { await axios.get('/rest/account/find/doesnotexist', { headers: { Cookie: cookieA } }); }
	catch (error) { view_error(error); }

	view_result(await axios.patch('/rest/account', { biography: 'Updated bio' }, { headers: { Cookie: cookieA } }));

	view_result(await axios.get('/rest/account/more-infos', { headers: { Cookie: cookieA } }));

	view_result(await axios.get(`/rest/account/fame/${userA}`, { headers: { Cookie: cookieA } }));
	try { await axios.get('/rest/account/fame/doesnotexist', { headers: { Cookie: cookieA } }); }
	catch (error) { view_error(error); }

	view_result(await axios.post('/rest/account/search', {}, { headers: { Cookie: cookieA } }));
	view_result(await axios.post('/rest/account/search', { minAge: 18, maxAge: 60 }, { headers: { Cookie: cookieA } }));

	view_result(await axios.get('/rest/account/suggestions', { headers: { Cookie: cookieA } }));
	view_result(await axios.get('/rest/account/suggestions?age=7', { headers: { Cookie: cookieA } }));
}

async function testToken() {
	console.log('\x1b[32mToken table tests\x1b[0m');

	const username = `token_${RUN_ID}`;
	const cookie = await registerVerifyLogin(username);
	await fillProfile(cookie);

	try { view_result(await axios.get(`/rest/token/resetPassword/${username}`)); }
	catch (error) { view_error(error); } // Expected 417 in test mode (EMAILPASS=""), token is still created/logged
	try { await axios.get('/rest/token/resetPassword/doesnotexist'); }
	catch (error) { view_error(error); }

	const token = await prompt(
		`Paste the password-reset token for ${username} ` +
		`(last path segment of the "reset password" link logged by the backend): `
	);
	view_result(await axios.post(`/rest/token/${token}/resetPassword`, { newPassword: 'newpass123' }));
	try { await axios.post('/rest/token/not-a-real-token/resetPassword', { newPassword: 'x' }); }
	catch (error) { view_error(error); }
}

async function testBlocked() {
	console.log('\x1b[32mBlocked table tests\x1b[0m');

	const userA = `blkA_${RUN_ID}`;
	const userB = `blkB_${RUN_ID}`;
	const cookieA = await registerVerifyLogin(userA);
	const cookieB = await registerVerifyLogin(userB);
	await fillProfile(cookieA);
	await fillProfile(cookieB);

	view_result(await axios.post(`/rest/blocked/${userB}`, {}, { headers: { Cookie: cookieA } }));
	view_result(await axios.post(`/rest/blocked/${userA}`, {}, { headers: { Cookie: cookieB } }));
	try { await axios.post('/rest/blocked/doesnotexist', {}, { headers: { Cookie: cookieA } }); }
	catch (error) { view_error(error); }

	// Confirm the block is reflected in how the two accounts see each other.
	view_result(await axios.get(`/rest/account/find/${userB}`, { headers: { Cookie: cookieA } }));
}

async function testLiked() {
	console.log('\x1b[32mLiked table tests\x1b[0m');

	const userA = `likeA_${RUN_ID}`;
	const userB = `likeB_${RUN_ID}`;
	const cookieA = await registerVerifyLogin(userA);
	const cookieB = await registerVerifyLogin(userB);
	await fillProfile(cookieA);
	await fillProfile(cookieB);

	await uploadPicture(cookieA);
	await uploadPicture(cookieB);

	view_result(await axios.post(`/rest/liked/${userB}`, {}, { headers: { Cookie: cookieA } }));
	view_result(await axios.post(`/rest/liked/${userA}`, {}, { headers: { Cookie: cookieB } })); // likes back -> match
	try { await axios.post('/rest/liked/doesnotexist', {}, { headers: { Cookie: cookieA } }); }
	catch (error) { view_error(error); }

	view_result(await axios.get('/rest/liked/connections', { headers: { Cookie: cookieA } }));

	view_result(await axios.delete(`/rest/liked/${userB}`, { headers: { Cookie: cookieA } }));
	try { await axios.delete(`/rest/liked/${userB}`, { headers: { Cookie: cookieA } }); } // already removed
	catch (error) { view_error(error); }
}

async function testMessage() {
	console.log('\x1b[32mMessage table tests\x1b[0m');

	const userA = `msgA_${RUN_ID}`;
	const userB = `msgB_${RUN_ID}`;
	const cookieA = await registerVerifyLogin(userA);
	const cookieB = await registerVerifyLogin(userB);
	await fillProfile(cookieA);
	await fillProfile(cookieB);
	await uploadPicture(cookieA);
	await uploadPicture(cookieB);

	// Messaging requires a match (mutual like) - see itsMatch() in myapp.rb.
	await axios.post(`/rest/liked/${userB}`, {}, { headers: { Cookie: cookieA } });
	await axios.post(`/rest/liked/${userA}`, {}, { headers: { Cookie: cookieB } });

	view_result(await axios.post(`/rest/message/${userB}`, { content: 'Hello there' }, { headers: { Cookie: cookieA } }));
	view_result(await axios.post(`/rest/message/${userA}`, { content: 'Hi back' }, { headers: { Cookie: cookieB } }));

	view_result(await axios.get('/rest/message', { headers: { Cookie: cookieA } }));
	view_result(await axios.get('/rest/message', { headers: { Cookie: cookieB } }));
}

async function testNotification() {
	console.log('\x1b[32mNotification table tests\x1b[0m');

	const userA = `notifA_${RUN_ID}`;
	const userB = `notifB_${RUN_ID}`;
	const cookieA = await registerVerifyLogin(userA);
	const cookieB = await registerVerifyLogin(userB);
	await fillProfile(cookieA);
	await fillProfile(cookieB);
	await uploadPicture(cookieA);
	await uploadPicture(cookieB);

	// Notifications are only ever created as a side effect of other actions
	// (there is no direct POST /rest/notification route) - trigger some.
	await axios.get(`/rest/account/find/${userA}`, { headers: { Cookie: cookieB } }); // VIEWED
	await axios.post(`/rest/liked/${userA}`, {}, { headers: { Cookie: cookieB } }); // LIKE

	const res = await axios.get('/rest/notification', { headers: { Cookie: cookieA } });
	view_result(res);
	const notifications = res.data;
	if (notifications.length === 0) {
		console.log('No notifications found to test patch on, skipping.');
		return;
	}
	const notifId = notifications[0].id;
	view_result(await axios.patch(`/rest/notification/${notifId}/opened/true`, {}, { headers: { Cookie: cookieA } }));
	try {
		await axios.patch('/rest/notification/00000000-0000-0000-0000-000000000000/opened/true',
			{}, { headers: { Cookie: cookieA } });
	} catch (error) { view_error(error); }
}

async function testTag() {
	console.log('\x1b[32mTag table tests\x1b[0m');

	const username = `tag_${RUN_ID}`;
	const cookie = await registerVerifyLogin(username);
	// Tags are set via account/fill (there is no dedicated "create tag" route).
	await fillProfile(cookie, { tags: ['school19', 'proximus'] });

	view_result(await axios.get('/rest/tag/proximus/similar'));
	view_result(await axios.get('/rest/tag/school19/similar'));
	view_result(await axios.get('/rest/tag/doesnotexist/similar')); // empty array, not an error
}

async function testPicture() {
	console.log('\x1b[32mPicture table tests\x1b[0m');

	const username = `pic_${RUN_ID}`;
	const cookie = await registerVerifyLogin(username);
	await fillProfile(cookie);

	const storagePath = await uploadPicture(cookie);
	console.log('Uploaded picture at: ' + storagePath);

	view_result(await axios.get('/rest/picture', { headers: { Cookie: cookie } }));

	view_result(await axios.delete('/rest/picture', { data: { storage_path: storagePath }, headers: { Cookie: cookie } }));
	try {
		await axios.delete('/rest/picture', { data: { storage_path: 'images/doesnotexist/x.jpg' }, headers: { Cookie: cookie } });
	} catch (error) { view_error(error); }
}

async function test() {
	const selected = process.argv[2];
	if (selected === undefined || selected === 'account') await testAccount();
	if (selected === undefined || selected === 'token') await testToken();
	if (selected === undefined || selected === 'blocked') await testBlocked();
	if (selected === undefined || selected === 'liked') await testLiked();
	if (selected === undefined || selected === 'message') await testMessage();
	if (selected === undefined || selected === 'notification') await testNotification();
	if (selected === undefined || selected === 'tag') await testTag();
	if (selected === undefined || selected === 'picture') await testPicture();
}

test().catch((error) => {
	if (error.response) view_result(error.response);
	else console.error(error);
	process.exitCode = 1;
});
