import { verificationCodeSchema } from '$lib/validators/auth.validator';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export async function load({ url }) {
	const form = await superValidate(zod(verificationCodeSchema));
	const email = url.searchParams.get('email');
	return { form, email };
}
