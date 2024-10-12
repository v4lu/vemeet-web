import type { Pageable, Sort } from './page.types';
import type { User } from './user.types';

export type Chat = {
	id: number;
	sessionUser: User;
	otherUser: User;
	createdAt: string;
	updatedAt: string;
	lastMessage: Message;
	sessionUserSeenStatus: boolean;
	otherUserSeenStatus: boolean;
};

export type ChatAsset = {
	id: number;
	messageId: number;
	chatId: number;
	fileType: string;
	fileSize: number;
	mimeType: string | null;
	durationSeconds: number | null;
	fileUrl: string | null;
	createdAt: string;
};

export type Message = {
	id: number;
	chatId: number;
	sender: User;
	recipient: User;
	messageType: string;
	content: string | null;
	createdAt: string;
	readAt: string;
	isOneTime: boolean;
	isSessionUserSender: boolean;
	chatAssets: ChatAsset[];
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

type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';

export type ChatAssetReq = {
	fileType: string;
	fileSize: number;
	mimeType?: string;
	durationSeconds?: number;
	assetUrl: string;
};

export type CreateMessage = {
	recipientId: number;
	messageType: MessageType;
	content: string | null;
	isOneTime: boolean;
	firstTime: boolean;
	chatAssets?: ChatAssetReq[];
};
