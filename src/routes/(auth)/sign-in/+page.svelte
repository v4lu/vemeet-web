<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Logo } from '$lib/components/ui/logo';
	import { toast } from '$lib/stores/toast.store.js';
	import { userLoginSchema } from '$lib/validators/auth.validator.js';
	import Icon from '@iconify/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { fade, fly } from 'svelte/transition';

	let { data } = $props();
	let togglePassword = $state(false);
	const { enhance, form, errors, submitting, message } = superForm(data.form, {
		validators: zodClient(userLoginSchema),
		onSubmit: () => {
			if ($submitting) {
				toast.info('Signing in...');
			}
		}
	});

	$effect(() => {
		if ($errors._errors) {
			if ($errors._errors[0].startsWith('SERVER:')) {
				toast.error($errors._errors[0].split('SERVER: ')[1]);
			}
			if ($errors._errors[0].startsWith('CREDENTIALS:')) {
				toast.error($errors._errors[0].split('CREDENTIALS: ')[1]);
			}
		}
	});

	function getPasswordStrength(password: string) {
		if (!password) return 0;
		let score = 0;
		if (password.length >= 8) score += 20;
		if (/[a-z]/.test(password)) score += 20;
		if (/[A-Z]/.test(password)) score += 20;
		if (/\d/.test(password)) score += 20;
		if (/[@$!%*?&.]/.test(password)) score += 20;
		return score;
	}

	let passwordStrength = $derived(getPasswordStrength($form.password));

	$effect(() => {
		if ($message) {
			toast.success($message);
			goto('/');
		}
	});
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background/95 p-4 py-12"
>
	<div class="w-full max-w-xl" in:fly={{ y: 20, duration: 600 }} out:fade>
		<div class="mb-8 space-y-6 text-center">
			<div class="flex justify-center">
				<Logo class="size-20 transition-transform hover:scale-105" />
			</div>
			<div class="space-y-2">
				<h2
					class="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-4xl font-bold text-transparent"
				>
					Welcome to Vemeet
				</h2>
				<p class="text-lg text-muted-foreground">Sign in to your account</p>
			</div>
		</div>

		<div class="rounded-2xl bg-card/95 p-8 shadow-xl ring-1 ring-border/5 backdrop-blur-sm">
			<form use:enhance method="POST" action="?/login" class="space-y-6">
				<Field name="Email" error={$errors.email}>
					<div class="group relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon
								icon="mynaui:envelope"
								class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
							/>
						</div>
						<Input
							bind:value={$form.email}
							type="email"
							name="email"
							placeholder="you@example.com"
							required
							class="pl-10 pr-4 ring-primary/20 transition-all focus:ring-2"
						/>
					</div>
				</Field>

				<Field name="Password" class="space-y-2">
					<div class="group relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Icon
								icon="solar:lock-password-outline"
								class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
							/>
						</div>
						<Input
							bind:value={$form.password}
							type={togglePassword ? 'text' : 'password'}
							placeholder="••••••••"
							name="password"
							required
							class="pl-10 pr-10 ring-primary/20 transition-all focus:ring-2"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors hover:text-primary focus:outline-none"
							onclick={() => (togglePassword = !togglePassword)}
						>
							<Icon
								icon={togglePassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
								class="h-5 w-5 text-muted-foreground/70 transition-colors hover:text-primary"
							/>
						</button>
					</div>

					{#if $form.password}
						<div class="h-1 w-full overflow-hidden rounded-full bg-muted/50" transition:fade>
							<div
								class="h-full transition-all duration-500 ease-out {passwordStrength <= 40
									? 'bg-red-500'
									: passwordStrength <= 80
										? 'bg-yellow-500'
										: 'bg-green-500'}"
								style="width: {passwordStrength}%"
							/>
						</div>
					{/if}

					<div class="flex justify-end">
						<a
							href="/forgot-password"
							class="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
						>
							Forgot password?
						</a>
					</div>
				</Field>

				<Button
					disabled={$submitting}
					isLoading={$submitting}
					type="submit"
					class="w-full font-semibold transition-all hover:shadow-lg"
					size="lg"
				>
					Sign in
				</Button>
			</form>

			<div class="my-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-border/50" />
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-card px-3 text-muted-foreground">Or continue with</span>
					</div>
				</div>

				<div class="mt-6">
					<Button class="w-full transition-all hover:shadow-lg" variant="secondary" size="lg">
						<Icon icon="ri:google-fill" class="mr-2 h-5 w-5 text-muted-foreground" />
						Sign in with Google
					</Button>
				</div>
			</div>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-border/50"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-card px-3 text-muted-foreground">New to Vemeet?</span>
					</div>
				</div>

				<div class="mt-6 flex justify-center">
					<a
						href="/sign-up"
						class="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
					>
						Create an account
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
