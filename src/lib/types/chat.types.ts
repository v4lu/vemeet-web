import type { User } from './user.types';

export type Chat = {
	id: number;
	user1: User;
	user2: User;
	createdAt: number;
	updatedAt: number;
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
