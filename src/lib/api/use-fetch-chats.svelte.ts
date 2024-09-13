import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { Chat } from '$lib/types/chat.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class UsersResponse {
	chats = $state<Chat[]>([]);
	error = $state<ServerErrorResponse>();
	isLoading = $state(false);

	addChat(chat: Chat) {
		this.chats = [chat, ...this.chats];
	}

	updateChat(updatedChat: Chat) {
		this.chats = this.chats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat));
	}

	removeChat(chatId: number) {
		this.chats = this.chats.filter((chat) => chat.id !== chatId);
	}

	getChatById(chatId: number): Chat | undefined {
		return this.chats.find((chat) => chat.id === chatId);
	}
}

export function useFetchChats(authToken: string) {
	const resp = new UsersResponse();

	async function fetchData() {
		resp.isLoading = true;
		try {
			const api = authAPI(authToken);
			resp.chats = await api.get('chats').json();
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
