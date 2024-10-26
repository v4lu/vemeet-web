import type { User } from './user.types';

export enum NotificationType {
	NEW_FOLLOWER = 'new_follower',
	NEW_REACTION = 'new_reaction',
	NEW_COMMENT = 'new_comment',
	NEW_MESSAGE = 'new_message',
	NEW_MATCH = 'new_match'
}

export type Notification = {
	id: number;
	user: User;
	notificationType: NotificationType;
	content: string;
	isRead: boolean;
	createdAt: string;
};
