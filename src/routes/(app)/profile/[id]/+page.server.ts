import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const userId = (await parent()).user.id;
	const id = +params.id;
	if (id === userId) {
		redirect(307, '/profile');
	}
	return {
		id
	};
};
