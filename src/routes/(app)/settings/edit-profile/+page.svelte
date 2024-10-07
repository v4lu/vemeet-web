<script lang="ts">
	import { useLocations } from '$lib/api/use-locations.svelte.js';
	import { useUpdateUser } from '$lib/api/use-update-user.svelte.js';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input, inputVariants } from '$lib/components/ui/input';
	import { sessionStore } from '$lib/stores/session.store';
	import type { City, Country } from '$lib/types/geo.types.js';
	import type { UserUpdateFormData } from '$lib/types/user.types.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let username = $state($sessionStore.username);
	let name = $state($sessionStore.name ?? '');
	let gender = $state($sessionStore.gender || '');
	let country = $state<Country>({
		countryFlag: $sessionStore.countryFlag,
		countryIsoCode: $sessionStore.countryIsoCode,
		countryLat: $sessionStore.countryLat,
		countryLng: $sessionStore.countryLng,
		countryName: $sessionStore.countryName
	});
	let city = $state<City>({
		cityLat: $sessionStore.cityLat,
		cityLng: $sessionStore.cityLng,
		cityName: $sessionStore.cityName,
		countryIsoCode: $sessionStore.countryIsoCode
	});
	let bio = $state($sessionStore.bio || '');

	let citySearch = $state($sessionStore.cityName || '');

	const { isSubmitting, updateUser } = useUpdateUser(data.accessToken);
	const { fetchCities, resp: locationsResp } = useLocations(data.accessToken);

	let showCityDropdown = $state(false);

	function debounce<F extends (...args: any[]) => any>(
		func: F,
		delay: number
	): (...args: Parameters<F>) => void {
		let timeoutId: ReturnType<typeof setTimeout>;
		return (...args: Parameters<F>) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => func(...args), delay);
		};
	}

	const debouncedFetchCities = debounce((countryIsoCode: string, search: string) => {
		fetchCities(countryIsoCode, search);
		showCityDropdown = true;
	}, 300);

	function handleCountryChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const selectedCountry = data.countries.find((c) => c.countryIsoCode === select.value);
		if (selectedCountry) {
			country = {
				countryFlag: selectedCountry.countryFlag,
				countryIsoCode: selectedCountry.countryIsoCode,
				countryLat: selectedCountry.countryLat,
				countryLng: selectedCountry.countryLng,
				countryName: selectedCountry.countryName
			};
			city = {} as City;
			citySearch = '';
			showCityDropdown = false;
			locationsResp.cities = [];
			fetchCities(selectedCountry.countryIsoCode!);
		} else {
			country = {} as Country;
			city = {} as City;
			citySearch = '';
			showCityDropdown = false;
			locationsResp.cities = [];
		}
	}

	function handleCitySearch(event: Event) {
		const input = event.target as HTMLInputElement;
		citySearch = input.value;
		if (country.countryIsoCode) {
			debouncedFetchCities(country.countryIsoCode, citySearch);
		}
	}

	function selectCity(selectedCity: City) {
		city = selectedCity;
		citySearch = selectedCity.cityName || '';
		showCityDropdown = false;
	}

	async function handleSubmit(event: Event): Promise<void> {
		event.preventDefault();
		const payload: UserUpdateFormData = {
			username,
			bio,
			name,
			gender,
			countryName: country.countryName || '',
			countryFlag: country.countryFlag || '',
			countryIsoCode: country.countryIsoCode || '',
			countryLat: country.countryLat || null,
			countryLng: country.countryLng || null,
			cityName: city.cityName || '',
			cityLat: city.cityLat || null,
			cityLng: city.cityLng || null
		};

		await updateUser(payload);
	}

	$effect(() => {
		country = {
			countryFlag: $sessionStore.countryFlag,
			countryIsoCode: $sessionStore.countryIsoCode,
			countryLat: $sessionStore.countryLat,
			countryLng: $sessionStore.countryLng,
			countryName: $sessionStore.countryName
		};
		city = {
			cityLat: $sessionStore.cityLat,
			cityLng: $sessionStore.cityLng,
			cityName: $sessionStore.cityName,
			countryIsoCode: $sessionStore.countryIsoCode
		};
		citySearch = $sessionStore.cityName || '';
	});
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
					bind:value={country.countryIsoCode}
					onchange={handleCountryChange}
				>
					<option value="">Select a country</option>
					{#each data.countries as countryOption}
						<option value={countryOption.countryIsoCode}>
							{countryOption.countryName}
						</option>
					{/each}
				</select>
			</Field>
			<Field name="City" optional>
				<div class="relative">
					<Input
						id="city"
						placeholder="Search for a city"
						bind:value={citySearch}
						oninput={handleCitySearch}
						disabled={!country.countryIsoCode}
						class="bg-background"
					/>
					{#if showCityDropdown && locationsResp.cities.length > 0}
						<ul
							class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
						>
							{#each locationsResp.cities as cityOption}
								<li
									class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
									onclick={() => selectCity(cityOption)}
								>
									{cityOption.cityName}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
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
