<script lang="ts">
	import Icon from '@iconify/svelte';
	import { useSwiperModeSetup } from '$lib/api/use-swipper-setup.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import CustomHeaderWithTitle from '$lib/components/ui/custom-header/custom-header-with-title.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Select } from '$lib/components/ui/select';
	import { sessionStore } from '$lib/stores/session.store';
	import { MainWrapper, SettingsTitle } from '$lib/components/layout';

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

<CustomHeaderWithTitle title="Swiper Preferences" />

<MainWrapper class="bg-card">
	<form onsubmit={handleSubmit} class="mt-4 space-y-8">
		<div class="flex flex-col">
			<SettingsTitle
				title="Age Range"
				icon="solar:users-group-rounded-bold"
				subtitle="Set the age range of people you want to see"
			/>
			<div class="flex w-full flex-1 flex-col space-y-4 pt-4">
				<div class="mt-2 flex space-x-4">
					<div class="flex-1">
						<span class="text-sm text-muted-foreground">Minimum Age</span>
						<Input
							type="number"
							id="minAge"
							bind:value={minAge}
							min={18}
							max={100}
							required
							class="mt-1"
						/>
					</div>
					<div class="flex-1">
						<span class="text-sm text-muted-foreground">Maximum Age</span>
						<Input
							type="number"
							id="maxAge"
							bind:value={maxAge}
							min={18}
							max={100}
							required
							class="mt-1"
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-col space-y-4">
			<SettingsTitle
				title="Prefered Gender"
				icon="solar:user-bold"
				subtitle="Set the preferred gender of people you want to see"
			/>
			<div class="flex flex-1 flex-col pt-2">
				<Select
					id="preferredGender"
					bind:value={preferredGender}
					options={genderOptions}
					required
				/>
			</div>
		</div>

		<div class="flex flex-col space-y-4">
			<SettingsTitle
				title="Maximum Distance"
				icon="solar:map-point-bold"
				subtitle="Set the maximum distance of people you want to see"
			/>
			<div class="flex flex-1 flex-col pt-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">{maxDistance} km</span>
					</div>
					<Input
						type="number"
						id="maxDistance"
						bind:value={maxDistance}
						min={1}
						max={100000}
						required
					/>
				</div>
			</div>
		</div>

		<div class="rounded-lg border bg-card/50 p-4">
			<div class="flex items-start space-x-2">
				<Icon icon="solar:info-circle-bold" class="mt-1 size-5 text-muted-foreground" />
				<div class="flex-1 text-sm text-muted-foreground">
					<p>Your swiper preferences help us show you more relevant matches.</p>
					<p>Changes to these settings take effect immediately.</p>
				</div>
			</div>
		</div>

		<Button type="submit" size="lg" class="w-full" disabled={resp.isLoadingUpdateSwiperPreferences}>
			{#if resp.isLoadingUpdateSwiperPreferences}
				Saving...
			{:else}
				Save Preferences
			{/if}
		</Button>
	</form>
</MainWrapper>
