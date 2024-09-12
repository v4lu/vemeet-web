import type { Image } from './image.types';
import type { Pageable, Sort } from './paga.types';
import type { Reaction } from './reaction.types';
import type { User } from './user.types';

export type Post = {
	id: number;
	user: User;
	content: string;
	images: Image[];
	reactions: Reaction[];
	createdAt: string;
	updatedAt: string;
};

export type PostsPagableResponse = {
	content: Post[];
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
