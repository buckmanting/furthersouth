const apiKeys = require('./api-key.json');

const readline = require('readline');
const googleMapsClient = require('@google/maps').createClient({
	key: apiKeys.GOOGLE_MAPS
});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
let firstCity;
let secondCity;
let extremity;

const getFirstCity = async () => {
	return new Promise(resolve => {
		rl.question('What is your first city?\n', (answer) => {
			return googleMapsClient.geocode({
				address: answer
			}, function (err, response) {
				if (!err) {
					if (response.json.results.length === 1) {
						firstCity = response.json.results[0];
						resolve();
					} else {
						console.table([...response.json.results.map(r => r.formatted_address)]);

						rl.question('Select the number of the city in the list below\n', (answer) => {
							firstCity = response.json.results[answer];
							resolve();
						});
					}
				} else {
					console.error(err);
				}
			});
		})
	});
};

const getSecondCity = async () => {
	return new Promise(resolve => {
		rl.question('What is your second city?\n', (answer) => {
			googleMapsClient.geocode({
				address: answer
			}, function (err, response) {
				if (!err) {
					if (response.json.results.length === 1) {
						secondCity = response.json.results[0];
						resolve();
					} else {
						console.table([...response.json.results.map(r => r.formatted_address)]);

						rl.question('Select the number of the city in the list below\n', (answer) => {
							secondCity = response.json.results[answer];
							resolve();
						});
					}
				} else {
					console.log('sorry, no results')
				}
			});
		});
	});
};

const getExtremity = () => {
	return new Promise(resolve => {
		rl.question(`Would you like to know if ${firstCity.formatted_address} further North, South, East or West than ${secondCity.formatted_address}\n`, (answer) => {
			const extremityRegex = /^NORTH|SOUTH|EAST|WEST$/i;

			if (extremityRegex.exec(answer)) {
				extremity = answer.toLowerCase();
				resolve();
			}
			else {
				console.log(`that's not a valid input, try again`);
				getExtremity();
			}
		})
	});
};

const calculate = () => {
	const firstCityLocation = firstCity.geometry.location;
	const secondCityLocation = secondCity.geometry.location;
	let message;

	switch (extremity) {
		case 'north':
			if (firstCityLocation.lat > secondCityLocation.lat) {
				message = `${firstCity.address_components[0].long_name} is further north than ${secondCity.address_components[0].long_name}`;
			} else {
				message = `${secondCity.address_components[0].long_name} is further north than ${firstCity.address_components[0].long_name}`;
			}

			break;
		case 'south':
			if (firstCityLocation.lat < secondCityLocation.lat) {
				message = `${firstCity.address_components[0].long_name} is further south than ${secondCity.address_components[0].long_name}`;
			} else {
				message = `${secondCity.address_components[0].long_name} is further south than ${firstCity.address_components[0].long_name}`;
			}

			break;
		case 'east':
			if (firstCityLocation.lng > secondCityLocation.lng) {
				message = `${firstCity.address_components[0].long_name} is further east than ${secondCity.address_components[0].long_name}`;
			} else {
				message = `${secondCity.address_components[0].long_name} is further east than ${firstCity.address_components[0].long_name}`;
			}

			break;
		case 'west':
			if (firstCityLocation.lng < secondCityLocation.lng) {
				message = `${firstCity.address_components[0].long_name} is further west than ${secondCity.address_components[0].long_name}`;
			} else {
				message = `${secondCity.address_components[0].long_name} is further west than ${firstCity.address_components[0].long_name}`;
			}

			break;
	}
	return message;
};

getFirstCity()
	.then(() => {
		console.log(`Cool, you've picked ${firstCity.formatted_address}`);

		secondCity = getSecondCity()
			.then(() => {
				console.log(`Cool, you've picked ${secondCity.formatted_address}`);

				getExtremity()
					.then(() => {
						if(firstCity.formatted_address === secondCity.formatted_address){
							console.log()
						}
						console.log(calculate());
						rl.close();
					})
					.catch(err => console.error(err));
			})
			.catch(err => console.error(err));

	})
	.catch(err => console.error(err));
