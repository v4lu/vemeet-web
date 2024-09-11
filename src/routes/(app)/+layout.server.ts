import { authAPI } from '$lib/api';
import { ACCESS_TOKEN } from '$lib/constants';
import type { User } from '$lib/types/user.types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get(ACCESS_TOKEN);

	const api = authAPI(cookies);

	const res = api.get<User>('users').json();

	return {
		user: res,
		accessToken
	};
};
