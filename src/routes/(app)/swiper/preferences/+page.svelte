<script lang="ts">
	import { useSwiperModeSetup } from '$lib/api/use-swipper-setup.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Select } from '$lib/components/ui/select';
	import { sessionStore } from '$lib/stores/session.store';

	let { data } = $props();

	type SwiperPreferencesFormData = {
		minAge: number;
		maxAge: number;
		preferredGender: string;
		maxDistance: number;
	};

	const { resp, updateSwiperPreferences } = useSwiperModeSetup(
		data.accessToken,
		$sessionStore,
		data.userSwiperConfigurated!,
		data.userSwiperPreferences!
	);
	resp.preferences = data.preferences;

	let minAge = $state(data.preferences.minAge);
	let maxAge = $state(data.preferences.maxAge);
	let preferredGender = $state(data.preferences.preferredGender);
	let maxDistance = $state(data.preferences.maxDistance);

	const genderOptions = [
		{ value: 'Female', label: 'Female' },
		{ value: 'Male', label: 'Male' },
		{ value: 'Any', label: 'Any' }
	];

	async function handleSubmit(event: Event): Promise<void> {
		event.preventDefault();
		const payload: SwiperPreferencesFormData = {
			minAge,
			maxAge,
			preferredGender,
			maxDistance
		};
		await updateSwiperPreferences(payload);
	}

	$effect(() => {
		if (data.preferences) {
			minAge = data.preferences.minAge ?? 18;
			maxAge = data.preferences.maxAge ?? 50;
			preferredGender = data.preferences.preferredGender ?? 'Female';
			maxDistance = data.preferences.maxDistance ?? 50000;
		}
	});
</script>

<h1 class="mb-6 mt-6 text-2xl font-bold">Edit Swiper Preferences</h1>

<form class="space-y-6" onsubmit={handleSubmit}>
	<div class="flex space-x-4">
		<Field name="Minimum Age" class="flex-1">
			<Input
				type="number"
				id="minAge"
				placeholder="Minimum Age"
				bind:value={minAge}
				min="18"
				max="100"
				required
			/>
		</Field>
		<Field name="Maximum Age" class="flex-1">
			<Input
				type="number"
				id="maxAge"
				placeholder="Maximum Age"
				bind:value={maxAge}
				min="18"
				max="100"
				required
			/>
		</Field>
	</div>

	<Field name="Preferred Gender">
		<Select id="preferredGender" bind:value={preferredGender} options={genderOptions} required />
	</Field>

	<Field name="Maximum Distance (km)">
		<Input
			type="number"
			id="maxDistance"
			placeholder="Maximum Distance"
			bind:value={maxDistance}
			min="1"
			max="100000"
			required
		/>
	</Field>

	<Button
		type="submit"
		class="w-full"
		isLoading={resp.isLoadingUpdateSwiperPreferences}
		disabled={resp.isLoadingUpdateSwiperPreferences}
	>
		{#if resp.isLoadingUpdateSwiperPreferences}
			Saving...
		{:else}
			Save Preferences
		{/if}
	</Button>
</form>
