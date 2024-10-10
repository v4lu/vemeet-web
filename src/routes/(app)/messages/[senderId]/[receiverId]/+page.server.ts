import { authAPI } from '$lib/api';
import { ACCESS_TOKEN } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import type { Chat } from '$lib/types/chat.types';
import { HTTPError } from 'ky';

export async function load({ params, cookies }) {
	const authToken = cookies.get(ACCESS_TOKEN);

	if (!authToken) {
		throw redirect(307, '/sign-in');
	}

	const api = authAPI(authToken);

	try {
		const response = await api.get<Chat>(`chats/users/${params.receiverId}`).json();

		return {
			receiverId: params.receiverId,
			senderId: params.senderId,
			chat: response
		};
	} catch (e) {
		if (e instanceof HTTPError && e.response.status === 404) {
			const chat = await api
				.post<Omit<Chat, 'lastMessage'>>('chats/create', {
					json: { otherUserId: params.receiverId }
				})
				.json();

			return {
				receiverId: params.receiverId,
				senderId: params.senderId,
				chat
			};
		}
		throw e;
	}
}
