import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { User } from '$lib/types/user.types';
import { HTTPError } from 'ky';

class UserProfile {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	user = $state<User>();
	following = $state<User[]>([]);
	followers = $state<User[]>([]);
	isFollowing = $state(false);

	isSubmittingFollow = $state(false);
}

export function useUser(authToken: string, userId: number, sessionUser: User) {
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
			resp.isFollowing = resp.followers.some((follower) => follower.id === sessionUser.id);
		} catch (error) {
			console.error('Error fetching user data:', error);
			if (error instanceof HTTPError) {
				resp.error = await error.response.json();
			}
		}
		resp.isLoading = false;
	}

	async function followUser() {
		resp.isSubmittingFollow = true;
		try {
			await api.post(`followers/follow/${userId}`);
			resp.followers.push(sessionUser);
			resp.isFollowing = true;
			toast.success('Following successfully');
		} catch (error) {
			console.error('Error fetching user data:', error);
			if (error instanceof HTTPError) {
				resp.error = await error.response.json();
			}
		}
	}

	async function unfollowUser() {
		resp.isSubmittingFollow = true;
		try {
			await api.delete(`followers/unfollow/${userId}`);
			const newFollowers = resp.followers.filter((r) => {
				return r.id !== sessionUser.id;
			});
			resp.followers = [...newFollowers];
			resp.isFollowing = false;
			toast.success('Following successfully');
		} catch (error) {
			console.error('Error fetching user data:', error);
			if (error instanceof HTTPError) {
				resp.error = await error.response.json();
			}
		}
	}

	fetchUserData();

	return {
		followUser,
		unfollowUser,
		resp
	};
}
