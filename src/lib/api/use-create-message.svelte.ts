import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { Message } from '$lib/types/chat.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

type MessagePayload = {
	recipientId: number;
	messageType: string;
	content: string;
	isOneTime: boolean;
};

class PostMessageResponse {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
}

export function usePostMessage(chatId: number, authToken: string) {
	const resp = new PostMessageResponse();

	async function postMessage(payload: MessagePayload) {
		resp.isLoading = true;
		try {
			const api = authAPI(authToken);
			const res = await api.post<Message>(`chats/${chatId}/messages`, { json: payload }).json();
			resp.error = null;
			toast.success('Message sent successfully');
			return res;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
				toast.error('Failed to send message. Please try again.');
			}
		}
		resp.isLoading = false;
	}

	return { postMessage, ...resp };
}
