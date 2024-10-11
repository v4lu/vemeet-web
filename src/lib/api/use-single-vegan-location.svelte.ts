import { goto } from '$app/navigation';
import { authAPI } from '$lib/api';
import type {
	LocationReviewRequest,
	LocationReviewResponse,
	LocationReviewUpdate,
	VeganLocation as TVeganLocation,
	VeganLocationUpdateRequest
} from '$lib/types/geo.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class VeganLocation {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	location = $state<TVeganLocation | null>(null);
	isSubmittingReview = $state(false);
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

	async function createReview(payload: LocationReviewRequest) {
		if (!resp.location) return;
		resp.isSubmittingReview = true;
		try {
			const response = await api
				.post<LocationReviewResponse>(`vegan-locations-reviews/${id}`, {
					json: { ...payload }
				})
				.json();
			resp.location.reviews = [response, ...resp.location.reviews];
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
	}

	async function deleteReview(reviewId: number) {
		if (!resp.location) return;
		try {
			await api.delete(`vegan-locations-reviews/${id}/${reviewId}`);
			resp.location.reviews = resp.location.reviews.filter((r) => r.id !== reviewId);
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
	}

	async function patchReview(payload: LocationReviewUpdate, reviewId: number) {
		if (!resp.location) return;
		try {
			const response = await api
				.patch<LocationReviewResponse>(`vegan-locations-reviews/${id}/${reviewId}`, {
					json: { ...payload }
				})
				.json();
			resp.location.reviews = resp.location.reviews.map((r) => (r.id === reviewId ? response : r));
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
		patchReview,
		deleteReview,
		createReview,
		updateLocation
	};
}
