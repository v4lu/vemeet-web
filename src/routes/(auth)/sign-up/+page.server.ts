import { api } from '$lib/api.js';
import type { ServerErrorResponse } from '$lib/types/ky.types.js';
import { type UserRegisterSchemaPayload, userRegisterSchema } from '$lib/validators/auth.validator';
import { fail, redirect } from '@sveltejs/kit';
import { HTTPError } from 'ky';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

type RegisterResponse = {
	email: string;
	username: string;
	id: number;
};

export async function load() {
	const form = await superValidate(zod(userRegisterSchema));

	return {
		form
	};
}

export const actions = {
	register: async ({ request }) => {
		const form = await superValidate(request, zod(userRegisterSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const birthdayDate = new Date(form.data.birthday);
		const birthdayInstant = birthdayDate.toISOString();

		const payload: UserRegisterSchemaPayload = {
			email: form.data.email,
			password: form.data.password,
			birthday: birthdayInstant,
			username: form.data.username
		};

		try {
			const res = await api
				.post<RegisterResponse>('auth/register', {
					json: payload
				})
				.json();

			throw redirect(307, `/welcome?email=${res.email}`);
		} catch (error) {
			if (error instanceof HTTPError) {
				if (error.response.status === 401) {
					const res = (await error.response.json()) as ServerErrorResponse;
					return setError(form, `CREDENTIALS: ${res.message}`);
				}
				return setError(form, 'SERVER: There is currently server issues, please try again later.');
			}
		}

		throw redirect(307, `/welcome?email=${payload.email}`);
	}
};
