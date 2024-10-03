<script lang="ts">
	import { useSwiperModeSetup } from '$lib/api/use-swipper-setup.svelte.js';
	import { SwiperHome } from '$lib/components/swiper/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Modal } from '$lib/components/ui/modals';
	import { Select } from '$lib/components/ui/select';
	import { sessionStore } from '$lib/stores/session.store';

	let { data } = $props();
	const { resp, configureSwiperPreferences } = useSwiperModeSetup(
		data.accessToken,
		$sessionStore,
		data.userSwiperConfigurated!,
		data.userSwiperPreferences!
	);

	let showSwiperModeModal = $state(false);
	let showProfileModal = $state(false);
	let showConfigModal = $state(false);

	let minAge = $state(18);
	let maxAge = $state(50);
	let preferredGender = $state('Female');
	let maxDistance = $state(50);

	const genderOptions = [
		{ value: 'Female', label: 'Female' },
		{ value: 'Male', label: 'Male' },
		{ value: 'Any', label: 'Any' }
	];

	function checkConfiguration() {
		if (!resp.isSwiperMode) {
			showSwiperModeModal = true;
		} else if (!resp.hasEverythingSetup) {
			showProfileModal = true;
		} else if (!resp.isConfigurated) {
			showConfigModal = true;
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const payload = {
			minAge,
			maxAge,
			preferredGender,
			maxDistance
		};
		await configureSwiperPreferences(payload);
		showConfigModal = false;
		resp.isConfigurated = true;
		checkConfiguration();
	}

	checkConfiguration();
</script>

{#if showSwiperModeModal}
	<Modal onClose={() => (showSwiperModeModal = false)}>
		<h2 class="mb-4 text-xl font-bold">Swiper Mode is Disabled</h2>
		<p>You need to enable Swiper Mode in your privacy settings to continue.</p>
		<div class="mt-4 flex justify-end">
			<a class={buttonVariants({ size: 'sm', variant: 'outline' })} href="/settings/privacy">
				Go to Privacy Settings
			</a>
		</div>
	</Modal>
{/if}

{#if showProfileModal}
	<Modal onClose={() => (showProfileModal = false)}>
		<h2 class="mb-4 text-xl font-bold">Profile Information Incomplete</h2>
		<p>
			Please complete your profile information to use Swiper Mode. We need to know your location
		</p>
		<div class="mt-4 flex justify-end">
			<a class={buttonVariants({ size: 'sm', variant: 'outline' })} href="/settings/edit-profile">
				Edit Profile
			</a>
		</div>
	</Modal>
{/if}

{#if showConfigModal}
	<Modal onClose={() => (showConfigModal = false)}>
		<h2 class="mb-4 text-xl font-bold">Swiper Mode Configuration</h2>
		<p class="mb-4">Please configure your Swiper preferences to continue.</p>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="flex space-x-4">
				<div class="flex-1">
					<label for="minAge" class="block text-sm font-medium text-gray-700">Minimum Age</label>
					<Input type="number" id="minAge" bind:value={minAge} min="18" max="100" required />
				</div>
				<div class="flex-1">
					<label for="maxAge" class="block text-sm font-medium text-gray-700">Maximum Age</label>
					<Input type="number" id="maxAge" bind:value={maxAge} min="18" max="100" required />
				</div>
			</div>
			<div>
				<label for="preferredGender" class="block text-sm font-medium text-gray-700"
					>Preferred Gender</label
				>
				<Select
					id="preferredGender"
					bind:value={preferredGender}
					options={genderOptions}
					required
				/>
			</div>
			<div>
				<label for="maxDistance" class="block text-sm font-medium text-gray-700"
					>Maximum Distance (km)</label
				>
				<Input
					type="number"
					id="maxDistance"
					bind:value={maxDistance}
					min="1"
					max="100000"
					required
				/>
			</div>
			<div class="flex justify-end">
				<Button type="submit" size="sm" disabled={resp.isLoadingConfigurateSwiperPreferences}>
					{resp.isLoadingConfigurateSwiperPreferences ? 'Configuring...' : 'Configure Preferences'}
				</Button>
			</div>
		</form>
	</Modal>
{/if}

{#if resp.isUserReady}
	<SwiperHome authToken={data.accessToken} />
{/if}
