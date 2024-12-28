import { redirect } from '@sveltejs/kit';
import { authAPI } from '$lib/api.js';
import { ACCESS_TOKEN } from '$lib/constants.js';
import type { Country } from '$lib/types/geo.types';

export async function load({ cookies }) {
	const authToken = cookies.get(ACCESS_TOKEN);
	if (!authToken) throw redirect(307, 'sign-in');
	const api = authAPI(authToken);
	const response = await api.get<Country[]>('locations/countries').json();

	return {
		countries: response
	};
}
