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

export function useSessionProfilePosts(authToken: string) {
	const resp = new ProfilePosts();
	const api = authAPI(authToken);

	async function loadPosts(page: number) {
		resp.isLoading = true;
		try {
			const response = await api.get<PostsPagableResponse>(`posts/session?page=${page}`, {}).json();
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

	async function createPost(postContent: string, imageUrls: string[]): Promise<void> {
		resp.isSumbmittingNewPost = true;
		const payload = {
			content: postContent,
			images: imageUrls
		};

		try {
			const newPost = await api
				.post<Post>('posts', {
					json: payload
				})
				.json();

			resp.posts = [newPost, ...resp.posts];
			toast.success('Post created successfully!');
		} catch (error) {
			console.error('Error creating post:', error);
			toast.error('Something went wrong, please try again later!');
		}
		resp.isSumbmittingNewPost = false;
	}

	async function deletePost(id: number) {
		try {
			await api.delete(`posts/${id}`, {}).json();
			resp.posts = resp.posts.filter((post) => post.id !== id);
			toast.success('Post deleted successfully!');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post. Please try again.');
		}
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
		createPost,
		deletePost,
		resp
	};
}
