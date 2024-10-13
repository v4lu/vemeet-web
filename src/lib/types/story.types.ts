import type { User } from './user.types';

export type CreateStoryRequest = {
	storyGroupId?: number;
	assetType: 'IMAGE' | 'VIDEO';
	contentType: string;
	duration?: string;
	width?: number;
	height?: number;
	fileContent: string;
};

export type StoryAssetResponse = {
	id: number;
	assetType: 'IMAGE' | 'VIDEO';
	contentType: string | null;
	duration: string | null;
	width: number | null;
	height: number | null;
	createdAt: string;
	url: string;
};

export type StoryResponse = {
	id: number;
	userId: number;
	storyGroupId: number | null;
	createdAt: string;
	expiresAt: string;
	viewCount: number;
	asset: StoryAssetResponse | null;
};

export type UserStoriesResponse = {
	user: User;
	userStories: StoryResponse[];
};
