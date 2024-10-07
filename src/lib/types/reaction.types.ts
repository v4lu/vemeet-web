import type { User } from './user.types';

export type ProfileImage = {
	id: number;
	url: string;
	createdAt: string;
};

// TOOD add missing fields for Reaction
export type Reaction = {
	id: number;
	user: User;
	reactionType: 'LIKE';
	createdAt: string;
};
