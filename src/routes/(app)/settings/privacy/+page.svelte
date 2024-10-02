<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api.js';
	import { Button } from '$lib/components/ui/button';
	import { Modal } from '$lib/components/ui/modals';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import { sessionStore } from '$lib/stores/session.store';
	import type { User } from '$lib/types/user.types.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	let isPrivate = $state($sessionStore.isPrivate);
	let swiperMode = $state($sessionStore.swiperMode);
	let inboxLocked = $state($sessionStore.inboxLocked);
	let showModal = $state(false);
	let modalContent = $state('');
	let toggleType = $state('');
	let isSubmitting = $state(false);

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
			throw error; // Re-throw the error so it can be caught in confirmToggle
		}
	}
</script>

<button class="mt-6 flex items-center text-sm font-medium" onclick={(): void => history.back()}>
	<Icon icon="solar:arrow-left-linear" class="mr-2 size-6" />
	Back
</button>

<h1 class="mb-6 mt-6 text-2xl font-bold">Privacy Profile</h1>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<span>Private Profile</span>
		<Toggle checked={isPrivate} onChange={() => openModal('isPrivate')} />
	</div>
	<div class="flex items-center justify-between">
		<span>Swiper Mode</span>
		<Toggle checked={swiperMode} onChange={() => openModal('swiperMode')} />
	</div>
	<div class="flex items-center justify-between">
		<span>Locked Inbox</span>
		<Toggle checked={inboxLocked} onChange={() => openModal('inboxLocked')} />
	</div>
</div>

{#if showModal}
	<Modal onClose={() => (showModal = false)}>
		<h2 class="mb-4 text-lg font-semibold">Confirm Change</h2>
		<p>{modalContent}</p>
		<div class="mt-6 flex justify-end space-x-4">
			<Button variant="outline" onclick={() => (showModal = false)} disabled={isSubmitting}
				>Cancel</Button
			>
			<Button onclick={confirmToggle} disabled={isSubmitting}>
				{isSubmitting ? 'Updating...' : 'Confirm'}
			</Button>
		</div>
	</Modal>
{/if}
