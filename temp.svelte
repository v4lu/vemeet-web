<script lang="ts">
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { Field } from '$lib/components/ui/field';
	import { Input, inputVariants } from '$lib/components/ui/input';
	import { sessionStore } from '$lib/stores/session.store';
	import Icon from '@iconify/svelte';
	import ky from 'ky';
	import { useDebounce } from 'runed';

	type City = {
		display_name: string;
		lat: string;
		lon: string;
	};

	async function fetchCities(query: string): Promise<City[]> {
		try {
			const data = await ky
				.get('https://nominatim.openstreetmap.org/search', {
					searchParams: {
						format: 'json',
						q: query,
						limit: '5',
						addressdetails: '1',
						featuretype: 'city'
					}
				})
				.json<any[]>();

			return data.map((item) => ({
				display_name: item.display_name,
				lat: item.lat,
				lon: item.lon
			}));
		} catch (error) {
			console.error('Error fetching cities:', error);
			return [];
		}
	}
	let username = $state($sessionStore.username);
	let name = $state($sessionStore.name || '');
	let gender = $state($sessionStore.gender || '');
	let city = $state($sessionStore.residenceName || '');
	let bio = $state($sessionStore.bio || '');
	let cityOptions = $state<string[]>([]);
	let showCityDropdown = $state(false);

	const debouncedFetchCities = useDebounce(
		async (query: string) => {
			if (query.length > 1) {
				cityOptions = await fetchCities(query);
				showCityDropdown = true;
			} else {
				cityOptions = [];
				showCityDropdown = false;
			}
		},
		() => 300
	);

	function handleCityInput(event: Event): void {
		const query = (event.target as HTMLInputElement).value;
		city = query;
		debouncedFetchCities(query);
	}

	function selectCity(selectedCity: string): void {
		console.log(selectedCity);
		city = selectedCity;
		showCityDropdown = false;
	}
</script>

<button class="flex items-center text-sm font-medium" onclick={(): void => history.back()}>
	<Icon icon="solar:arrow-left-linear" class="mr-2 size-6" />
	Back
</button>
<h1 class="mb-6 mt-3 text-2xl font-bold">Edit Profile</h1>

<form class="space-y-6">
	<Field name="Username">
		<Input id="username" placeholder="Username" value={$sessionStore.username} required />
	</Field>

	<Field name="Name" optional>
		<Input id="name" placeholder="Name" value={$sessionStore.name && $sessionStore.name} required />
	</Field>

	<Field name="Gender">
		<Input id="gender" placeholder="Gender" value={$sessionStore.gender && $sessionStore.gender} />
	</Field>

	<Field name="City">
		<div class="relative">
			<Input id="city" type="text" placeholder="City" bind:value={city} oninput={handleCityInput} />
			{#if showCityDropdown && cityOptions.length > 0}
				<ul
					class="absolute z-10 mt-1 max-h-60 w-full overflow-auto border border-gray-300 bg-white"
				>
					{#each cityOptions as option}
						<li class="cursor-pointer px-4 py-2 hover:bg-gray-100">
							<button type="button" onclick={() => selectCity(option)}>
								{option.display_name}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</Field>
	<Field name="Bio">
		<textarea id="bio" rows="4" class={cn(inputVariants(), 'resize-none')} placeholder="Bio"
		></textarea>
	</Field>

	<Button type="submit" class="w-full">Submit</Button>
</form>
