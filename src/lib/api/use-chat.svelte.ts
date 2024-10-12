import { browser } from '$app/environment';
import { authAPI } from '$lib/api';
import { WEBSOCKET_URL } from '$lib/constants';
import { toast } from '$lib/stores/toast.store';
import type { CreateMessage, Message, MessagesPagableResponse } from '$lib/types/chat.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';
import ReconnectingWebSocket from 'reconnecting-websocket';

type UseFetchChatArgs = {
	userId: number;
	chatId?: number;
	authToken: string;
	firstTime: boolean;
};

class Chat {
	messages = $state<Message[]>([]);
	error = $state<ServerErrorResponse>();
	isLoading = $state(true);
	currentPage = $state(0);
	hasMore = $state(true);
	socket: ReconnectingWebSocket | null = $state(null);
	firstTime = $state(true);
}

export function useChat({ authToken, chatId, userId, firstTime }: UseFetchChatArgs) {
	const resp = new Chat();
	const api = authAPI(authToken);
	resp.firstTime = firstTime;

	function connectWebSocket() {
		if (!chatId) return;
		if (!browser) return;
		const wsUrl = `${WEBSOCKET_URL}/chat?userId=${userId}&chatId=${chatId}&token=${authToken}`;

		resp.socket = new ReconnectingWebSocket(wsUrl, [], {
			maxReconnectionDelay: 10000,
			minReconnectionDelay: 1000,
			reconnectionDelayGrowFactor: 1.3
		});
		resp.socket.onmessage = (event) => {
			const newMessage = JSON.parse(event.data) as Message;
			resp.messages = [...resp.messages, newMessage];
		};

		resp.socket.onerror = (error) => {
			console.error(`WebSocket error for user ${userId}:`, error);
		};
	}

	async function fetchData(page: number) {
		if (!chatId) return;
		resp.isLoading = true;
		try {
			const response = await api
				.get<MessagesPagableResponse>(`chats/${chatId}?page=${page}`)
				.json();
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

	async function postMessage(payload: Omit<CreateMessage, 'firstTime'>) {
		try {
			const message: CreateMessage = {
				...payload,
				firstTime: resp.firstTime
			};
			const res = await api.post<Message>(`chats/message`, { json: message }).json();
			resp.firstTime = false;
			toast.success('Message sent successfully');
			return res;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
				toast.error('Failed to send message. Please try again.');
			}
		}
	}

	function cleanup() {
		if (browser && resp.socket) {
			resp.socket.close();
		}
	}

	if (browser) {
		connectWebSocket();
	}

	return {
		fetchData,
		postMessage,
		resp,
		cleanup
	};
}
