/* THIS TESTER IS OUTDATED AS THE TESTED API HAS CHANGED ITS ENDPOINTS AND ADDED COOKIES */
const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:1942';
axios.defaults.withCredentials = true; //Send cookies with requests

let account1 = {
	username: 'artainmo',
	password: 'pass',
	email: 'hotmail',
	firstname: 'art',
	lastname: 'tai',
	gender: 'MALE',
	sexual_orientation: 'FEMALE',
	biography: 'dwdqdq',
	birthday: '2020-12-21',
	geolocation: '50.76781,4.33688'
};

let account2 =  {
	username: 'pvanderl',
	password: 'pass',
	email: 'hotmail',
	firstname: 'p',
	lastname: 'v',
	gender: 'MALE',
	sexual_orientation: 'BI',
	biography: 'dwdqdq',
	birthday: '2015-12-21',
	geolocation: '-87.6,41.9'
};

let account3 = {
	username: 'dd',
	email: 'hotmail'
}

let account4 = {
	username: 'girl',
	password: 'pass',
	email: 'hotmail',
	firstname: 'g',
	lastname: 'i',
	gender: 'FEMALE',
	sexual_orientation: 'MALE',
	biography: 'dwdqdq',
	birthday: '2020-12-21',
	geolocation: '-87.6,41.9'
};

let account5 = {
	username: 'girl2',
	password: 'pass',
	email: 'hotmail',
	firstname: 'g2',
	lastname: 'i2',
	gender: 'FEMALE',
	sexual_orientation: 'MALE',
	biography: 'dwdqdq',
	birthday: '2007-12-21',
	geolocation: '-87.6,41.9'
};

let account6 = {
	username: 'girl3',
	password: 'pass',
	email: 'hotmail',
	firstname: 'g3',
	lastname: 'i3',
	gender: 'FEMALE',
	sexual_orientation: 'MALE',
	biography: 'dwdqdq',
	birthday: '2020-12-21',
	geolocation: '50.76781,4.33688'
};

let account7 = {
	username: 'gay1',
	password: 'pass',
	email: 'hotmail',
	firstname: 'g',
	lastname: 'a',
	gender: 'MALE',
	sexual_orientation: 'MALE',
	biography: 'dwdqdq',
	birthday: '2019-12-21',
	geolocation: '-87.6,41.9'
};

let notification1 = {
	username: 'artainmo',
	title: 'like',
	content: 'you received a like',
	notif_type: 'LIKE'
}

let notification2 = {
	username: 'pvanderl',
	title: 'visit',
	content: 'you were visited',
	notif_type: 'VIEWED'
}

let notification3 = {
	username: 'artainmo',
	notif_type: 'LIKE'
}

function view_result(res) {
	console.log('Request: ' + res.config.method + ' ' + res.config.url);
	console.log('Response status code: ' + res.status);
	console.log('Response body: ' + res.data);
	console.log('');
}

