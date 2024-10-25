import { newPasswordSchema } from '$lib/validators/auth.validator';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export async function load({ url }) {
	const form = await superValidate(zod(newPasswordSchema));
	const email = url.searchParams.get('email');

	if (!email) throw redirect(307, '/sign-in');
	return { form, email };
}
