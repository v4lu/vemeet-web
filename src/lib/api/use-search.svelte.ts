import { authAPI } from '$lib/api';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { User as UserType } from '$lib/types/user.types';
import { HTTPError } from 'ky';

class User {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	users = $state<UserType[]>([]);
}

export function useSearch(authToken: string) {
	const resp = new User();
	const api = authAPI(authToken);

	async function getUsers(search: string) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<UserType[]>(`search/users`, {
					searchParams: {
						search
					}
				})
				.json();
			resp.users = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	return {
		resp,
		getUsers
	};
}
