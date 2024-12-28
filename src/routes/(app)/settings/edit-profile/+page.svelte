<script lang="ts">
	import Icon from '@iconify/svelte';
	import { browser } from '$app/environment';
	import { useLocations } from '$lib/api/use-locations.svelte.js';
	import { useUpdateUser } from '$lib/api/use-update-user.svelte.js';
	import { cn } from '$lib/cn';
	import { Avatar } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header';
	import { Field } from '$lib/components/ui/field';
	import { Input, inputVariants } from '$lib/components/ui/input';
	import { sessionStore } from '$lib/stores/session.store';
	import type { City, Country } from '$lib/types/geo.types.js';
	import type { UserUpdateFormData } from '$lib/types/user.types.js';
	import { clickOutside } from '$lib/utils';
	import { MainWrapper, SettingsTitle } from '$lib/components/layout';

	let { data } = $props();
	let genderOptions = $state([
		{ value: '', label: 'Select gender' },
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' },
		{ value: 'other', label: 'Other' },
		{ value: 'prefer_not_to_say', label: 'Prefer not to say' }
	]);

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
	let countrySearch = $state($sessionStore.countryName || '');
	let filteredCountries = $state(data.countries);

	const { isSubmitting, updateUser } = useUpdateUser(data.accessToken);
	const { fetchCities, resp: locationsResp } = useLocations(data.accessToken);

	let showCityDropdown = $state(false);
	let showCountryDropdown = $state(false);
	let showGenderDropdown = $state(false);

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

	function handleCountrySearch(event: Event) {
		const input = event.target as HTMLInputElement;
		countrySearch = input.value;

		filteredCountries = data.countries.filter((country) =>
			country?.countryName?.toLowerCase().includes(countrySearch.toLowerCase())
		);

		showCountryDropdown = filteredCountries.length > 0;
	}

	function selectCountry(selectedCountry: Country) {
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
		countrySearch = selectedCountry.countryName ?? '';
		showCountryDropdown = false;
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

	function selectGender(selectedGender: string) {
		gender = selectedGender;
		showGenderDropdown = false;
	}

	$effect(() => {
		if (browser) {
			username = $sessionStore.username;
			name = $sessionStore.name ?? '';
			gender = $sessionStore.gender || '';
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
		}
	});
</script>

<svelte:head>
	<title>Vemeet - Edit Profile</title>
</svelte:head>

<CustomHeaderWithTitle title="Edit Profile" />
<MainWrapper class="bg-card">
	<form class="mt-4 flex flex-col justify-between space-y-6 sm:space-y-8" onsubmit={handleSubmit}>
		<div class="flex-1 space-y-6 sm:space-y-8">
			<div class="space-y-4 sm:space-y-6">
				<div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
					<Avatar class="size-14 sm:size-16" user={$sessionStore} />
					<div>
						<h2 class="text-base font-semibold sm:text-lg">Basic Information</h2>
						<p class="text-sm text-muted-foreground">
							Update your profile details and personal information
						</p>
					</div>
				</div>

				<div class="space-y-4">
					<Field name="Username">
						<div class="group relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon
									icon="solar:user-bold"
									class="size-4 text-muted-foreground/70 transition-colors group-focus-within:text-primary sm:size-5"
								/>
							</div>
							<Input
								id="username"
								placeholder="Enter your username"
								bind:value={username}
								required
								class="bg-muted/50 pl-10 ring-primary/20 transition-all focus:ring-2"
							/>
						</div>
					</Field>

					<div class="grid gap-4 sm:grid-cols-2">
						<Field name="Name" optional>
							<div class="group relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<Icon
										icon="solar:user-id-bold"
										class="size-4 text-muted-foreground/70 transition-colors group-focus-within:text-primary sm:size-5"
									/>
								</div>
								<Input
									id="name"
									placeholder="Enter your full name"
									bind:value={name}
									class="bg-muted/50 pl-10 ring-primary/20 transition-all focus:ring-2"
								/>
							</div>
						</Field>
						<Field name="Gender" optional>
							<div class="relative">
								<button
									type="button"
									class="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-2 ring-primary/20 transition-all focus:ring-2"
									onclick={() => (showGenderDropdown = !showGenderDropdown)}
								>
									<div class="flex items-center space-x-2">
										<Icon
											icon="solar:users-group-two-rounded-bold"
											class="size-4 text-muted-foreground/70 transition-colors group-focus-within:text-primary sm:size-5"
										/>
										<span class="text-sm">
											{genderOptions.find((option) => option.value === gender)?.label ||
												'Select gender'}
										</span>
									</div>
									<Icon
										icon={showGenderDropdown ? 'solar:chevron-up-bold' : 'solar:chevron-down-bold'}
										class="size-4 text-muted-foreground/70"
									/>
								</button>

								{#if showGenderDropdown}
									<ul
										use:clickOutside={() => (showGenderDropdown = false)}
										class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-card py-1 shadow-lg sm:max-h-60"
									>
										{#each genderOptions as option}
											<button
												class="cursor-pointer px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
												onclick={() => selectGender(option.value)}
											>
												{option.label}
											</button>
										{/each}
									</ul>
								{/if}
							</div>
						</Field>
					</div>
				</div>
			</div>

			<div class="space-y-4 sm:space-y-6">
				<SettingsTitle
					title="Location"
					subtitle="Where are you based?"
					icon="solar:map-point-bold"
				/>

				<div class="grid gap-4 sm:grid-cols-2">
					<Field name="Country" optional>
						<div class="group relative flex items-center">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon
									icon="material-symbols:globe"
									class="size-4 text-muted-foreground/70 transition-colors group-focus-within:text-primary sm:size-5"
								/>
							</div>
							<Input
								id="country"
								placeholder="Search for a country"
								bind:value={countrySearch}
								oninput={handleCountrySearch}
								class="bg-muted/50 pl-10 ring-primary/20 transition-all focus:ring-2"
							/>
							{#if showCountryDropdown && filteredCountries.length > 0}
								<ul
									use:clickOutside={() => (showCountryDropdown = false)}
									class="absolute top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-card py-1 shadow-lg sm:max-h-60"
								>
									{#each filteredCountries as countryOption}
										<button
											type="button"
											class="w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
											onclick={() => selectCountry(countryOption)}
										>
											<span class="mr-2">{countryOption.countryFlag}</span>
											<span>{countryOption.countryName}</span>
										</button>
									{/each}
								</ul>
							{/if}
						</div>
					</Field>

					<Field name="City" optional>
						<div class="group relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<Icon
									icon="solar:city-bold"
									class="size-4 text-muted-foreground/70 transition-colors group-focus-within:text-primary sm:size-5"
								/>
							</div>
							<Input
								id="city"
								placeholder={country.countryIsoCode
									? 'Search for a city'
									: 'Select a country first'}
								bind:value={citySearch}
								oninput={handleCitySearch}
								disabled={!country.countryIsoCode}
								class="bg-muted/50 pl-10 ring-primary/20 transition-all focus:ring-2"
							/>
							{#if showCityDropdown && locationsResp.cities.length > 0}
								<ul
									use:clickOutside={() => (showCityDropdown = false)}
									class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-card py-1 shadow-lg sm:max-h-60"
								>
									{#each locationsResp.cities as cityOption}
										<button
											type="button"
											class="w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
											onclick={() => selectCity(cityOption)}
										>
											{cityOption.cityName}
										</button>
									{/each}
								</ul>
							{/if}
						</div>
					</Field>
				</div>
			</div>

			<div class="space-y-4 sm:space-y-6">
				<SettingsTitle
					title="About You"
					subtitle="Share a bit about yourself with the community"
					icon="solar:pen-bold"
				/>

				<Field name="Bio" optional>
					<div class="group relative">
						<textarea
							id="bio"
							rows="4"
							class={cn(
								inputVariants(),
								'min-h-[120px] resize-none bg-muted/50 ring-primary/20 transition-all focus:ring-2'
							)}
							placeholder="Tell us about yourself, your interests, and what brings you to our community..."
							bind:value={bio}
						></textarea>
					</div>
				</Field>
			</div>
		</div>

		<Button type="submit" class="w-full" size="lg" isLoading={isSubmitting} disabled={isSubmitting}>
			{isSubmitting ? 'Saving Changes...' : 'Save Changes'}
		</Button>
	</form>
</MainWrapper>
