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
	swiperMode: boolean;
	inboxLocked: boolean;
	gender?: string;
	bio?: string;
	name?: string;
	countryName?: string;
	countryFlag?: string;
	countryIsoCode?: string;
	countryLat?: number;
	countryLng?: number;
	cityName?: string;
	cityLat?: number;
	cityLng?: number;
	profileImage?: ProfileImage;
};

export type UserSwiperPreferences = {
	id: number;
	userId: number;
	minAge: number;
	maxAge: number;
	maxDistance: number;
	preferredGender: string;
};

export type SetupUserSwiperPreferences = Omit<UserSwiperPreferences, 'id' | 'userId'>;

export type PotencialMatchResponse = {
	matches: PotencialMatch[];
	hasNextPage: true;
};

export type PotencialMatch = {
	distance: number;
	user: User;
};
