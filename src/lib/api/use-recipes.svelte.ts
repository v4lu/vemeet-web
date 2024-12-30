import { HTTPError } from 'ky';
import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type {
	CreateRecipe,
	RecipeCategory,
	RecipePagableResponse,
	Recipe as RecipeType
} from '$lib/types/recipe.types';
class Recipe {
	error = $state<ServerErrorResponse | null>(null);

	categories = $state<RecipeCategory[]>([]);
	recipes = $state<RecipeType[]>([]);
	currentPage = $state(0);

	hasMore = $state(true);
	isInitialized = $state(false);
	isSubmitting = $state(false);
	isSubmittingCategory = $state(false);
	isLoadingCategories = $state(false);
	isLoadingRecipes = $state(false);
	isSubmittingLike = $state(false);
	isEditSubmitting = $state(false);
}

export function useRecipes(authToken: string, userId: number) {
	const res = new Recipe();
	const api = authAPI(authToken);

	async function createRecipe(payload: CreateRecipe) {
		res.isSubmitting = true;
		try {
			const response = await api
				.post<RecipeType>('recipes', {
					json: { ...payload }
				})
				.json();

			res.recipes = [...res.recipes, response];
			toast.success('New Recipe Created, good job!');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		}
		res.isSubmitting = false;
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

	async function createCategory(name: string) {
		res.isSubmittingCategory = true;
		try {
			const response = await api
				.post<RecipeCategory>('recipes/categories', {
					json: { name }
				})
				.json();
			res.categories = [...res.categories, response];

			toast.success('New Category Created, good job!');
		} catch (e) {
			if (e instanceof HTTPError) {
				const eRes = (await e.response.json()) as ServerErrorResponse;
				res.error = eRes;
				console.error(eRes);
			} else {
				toast.error('An error occurred while updating your profile');
			}
		}
	}

	async function loadRecipes(page: number) {
		if (res.isLoadingRecipes || (!res.hasMore && res.isInitialized)) return;

		res.isLoadingRecipes = true;
		try {
			const response = await api
				.get<RecipePagableResponse>(`recipes/user/${userId}?page=${page}`, {})
				.json();
			if (page === 0) {
				res.recipes = response.content;
			} else {
				res.recipes = [...res.recipes, ...response.content];
			}
			res.currentPage = page;
			res.hasMore = !response.last;
			res.isInitialized = true;
		} catch (error) {
			console.error('Error fetching posts:', error);
		}
		res.isLoadingRecipes = false;
	}

	async function recipeLikeToggle(recipeId: number, isLiked: boolean) {
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
			res.recipes = res.recipes.map((r) => (r.id === recipeId ? updatedPost : r));

			toast.success(`Recipe ${isLiked ? 'unliked' : 'liked'} successfully!`);
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}

	async function deleteRecipe(id: number) {
		try {
			await api.delete(`recipes/${id}`, {}).json();
			res.recipes = res.recipes.filter((r) => r.id !== id);
			toast.success('Recipe deleted successfully!');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post. Please try again.');
		}
	}

	getCategories();

	return {
		createCategory,
		createRecipe,
		res,
		loadRecipes,
		recipeLikeToggle,
		deleteRecipe
	};
}
