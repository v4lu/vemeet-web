import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import ky, { type KyInstance } from 'ky';
import { CLIENT_BASE_URL, SERVER_BASE_URL } from './constants';

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

export function authAPI(authToken: string): KyInstance {
	return ky.create({
		prefixUrl: getBaseUrl(),
		headers: {
			Authorization: `Bearer ${authToken}`
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
	file: File | Blob | null;
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
	if (!file) return;
	setImageUploadLoading(true);
	const formData = new FormData();
	formData.append('file', file);
	try {
		const res = await api
			.post<{ url: string }>('files/image-avif', {
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

type UploadType = {
	file: File | Blob | null;
	authToken: string;
};

type UplaodRespose = {
	url: string;
};

export async function uploadFile({
	file,
	authToken
}: UploadType): Promise<UplaodRespose | undefined> {
	if (!file) return;
	const formData = new FormData();
	formData.append('file', file);
	const res = await api
		.post<UplaodRespose>('files/single', {
			headers: {
				Authorization: `Bearer ${authToken}`
			},
			body: formData
		})
		.json();

	return res;
}

// we should use this new function everywhere it is better

type UploadImgType = {
	authToken: string;
	file: File | Blob | null;
};
export async function uploadImg({ authToken, file }: UploadImgType): Promise<string | undefined> {
	if (!file) return;
	const formData = new FormData();
	formData.append('file', file);
	try {
		const res = await api
			.post<{ url: string }>('files/image-avif', {
				headers: {
					Authorization: `Bearer ${authToken}`
				},
				body: formData
			})
			.json();

		return res.url;
	} catch (error) {
		//TODO toast
		console.error(error);
	}
}

export function catchErr<T>(promise: Promise<T>): Promise<[T | null, Error | null]> {
	return promise
		.then((data): [T, null] => [data, null])
		.catch((err): [null, Error] => [null, err instanceof Error ? err : new Error(String(err))]);
}
