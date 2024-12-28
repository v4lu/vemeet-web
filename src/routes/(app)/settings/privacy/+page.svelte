<script lang="ts">
	import Icon from '@iconify/svelte';
	import { api, createAuthHeaders } from '$lib/api.js';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';
	import { Drawer } from '$lib/components/ui/drawer/index.js';
	import { Modal } from '$lib/components/ui/modals';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { sessionStore } from '$lib/stores/session.store';
	import type { User } from '$lib/types/user.types.js';
	import { MainWrapper } from '$lib/components/layout';

	let { data } = $props();
	let isPrivate = $state($sessionStore.isPrivate);
	let swiperMode = $state($sessionStore.swiperMode);
	let inboxLocked = $state($sessionStore.inboxLocked);
	let showModal = $state(false);
	let modalContent = $state('');
	let toggleType = $state('');
	let isSubmitting = $state(false);
	let isMobile = $state(true);

	function openModal(type: string) {
		toggleType = type;
		switch (type) {
			case 'isPrivate':
				modalContent =
					'Are you sure you want to change your profile privacy? This will affect who can see your profile.';
				break;
			case 'swiperMode':
				modalContent =
					'Are you sure you want to change your swiper mode? This will make your profile able to be found through Swiper mode.';
				break;
			case 'inboxLocked':
				modalContent =
					'Are you sure you want to change your inbox settings? This will affect who can send you messages.';
				break;
		}
		showModal = true;
	}

	async function confirmToggle() {
		isSubmitting = true;
		let updatedValue: boolean;

		switch (toggleType) {
			case 'isPrivate':
				updatedValue = !isPrivate;
				isPrivate = updatedValue;
				break;
			case 'swiperMode':
				updatedValue = !swiperMode;
				swiperMode = updatedValue;
				break;
			case 'inboxLocked':
				updatedValue = !inboxLocked;
				inboxLocked = updatedValue;
				break;
			default:
				isSubmitting = false;
				showModal = false;
				return;
		}

		showModal = false;

		try {
			await updateUser({ [toggleType]: updatedValue });
		} catch (error) {
			console.error('Failed to update user settings:', error);
			switch (toggleType) {
				case 'isPrivate':
					isPrivate = !updatedValue;
					break;
				case 'swiperMode':
					swiperMode = !updatedValue;
					break;
				case 'inboxLocked':
					inboxLocked = !updatedValue;
					break;
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function updateUser(payload: Partial<User>): Promise<void> {
		try {
			const res = await api
				.patch<User>('users', {
					json: payload,
					headers: createAuthHeaders(data.accessToken)
				})
				.json();
			sessionStore.setUser(res);
		} catch (error) {
			console.error(error);
		}
	}

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

<svelte:head>
	<title>Vemeet - Privacy</title>
</svelte:head>

<CustomHeaderWithTitle title="Privacy" />

<MainWrapper class="bg-card">
	<div class="mx-auto space-y-6">
		<div class="space-y-2">
			<h2 class="text-xl font-semibold tracking-tight sm:text-2xl">Privacy & Security</h2>
			<p class="text-sm text-muted-foreground">
				Manage your privacy settings and control how others interact with you
			</p>
		</div>

		<div class="space-y-4 rounded-lg border bg-card shadow-sm sm:p-6">
			<div class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
				<div
					class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
				>
					<Icon icon="solar:shield-user-bold" class="size-5 sm:size-6" />
				</div>
				<div class="flex flex-1 flex-col space-y-2 sm:space-y-1">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<h3 class="text-base font-medium text-foreground sm:text-lg">Private Profile</h3>
							{#if isPrivate}
								<span
									class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
								>
									<Icon icon="solar:shield-check-bold" class="mr-1 size-3.5" />
									Enabled
								</span>
							{/if}
						</div>
						<Toggle checked={isPrivate} onchange={() => openModal('isPrivate')} size="md" />
					</div>
					<p class="text-sm text-muted-foreground">
						Only approved followers can see your profile content and activities
					</p>
				</div>
			</div>

			<div class="border-t"></div>

			<div class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
				<div
					class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
				>
					<Icon icon="solar:users-group-rounded-bold" class="size-5 sm:size-6" />
				</div>
				<div class="flex flex-1 flex-col space-y-2 sm:space-y-1">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<h3 class="text-base font-medium text-foreground sm:text-lg">Swiper Mode</h3>
							{#if !swiperMode}
								<span
									class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
								>
									<Icon icon="solar:shield-cross-bold" class="mr-1 size-3.5" />
									Disabled
								</span>
							{/if}
						</div>
						<Toggle checked={swiperMode} onchange={() => openModal('swiperMode')} size="md" />
					</div>
					<p class="text-sm text-muted-foreground">
						Allow your profile to be discovered through Swiper mode
					</p>
				</div>
			</div>

			<div class="border-t"></div>

			<div class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
				<div
					class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
				>
					<Icon icon="solar:lock-keyhole-bold" class="size-5 sm:size-6" />
				</div>
				<div class="flex flex-1 flex-col space-y-2 sm:space-y-1">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<h3 class="text-base font-medium text-foreground sm:text-lg">Locked Inbox</h3>
							{#if inboxLocked}
								<span
									class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
								>
									<Icon icon="solar:shield-check-bold" class="mr-1 size-3.5" />
									Enabled
								</span>
							{/if}
						</div>
						<Toggle checked={inboxLocked} onchange={() => openModal('inboxLocked')} size="md" />
					</div>
					<p class="text-sm text-muted-foreground">
						Only receive messages from approved connections
					</p>
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-card/50 p-4">
			<div class="flex items-start space-x-2">
				<Icon icon="solar:info-circle-bold" class="mt-1 size-5 text-muted-foreground" />
				<div class="flex-1 text-sm text-muted-foreground">
					<p>
						Your privacy settings help protect your information and control your experience on
						Vemeet.
					</p>
					<p class="mt-2">Changes to these settings take effect immediately.</p>
				</div>
			</div>
		</div>
	</div>
</MainWrapper>

{#if showModal}
	<Dialog onClose={() => (showModal = false)}>
		<div class="space-y-4 p-4">
			<div class="flex items-center gap-4">
				<div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
					<Icon
						icon={toggleType === 'isPrivate'
							? 'solar:shield-user-bold'
							: toggleType === 'swiperMode'
								? 'solar:users-group-rounded-bold'
								: 'solar:lock-keyhole-bold'}
						class="size-6 text-primary"
					/>
				</div>
				<h2 class="text-xl font-semibold text-foreground">Confirm Change</h2>
			</div>

			<p class="text-muted-foreground">{modalContent}</p>

			<div class="mt-6 flex justify-end space-x-3">
				<Button
					variant="outline"
					onclick={() => (showModal = false)}
					disabled={isSubmitting}
					class="font-medium"
				>
					Cancel
				</Button>
				<Button onclick={confirmToggle} disabled={isSubmitting} class="font-medium">
					{#if isSubmitting}
						<Icon icon="solar:spinner-bold" class="mr-2 size-4 animate-spin" />
						Updating...
					{:else}
						Confirm
					{/if}
				</Button>
			</div>
		</div>
	</Dialog>
{/if}
