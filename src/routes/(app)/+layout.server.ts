import { authAPI } from '$lib/api';
import { ACCESS_TOKEN } from '$lib/constants';
import type { User } from '$lib/types/user.types';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const accessToken = cookies.get(ACCESS_TOKEN);

	if (!accessToken) {
		throw redirect(307, '/sign-in');
	}

	const api = authAPI(accessToken);

	const user = await api.get<User>('users').json();

	return {
		user,
		accessToken,
		path: url.pathname
	};
};
