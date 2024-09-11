export type ProfileImage = {
	id: number;
	url: string;
	createdAt: string;
};

export type User = {
	id: number;
	username: string;
	birthday: string;
	awsCognitoId: string;
	createdAt: string;
	verified: boolean;
	isPrivate: boolean;
	inboxLocked: boolean;
	gender?: string;
	birthplaceLat?: number;
	birthplaceLng?: number;
	birthplaceName?: string;
	residenceLat?: number;
	residenceLng?: number;
	residenceName?: string;
	bio?: string;
	name?: string;
	profileImage?: ProfileImage;
};
