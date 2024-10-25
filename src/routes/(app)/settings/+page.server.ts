import { ACCESS_TOKEN, COGNITO_ID, REFRESH_TOKEN } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete(ACCESS_TOKEN, { path: '/' });
		cookies.delete(REFRESH_TOKEN, { path: '/' });
		cookies.delete(COGNITO_ID, { path: '/' });
		throw redirect(303, 'https://vemeet.me');
	}
};
