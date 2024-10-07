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
