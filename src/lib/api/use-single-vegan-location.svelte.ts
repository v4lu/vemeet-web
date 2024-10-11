import { goto } from '$app/navigation';
import { authAPI } from '$lib/api';
import type {
	VeganLocation as TVeganLocation,
	VeganLocationUpdateRequest
} from '$lib/types/geo.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class VeganLocation {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	location = $state<TVeganLocation | null>(null);
}

export function useVeganLocation(authToken: string, id: number) {
	const resp = new VeganLocation();
	const api = authAPI(authToken);

	async function getLocation() {
		resp.isLoading = true;
		try {
			const response = await api.get<TVeganLocation>(`vegan-locations/${id}`).json();
			resp.location = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	async function deleteLocation() {
		try {
			await api.delete(`vegan-locations/${id}`);
			goto('/');
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
	}

	async function updateLocation(payload: VeganLocationUpdateRequest) {
		try {
			const response = await api
				.patch<TVeganLocation>(`vegan-locations/${id}`, {
					json: { ...payload }
				})
				.json();
			resp.location = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
	}

	getLocation();

	return {
		resp,
		getLocation,
		deleteLocation,
		updateLocation
	};
}
