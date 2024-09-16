import type { Pageable, Sort } from './page.types';
import type { User } from './user.types';

export type Chat = {
	id: number;
	user1: User;
	user2: User;
	createdAt: string;
	updatedAt: string;
};

export type Message = {
	id: number;
	chatId: number;
	sender: User;
	messageType: string;
	content: string;
	createdAt: string;
	readAt: string;
	isOneTime: boolean;
};

export type MessagesPagableResponse = {
	content: Message[];
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
