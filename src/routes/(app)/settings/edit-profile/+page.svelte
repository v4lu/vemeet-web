<script lang="ts">
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

<CustomHeaderWithTitle title="Edit Profile" />
<div class="container h-full px-4 py-6 lg:border-x lg:border-border lg:bg-card lg:px-8">
	<div class="max-w-pc mx-auto">
		<form class="flex flex-col justify-between space-y-8" onsubmit={handleSubmit}>
			<div class="flex-1 space-y-8">
				<div class="space-y-6">
					<div class="flex items-center gap-4">
						<Avatar class="size-16" user={$sessionStore} />
						<div>
							<h2 class="text-lg font-semibold">Basic Information</h2>
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
										class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
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
											class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
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
								<div class="group relative">
									<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
										<Icon
											icon="solar:users-group-two-rounded-bold"
											class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
										/>
									</div>
									<select
										id="gender"
										bind:value={gender}
										class={cn(
											inputVariants(),
											'bg-muted/50 pl-10 ring-primary/20 transition-all focus:ring-2'
										)}
									>
										<option value="">Select gender</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
										<option value="other">Other</option>
										<option value="prefer_not_to_say">Prefer not to say</option>
									</select>
								</div>
							</Field>
						</div>
					</div>
				</div>

				<!-- Location section -->
				<div class="space-y-6">
					<div class="flex items-center gap-4">
						<div
							class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<Icon icon="solar:map-point-bold" class="size-8" />
						</div>
						<div>
							<h2 class="text-lg font-semibold">Location</h2>
							<p class="text-sm text-muted-foreground">Where are you based?</p>
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<Field name="Country" optional>
							<div class="group relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<Icon
										icon="material-symbols:globe"
										class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
									/>
								</div>
								<select
									id="country"
									class={cn(
										inputVariants(),
										'bg-muted/50 pl-10 ring-primary/20 transition-all focus:ring-2'
									)}
									bind:value={country.countryIsoCode}
									onchange={handleCountryChange}
								>
									<option value="">Select a country</option>
									{#each data.countries as countryOption}
										<option value={countryOption.countryIsoCode}>
											{countryOption.countryFlag}
											{countryOption.countryName}
										</option>
									{/each}
								</select>
							</div>
						</Field>

						<Field name="City" optional>
							<div class="group relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<Icon
										icon="solar:city-bold"
										class="h-5 w-5 text-muted-foreground/70 transition-colors group-focus-within:text-primary"
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
										class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-card py-1 shadow-lg"
									>
										{#each locationsResp.cities as cityOption}
											<li
												class="cursor-pointer px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
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
				</div>

				<!-- Bio section -->
				<div class="space-y-6">
					<div class="flex items-center gap-4">
						<div
							class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<Icon icon="solar:pen-bold" class="size-8" />
						</div>
						<div>
							<h2 class="text-lg font-semibold">About You</h2>
							<p class="text-sm text-muted-foreground">
								Share a bit about yourself with the community
							</p>
						</div>
					</div>

					<Field name="Bio" optional>
						<div class="group relative">
							<textarea
								id="bio"
								rows="4"
								class={cn(
									inputVariants(),
									'min-h-[100px] resize-none bg-muted/50 ring-primary/20 transition-all focus:ring-2'
								)}
								placeholder="Tell us about yourself, your interests, and what brings you to our community..."
								bind:value={bio}
							></textarea>
						</div>
					</Field>
				</div>
			</div>

			<Button
				type="submit"
				class="w-full font-medium"
				size="lg"
				isLoading={isSubmitting}
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Saving Changes...' : 'Save Changes'}
			</Button>
		</form>
	</div>
</div>
