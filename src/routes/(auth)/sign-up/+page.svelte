<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { toast } from '$lib/stores/toast.store.js';
	import { userRegisterSchema } from '$lib/validators/auth.validator.js';
	import Icon from '@iconify/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();
	let togglePassword = $state(false);
	let toggleConfirmPassword = $state(false);
	const { enhance, form, errors, submitting, message } = superForm(data.form, {
		validators: zodClient(userRegisterSchema)
	});

	$effect(() => {
		if ($errors._errors) {
			if ($errors._errors[0].startsWith('SERVER:')) {
				const err = $errors._errors[0].split('SERVER: ')[1];
				toast.error(err);
			}
			if ($errors._errors[0].startsWith('CREDENTIALS:')) {
				const err = $errors._errors[0].split('CREDENTIALS: ')[1];
				toast.error(err);
			}
		}
	});

	$effect(() => {
		if ($message) {
			toast.success($message);
			goto('/');
		}
	});
</script>

<div class="flex min-h-screen flex-col justify-center px-4 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="mt-6 text-center text-3xl font-extrabold">Create your account</h2>
	</div>
	<div class="sm:mx-auto sm:w-full sm:max-w-xl">
		<div class="px-4 py-4 sm:px-10">
			<form use:enhance method="POST" action="?/register" class="mt-4 grid gap-3">
				<Field name="Email" error={$errors.email}>
					<div class="relative mt-1">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon icon="mynaui:envelope" class="h-5 w-5" />
						</div>
						<Input
							bind:value={$form.email}
							id="email"
							name="email"
							type="email"
							placeholder="jd@example.com"
							required
							class="pl-10 pr-10"
						/>
					</div>
				</Field>

				<Field name="Username" error={$errors.username}>
					<div class="relative mt-1">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon icon="mdi:user" class="h-5 w-5" />
						</div>
						<Input
							bind:value={$form.username}
							id="username"
							name="username"
							type="text"
							placeholder="johndoe"
							required
							class="pl-10 pr-10"
						/>
					</div>
				</Field>

				<Field name="Birthday" error={$errors.birthday}>
					<div class="relative mt-1">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon icon="mdi:cake" class="h-5 w-5" />
						</div>
						<Input
							bind:value={$form.birthday}
							id="birthday"
							name="birthday"
							type="date"
							required
							class="pl-10 pr-10"
						/>
					</div>
				</Field>

				<Field name="Password" error={$errors.password}>
					<div class="relative mt-1">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon icon="solar:lock-password-outline" class="h-5 w-5" />
						</div>
						<Input
							bind:value={$form.password}
							id="password"
							name="password"
							type={togglePassword ? 'text' : 'password'}
							placeholder="********"
							required
							class="pl-10 pr-10"
						/>
						<div class="absolute inset-y-0 right-0 flex items-center pr-3">
							<button
								type="button"
								class="mt-1 flex items-center justify-center focus:outline-none"
								onclick={(): boolean => (togglePassword = !togglePassword)}
							>
								<Icon
									icon={togglePassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
									class="h-5 w-5"
								/>
							</button>
						</div>
					</div>
				</Field>

				<Field name="Confirm Password" error={$errors.confirmPassword}>
					<div class="relative mt-1">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon icon="solar:lock-password-outline" class="h-5 w-5" />
						</div>
						<Input
							bind:value={$form.confirmPassword}
							id="confirmPassword"
							name="confirmPassword"
							type={toggleConfirmPassword ? 'text' : 'password'}
							placeholder="********"
							required
							class="pl-10 pr-10"
						/>
						<div class="absolute inset-y-0 right-0 flex items-center pr-3">
							<button
								type="button"
								class="mt-1 flex items-center justify-center focus:outline-none"
								onclick={(): boolean => (toggleConfirmPassword = !toggleConfirmPassword)}
							>
								<Icon
									icon={toggleConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
									class="h-5 w-5"
								/>
							</button>
						</div>
					</div>
				</Field>

				<Button
					disabled={$submitting}
					isLoading={$submitting}
					type="submit"
					class="w-full"
					size="sm">Sign up</Button
				>
			</form>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-border"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-background px-2 text-muted-foreground">Or continue with</span>
					</div>
				</div>

				<div class="mt-6">
					<Button class="w-full" variant="secondary" size="sm">
						<Icon icon="ri:google-fill" class="mr-2 h-5 w-5 text-muted-foreground" />
						Sign up with Google
					</Button>
				</div>
			</div>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-border"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-background px-2 text-muted-foreground">Already have an account?</span>
					</div>
				</div>

				<div class="mt-6 flex w-full justify-center">
					<a class="font-medium text-primary hover:underline" href="/sign-in"> Sign In </a>
				</div>
			</div>
		</div>
	</div>
</div>
