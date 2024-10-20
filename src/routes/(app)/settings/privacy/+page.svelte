<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api.js';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';

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
		}
	}
</script>

<CustomHeaderWithTitle title="Privacy Settings" />

<div class="container bg-card p-6 shadow-lg">
	<div class="mt-2 space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-foreground">Private Profile</h3>
				<p class="text-sm text-muted-foreground">Only approved followers can see your profile</p>
			</div>
			<Toggle checked={isPrivate} onchange={() => openModal('isPrivate')} />
		</div>

		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-foreground">Swiper Mode</h3>
				<p class="text-sm text-muted-foreground">
					Allow your profile to be discovered in Swiper mode
				</p>
			</div>
			<Toggle checked={swiperMode} onchange={() => openModal('swiperMode')} />
		</div>

		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-foreground">Locked Inbox</h3>
				<p class="text-sm text-muted-foreground">Only receive messages from approved connections</p>
			</div>
			<Toggle checked={inboxLocked} onchange={() => openModal('inboxLocked')} />
		</div>
	</div>
</div>

{#if showModal}
	<Modal onClose={() => (showModal = false)}>
		<h2 class="mb-4 text-xl font-semibold text-foreground">Confirm Change</h2>
		<p class="text-muted-foreground">{modalContent}</p>
		<div class="mt-6 flex justify-end space-x-4">
			<Button variant="outline" onclick={() => (showModal = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={confirmToggle} disabled={isSubmitting}>
				{isSubmitting ? 'Updating...' : 'Confirm'}
			</Button>
		</div>
	</Modal>
{/if}
