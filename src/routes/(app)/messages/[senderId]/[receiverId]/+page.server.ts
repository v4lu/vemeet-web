import { authAPI } from '$lib/api';
import { ACCESS_TOKEN } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import type { Chat } from '$lib/types/chat.types';
import { HTTPError } from 'ky';
import type { User } from '$lib/types/user.types.js';

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
			otherUser: response.otherUser,
			firstTime: false,
			chat: response
		};
	} catch (e) {
		if (e instanceof HTTPError && e.response.status === 404) {
			const response = await api.get<User>(`users/${params.receiverId}`).json();
			return {
				receiverId: params.receiverId,
				senderId: params.senderId,
				otherUser: response,
				firstTime: true
			};
		}
		throw e;
	}
}
