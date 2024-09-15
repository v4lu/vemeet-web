import { authAPI } from '$lib/api';
import type { Image } from '$lib/types/image.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';

class ProfileMedia {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	media = $state<Image[]>([]);
}

export function useProfileMedia(authToken: string, userId: number) {
	const resp = new ProfileMedia();
	const api = authAPI(authToken);

	async function loadImages() {
		resp.isLoading = true;
		try {
			const response = await api.get<Image[]>(`images/${userId}`, {}).json();
			resp.media = response;
		} catch (error) {
			console.error('Error fetching images:', error);
		}
		resp.isLoading = false;
	}

	loadImages();
	return {
		resp
	};
}
