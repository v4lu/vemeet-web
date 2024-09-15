import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { Post, PostsPagableResponse } from '$lib/types/post.types';

class ProfilePosts {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);

	posts = $state<Post[]>([]);
	currentPage = $state(0);
	hasMore = $state(true);

	isSumbmittingNewPost = $state(false);
	isSubmittingPostDeleting = $state(false);
}

export function useProfilePosts(authToken: string, userId: number) {
	const resp = new ProfilePosts();
	const api = authAPI(authToken);

	async function loadPosts(page: number) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<PostsPagableResponse>(`posts/user/${userId}?page=${page}`, {})
				.json();
			if (page === 0) {
				resp.posts = response.content;
			} else {
				resp.posts = [...resp.posts, ...response.content];
			}
			resp.currentPage = page;
			resp.hasMore = !response.last;
		} catch (error) {
			console.error('Error fetching posts:', error);
		}
		resp.isLoading = false;
	}

	async function postLikeToggle(postId: number, isLiked: boolean) {
		try {
			let updatedPost: Post;
			if (isLiked) {
				updatedPost = await api.delete<Post>(`posts/${postId}/reactions`, {}).json();
			} else {
				updatedPost = await api
					.post<Post>(`posts/${postId}/reactions`, {
						json: { reactionType: 'LIKE' }
					})
					.json();
			}

			resp.posts = resp.posts.map((post) => (post.id === postId ? updatedPost : post));

			toast.success(`Post ${isLiked ? 'unliked' : 'liked'} successfully!`);
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}

	return {
		postLikeToggle,
		loadPosts,
		resp
	};
}
