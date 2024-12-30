import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { FeedPagableResponse } from '$lib/types/feed.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { Post } from '$lib/types/post.types';
import type { Recipe } from '$lib/types/recipe.types';

type NormalizedFeedItem = { type: 'post'; item: Post } | { type: 'recipe'; item: Recipe };

class Feed {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	items = $state<NormalizedFeedItem[]>([]);
	posts = $state<Post[]>([]);
	currentPage = $state(0);
	hasMore = $state(true);
	isSubmittingNewPost = $state(false);
	isInitialized = $state(false);
}

export function useFeed(authToken: string) {
	const resp = new Feed();
	const api = authAPI(authToken);

	async function loadFeed(page: number) {
		if (resp.isLoading || (!resp.hasMore && resp.isInitialized)) return;
		resp.isLoading = true;
		try {
			const response = await api.get<FeedPagableResponse>(`feed?page=${page}`).json();
			const normalizedItems: NormalizedFeedItem[] = response.content.map((item) => {
				if ('post' in item) {
					return { type: 'post', item: item.post };
				} else {
					return { type: 'recipe', item: item.recipe };
				}
			});

			if (page === 0) {
				resp.items = normalizedItems;
			} else {
				resp.items = [...resp.items, ...normalizedItems];
			}

			resp.posts = resp.items
				.filter((item): item is { type: 'post'; item: Post } => item.type === 'post')
				.map((item) => item.item);
			resp.currentPage = page;
			resp.hasMore = !response.last && response.content.length > 0;
			resp.isInitialized = true;
		} catch (error) {
			console.error('Error fetching feed:', error);
			resp.error = error as ServerErrorResponse;
		} finally {
			resp.isLoading = false;
		}
	}

	async function postLikeToggle(postId: number, isLiked: boolean) {
		try {
			let updatedPost: Post;
			if (isLiked) {
				updatedPost = await api.delete<Post>(`posts/${postId}/reactions`).json();
			} else {
				updatedPost = await api
					.post<Post>(`posts/${postId}/reactions`, {
						json: { reactionType: 'LIKE' }
					})
					.json();
			}
			resp.posts = resp.posts.map((post) => (post.id === postId ? updatedPost : post));
			resp.items = resp.items.map((item) =>
				item.type === 'post' && item.item.id === postId ? { type: 'post', item: updatedPost } : item
			);
			toast.success(`Post ${isLiked ? 'unliked' : 'liked'} successfully!`);
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}

	async function recipeLikeToggle(recipeId: number, isLiked: boolean) {
		try {
			let updatedPost: Recipe;
			if (isLiked) {
				updatedPost = await api.delete<Recipe>(`recipes/${recipeId}/reactions`, {}).json();
			} else {
				updatedPost = await api
					.post<Recipe>(`recipes/${recipeId}/reactions`, {
						json: { reactionType: 'LIKE' }
					})
					.json();
			}
			resp.items = resp.items.map((item) =>
				item.type === 'recipe' && item.item.id === recipeId
					? { type: 'recipe', item: updatedPost }
					: item
			);

			toast.success(`Recipe ${isLiked ? 'unliked' : 'liked'} successfully!`);
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}

	async function deletePost(id: number) {
		try {
			await api.delete(`posts/${id}`).json();
			resp.posts = resp.posts.filter((post) => post.id !== id);
			resp.items = resp.items.filter((item) => !(item.type === 'post' && item.item.id === id));
			toast.success('Post deleted successfully!');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post. Please try again.');
		}
	}

	async function deleteRecipe(id: number) {
		try {
			await api.delete(`recipes/${id}`, {}).json();

			resp.items = resp.items.filter((item) => !(item.type === 'recipe' && item.item.id === id));
			toast.success('Recipe deleted successfully!');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post. Please try again.');
		}
	}

	async function createPost(postContent: string, imageUrls: string[]): Promise<void> {
		resp.isSubmittingNewPost = true;
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
			resp.items = [{ type: 'post', item: newPost }, ...resp.items];
			toast.success('Post created successfully!');
		} catch (error) {
			console.error('Error creating post:', error);
			toast.error('Something went wrong, please try again later!');
		}
		resp.isSubmittingNewPost = false;
	}

	return {
		loadFeed,
		resp,
		deletePost,
		deleteRecipe,
		createPost,
		postLikeToggle,
		recipeLikeToggle
	};
}
