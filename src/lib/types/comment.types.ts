import type { Reaction } from './reaction.types';
import type { User } from './user.types';

export type Comment = {
	id: number;
	user: User;
	content: string;
	parentId: number | null;
	replies: Comment[];
	reactions: Reaction[];
	createdAt: string;
	updatedAt: string;
};
