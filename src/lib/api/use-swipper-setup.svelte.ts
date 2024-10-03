import { authAPI } from '$lib/api';
import { toast } from '$lib/stores/toast.store';
import type { ServerErrorResponse } from '$lib/types/ky.types';
import type {
	SetupUserSwiperPreferences,
	User,
	UserSwiperPreferences
} from '$lib/types/user.types';

class UserProfile {
	error = $state<ServerErrorResponse | null>(null);
	isLoading = $state(false);

	isConfigurated = $state(false);
	isSwiperMode = $state(false);
	hasEverythingSetup = $state(false);
	whatsMissing = $state<string[]>([]);
	preferences = $state<UserSwiperPreferences | null>(null);
	isUserReady = $state(false);

	isLoadingConfigurateSwiperPreferences = $state(false);
	isLoadingUpdateSwiperPreferences = $state(false);
}

export function useSwiperModeSetup(
	authToken: string,
	sessionUser: User,
	isConfigurated: boolean,
	preferences: UserSwiperPreferences
) {
	const resp = new UserProfile();
	const api = authAPI(authToken);
	resp.preferences = preferences;
	resp.isConfigurated = isConfigurated;
	resp.isSwiperMode = sessionUser.swiperMode;

	const neededValues = {
		cityLat: sessionUser.cityLat,
		cityLng: sessionUser.cityLng,
		cityName: sessionUser.cityName,
		countryFLag: sessionUser.countryFlag,
		isoCode: sessionUser.countryIsoCode,
		countryLng: sessionUser.countryLng,
		countryLat: sessionUser.countryLat,
		countryName: sessionUser.countryName
	};

	for (const [key, value] of Object.entries(neededValues)) {
		if (value === null) {
			resp.whatsMissing.push(key);
		}
	}

	if (resp.whatsMissing.length === 0) {
		resp.hasEverythingSetup = true;
	}

	if (resp.isSwiperMode && resp.hasEverythingSetup && isConfigurated) {
		resp.isUserReady = true;
	}

	async function configureSwiperPreferences(payload: SetupUserSwiperPreferences) {
		resp.isLoadingConfigurateSwiperPreferences = true;
		try {
			const response = await api
				.post<UserSwiperPreferences>('user-preferences', {
					json: { ...payload }
				})
				.json();
			resp.preferences = response;
			resp.isConfigurated = true;
			if (resp.isSwiperMode && resp.hasEverythingSetup) {
				resp.isUserReady = true;
			}
			toast.success('Preferences configured successfully');
		} catch (e) {
			toast.error('Something went wrong please try again later');
			console.error(e);
		}
		resp.isLoadingConfigurateSwiperPreferences = false;
	}

	async function updateSwiperPreferences(payload: SetupUserSwiperPreferences) {
		resp.isLoadingUpdateSwiperPreferences = true;
		try {
			const response = await api
				.patch<UserSwiperPreferences>('user-preferences', {
					json: { ...payload }
				})
				.json();
			resp.preferences = response;
			resp.isConfigurated = true;
			if (resp.isSwiperMode && resp.hasEverythingSetup) {
				resp.isUserReady = true;
			}
			toast.success('Preferences configured successfully');
		} catch (e) {
			toast.error('Something went wrong please try again later');
			console.error(e);
		}
		resp.isLoadingUpdateSwiperPreferences = false;
	}

	return {
		resp,
		configureSwiperPreferences,
		updateSwiperPreferences
	};
}
