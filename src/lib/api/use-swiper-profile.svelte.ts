import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { SwipeProfile, SwipeProfileUpdate } from '$lib/types/user.types';

class SwiperProfile {
	error = $state<ServerErrorResponse | null>(null);
	user = $state<SwipeProfile>();
	isLoading = $state(false);

	isSubmittingUpdate = $state(false);
}

export function useSwiperProfile(authToken: string, userId: number) {
	const resp = new SwiperProfile();
	const api = authAPI(authToken);

	async function loadProfile() {
		resp.isLoading = true;
		try {
			const response = await api.get<SwipeProfile>(`swipes/${userId}`).json();
			resp.user = response;
		} catch (error) {
			resp.error = error as ServerErrorResponse;
		}
		resp.isLoading = false;
	}

	async function updateProfile(payload: SwipeProfileUpdate) {
		resp.isSubmittingUpdate = true;
		try {
			const response = await api.patch<SwipeProfile>('swipes', { json: payload }).json();
			resp.user = response;
			toast.success('Profile updated successfully');
		} catch (error) {
			resp.error = error as ServerErrorResponse;
		}
		resp.isSubmittingUpdate = false;
	}

	loadProfile();

	return {
		resp,
		updateProfile
	};
}
