<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Logo } from '$lib/components/ui/logo';
	import { toast } from '$lib/stores/toast.store.js';
	import { userLoginSchema } from '$lib/validators/auth.validator.js';
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();
	let togglePassword = $state(false);
	const { enhance, form, errors, submitting } = superForm(data.form, {
		validators: zodClient(userLoginSchema),
		onResult: ({ result }) => {
			if (result.status === 403) toast.error('Invalid email or password');
			if (result.status === 401) toast.error('Invalid email or password');
			if (result.status === 500) toast.error('Something went wrong. Please try again');
			if (result.status === 200 || result.status === 201) goto('/');
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
</script>

<div class="grid min-h-screen w-full lg:grid-cols-2">
	<div class="relative hidden lg:block">
		<img src="./auth-cover.webp" alt="Welcome" class="h-full w-full object-cover" />
		<div
			class="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent"
		></div>

		<!-- Sign-in specific content -->
		<div class="absolute inset-0 z-20 flex items-center justify-center">
			<div class="flex max-w-lg flex-col items-center px-8 lg:items-start lg:text-white">
				<h2
					class="mt-4 text-balance text-center text-2xl font-extrabold sm:mt-6 sm:text-4xl lg:text-left lg:leading-tight"
				>
					Welcome Back to Your Community
				</h2>
				<p class="mt-3 text-center text-sm text-white/80 sm:text-base lg:text-left">
					Sign in to connect with fellow vegans, discover new recipes, and continue making a
					positive impact.
				</p>

				<div class="mt-8 flex flex-col gap-6">
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:account-heart" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Your Profile</h3>
							<p class="text-sm text-white/80">Access your personalized feed and connections</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:message-text" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Messages</h3>
							<p class="text-sm text-white/80">Continue conversations with your community</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:bookmark-outline" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Saved Items</h3>
							<p class="text-sm text-white/80">Access your favorite recipes and places</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="absolute bottom-4 left-4 z-20 flex items-center gap-3">
			<Logo class="size-16 text-white" />
			<h3 class="text-3xl font-bold tracking-wide text-white">Vemeet</h3>
		</div>
	</div>

	<!-- Right side with form -->
	<div class="flex w-full items-center justify-center p-4 lg:p-8">
		<div class="w-full max-w-2xl" in:fly={{ y: 20, duration: 600 }} out:fade>
			<div class="mb-8 space-y-6 text-center lg:hidden">
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

			<div
				class="w-full space-y-6 p-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-12 lg:shadow-xl lg:ring-1 lg:ring-border lg:backdrop-blur-sm"
			>
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
								class="border-0 bg-muted/50 pl-10 pr-4 ring-primary/20 transition-all focus:ring-2 lg:border lg:bg-background"
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
								class="border-0 bg-muted/50 pl-10 pr-10 ring-primary/20 transition-all focus:ring-2 lg:border lg:bg-background"
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
								></div>
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

				<div class="mt-6">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-border/50"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="bg-background px-3 text-muted-foreground lg:bg-card">New to Vemeet?</span
							>
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
</div>
