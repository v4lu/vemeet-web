import type { Pageable, Sort } from './page.types';

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
	swiperUserProfile: SwipeProfile;
};

export type SwipeProfile = {
	user: User;
	id: number;
	userId: number;
	distance: number;
	description?: string;
	mainImageUrl?: string;
	otherImages?: string[];
};

export type SwipeProfileUpdate = {
	description?: string;
	mainImageUrl?: string;
	otherImages?: string[];
};

export type PotentialSwipePagableResponse = {
	content: SwipeProfile[];
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

export type UserUpdateFormData = {
	username: string;
	bio?: string;
	name?: string;
	gender?: string;
	countryName?: string | null;
	countryFlag?: string | null;
	countryIsoCode?: string | null;
	countryLat?: number | null;
	countryLng?: number | null;
	cityName?: string | null;
	cityLat?: number | null;
	cityLng?: number | null;
};

export type UserPagableResponse = {
	content: User[];
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
