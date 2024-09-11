import { browser } from '$app/environment';
import { type Cookies, redirect } from '@sveltejs/kit';
import ky from 'ky';
import { ACCESS_TOKEN, CLIENT_BASE_URL, SERVER_BASE_URL } from './constants';

function getBaseUrl() {
	return browser ? CLIENT_BASE_URL : SERVER_BASE_URL;
}

export const api = ky.create({
	prefixUrl: getBaseUrl()
});

type RefreshResponse = {
	accessToken: string;
	accessTokenExpiry: number;
};

export function authAPI(cookies: Cookies) {
	return ky.create({
		prefixUrl: getBaseUrl(),
		timeout: 10000,
		headers: {
			Authorization: `Bearer ${cookies.get(ACCESS_TOKEN)}`
		},
		retry: {
			limit: 2,
			methods: ['get', 'post', 'put', 'delete', 'patch'],
			statusCodes: [500]
		}
	});
}

export async function refreshToken(refresh: string, cognitoId: string) {
	try {
		const res = await ky
			.post<RefreshResponse>(`${getBaseUrl()}/auth/refresh?id=${cognitoId}`, {
				headers: {
					'Refresh-Token-X': refresh
				}
			})
			.json();
		return res;
	} catch (error) {
		console.error('Failed to refresh token:', error);
		throw redirect(302, '/sign-in');
	}
}
