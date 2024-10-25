import { forgotPasswordSchema } from '$lib/validators/auth.validator';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export async function load() {
	const form = await superValidate(zod(forgotPasswordSchema));

	return { form };
}
