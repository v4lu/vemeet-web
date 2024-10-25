<script lang="ts">
	import { goto } from '$app/navigation';
	import { authAPI } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';
	import { Drawer } from '$lib/components/ui/drawer';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Modal } from '$lib/components/ui/modals';
	import { toast } from '$lib/stores/toast.store';
	import Icon from '@iconify/svelte';
	import { HTTPError } from 'ky';

	let { data } = $props();
	const api = authAPI(data.accessToken);

	let email = $state(data.email);
	let showEmailModal = $state(false);
	let showPasswordModal = $state(false);
	let showDeleteModal = $state(false);
	let isSubmitting = $state(false);
	let showEmailVerification = $state(false);

	let newEmail = $state('');
	let emailVerificationCode = $state('');

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let deleteConfirmation = $state('');
	let passwordForDeletion = $state('');

	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	let isMobile = $state(true);

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

	let passwordStrength = $derived(getPasswordStrength(newPassword));

	async function handlePasswordChange(e: Event) {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error('New passwords do not match');
			return;
		}

		isSubmitting = true;
		try {
			await api.patch('auth/password', {
				json: {
					oldPassword: currentPassword,
					newPassword
				}
			});
			toast.success('Password updated successfully');
			showPasswordModal = false;
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error: any) {
			toast.error(error.message || 'Failed to update password');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleAccountDeletion(e: Event) {
		e.preventDefault();
		if (deleteConfirmation !== 'DELETE') {
			toast.error('Please type DELETE to confirm account deletion');
			return;
		}

		isSubmitting = true;
		try {
			await api.delete('auth/account', {
				json: { password: passwordForDeletion }
			});
			toast.success('Account deleted successfully');
			goto('https://vemeet.me');
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete account');
		} finally {
			isSubmitting = false;
		}
	}

	function resetForms() {
		if (!showEmailModal) {
			newEmail = '';
			emailVerificationCode = '';
			showEmailVerification = false;
		}
		if (!showPasswordModal) {
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
			showCurrentPassword = false;
			showNewPassword = false;
			showConfirmPassword = false;
		}
		if (!showDeleteModal) {
			deleteConfirmation = '';
			passwordForDeletion = '';
		}
	}

	async function handleEmailChange(e: Event) {
		e?.preventDefault();
		if (newEmail === email) {
			toast.error('Please enter a different email, this is yours');
			return;
		}
		isSubmitting = true;
		try {
			await api.patch('auth/email/initiate', {
				json: { newEmail }
			});
			showEmailVerification = true;
			toast.success('Verification code sent to your new email');
		} catch (error) {
			if (error instanceof HTTPError) {
				if (error.response.status === 409) {
					toast.error('This email is already in use. Please try another one.');
				} else {
					toast.error('Something went wrong please try again later');
				}
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function handleEmailVerification(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		try {
			await api.post('auth/email/confirm', {
				json: {
					email: newEmail,
					confirmationCode: emailVerificationCode
				}
			});
			toast.success('Email updated successfully');
			showEmailModal = false;
			showEmailVerification = false;
			emailVerificationCode = '';
			email = newEmail;
			newEmail = '';
		} catch (error: any) {
			toast.error(error.message || 'Invalid verification code');
			console.error('Email verification error:', error);
		} finally {
			isSubmitting = false;
		}
	}

	$effect(() => {
		resetForms();
	});

	$effect(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');

		function handleResize(e: MediaQueryListEvent | MediaQueryList) {
			isMobile = e.matches;
		}

		mediaQuery.addEventListener('change', handleResize);

		handleResize(mediaQuery);

		return () => {
			mediaQuery.removeEventListener('change', handleResize);
		};
	});

	const Dialog = $derived(isMobile ? Drawer : Modal);
</script>

<CustomHeaderWithTitle title="Security" />

<div class="container h-full px-4 py-6 lg:border-x lg:border-border lg:bg-card lg:px-8">
	<div class="max-w-pc mx-auto space-y-8">
		<div class="space-y-2">
			<h2 class="text-2xl font-semibold tracking-tight">Account Security</h2>
			<p class="text-sm text-muted-foreground">
				Manage your account security settings and credentials
			</p>
		</div>

		<div class="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
			<div class="space-y-6">
				<div class="flex items-start space-x-4">
					<div
						class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<Icon icon="solar:letter-bold" class="size-6" />
					</div>
					<div class="flex-1 space-y-1">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-lg font-medium">Email Address</h3>
								<p class="text-sm text-muted-foreground">Change your account email</p>
							</div>
							<Button variant="outline" onclick={() => (showEmailModal = true)}>
								Change Email
							</Button>
						</div>
						<p class="text-sm font-medium">{email}</p>
					</div>
				</div>
			</div>

			<div class="border-t"></div>

			<div class="space-y-6">
				<div class="flex items-start space-x-4">
					<div
						class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<Icon icon="solar:lock-password-bold" class="size-6" />
					</div>
					<div class="flex-1 space-y-1">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-lg font-medium">Password</h3>
								<p class="text-sm text-muted-foreground">Change your account password</p>
							</div>
							<Button variant="outline" onclick={() => (showPasswordModal = true)}>
								Change Password
							</Button>
						</div>
						<p class="text-sm text-muted-foreground">Last changed: Never</p>
					</div>
				</div>
			</div>

			<div class="border-t"></div>

			<div class="space-y-6">
				<div class="flex items-start space-x-4">
					<div
						class="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
					>
						<Icon icon="solar:trash-bin-trash-bold" class="size-6" />
					</div>
					<div class="flex-1 space-y-1">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-lg font-medium">Delete Account</h3>
								<p class="text-sm text-muted-foreground">
									Permanently delete your account and all data
								</p>
							</div>
							<Button
								variant="destructive"
								onclick={() => (showDeleteModal = true)}
								class="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
							>
								Delete Account
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-card/50 p-4">
			<div class="flex items-center space-x-3">
				<Icon icon="solar:shield-warning-bold" class="mt-1 size-7 text-muted-foreground" />
				<div class="flex-1 text-sm text-muted-foreground">
					<p>
						Keep your account secure by using a strong password and regularly reviewing your
						security settings.
					</p>
					<p class="mt-2">
						We can recommand storing your password in Password Manager like ProtonPass, 1Password
						and others.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

{#if showEmailModal}
	<Dialog class="lg:min-w-[35rem]" onClose={() => (showEmailModal = false)}>
		<div class="space-y-4">
			<div class="flex items-center gap-4">
				<div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
					<Icon icon="solar:letter-bold" class="size-6 text-primary" />
				</div>
				<h2 class="text-xl font-semibold">
					{showEmailVerification ? 'Verify Email' : 'Change Email'}
				</h2>
			</div>

			{#if showEmailVerification}
				<div class="rounded-lg bg-muted/50 p-4">
					<p class="text-sm text-muted-foreground">
						We've sent a verification code to <span class="font-medium text-foreground"
							>{newEmail}</span
						>. Please enter it below to complete your email change.
					</p>
				</div>

				<form class="space-y-4" onsubmit={handleEmailVerification}>
					<Field name="Verification Code">
						<Input
							type="text"
							inputmode="numeric"
							placeholder="Enter 6-digit code"
							bind:value={emailVerificationCode}
							required
							class="bg-muted/50"
						/>
					</Field>

					<div class="mt-2 flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onclick={() => (showEmailModal = false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || !emailVerificationCode}>
							{#if isSubmitting}
								<Icon icon="solar:spinner-bold" class="mr-2 size-4 animate-spin" />
								Verifying...
							{:else}
								Verify Email
							{/if}
						</Button>
					</div>
				</form>

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

				<div class="flex justify-center">
					<button
						type="button"
						class="text-sm font-medium text-primary hover:text-primary/80 hover:underline disabled:opacity-50"
						onclick={handleEmailChange}
						disabled={isSubmitting}
					>
						Resend verification code
					</button>
				</div>
			{:else}
				<form class="space-y-4" onsubmit={handleEmailChange}>
					<Field name="New Email">
						<Input
							type="email"
							placeholder="Enter new email address"
							bind:value={newEmail}
							required
							class="bg-muted/50"
						/>
					</Field>

					<div class="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onclick={() => (showEmailModal = false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || !newEmail}>
							{#if isSubmitting}
								<Icon icon="solar:spinner-bold" class="mr-2 size-4 animate-spin" />
								Sending Code...
							{:else}
								Continue
							{/if}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</Dialog>
{/if}

{#if showPasswordModal}
	<Dialog class="lg:min-w-[35rem]" onClose={() => (showPasswordModal = false)}>
		<div class="space-y-4">
			<div class="flex items-center gap-4">
				<div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
					<Icon icon="solar:lock-password-bold" class="size-6 text-primary" />
				</div>
				<h2 class="text-xl font-semibold">Change Password</h2>
			</div>

			<form class="space-y-4" onsubmit={handlePasswordChange}>
				<Field name="Current Password">
					<div class="relative">
						<Input
							type={showCurrentPassword ? 'text' : 'password'}
							placeholder="Enter current password"
							bind:value={currentPassword}
							required
							class="bg-muted/50 pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2"
							onclick={() => (showCurrentPassword = !showCurrentPassword)}
						>
							<Icon
								icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
								class="size-5 text-muted-foreground"
							/>
						</button>
					</div>
				</Field>

				<Field name="New Password">
					<div class="space-y-2">
						<div class="relative">
							<Input
								type={showNewPassword ? 'text' : 'password'}
								placeholder="Enter new password"
								bind:value={newPassword}
								required
								class="bg-muted/50 pr-10"
							/>
							<button
								type="button"
								class="absolute right-3 top-1/2 -translate-y-1/2"
								onclick={() => (showNewPassword = !showNewPassword)}
							>
								<Icon
									icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
									class="size-5 text-muted-foreground"
								/>
							</button>
						</div>

						{#if newPassword}
							<div class="h-1 w-full overflow-hidden rounded-full bg-muted/50">
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
					</div>
				</Field>

				<Field name="Confirm New Password">
					<div class="relative">
						<Input
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="Confirm new password"
							bind:value={confirmPassword}
							required
							class="bg-muted/50 pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
						>
							<Icon
								icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
								class="size-5 text-muted-foreground"
							/>
						</button>
					</div>
				</Field>

				<div class="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onclick={() => (showPasswordModal = false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							<Icon icon="solar:spinner-bold" class="mr-2 size-4 animate-spin" />
							Updating...
						{:else}
							Update Password
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</Dialog>
{/if}

{#if showDeleteModal}
	<Dialog class="lg:min-w-[35rem]" onClose={() => (showDeleteModal = false)}>
		<div class="space-y-4">
			<div class="flex items-center gap-4">
				<div class="flex size-12 items-center justify-center rounded-full bg-destructive/10">
					<Icon icon="solar:trash-bin-trash-bold" class="size-6 text-destructive" />
				</div>
				<h2 class="text-xl font-semibold text-destructive">Delete Account</h2>
			</div>

			<div class="rounded-lg border-2 border-destructive/10 bg-destructive/5 p-4 text-sm">
				<p class="font-medium text-destructive">Warning: This action cannot be undone.</p>
				<ul class="ml-4 mt-2 list-disc text-muted-foreground">
					<li>All your data will be permanently deleted</li>
					<li>You won't be able to recover your account</li>
					<li>Your username will be available for others to use</li>
				</ul>
			</div>

			<form class="space-y-4" onsubmit={handleAccountDeletion}>
				<Field name="Confirmation">
					<Input
						type="text"
						placeholder="Type 'DELETE' to confirm"
						bind:value={deleteConfirmation}
						required
						class="bg-muted/50"
					/>
				</Field>

				<Field name="Password">
					<div class="relative">
						<Input
							type={showCurrentPassword ? 'text' : 'password'}
							placeholder="Enter your password"
							bind:value={passwordForDeletion}
							required
							class="bg-muted/50 pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2"
							onclick={() => (showCurrentPassword = !showCurrentPassword)}
						>
							<Icon
								icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
								class="size-5 text-muted-foreground"
							/>
						</button>
					</div>
				</Field>

				<div class="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onclick={() => (showDeleteModal = false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>

					<Button
						type="submit"
						variant="destructive"
						disabled={isSubmitting || deleteConfirmation !== 'DELETE' || !passwordForDeletion}
						class="bg-destructive hover:bg-destructive/90"
					>
						{#if isSubmitting}
							<Icon icon="solar:spinner-bold" class="mr-2 size-4 animate-spin" />
							Deleting...
						{:else}
							Delete Account Permanently
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</Dialog>
{/if}
