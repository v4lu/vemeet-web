import { refreshToken } from '$lib/api';
import { ACCESS_TOKEN, COGNITO_ID, REFRESH_TOKEN, isProduction } from '$lib/constants';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const access = event.cookies.get(ACCESS_TOKEN);
	const refresh = event.cookies.get(REFRESH_TOKEN);
	const cognitoId = event.cookies.get(COGNITO_ID);

	if (!access && refresh && cognitoId) {
		try {
			const refreshedTokens = await refreshToken(refresh, cognitoId);

			const now = Math.floor(Date.now() / 1000);
			const bufferTime = 60; // 1 minute buffer

			event.cookies.set(ACCESS_TOKEN, refreshedTokens.accessToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: isProduction,
				maxAge: Math.max(0, refreshedTokens.accessTokenExpiry - now - bufferTime)
			});

			event.request.headers.set('Authorization', `Bearer ${refreshedTokens.accessToken}`);
		} catch (error) {
			console.error(error);
			event.cookies.delete(ACCESS_TOKEN, { path: '/' });
			event.cookies.delete(REFRESH_TOKEN, { path: '/' });
			event.cookies.delete(COGNITO_ID, { path: '/' });
			return new Response(null, { status: 302, headers: { Location: '/sign-in' } });
		}
	}

	const response = await resolve(event);
	return response;
};
