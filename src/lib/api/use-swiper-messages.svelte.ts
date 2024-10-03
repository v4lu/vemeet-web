import { authAPI } from '$lib/api';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { User } from '$lib/types/user.types';

class SwiperMessages {
	error = $state<ServerErrorResponse | null>(null);
	matches = $state<User[]>([]);
	isLoading = $state(false);
}

export function useSwiperMessages(authToken: string) {
	const resp = new SwiperMessages();
	const api = authAPI(authToken);

	async function loadMatches() {
		resp.isLoading = true;
		try {
			const response = await api.get<User[]>('swipes/matches').json();
			resp.matches = response;
		} catch (error) {
			resp.error = error as ServerErrorResponse;
		}
		resp.isLoading = false;
	}

	loadMatches();

	return {
		resp
	};
}
