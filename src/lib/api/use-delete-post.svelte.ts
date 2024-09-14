import { goto } from '$app/navigation';
import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import { HTTPError } from 'ky';

class DeletePost {
	error = $state<ServerErrorResponse>();
	isSubmitting = $state(false);
}

export function useDeletePost(id: number, authToken: string) {
	const res = new DeletePost();

	async function deletePost() {
		res.isSubmitting = true;
		try {
			const api = authAPI(authToken);
			await api.delete(`posts/${id}`).json();
			goto('/profile');
		} catch (err) {
			if (err instanceof HTTPError) {
				res.error = (await err.response.json()) as ServerErrorResponse;
			}
			toast.error('Failed to delete post. Please try again.');
		}
		res.isSubmitting = false;
	}

	return { deletePost, ...res };
}
