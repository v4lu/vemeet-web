import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	const { userSwiperPreferences, userSwiperConfigurated } = await parent();

	if (!userSwiperConfigurated) {
		throw redirect(307, '/swiper');
	}

	if (!userSwiperPreferences) {
		throw redirect(307, '/swiper');
	}

	return {
		preferences: userSwiperPreferences
	};
}
