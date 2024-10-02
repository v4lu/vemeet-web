import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { PotencialMatch, PotencialMatchResponse } from '$lib/types/user.types';

class SwiperMode {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	hasMore = $state(false);
	potentialMatches = $state<PotencialMatch[]>([]);
	currentPage = $state(0);
}

export function useSwiperMode(authToken: string) {
	const resp = new SwiperMode();
	const api = authAPI(authToken);

	async function getPotentialMatches(page: number = resp.currentPage, size: number = 4) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<PotencialMatchResponse>('swipes/potential-matches', {
					searchParams: { page, size }
				})
				.json();

			if (page === 0) {
				resp.potentialMatches = response.matches;
			} else {
				resp.potentialMatches = [...resp.potentialMatches, ...response.matches];
			}

			resp.hasMore = response.hasNextPage;
			resp.currentPage = page;
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
			toast.success('Swiped successfully');
		} catch (e) {
			toast.error('Failed to register swipe. Please try again.');
			console.error(e);
		}
	}

	function loadMoreMatches() {
		if (resp.hasMore && !resp.isLoading) {
			getPotentialMatches(resp.currentPage + 1);
		}
	}

	return {
		resp,
		getPotentialMatches,
		swipe,
		loadMoreMatches
	};
}
