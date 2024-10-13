import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { Chat } from '$lib/types/chat.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { Notification } from '$lib/types/notification.type';
import { HTTPError } from 'ky';
import { onDestroy } from 'svelte';

class Notifications {
	chats = $state<Chat[]>([]);
	error = $state<ServerErrorResponse>();
	messageNotification = $state<Notification[]>([]);
	nonMessageNotification = $state<Notification[]>([]);
	isLoading = $state(false);
}

export function useNotification(authToken: string) {
	const resp = new Notifications();
	const api = authAPI(authToken);

	async function fetchMessageNotifications() {
		try {
			const response = await api.get<Notification[]>('notifications/messages').json();
			resp.messageNotification = response;
		} catch (error) {
			if (error instanceof HTTPError) {
				resp.error = await error.response.json();
				console.error(resp.error);
			}
		}
	}

	async function fetchNonMessageNotifications() {
		try {
			const response = await api.get<Notification[]>('notifications/non-messages').json();
			resp.nonMessageNotification = response;
		} catch (error) {
			if (error instanceof HTTPError) {
				resp.error = await error.response.json();
				console.error(resp.error);
			}
		}
	}

	async function fetchAll() {
		resp.isLoading = true;
		try {
			await Promise.all([fetchMessageNotifications(), fetchNonMessageNotifications()]);
		} catch (err) {
			console.error('Error fetching notifications:', err);
		} finally {
			resp.isLoading = false;
		}
	}

	async function markAsRead(notificationId: number) {
		try {
			await api.post(`notifications/mark-read/${notificationId}`);
			resp.messageNotification = resp.messageNotification.filter((n) => n.id !== notificationId);
			resp.nonMessageNotification = resp.nonMessageNotification.filter(
				(n) => n.id !== notificationId
			);
			toast.success('Notification marked as read');
		} catch (error) {
			if (error instanceof HTTPError) {
				resp.error = await error.response.json();
				toast.error('Failed to mark notification as read');
			}
		}
	}

	async function markAllAsRead() {
		try {
			await api.post('notifications/mark-all-non-message-read');
			resp.nonMessageNotification = [];
			toast.success('All non-message notifications marked as read');
		} catch (error) {
			if (error instanceof HTTPError) {
				resp.error = await error.response.json();
				toast.error('Failed to mark all non-message notifications as read');
			}
		}
	}

	fetchAll();
	const refreshInterval = setInterval(fetchAll, 40000); // 40 seconds

	onDestroy(() => clearInterval(refreshInterval));

	return {
		resp,
		markAsRead,
		markAllAsRead
	};
}
