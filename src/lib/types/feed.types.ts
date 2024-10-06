import type { Pageable, Sort } from './page.types';
import type { Post } from './post.types';
import type { Recipe } from './recipe.types';

export type FeedItem = { post: Post } | { recipe: Recipe };

export type FeedPagableResponse = {
	content: FeedItem[];
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
