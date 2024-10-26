// use-search.svelte.ts
import { authAPI } from '$lib/api';
import type { VeganLocation } from '$lib/types/geo.types';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type { Recipe } from '$lib/types/recipe.types';
import type { User as UserType } from '$lib/types/user.types';
import { HTTPError } from 'ky';

class Search {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);
	users = $state<UserType[]>([]);
	locations = $state<VeganLocation[]>([]);
	recipes = $state<Recipe[]>([]);
}

export function useSearch(authToken: string) {
	const resp = new Search();
	const api = authAPI(authToken);

	async function getUsers(search: string) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<UserType[]>('search/users', {
					searchParams: { search }
				})
				.json();
			resp.users = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	async function getLocations(params: {
		search: string;
		type?: string;
		city?: string;
		country?: string;
		verified?: boolean;
	}) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<VeganLocation[]>('search/locations', {
					searchParams: params
				})
				.json();
			resp.locations = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	async function getRecipes(params: {
		search?: string;
		categoryId?: number;
		tagId?: number;
		difficulty?: string;
		minServings?: number;
		maxServings?: number;
	}) {
		resp.isLoading = true;
		try {
			const response = await api
				.get<Recipe[]>('search/recipes', {
					searchParams: params
				})
				.json();
			resp.recipes = response;
		} catch (err) {
			if (err instanceof HTTPError) {
				resp.error = (await err.response.json()) as ServerErrorResponse;
			}
		}
		resp.isLoading = false;
	}

	return {
		resp,
		getUsers,
		getLocations,
		getRecipes
	};
}
