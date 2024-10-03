import type { Country, CountryResponse } from '$lib/types/geo.types';
import ky from 'ky';

export async function load() {
	const response = await ky.get<CountryResponse[]>('https://restcountries.com/v3.1/all').json();

	const countries: Country[] = response
		.sort((a, b) => a.name.common.localeCompare(b.name.common))
		.map((country) => ({
			name: country.name.common,
			code: country.cca2,
			coordinates: {
				lat: country.latlng[0],
				lng: country.latlng[1]
			},
			flag: country.flag
		}));

	return {
		countries
	};
}
