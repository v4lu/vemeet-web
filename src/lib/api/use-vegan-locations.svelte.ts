import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { CreateLocation, VeganLocation } from '$lib/types/geo.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class VeganLocations {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	isCreatingLoading = $state(false);
	locations = $state<VeganLocation[]>([]);
	isFetched = $state(false);
}

export function useVeganLocations(authToken: string) {
	const resp = new VeganLocations();
	const api = authAPI(authToken);

	async function createLocation(payload: CreateLocation) {
		resp.isCreatingLoading = true;
		try {
			const response = await api
				.post<VeganLocation>('vegan-locations', { json: { ...payload } })
				.json();
			resp.locations = [...resp.locations, response];
			toast.success('Location created successfully, thank you!');
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		} finally {
			resp.isCreatingLoading = false;
		}
	}

	async function getLocations(page: number, search: string) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<VeganLocation[]>(`vegan-locations`, {
					searchParams: {
						search,
						page
					}
				})
				.json();
			resp.locations = response;
			resp.isFetched = true;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	getLocations(0, '');

	return {
		resp,
		createLocation,
		getLocations
	};
}
