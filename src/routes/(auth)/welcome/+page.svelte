<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { toast } from '$lib/stores/toast.store.js';
	import { verificationCodeSchema } from '$lib/validators/auth.validator.js';
	import Icon from '@iconify/svelte';
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

<div class="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-bold tracking-tight">Enter Verification Code</h2>
			<p class="mt-2 text-center text-sm text-muted-foreground">
				We've sent a verification code to {data.email}. Please enter it below.
			</p>
		</div>
		<form use:enhance method="POST" class="mt-8 space-y-6">
			<input type="hidden" id="email" name="email" bind:value={data.email} />
			<Field name="Verification Code" error={$errors.code}>
				<div class="relative mt-1">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Icon icon="mdi:shield-check" class="h-5 w-5 text-muted-foreground" />
					</div>
					<Input
						bind:value={$form.code}
						id="code"
						name="code"
						type="text"
						autocomplete="one-time-code"
						required
						class="pl-10 pr-10"
						placeholder="Enter 6-digit code"
					/>
				</div>
			</Field>
			<div>
				<Button type="submit" class="w-full" disabled={isVerifying} isLoading={isVerifying}>
					{#if isVerifying}
						Verifying...
					{:else}
						Verify
					{/if}
				</Button>
			</div>
		</form>
		<div class="mt-4 text-center">
			<button
				type="button"
				class="text-sm text-primary hover:underline focus:outline-none"
				onclick={handleResendCode}
				disabled={resendDisabled}
			>
				{#if resendDisabled}
					Resend code in {resendTimer}s
				{:else}
					Didn't receive the code? Resend
				{/if}
			</button>
		</div>
	</div>
</div>
