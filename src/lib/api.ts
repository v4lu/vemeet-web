import { browser } from '$app/environment';
import { type Cookies, redirect } from '@sveltejs/kit';
import ky, { type KyInstance } from 'ky';
import { ACCESS_TOKEN, CLIENT_BASE_URL, SERVER_BASE_URL } from './constants';

function getBaseUrl(): string {
	return browser ? CLIENT_BASE_URL : SERVER_BASE_URL;
}

export const api = ky.create({
	prefixUrl: getBaseUrl()
});

type RefreshResponse = {
	accessToken: string;
	accessTokenExpiry: number;
};

export function authAPI(cookies: Cookies): KyInstance {
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

export function createAuthHeaders(token: string): Headers {
	return new Headers({
		Authorization: `Bearer ${token}`
	});
}

export async function refreshToken(refresh: string, cognitoId: string): Promise<RefreshResponse> {
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

type UploadImageType = {
	file: File | null;
	setImageUrl: (val: string) => void;
	setImageUploadLoading: (val: boolean) => void;
	authToken: string;
};

export async function uploadImage({
	authToken,
	file,
	setImageUploadLoading,
	setImageUrl
}: UploadImageType): Promise<void> {
	setImageUploadLoading(true);
	const formData = new FormData();
	if (file) {
		formData.append('file', file);
		try {
			const res = await api
				.post<{ url: string }>('files/single', {
					headers: {
						Authorization: `Bearer ${authToken}`
					},
					body: formData
				})
				.json();

			setImageUrl(res.url);
			setImageUploadLoading(false);
		} catch (error) {
			//TODO toast
			console.error(error);
		}
	}
}
