import { authAPI } from '$lib/api';
import type { LocationPagableResponse, VeganLocation } from '$lib/types/geo.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { User, UserPagableResponse } from '$lib/types/user.types';
import { HTTPError } from 'ky';

class Search {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	users = $state<User[]>([]);
	locations = $state<VeganLocation[]>([]);
	hasMore = $state(true);
	currentPage = $state(0);
	locationPermission = $state<'granted' | 'denied' | 'prompt'>('prompt');
}

export function useSuggestions(authToken: string) {
	const resp = new Search();
	const api = authAPI(authToken);

	async function getUsers(lat: number, lon: number, radius: number, page: number = 0) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<UserPagableResponse>('search/users/nearby', {
					searchParams: {
						latitude: lat,
						longitude: lon,
						maxDistance: radius,
						page,
						size: 10
					}
				})
				.json();

			if (page === 0) {
				resp.users = response.content;
			} else {
				resp.users = [...resp.users, ...response.content];
			}

			resp.hasMore = !response.last;
			resp.currentPage = response.number;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	async function getLocations(lat: number, lon: number, radius: number, page: number = 0) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<LocationPagableResponse>('search/locations/nearby', {
					searchParams: {
						latitude: lat,
						longitude: lon,
						maxDistance: radius,
						page,
						size: 10
					}
				})
				.json();
			if (page === 0) {
				resp.locations = response.content;
			} else {
				resp.locations = [...resp.locations, ...response.content];
			}
			resp.hasMore = !response.last;
			resp.currentPage = response.number;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	async function loadMore(
		lat: number,
		lon: number,
		radius: number,
		type: 'users' | 'locations' = 'users'
	) {
		if (resp.hasMore && !resp.isLoading) {
			if (type === 'users') {
				await getUsers(lat, lon, radius, resp.currentPage + 1);
			} else {
				await getLocations(lat, lon, radius, resp.currentPage + 1);
			}
		}
	}

	async function checkLocationPermission() {
		if (!('geolocation' in navigator)) {
			resp.locationPermission = 'denied';
			return false;
		}

		try {
			const permission = await navigator.permissions.query({ name: 'geolocation' });
			resp.locationPermission = permission.state;

			permission.addEventListener('change', () => {
				resp.locationPermission = permission.state;
			});

			return resp.locationPermission === 'granted';
		} catch {
			resp.locationPermission = 'prompt';
			return false;
		}
	}

	async function requestLocation() {
		return new Promise<GeolocationPosition>((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject);
		});
	}

	return {
		resp,
		getUsers,
		loadMore,
		requestLocation,
		checkLocationPermission,
		getLocations
	};
}
