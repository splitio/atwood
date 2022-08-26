const splitio = require('@splitsoftware/splitio').SplitFactory;
const axios = require('axios').default;

console.log("ATWOOD DATA GENERATOR");

const factory = splitio({
	core: {
		authorizationKey: 'd4bj6q57iq7ddea2qletvhjoibjfqhqj8c96',
		key: 'atwood_id' // unique identifier for your user
	},
	debug: false
});

const client = factory.client();
console.log('initializing SDK...');

let counter = new Date().getTime(); 
client.on(client.Event.SDK_READY, () => {
	console.log('SDK_READY!');
	setInterval(() => {
		const keyName = 'atwood';
		const feature = 'atwood';
		let onValue = Math.cos((counter % 360) * Math.PI / 180); 
		let offValue = Math.sin((counter % 360) * Math.PI / 180); 
		counter++;

		onValue *= 100;
		offValue *= 100;

		const props = {
			device: 'chrome',
			source: 'atwood'
		}

		//const time = new Date().getTime() - 1000 * 60 * 60 * 5;
		const time = new Date().getTime()
		console.log(new Date(time).toLocaleString());

		track(
			keyName, 
			feature,
			time, 
			'on',
			'page_latency_ms',
			'user',
			onValue,
			props);

		track(
	
			keyName, 
			feature,
		 	time,	
			'off',
			'page_latency_ms',
			'user',
			offValue,
			props);

		onValue = 20 + nextRandomInt();
		offValue = 0 + nextRandomInt();

		track(
			keyName, 
			feature,
			time, 
			'on',
			'onboarding_completion_time_ms',
			'user',
			onValue,
			props);

		track(
	
			keyName, 
			feature,
		 	time,	
			'off',
			'onboarding_completion_time_ms',
			'user',
			offValue,
			props);

		onValue = 100 + nextRandomInt();
		offValue = 50 + nextRandomInt();

		track(
			keyName, 
			feature,
			time, 
			'on',
			'clicks_to_adopt',
			'user',
			onValue,
			props);

		track(
	
			keyName, 
			feature,
		 	time,	
			'off',
			'clicks_to_adopt',
			'user',
			offValue,
			props);

	}, 1000);
});

function nextRandomInt() {
	return Math.floor((Math.random() * 25));
}

async function track(key, feature, time, treatment, eventTypeId, trafficTypeName, value, properties) {

	console.log(treatment + ' | ' + value);

	const url = 'https://xkh7626hm7tcbv6vh32oly2yle0xwtkl.lambda-url.us-west-2.on.aws/';

	const body = {
		key: key,
		split: feature,
		time: time,
		treatment: treatment,
		eventTypeId: eventTypeId,
		trafficTypeName: trafficTypeName,
		value: value,
		properties: properties
	}

	await axios({
		method: 'post',
		data: body,
		url: url,
		headers:{
			'Content-Type': 'application/json'
		}
	}).then(function (response) {
		console.log(response.data);
	}).catch(function (error) {
		console.log('-');
	});

}
