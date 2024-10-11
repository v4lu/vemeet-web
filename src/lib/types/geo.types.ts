import type { User } from './user.types';

export type Country = {
	id?: number;
	countryName?: string;
	countryIsoCode?: string;
	countryFlag?: string;
	countryLat?: number;
	countryLng?: number;
};

export type City = {
	id?: number;
	countryIsoCode?: string;
	cityName?: string;
	cityLat?: number;
	cityLng?: number;
};

export type CreateLocation = {
	name: string;
	description?: string;
	address: string;
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	type: string;
	websiteUrl?: string;
	phoneNumber?: string;
	openingHours?: string;
	priceRange?: string;
	images?: string[];
};

type LocationImageResponse = {
	id: number;
	url: string;
};

type ReviewImageResponse = {
	id: number;
	url: string;
};

export type LocationReviewResponse = {
	id: number;
	user: User;
	rating: number;
	comment: string | null;
	createdAt: string;
	updatedAt: string;
	images: ReviewImageResponse[];
};

export type VeganLocation = {
	id: number;
	name: string;
	description?: string;
	address: string;
	city: string;
	country: string;
	latitude: number;
	longitude: number;
	type: string;
	websiteUrl?: string;
	phoneNumber?: string;
	openingHours?: string;
	priceRange?: string;
	user: User;
	isVerified: boolean;
	createdAt: string;
	updatedAt: string;
	images: LocationImageResponse[];
	reviews: LocationReviewResponse[];
};

export type VeganLocationUpdateRequest = {
	name?: string;
	description?: string;
	address?: string;
	city?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	type?: string;
	websiteUrl?: string;
	phoneNumber?: string;
	openingHours?: string;
	priceRange?: string;
	imagesToAdd?: string[];
	imageIdsToRemove?: number[];
};
