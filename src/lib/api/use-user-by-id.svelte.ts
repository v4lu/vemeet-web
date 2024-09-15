import { authAPI } from '$lib/api';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { User } from '$lib/types/user.types';

class UserProfile {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	user = $state<User>();
	following = $state<User[]>([]);
	followers = $state<User[]>([]);
}

export function useUser(authToken: string, userId: number) {
	const resp = new UserProfile();
	const api = authAPI(authToken);

	async function fetchUserData() {
		resp.isLoading = true;

		try {
			const [user, followers, following] = await Promise.all([
				api.get<User>(`users/${userId}`).json(),
				api.get<User[]>(`followers/followers/${userId}`).json(),
				api.get<User[]>(`followers/following/${userId}`).json()
			]);

			resp.user = user;
			resp.followers = followers;
			resp.following = following;
		} catch (error) {
			console.error('Error fetching user data:', error);
			resp.error = error as ServerErrorResponse;
		}
		resp.isLoading = false;
	}

	fetchUserData();

	return {
		resp
	};
}
