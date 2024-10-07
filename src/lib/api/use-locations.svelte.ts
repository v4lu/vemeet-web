import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { City } from '$lib/types/geo.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class Geo {
	cities = $state<City[]>([]);
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
}

export function useLocations(authToken: string) {
	const resp = new Geo();
	const api = authAPI(authToken);

	async function fetchCities(countryIsoCode: string, search: string = '') {
		resp.isLoading = true;
		resp.error = null;

		try {
			const response = await api
				.get(`locations/cities/${countryIsoCode}`, {
					searchParams: {
						search
					}
				})
				.json<City[]>();

			resp.cities = response;
		} catch (err) {
			console.error('Error fetching cities:', err);
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
				toast.error('Failed to fetch cities. Please try again later.');
			}
		} finally {
			resp.isLoading = false;
		}
	}

	return {
		fetchCities,
		resp
	};
}
