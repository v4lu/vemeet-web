<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Logo } from '$lib/components/ui/logo';
	import { toast } from '$lib/stores/toast.store.js';
	import { verificationCodeSchema } from '$lib/validators/auth.validator.js';
	import Icon from '@iconify/svelte';
	import { fade, fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();
	let isVerifying = $state(false);
	const { form, errors, enhance } = superForm(data.form, {
		validators: zodClient(verificationCodeSchema),
		onSubmit: async ({ formData, cancel }) => {
			cancel();
			isVerifying = true;
			try {
				await api.post('auth/confirm', {
					json: { confirmationCode: formData.get('code'), email: data.email }
				});
				toast.success('Verification successful!');
				goto('/sign-in');
			} catch (error) {
				console.error('Verification error:', error);
				toast.error('Invalid verification code. Please try again.');
			} finally {
				isVerifying = false;
			}
		}
	});

	let resendDisabled = $state(false);
	let resendTimer = $state(0);

	function startResendTimer() {
		resendDisabled = true;
		resendTimer = 60;
		const interval = setInterval(() => {
			resendTimer--;
			if (resendTimer <= 0) {
				clearInterval(interval);
				resendDisabled = false;
			}
		}, 1000);
	}

	async function handleResendCode() {
		if (resendDisabled) return;
		try {
			await api.post('auth/verification-email/resend', { json: { email: data.email } }).json();
			toast.success('Verification code resent');
			startResendTimer();
		} catch (error) {
			console.error('Resend error:', error);
			toast.error('Failed to resend code. Please try again later.');
		}
	}
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
					One Last Step to Join Us
				</h2>
				<p class="mt-3 text-center text-sm text-white/80 sm:text-base lg:text-left">
					We want to ensure your email is valid. This helps us keep our community safe and secure.
				</p>

				<div class="mt-8 flex flex-col gap-6">
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:shield-check" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Secure Access</h3>
							<p class="text-sm text-white/80">Verify your email to access all features</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:email-fast" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Quick Process</h3>
							<p class="text-sm text-white/80">Simple verification with a 6-digit code</p>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="rounded-full bg-white/10 p-3 backdrop-blur-sm">
							<Icon icon="mdi:account-check" class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 class="font-medium text-white">Start Exploring</h3>
							<p class="text-sm text-white/80">Connect with the community after verification</p>
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
						Verify Your Email
					</h2>
					<p class="text-lg text-muted-foreground">Enter the verification code</p>
				</div>
			</div>

			<div
				class="w-full space-y-6 p-0 lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-12 lg:shadow-xl lg:ring-1 lg:ring-border lg:backdrop-blur-sm"
			>
				<div class="space-y-4 text-center">
					<p class="text-lg text-muted-foreground">
						We've sent a verification code to <span class="font-medium text-foreground"
							>{data.email}</span
						>
					</p>
				</div>

				<form use:enhance method="POST" class="space-y-6">
					<input type="hidden" id="email" name="email" bind:value={data.email} />
					<Field name="Verification Code" error={$errors.code}>
						<div class="group relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon
									icon="mdi:shield-check"
									class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
								/>
							</div>
							<Input
								bind:value={$form.code}
								id="code"
								name="code"
								type="text"
								autocomplete="one-time-code"
								required
								class="border-0 bg-muted/50 pl-10 pr-4 ring-primary/20 transition-all focus:ring-2 lg:border lg:bg-background"
								placeholder="Enter 6-digit code"
							/>
						</div>
					</Field>

					<Button
						type="submit"
						class="w-full font-semibold transition-all hover:shadow-lg"
						disabled={isVerifying}
						isLoading={isVerifying}
						size="lg"
					>
						{isVerifying ? 'Verifying...' : 'Verify Email'}
					</Button>
				</form>

				<div class="mt-6">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-border/50"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="bg-background px-3 text-muted-foreground lg:bg-card">
								Didn't receive the code?
							</span>
						</div>
					</div>

					<div class="mt-6 flex justify-center">
						<button
							type="button"
							class="font-medium text-primary transition-colors hover:text-primary/80 hover:underline disabled:opacity-50"
							onclick={handleResendCode}
							disabled={resendDisabled}
						>
							{resendDisabled ? `Resend code in ${resendTimer}s` : 'Resend code'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
