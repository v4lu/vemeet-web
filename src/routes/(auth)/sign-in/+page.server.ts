import { api } from '$lib/api.js';
import { ACCESS_TOKEN, COGNITO_ID, REFRESH_TOKEN, isProduction } from '$lib/constants.js';
import { type UserLoginSchemaPayload, userLoginSchema } from '$lib/validators/auth.validator.js';
import { fail, redirect } from '@sveltejs/kit';
import { HTTPError } from 'ky';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

type LoginResponse = {
	accessToken: string;
	refreshToken: string;
	cognitoId: string;
	accessTokenExpiry: number;
	refreshTokenExpiry: number;
};

export async function load() {
	const form = await superValidate(zod(userLoginSchema));

	return {
		form
	};
}

export const actions = {
	login: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(userLoginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const payload: UserLoginSchemaPayload = {
			email: form.data.email,
			password: form.data.password
		};

		try {
			const res = await api
				.post<LoginResponse>('auth/login', {
					json: payload
				})
				.json();

			const { accessToken, refreshToken, cognitoId, accessTokenExpiry, refreshTokenExpiry } = res;

			const now = Math.floor(Date.now() / 1000);
			const bufferTime = 2;

			cookies.set(ACCESS_TOKEN, accessToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: 'strict',
				path: '/',
				maxAge: Math.max(0, accessTokenExpiry - now - bufferTime)
			});
			cookies.set(REFRESH_TOKEN, refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: 'strict',
				path: '/',
				maxAge: Math.max(0, refreshTokenExpiry - now - bufferTime)
			});
			cookies.set(COGNITO_ID, cognitoId, {
				httpOnly: true,
				secure: isProduction,
				sameSite: 'strict',
				path: '/',
				maxAge: Math.max(0, refreshTokenExpiry - now - bufferTime)
			});

			redirect(307, '/');
		} catch (error) {
			if (error instanceof HTTPError) {
				if (error.response.status === 403) {
					return fail(403, { form });
				}
				if (error.response.status === 401) {
					return fail(401, { form });
				} else {
					return fail(500, { form });
				}
			}
		}

		redirect(307, '/');
	}
};