async function testAccount() {
	console.log('\033[32mAccount table tests\033[0m')

	view_result(await axios.post('/rest/account', account1));
	view_result(await axios.post('/rest/account', account2));
	try { view_result(await axios.post('/rest/account', account3)); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/account/all'));

	view_result(await axios.get('/rest/account/find/artainmo'));
	try { view_result(await axios.get('/rest/account/find/georges')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.patch('/rest/account/artainmo/email/icloud'));
	view_result(await axios.get('/rest/account/find/artainmo'));
	try { view_result(await axios.patch('/rest/account/unexist/email/icloud')); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.patch('/rest/account/artainmo/ddeee/ok')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/account/password/artainmo/pass'));
	view_result(await axios.get('/rest/account/password/artainmo/edewd'));
	try { view_result(await axios.get('/rest/account/password/unexist/eddd')); }
	catch (error) { view_result(error.response); }

	await axios.post('/rest/blocked/artainmo/pvanderl');
	await axios.post('/rest/liked/artainmo/pvanderl');
	await axios.post('/rest/message/artainmo/pvanderl', {content:'message content'});
	await axios.post('/rest/visit/pvanderl/artainmo');
	await axios.post('/rest/liked/pvanderl/artainmo');
	view_result(await axios.get('/rest/account/fame/artainmo'));
	view_result(await axios.get('/rest/account/fame/pvanderl'));
	try { view_result(await axios.get('/rest/account/fame/edewd')); }
	catch (error) { view_result(error.response); }
	await axios.delete('/rest/blocked/artainmo/pvanderl');
	await axios.delete('/rest/liked/artainmo/pvanderl');
	await axios.delete('/rest/message/artainmo/pvanderl');
	await axios.delete('/rest/visit/pvanderl');
	await axios.delete('/rest/liked/pvanderl/artainmo');

	await axios.post('/rest/account', account4);
	await axios.post('/rest/account', account5);
	await axios.post('/rest/tag/pvanderl/proximus')
	await axios.post('/rest/tag/girl2/proximus')
	await axios.post('/rest/account', account6);
	await axios.post('/rest/account', account7);
	await axios.post('/rest/liked/pvanderl/gay1')
	view_result(await axios.get('/rest/account/suggestions/artainmo'));
	view_result(await axios.get('/rest/account/suggestions/pvanderl'));
	view_result(await axios.get('/rest/account/suggestions/pvanderl?age=7'));
	view_result(await axios.get('/rest/account/suggestions/pvanderl?fame=90'));
	view_result(await axios.get('/rest/account/suggestions/pvanderl?tags=1'));
	await axios.delete('/rest/tag/pvanderl/proximus')
	await axios.delete('/rest/tag/girl2/proximus')
	await axios.delete('/rest/liked/pvanderl/gay1')
	await axios.delete('/rest/account/girl');
	await axios.delete('/rest/account/girl2');
	await axios.delete('/rest/account/girl3');
	await axios.delete('/rest/account/gay1');

	view_result(await axios.delete('/rest/account/artainmo'));
	view_result(await axios.delete('/rest/account/pvanderl'));
	try { view_result(await axios.delete('/rest/account/georges')); }
	catch (error) { view_result(error.response); }
}

async function testBlocked() {
	console.log('\033[32mBlocked table tests\033[0m')

	await axios.post('/rest/account', account1);
	await axios.post('/rest/account', account2);

	view_result(await axios.post('/rest/blocked/artainmo/pvanderl'));
	view_result(await axios.post('/rest/blocked/pvanderl/artainmo'));
	try { view_result(await axios.post('/rest/blocked/nobody/someone')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/blocked/artainmo/pvanderl'));
	try { view_result(await axios.get('/rest/blocked/artainmo/nobody')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.delete('/rest/blocked/artainmo/pvanderl'));
	view_result(await axios.delete('/rest/blocked/pvanderl/artainmo'));
	try { view_result(await axios.delete('/rest/blocked/nobody/someone')); }
	catch (error) { view_result(error.response); }

	await axios.delete('/rest/account/artainmo');
	await axios.delete('/rest/account/pvanderl');
}

async function testLiked() {
	console.log('\033[32mLiked table tests\033[0m')

	await axios.post('/rest/account', account1);
	await axios.post('/rest/account', account2);

	view_result(await axios.post('/rest/liked/artainmo/pvanderl'));
	view_result(await axios.post('/rest/liked/pvanderl/artainmo'));
	try { view_result(await axios.post('/rest/liked/nobody/someone')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/liked/by/artainmo/to/pvanderl'));
	try { view_result(await axios.get('/rest/liked/by/artainmo/to/nobody')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/liked/by/artainmo'));
	try { view_result(await axios.get('/rest/liked/by/nobody')); }
	catch (error) { view_result(error.response); }
	view_result(await axios.get('/rest/liked/to/artainmo'));
	try { view_result(await axios.get('/rest/liked/to/nobody')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.delete('/rest/liked/artainmo/pvanderl'));
	view_result(await axios.delete('/rest/liked/pvanderl/artainmo'));
	try { view_result(await axios.delete('/rest/liked/nobody/someone')); }
	catch (error) { view_result(error.response); }

	await axios.delete('/rest/account/artainmo');
	await axios.delete('/rest/account/pvanderl');
}

async function testMessage() {
	console.log('\033[32mMessage table tests\033[0m')

	await axios.post('/rest/account', account1);
	await axios.post('/rest/account', account2);

	view_result(await axios.post('/rest/message/artainmo/pvanderl', {content:'message content'}));
	view_result(await axios.post('/rest/message/pvanderl/artainmo', {content:'Hello'}));
	try { view_result(await axios.post('/rest/message/nobody/someone', {content:'Hi'})); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/message/artainmo/pvanderl'));
	try { view_result(await axios.get('/rest/message/artainmo/nobody')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.delete('/rest/message/artainmo/pvanderl'));
	try { view_result(await axios.delete('/rest/message/pvanderl/artainmo')); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.delete('/rest/message/nobody/someone')); }
	catch (error) { view_result(error.response); }

	await axios.delete('/rest/account/artainmo');
	await axios.delete('/rest/account/pvanderl');
}

async function testVisit() {
	console.log('\033[32mVisit table tests\033[0m')

	await axios.post('/rest/account', account1);
	await axios.post('/rest/account', account2);

	view_result(await axios.post('/rest/visit/artainmo/pvanderl'));
	view_result(await axios.post('/rest/visit/pvanderl/artainmo'));
	try { view_result(await axios.post('/rest/visit/nobody/someone')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/visit/by/artainmo'));
	try { view_result(await axios.get('/rest/visit/by/nobody')); }
	catch (error) { view_result(error.response); }
	view_result(await axios.get('/rest/visit/to/artainmo'));
	try { view_result(await axios.get('/rest/visit/to/nobody')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.delete('/rest/visit/artainmo'));
	view_result(await axios.delete('/rest/visit/pvanderl'));
	try { view_result(await axios.delete('/rest/visit/nobody')); }
	catch (error) { view_result(error.response); }

	await axios.delete('/rest/account/artainmo');
	await axios.delete('/rest/account/pvanderl');
}

async function testNotification() {
	console.log('\033[32mNotification table tests\033[0m')

	await axios.post('/rest/account', account1);
	await axios.post('/rest/account', account2);

	view_result(await axios.post('/rest/notification', notification1));
	view_result(await axios.post('/rest/notification', notification2));
	try { view_result(await axios.post('/rest/notification', notification3)); }
	catch (error) { view_result(error.response); }

	ret = await axios.get('/rest/notification/artainmo');
	notif_id1 = ret.data[0][0];
	view_result(ret);
	ret = await axios.get('/rest/notification/pvanderl');
	notif_id2 = ret.data[0][0];
	view_result(ret);
	try { view_result(await axios.get('/rest/notification/georges')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.patch('/rest/notification/' + notif_id1 + '/opened/true'));
	view_result(await axios.get('/rest/notification/artainmo'));
	try { view_result(await axios.patch('/rest/notification/123/opened/true')); }
	catch (error) { view_result(error.response); }
	try { view_result(
		await axios.patch('/rest/notification/d7b75cc9-037b-4803-862a-81cf183e2c97/ddeee/ok')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.delete('/rest/notification/' + notif_id1));
	view_result(await axios.delete('/rest/notification/' + notif_id2));
	try { view_result(
		await axios.delete('/rest/notification/d7b75cc9-037b-4803-862a-81cf183e2c97')); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.delete('/rest/notification/12e33343e')); }
	catch (error) { view_result(error.response); }

	await axios.delete('/rest/account/artainmo');
	await axios.delete('/rest/account/pvanderl');
}

async function testTag() {
	console.log('\033[32mTag table tests\033[0m')

	await axios.post('/rest/account', account1);
	await axios.post('/rest/account', account2);

	view_result(await axios.post('/rest/tag/artainmo/school19'));
	view_result(await axios.post('/rest/tag/pvanderl/proximus'));
	try { view_result(await axios.post('/rest/tag/nobody/something')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/tag/ofUser/artainmo'));
	try { view_result(await axios.get('/rest/tag/ofUser/nobody')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.get('/rest/tag/proximus'));
	try { view_result(await axios.get('/rest/tag/fefew')); }
	catch (error) { view_result(error.response); }

	view_result(await axios.delete('/rest/tag/artainmo/school19'));
	view_result(await axios.delete('/rest/tag/pvanderl/proximus'));
	try { view_result(await axios.delete('/rest/tag/nobody/something')); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.delete('/rest/tag/artainmo/deww')); }
	catch (error) { view_result(error.response); }

	await axios.delete('/rest/account/artainmo');
	await axios.delete('/rest/account/pvanderl');
}

async function test() {
	if (process.argv[2] === undefined || process.argv[2] == 'account')
		await testAccount()
	if (process.argv[2] === undefined || process.argv[2] == 'blocked')
		await testBlocked()
	if (process.argv[2] === undefined || process.argv[2] == 'liked')
		await testLiked()
	if (process.argv[2] === undefined || process.argv[2] == 'message')
		await testMessage()
	if (process.argv[2] === undefined || process.argv[2] == 'visit')
		await testVisit()
	if (process.argv[2] === undefined || process.argv[2] == 'notification')
		await testNotification()
	if (process.argv[2] === undefined || process.argv[2] == 'tag')
		await testTag()
}

test()
