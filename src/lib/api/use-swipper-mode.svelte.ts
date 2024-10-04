import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { PotentialSwipePagableResponse, SwipeProfile } from '$lib/types/user.types';

class SwiperMode {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	hasMore = $state(true);
	potentialMatches = $state<SwipeProfile[]>([]);
	currentPage = $state(0);
}

export function useSwiperMode(authToken: string) {
	const resp = new SwiperMode();
	const api = authAPI(authToken);

	async function getPotentialMatches(size: number = 5) {
		if (!resp.hasMore) return;
		resp.isLoading = true;
		try {
			const response = await api
				.get<PotentialSwipePagableResponse>('swipes/potential-matches', {
					searchParams: { page: resp.currentPage, size }
				})
				.json();

			resp.potentialMatches = [...resp.potentialMatches, ...response.content];
			resp.hasMore = !response.last;
			resp.currentPage = response.number;
			resp.error = null;
		} catch (e) {
			resp.error = e as ServerErrorResponse;
			toast.error('Failed to load potential matches. Please try again later.');
			console.error(e);
		} finally {
			resp.isLoading = false;
		}
	}

	async function swipe(direction: 'left' | 'right', userId: number) {
		try {
			await api.post('swipes', { json: { swipedUserId: userId, direction } });
			resp.potentialMatches = resp.potentialMatches.filter((match) => match.userId !== userId);

			if (resp.potentialMatches.length === 0) {
				await getPotentialMatches();
			}

			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	getPotentialMatches();

	return {
		resp,
		swipe
	};
}
