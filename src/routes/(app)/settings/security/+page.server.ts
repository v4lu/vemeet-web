import { authAPI } from '$lib/api.js';
import { ACCESS_TOKEN } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

type EmailRequestType = {
	email: string;
};

export async function load({ cookies }) {
	const authToken = cookies.get(ACCESS_TOKEN);

	if (!authToken) throw redirect(307, '/sign-in');

	const api = authAPI(authToken);

	const response = await api.get<EmailRequestType>('auth/email').json();

	return {
		email: response.email
	};
}
