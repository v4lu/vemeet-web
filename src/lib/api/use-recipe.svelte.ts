import { HTTPError } from 'ky';
import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { CreateRecipe, RecipeCategory, Recipe as RecipeType } from '$lib/types/recipe.types';
import type { Comment } from '$lib/types/comment.types';
import type { Reaction } from '$lib/types/reaction.types';

class Recipe {
	error = $state<ServerErrorResponse | null>(null);
	recipe = $state<RecipeType>();
	categories = $state<RecipeCategory[]>([]);
	isLoading = $state(false);
	isSubmittingUpdate = $state(false);
	isLoadingCategories = $state(false);
	isSubmittingComment = $state(false);
}

export function useRecipe(authToken: string, recipeId: number) {
	const res = new Recipe();
	const api = authAPI(authToken);

	async function getRecipe() {
		res.isLoading = true;
		try {
			const response = await api.get<RecipeType>(`recipes/${recipeId}`).json();
			res.recipe = response;
			if (res.recipe) {
				res.recipe.comments = res.recipe.comments.sort((a: Comment, b: Comment) => {
					return new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1;
				});
			}
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		}
		res.isLoading = false;
	}

	async function getCategories() {
		res.isLoadingCategories = true;
		try {
			const response = await api.get<RecipeCategory[]>('recipes/categories').json();
			res.categories = response;
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		}
		res.isLoadingCategories = false;
	}

	async function deleteRecipe() {
		try {
			await api.delete(`recipes/${recipeId}`, {}).json();
			toast.success('Recipe deleted successfully!');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post. Please try again.');
		}
	}

	async function recipeLikeToggle(isLiked: boolean) {
		try {
			let updatedPost: RecipeType;
			if (isLiked) {
				updatedPost = await api.delete<RecipeType>(`recipes/${recipeId}/reactions`, {}).json();
			} else {
				updatedPost = await api
					.post<RecipeType>(`recipes/${recipeId}/reactions`, {
						json: { reactionType: 'LIKE' }
					})
					.json();
			}
			res.recipe = updatedPost;
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}

	async function updateRecipe(payload: CreateRecipe) {
		res.isSubmittingUpdate = true;
		try {
			const response = await api.patch<RecipeType>(`recipes/${recipeId}`, { json: payload }).json();
			res.recipe = response;
			toast.success('Recipe updated successfully!');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		}
		res.isSubmittingUpdate = false;
	}

	async function createComment(payload: { content: string }) {
		res.isSubmittingComment = true;
		try {
			const response = await api
				.post<Comment>(`comments/recipes/${recipeId}/comments`, { json: payload })
				.json();
			if (res.recipe) {
				res.recipe.comments.unshift(response);
			}

			toast.success('Comment added successfully!');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			} else {
				toast.error('An error occurred while adding your comment');
			}
		}
	}

	async function deleteComment(commentId: number) {
		try {
			await api.delete(`comments/${commentId}`).json();
			if (res.recipe) {
				res.recipe.comments = res.recipe.comments.filter((c) => c.id !== commentId);
			}
			toast.success('Comment deleted successfully');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			}
			toast.error('Failed to delete comment');
		}
	}

	async function editComment(commentId: number, content: string) {
		try {
			const response = await api
				.patch<Comment>(`comments/${commentId}`, {
					json: { content }
				})
				.json();
			if (res.recipe) {
				const commentIndex = res.recipe.comments.findIndex((c) => c.id === commentId);
				res.recipe.comments[commentIndex] = response;
			}
			toast.success('Comment updated successfully');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			}
			toast.error('Failed to update comment');
		}
	}

	async function commentLikeToggle(isLiked: boolean, commentId: number) {
		try {
			if (isLiked) {
				await api.delete(`comments/${commentId}/reactions`).json();
				res.recipe?.comments.find((c) => c.id === commentId)?.reactions.pop();
			} else {
				const response = await api
					.post<Reaction>(`comments/${commentId}/reactions`, {
						json: { reactionType: 'LIKE' }
					})
					.json();
				res.recipe?.comments.find((c) => c.id === commentId)?.reactions.push(response);
			}
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			}
			toast.error('Failed to update reaction');
		}
	}

	getRecipe();
	getCategories();

	return {
		res,
		deleteRecipe,
		updateRecipe,
		recipeLikeToggle,
		createComment,
		deleteComment,
		editComment,
		commentLikeToggle
	};
}
