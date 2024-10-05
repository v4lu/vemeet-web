import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { Recipe as RecipeType } from '$lib/types/recipe.types';
import { HTTPError } from 'ky';
class Recipe {
	error = $state<ServerErrorResponse | null>(null);
	recipe = $state<RecipeType>();
	isLoading = $state(false);
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

	getRecipe();

	return { res };
}
