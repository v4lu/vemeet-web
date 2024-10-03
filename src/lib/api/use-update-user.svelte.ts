import { authAPI } from '$lib/api';
import { sessionStore } from '$lib/stores/session.store';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { User, UserUpdateFormData } from '$lib/types/user.types';
import { HTTPError } from 'ky';

class UpdateUser {
	error = $state<ServerErrorResponse | null>(null);
	isSubmitting = $state(false);
}

export function useUpdateUser(authToken: string) {
	const res = new UpdateUser();

	async function updateUser(payload: UserUpdateFormData) {
		res.isSubmitting = true;
		try {
			const api = authAPI(authToken);
			const res = await api
				.patch<User>('users', {
					json: payload
				})
				.json();

			sessionStore.setUser(res);
			toast.success('Profile updated successfully');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				if (eRes.statusCode === 409) {
					toast.error(eRes.message);
				}
				console.error(eRes);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		}
		res.isSubmitting = false;
	}

	return { updateUser, ...res };
}
