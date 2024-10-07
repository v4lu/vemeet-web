import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { CreateRecipe, RecipeCategory, Recipe as RecipeType } from '$lib/types/recipe.types';
import { HTTPError } from 'ky';
class Recipe {
	error = $state<ServerErrorResponse | null>(null);
	recipe = $state<RecipeType>();
	categories = $state<RecipeCategory[]>([]);
	isLoading = $state(false);
	isSubmittingUpdate = $state(false);
	isLoadingCategories = $state(false);
}

export function useRecipe(authToken: string, recipeId: number) {
	const res = new Recipe();
	const api = authAPI(authToken);

	async function getRecipe() {
		res.isLoading = true;
		try {
			const response = await api.get<RecipeType>(`recipes/${recipeId}`).json();
			res.recipe = response;
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

			toast.success(`Recipe ${isLiked ? 'unliked' : 'liked'} successfully!`);
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

	getRecipe();
	getCategories();

	return {
		res,
		deleteRecipe,
		updateRecipe,
		recipeLikeToggle
	};
}
