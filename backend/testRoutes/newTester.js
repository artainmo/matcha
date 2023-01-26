const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:1942';
axios.defaults.withCredentials = true; //Send cookies with requests

let account =  {
    username: 'pvanderl',
    password: 'pass',
    email: 'hotmail',
    firstname: 'p',
    lastname: 'v',
    gender: 'MALE',
    sexual_orientation: 'BI',
    biography: 'dwdqdq',
    birthday: '2015-12-21',
	//profile_picture
	//tags
};

let account2 =  {
    username: 'artainmo',
    password: 'pass',
    email: 'hotmail',
    firstname: 'art',
    lastname: 'tai',
    gender: 'MALE',
    sexual_orientation: 'FEMALE',
    biography: 'dwdqdq',
    birthday: '2015-12-21',
    geolocation: 'Lile'
};

let account3 = {
    username: 'girl',
    password: 'pass',
    email: 'hotmail',
    firstname: 'g',
    lastname: 'i',
    gender: 'FEMALE',
    sexual_orientation: 'MALE',
    biography: 'dwdqdq',
    birthday: '2020-12-21',
    geolocation: "Hôtel de Ville, 75004 Paris, France"
};

let account4 = {
    username: 'girl2',
    password: 'pass',
    email: 'hotmail',
    firstname: 'g2',
    lastname: 'i2',
    gender: 'FEMALE',
    sexual_orientation: 'MALE',
    biography: 'dwdqdq',
    birthday: '2007-12-21',
    geolocation: 'Paris'
};

let account5 = {
    username: 'girl3',
    password: 'pass',
    email: 'hotmail',
    firstname: 'g3',
    lastname: 'i3',
    gender: 'FEMALE',
    sexual_orientation: 'MALE',
    biography: 'dwdqdq',
    birthday: '2020-12-21',
    geolocation: "Hôtel de Ville, 75004 Paris, France"
};

let account6 = {
    username: 'gay1',
    password: 'pass',
    email: 'hotmail',
    firstname: 'g',
    lastname: 'a',
    gender: 'MALE',
    sexual_orientation: 'MALE',
    biography: 'dwdqdq',
    birthday: '2019-12-21',
    geolocation: 'Paris'
};

function view_result(res) {
    console.log('Request: ' + res.config.method + ' ' + res.config.url);
    console.log('Response status code: ' + res.status);
    console.log('Response body: ' + res.data);
    console.log('');
}

async function selectiveTesting() {
	//try { await axios.delete('/rest/account'); }
	//catch (error) { view_result(error.response); }
/*
	console.log('\033[32mCREATE ACCOUNTS FOR SIMULATION\033[0m');

	try { view_result(await axios.post('/rest/account/register', account)); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.patch('/rest/account/fill/pvanderl', account)); }
	catch (error) { view_result(error.response); }

	try { view_result(await axios.post('/rest/account/register', account2)); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.patch('/rest/account/fill/artainmo', account2)); }
	catch (error) { view_result(error.response); }

	try { view_result(await axios.post('/rest/account/register', account3)); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.patch('/rest/account/fill/girl', account3)); }
	catch (error) { view_result(error.response); }

	try { view_result(await axios.post('/rest/account/register', account4)); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.patch('/rest/account/fill/girl2', account4)); }
	catch (error) { view_result(error.response); }

	try { view_result(await axios.post('/rest/account/register', account5)); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.patch('/rest/account/fill/girl3', account5)); }
	catch (error) { view_result(error.response); }

	try { view_result(await axios.post('/rest/account/register', account6)); }
	catch (error) { view_result(error.response); }
	try { view_result(await axios.patch('/rest/account/fill/gay1', account6)); }
	catch (error) { view_result(error.response); }
*/
	console.log('\033[32mTESTS\033[0m');
	try { view_result(await axios.get('/rest/account/suggestions?sort=age')) }
	catch (error) { view_result(error.response); }

	//try { await axios.delete('/rest/account'); }
	//catch (error) { view_result(error.response); }
}

selectiveTesting();
