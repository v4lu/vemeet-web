<script lang="ts">
	import { useSwiperModeSetup } from '$lib/api/use-swipper-setup.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import CustomHeaderWithTitle from '$lib/components/ui/custom-header/custom-header-with-title.svelte';
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

<CustomHeaderWithTitle title="Swiper Preferences" />

<div
	class="container min-h-full bg-background px-4 py-4 sm:px-6 lg:border-x lg:border-border lg:bg-card lg:px-8"
>
	<div class="mx-auto max-w-3xl space-y-6">
		<div class="space-y-2">
			<p class="text-sm text-muted-foreground">
				Customize your swiper preferences to find better matches
			</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-4 rounded-lg border bg-card shadow-sm sm:p-6">
				<div
					class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0"
				>
					<div
						class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
					>
						<Icon icon="solar:users-group-rounded-bold" class="size-5 sm:size-6" />
					</div>
					<div class="flex flex-1 flex-col space-y-4">
						<div>
							<h3 class="text-base font-medium text-foreground sm:text-lg">Age Range</h3>
							<div class="mt-2 flex space-x-4">
								<div class="flex-1">
									<label class="text-sm text-muted-foreground">Minimum Age</label>
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
									<label class="text-sm text-muted-foreground">Maximum Age</label>
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
				</div>

				<div class="border-t"></div>

				<div
					class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0"
				>
					<div
						class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
					>
						<Icon icon="solar:users-bold" class="size-5 sm:size-6" />
					</div>
					<div class="flex flex-1 flex-col space-y-2">
						<h3 class="text-base font-medium text-foreground sm:text-lg">Preferred Gender</h3>
						<Select
							id="preferredGender"
							bind:value={preferredGender}
							options={genderOptions}
							required
						/>
					</div>
				</div>

				<div class="border-t"></div>

				<div
					class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0"
				>
					<div
						class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
					>
						<Icon icon="solar:map-point-bold" class="size-5 sm:size-6" />
					</div>
					<div class="flex flex-1 flex-col space-y-2">
						<h3 class="text-base font-medium text-foreground sm:text-lg">Maximum Distance</h3>
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
			</div>

			<div class="rounded-lg border bg-card/50 p-4">
				<div class="flex items-start space-x-2">
					<Icon icon="solar:info-circle-bold" class="mt-1 size-5 text-muted-foreground" />
					<div class="flex-1 text-sm text-muted-foreground">
						<p>Your swiper preferences help us show you more relevant matches.</p>
						<p class="mt-2">Changes to these settings take effect immediately.</p>
					</div>
				</div>
			</div>

			<Button type="submit" class="w-full" disabled={resp.isLoadingUpdateSwiperPreferences}>
				{#if resp.isLoadingUpdateSwiperPreferences}
					Saving...
				{:else}
					Save Preferences
				{/if}
			</Button>
		</form>
	</div>
</div>
