import { WEBSOCKET_URL } from '$lib/constants';
import type { Message } from '$lib/types/chat.types';
import { writable } from 'svelte/store';

export class WebSocketService {
	private socket: WebSocket | null = null;
	private messageStore = writable<Message[]>([]);

	connect(userId: number, authToken: string) {
		this.socket = new WebSocket(`${WEBSOCKET_URL}/chat?userId=${userId}&token=${authToken}`);

		this.socket.onmessage = (event) => {
			const message: Message = JSON.parse(event.data);
			this.messageStore.update((messages) => {
				if (!messages.some((m) => m.id === message.id)) {
					return [...messages, message];
				}
				return messages;
			});
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	}

	disconnect() {
		if (this.socket) {
			this.socket.close();
		}
	}

	sendMessage(message: Message) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		} else {
			console.error('WebSocket is not connected');
		}
	}

	subscribe(callback: (value: Message[]) => void) {
		return this.messageStore.subscribe(callback);
	}
}

export const webSocketService = new WebSocketService();
