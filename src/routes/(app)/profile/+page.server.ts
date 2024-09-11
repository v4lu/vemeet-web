import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const value = await parent();

	return {
		user: value.user
	};
};
