export type CountryResponse = {
	name: {
		common: string;
		official: string;
	};
	cca2: string;
	latlng: [number, number];
	flag: string;
};

export type Country = {
	name: string;
	code: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	flag: string;
};

export type DBCountry = {
	countryFlag?: string;
	countryIsoCode?: string;
	countryLat?: number;
	countryLng?: number;
	countryName?: string;
};

export type DBCity = {
	cityName?: string;
	cityLat?: number;
	cityLng?: number;
};
