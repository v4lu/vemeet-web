import { HTTPError } from 'ky';
import { authAPI } from '$lib/api';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type {
	CreateStoryRequest,
	StoryResponse,
	UserStoriesResponse
} from '$lib/types/story.types';
import type { User } from '$lib/types/user.types';

class Story {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	stories = $state<UserStoriesResponse[]>([]);
	userStories = $state<StoryResponse[]>([]);
	isSubmitting = $state(false);
}

export function useFeedStories(authToken: string, sessionUser: User) {
	const resp = new Story();
	const api = authAPI(authToken);

	async function loadStories() {
		try {
			const response = await api.get<UserStoriesResponse[]>('stories/followed').json();
			resp.stories = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
	}

	async function loadUserStories() {
		try {
			const response = await api.get<StoryResponse[]>(`stories/user/${sessionUser.id}`).json();
			resp.userStories = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
	}

	async function fetchAll() {
		resp.isLoading = true;
		try {
			await Promise.all([loadStories(), loadUserStories()]);
		} catch (err) {
			console.error('Error fetching stories:', err);
		} finally {
			resp.isLoading = false;
		}
	}

	async function createStory(payload: CreateStoryRequest) {
		resp.isSubmitting = true;
		try {
			const newStory = await api.post<StoryResponse>('stories', { json: { ...payload } }).json();

			resp.userStories = [newStory, ...resp.userStories];
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		} finally {
			resp.isSubmitting = false;
		}
	}

	fetchAll();

	return {
		resp,
		createStory,
		fetchAll
	};
}
