import type { Pageable, Sort } from './page.types';

export type CreateRecipe = {
	title: string;
	content: object;
	ingredients: string[];
	cookingTime: number;
	preparationTime: number;
	servings: number;
	difficulty: string;
	categoryId: number;
	imageUrls: string[];
};

export type RecipeCategory = {
	id: number;
	name: string;
};

type Image = {
	id: number;
	imageUrl: string;
};

export type Recipe = {
	id: number;
	content: object;
	createdAt: string;
	updatedAt: string;
	category: RecipeCategory;
	preparationTime: number;
	cookingTime: number;
	servings: number;
	difficulty: string;
	ingredients: string[];
	images: Image[];
	//comments
};

export type RecipePagableResponse = {
	content: Recipe[];
	pageable: Pageable;
	totalPages: number;
	totalElements: number;
	last: boolean;
	first: boolean;
	size: number;
	number: number;
	sort: Sort;
	numberOfElements: number;
	empty: boolean;
};
