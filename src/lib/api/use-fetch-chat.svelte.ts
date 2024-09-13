import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { Message } from '$lib/types/chat.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class Chat {
	messages = $state<Message[]>([]);
	error = $state<ServerErrorResponse>();
	isLoading = $state(false);

	addMessage(message: Message) {
		this.messages.push(message);
	}
}

export function useFetchChat(id: number, authToken: string) {
	const resp = new Chat();

	async function fetchData() {
		resp.isLoading = true;
		try {
			const api = authAPI(authToken);
			const res = await api.get<Message[]>(`chats/${id}`).json();
			resp.messages = res.reverse();
			resp.error = undefined;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
				toast.error('Something went wrong, please try again later');
			}
		}
		resp.isLoading = false;
	}

	fetchData();
	return resp;
}
