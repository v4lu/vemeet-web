<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Logo } from '$lib/components/ui/logo';
	import { toast } from '$lib/stores/toast.store.js';
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const schema = z.object({
		email: z.string().email('Please enter a valid email address')
	});

	let { data } = $props();
	let isSubmitting = $state(false);
	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(schema),
		onSubmit: async ({ formData, cancel }) => {
			cancel();
			isSubmitting = true;
			try {
				await api.post('auth/password-reset/initiate', {
					json: { email: formData.get('email') }
				});
				toast.success('Password reset instructions sent to your email!');
				goto(`/new-password?email=${formData.get('email')}`);
			} catch (error) {
				console.error('Password reset error:', error);
				toast.error('Failed to send reset instructions. Please try again.');
			} finally {
				isSubmitting = false;
			}
		}
	});
</script>

<div class="grid min-h-screen w-full lg:grid-cols-2">
	<div class="relative hidden lg:block">
		<img src="./auth-cover.webp" alt="Welcome" class="h-full w-full object-cover" />
		<div
			class="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent"
		></div>

		<div class="absolute inset-0 z-20 flex items-center justify-center">
			<div class="flex max-w-lg flex-col items-center px-8 lg:items-start lg:text-white">
				<h2
					class="mt-4 text-balance text-center text-2xl font-extrabold sm:mt-6 sm:text-4xl lg:text-left lg:leading-tight"
				>
					Reset Your Password
				</h2>
				<p class="mt-3 text-center text-sm text-white/80 sm:text-base lg:text-left">
					Don't worry, it happens to the best of us. We'll help you get back into your account
					safely.
				</p>

				<div class="mt-8 flex flex-col gap-6">
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:email-check" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Check Your Email</h3>
							<p class="text-sm text-white/80">
								We'll send you instructions to reset your password
							</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:lock-reset" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Create New Password</h3>
							<p class="text-sm text-white/80">Choose a strong password for your account</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:shield-check" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Secure Process</h3>
							<p class="text-sm text-white/80">Your account security is our top priority</p>
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
						Forgot Password?
					</h2>
					<p class="text-lg text-muted-foreground">Reset your password</p>
				</div>
			</div>

			<div
				class="w-full space-y-6 p-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-12 lg:shadow-xl lg:ring-1 lg:ring-border lg:backdrop-blur-sm"
			>
				<div class="space-y-4">
					<p class="text-center text-sm text-muted-foreground">
						Enter your email address and we'll send you instructions to reset your password.
					</p>
				</div>

				<form use:enhance method="POST" class="space-y-6">
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

					<Button
						type="submit"
						class="w-full font-semibold transition-all hover:shadow-lg"
						disabled={isSubmitting}
						isLoading={isSubmitting}
						size="lg"
					>
						{isSubmitting ? 'Sending Instructions...' : 'Send Reset Instructions'}
					</Button>
				</form>

				<div class="mt-6">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-border/50"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="bg-background px-3 text-muted-foreground lg:bg-card">
								Remember your password?
							</span>
						</div>
					</div>

					<div class="mt-6 flex justify-center">
						<a
							href="/sign-in"
							class="font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
						>
							Back to Sign in
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
