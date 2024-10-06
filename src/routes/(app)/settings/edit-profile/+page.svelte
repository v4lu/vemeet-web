<script lang="ts">
	import { useUpdateUser } from '$lib/api/use-update-user.svelte.js';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input, inputVariants } from '$lib/components/ui/input';
	import { sessionStore } from '$lib/stores/session.store';
	import type { DBCity, DBCountry } from '$lib/types/geo.types.js';
	import type { UserUpdateFormData } from '$lib/types/user.types.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let username = $state($sessionStore.username);
	let name = $state($sessionStore.name ?? '');
	let gender = $state($sessionStore.gender || '');
	let country = $state<DBCountry>({
		countryFlag: $sessionStore.countryFlag,
		countryIsoCode: $sessionStore.countryIsoCode,
		countryLat: $sessionStore.countryLat,
		countryLng: $sessionStore.countryLng,
		countryName: $sessionStore.countryName
	});
	let city = $state<DBCity>({
		cityLat: $sessionStore.cityLat,
		cityLng: $sessionStore.cityLng,
		cityName: $sessionStore.cityName
	});
	let bio = $state($sessionStore.bio || '');

	const { isSubmitting, updateUser } = useUpdateUser(data.accessToken);

	function handleCountryChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedCountry = data.countries.find((c) => c.code === select.value);
		if (selectedCountry) {
			country = {
				countryFlag: selectedCountry.flag,
				countryIsoCode: selectedCountry.code,
				countryLat: selectedCountry.coordinates.lat,
				countryLng: selectedCountry.coordinates.lng,
				countryName: selectedCountry.name
			};
		}
	}

	async function handleSubmit(event: Event): Promise<void> {
		event.preventDefault();
		const payload: UserUpdateFormData = {
			username,
			bio,
			name,
			gender,
			countryName: country.countryName,
			countryFlag: country.countryFlag,
			countryIsoCode: country.countryIsoCode,
			countryLat: country.countryLat,
			countryLng: country.countryLng,
			cityName: city.cityName,
			cityLat: city.cityLat,
			cityLng: city.cityLng
		};
		await updateUser(payload);
	}
</script>

<div class="container mx-auto my-12 max-w-2xl space-y-6">
	<button
		class="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
		onclick={() => history.back()}
	>
		<Icon icon="solar:arrow-left-linear" class="mr-2 size-5" />
		Back
	</button>

	<form class="space-y-6 rounded-lg bg-card p-6 shadow-lg" onsubmit={handleSubmit}>
		<h1 class="text-2xl font-bold text-foreground">Edit Profile</h1>

		<Field name="Username">
			<Input
				id="username"
				placeholder="Username"
				bind:value={username}
				required
				class="bg-background"
			/>
		</Field>

		<div class="grid gap-6 sm:grid-cols-2">
			<Field name="Name" optional>
				<Input id="name" placeholder="Name" bind:value={name} class="bg-background" />
			</Field>
			<Field name="Gender" optional>
				<Input id="gender" placeholder="Gender" bind:value={gender} class="bg-background" />
			</Field>
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<Field name="Country" optional>
				<select
					id="country"
					class={cn(inputVariants(), 'bg-background')}
					value={country.countryIsoCode}
					onchange={handleCountryChange}
				>
					<option value="">Select a country</option>
					{#each data.countries as country}
						<option value={country.code}>
							{country.name}
						</option>
					{/each}
				</select>
			</Field>
			<Field name="City" optional>
				<Input id="city" placeholder="City" bind:value={city.cityName} class="bg-background" />
			</Field>
		</div>

		<Field name="Bio" optional>
			<textarea
				id="bio"
				rows="4"
				class={cn(inputVariants(), 'resize-none bg-background')}
				placeholder="Tell us about yourself..."
				bind:value={bio}
			></textarea>
		</Field>

		<Button type="submit" class="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
			{isSubmitting ? 'Saving...' : 'Save Changes'}
		</Button>
	</form>
</div>
