import { authAPI } from '$lib/api';
import { ACCESS_TOKEN } from '$lib/constants';
import type { UserSwiperPreferences } from '$lib/types/user.types';
import { redirect } from '@sveltejs/kit';
import type { HTTPError } from 'ky';

export async function load({ cookies, url }) {
	const accessToken = cookies.get(ACCESS_TOKEN);

	if (!accessToken) {
		throw redirect(307, '/sign-in');
	}

	const api = authAPI(accessToken);

	try {
		const response = await api.get<UserSwiperPreferences>('user-preferences').json();

		return {
			userSwiperPreferences: response,
			userSwiperConfigurated: true,
			path: url.pathname
		};
	} catch (e) {
		const error = e as HTTPError;

		if (error.response.status === 404) {
			return {
				userSwiperPreferences: null,
				userSwiperConfigurated: false,
				path: url.pathname
			};
		}
	}
}
