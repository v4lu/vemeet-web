import { authAPI } from '$lib/api.js';
import type { Post } from '$lib/types/post.types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const accessToken = (await parent()).accessToken;
	const api = authAPI(accessToken);
	const id = params.id;

	const res = api.get<Post>(`posts/${id}`).json();

	return {
		post: res,
		id
	};
};
