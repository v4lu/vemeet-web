import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { Message, MessagesPagableResponse } from '$lib/types/chat.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class Chat {
	messages = $state<Message[]>([]);
	error = $state<ServerErrorResponse>();
	isLoading = $state(true);
	currentPage = $state(0);
	hasMore = $state(true);
}

export function useFetchChat(id: number, authToken: string) {
	const resp = new Chat();
	const api = authAPI(authToken);

	async function fetchData(page: number) {
		resp.isLoading = true;
		try {
			const response = await api.get<MessagesPagableResponse>(`chats/${id}?page=${page}`).json();

			if (page === 0) {
				resp.messages = response.content.reverse();
			} else {
				resp.messages = [...response.content.reverse(), ...resp.messages];
			}

			resp.currentPage = page;
			resp.hasMore = !response.last;
		} catch (err) {
			console.error('Error fetching messages:', err);
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
				toast.error('Something went wrong, please try again later');
			}
		}
		resp.isLoading = false;
	}

	return {
		fetchData,
		resp
	};
}
