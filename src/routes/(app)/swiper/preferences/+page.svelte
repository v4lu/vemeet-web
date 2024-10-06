<script lang="ts">
	import { useSwiperModeSetup } from '$lib/api/use-swipper-setup.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Select } from '$lib/components/ui/select';
	import { sessionStore } from '$lib/stores/session.store';
	import Icon from '@iconify/svelte';

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

<div class="container mx-auto max-w-2xl px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold text-primary">Edit Swiper Preferences</h1>
	<form class="space-y-8" onsubmit={handleSubmit}>
		<div class="rounded-lg bg-card p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold">Age Range</h2>
			<div class="mb-4 flex items-center justify-between">
				<span class="text-sm font-medium text-muted-foreground">Min: {minAge}</span>
				<span class="text-sm font-medium text-muted-foreground">Max: {maxAge}</span>
			</div>
			<div class="flex space-x-4">
				<Field name="Minimum Age" class="flex-1">
					<Input
						type="number"
						id="minAge"
						bind:value={minAge}
						min={18}
						max={100}
						required
						class="mt-1"
					/>
				</Field>
				<Field name="Maximum Age" class="flex-1">
					<Input
						type="number"
						id="maxAge"
						bind:value={maxAge}
						min={18}
						max={100}
						required
						class="mt-1"
					/>
				</Field>
			</div>
		</div>

		<div class="rounded-lg bg-card p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold">Preferred Gender</h2>
			<Select id="preferredGender" bind:value={preferredGender} options={genderOptions} required />
		</div>

		<div class="rounded-lg bg-card p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold">Maximum Distance</h2>
			<div class="mb-4 flex items-center justify-between">
				<span class="text-sm font-medium text-muted-foreground">{maxDistance} km</span>
				<Icon icon="solar:map-point-bold" class="size-6 text-primary" />
			</div>
			<Input
				type="number"
				id="maxDistance"
				bind:value={maxDistance}
				min={1}
				max={100000}
				required
				class="mt-1"
			/>
		</div>

		<Button
			type="submit"
			class="w-full transition-all duration-300 hover:shadow-lg"
			disabled={resp.isLoadingUpdateSwiperPreferences}
		>
			{#if resp.isLoadingUpdateSwiperPreferences}
				Saving...
			{:else}
				<Icon icon="solar:check-circle-bold" class="mr-2 size-5" />
				Save Preferences
			{/if}
		</Button>
	</form>
</div>
