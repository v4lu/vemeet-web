<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Logo } from '$lib/components/ui/logo';
	import { toast } from '$lib/stores/toast.store.js';
	import { newPasswordSchema } from '$lib/validators/auth.validator.js';
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();
	let togglePassword = $state(false);
	let toggleConfirmPassword = $state(false);
	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zodClient(newPasswordSchema),
		onSubmit: async ({ formData, cancel }) => {
			cancel();
			try {
				await api.post('auth/password-reset/complete', {
					json: {
						email: data.email,
						newPassword: formData.get('newPassword'),
						confirmationCode: formData.get('confirmationCode')
					}
				});
				toast.success('Password reset successful!');
				goto('/sign-in');
			} catch (error) {
				console.error('Password reset error:', error);
				toast.error('Failed to reset password. Please try again.');
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

	let passwordStrength = $derived(getPasswordStrength($form.newPassword));
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
					Create Your New Password
				</h2>
				<p class="mt-3 text-center text-sm text-white/80 sm:text-base lg:text-left">
					Choose a strong password to keep your account secure. Make sure it's unique and easy to
					remember.
				</p>

				<div class="mt-8 flex flex-col gap-6">
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:password-check" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Strong Password</h3>
							<p class="text-sm text-white/80">Use a mix of letters, numbers, and symbols</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:shield-lock" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Enhanced Security</h3>
							<p class="text-sm text-white/80">Keep your account protected</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:login-variant" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Ready to Go</h3>
							<p class="text-sm text-white/80">Sign in with your new password after reset</p>
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
						Reset Password
					</h2>
					<p class="text-lg text-muted-foreground">Create a new password</p>
				</div>
			</div>

			<div
				class="w-full space-y-6 p-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-12 lg:shadow-xl lg:ring-1 lg:ring-border lg:backdrop-blur-sm"
			>
				<div class="space-y-4">
					<p class="text-center text-sm text-muted-foreground">
						Enter the code sent to <span class="font-medium text-foreground">{data.email}</span> and
						create your new password.
					</p>
				</div>

				<form use:enhance method="POST" class="space-y-6">
					<input type="hidden" name="email" value={data.email} />

					<Field name="Confirmation Code" error={$errors.confirmationCode}>
						<div class="group relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon
									icon="mdi:shield-check"
									class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
								/>
							</div>
							<Input
								bind:value={$form.confirmationCode}
								name="confirmationCode"
								type="text"
								placeholder="Enter 6-digit code"
								required
								class="border-0 bg-muted/50 pl-10 pr-4 ring-primary/20 transition-all focus:ring-2 lg:border lg:bg-background"
							/>
						</div>
					</Field>

					<Field name="New Password" error={$errors.newPassword} class="space-y-2">
						<div class="group relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon
									icon="solar:lock-password-outline"
									class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
								/>
							</div>
							<Input
								bind:value={$form.newPassword}
								name="newPassword"
								type={togglePassword ? 'text' : 'password'}
								placeholder="••••••••"
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

						{#if $form.newPassword}
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
					</Field>

					<Field name="Confirm Password" error={$errors.confirmPassword}>
						<div class="group relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon
									icon="solar:lock-password-outline"
									class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
								/>
							</div>
							<Input
								bind:value={$form.confirmPassword}
								name="confirmPassword"
								type={toggleConfirmPassword ? 'text' : 'password'}
								placeholder="••••••••"
								required
								class="border-0 bg-muted/50 pl-10 pr-10 ring-primary/20 transition-all focus:ring-2 lg:border lg:bg-background"
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3 transition-colors hover:text-primary focus:outline-none"
								onclick={() => (toggleConfirmPassword = !toggleConfirmPassword)}
							>
								<Icon
									icon={toggleConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
									class="h-5 w-5 text-muted-foreground/70 transition-colors hover:text-primary"
								/>
							</button>
						</div>
					</Field>

					<Button
						type="submit"
						class="w-full font-semibold transition-all hover:shadow-lg"
						disabled={$submitting}
						isLoading={$submitting}
						size="lg"
					>
						{$submitting ? 'Resetting Password...' : 'Reset Password'}
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
