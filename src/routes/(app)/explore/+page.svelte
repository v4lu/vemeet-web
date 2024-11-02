<script lang="ts">
	import { useSearch } from '$lib/api/use-search.svelte';
	import { useSuggestions } from '$lib/api/use-suggestions.svelte.js';
	import { cn } from '$lib/cn';
	import {
		LocationCardPreview,
		RecipeCardPreview,
		UserHorizontalCard
	} from '$lib/components/cards';
	import { CustomHeader } from '$lib/components/ui/custom-header';
	import { Input } from '$lib/components/ui/input';
	import { clickOutside, debounce, useIntersection } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	type RecipeSort = 'popular' | 'weekly' | 'newest';
	type LocationFilter = '50km' | '20km' | 'city';

	let { data } = $props();
	const { getUsers, getRecipes, getLocations, resp } = useSearch(data.accessToken);
	const {
		resp: suggestionsResp,
		getUsers: getSuggestionUsers,
		loadMore,
		getLocations: getSuggestionLocations,
		requestLocation
	} = useSuggestions(data.accessToken);

	let searchQuery = $state('');
	let isSearching = $state(false);
	let showResults = $state(false);
	let activeTab = $state<'people' | 'locations' | 'recipes'>('people');
	let searchContainer = $state<HTMLDivElement>();
	let userLocation = $state<{ lat: number; lng: number } | null>(null);
	let activeSuggestionTab = $state<'people' | 'locations' | 'recipes'>('people');

	let recipeSort = $state<RecipeSort>('popular');
	let locationFilter = $state<LocationFilter>('50km');

	const debouncedSearch = debounce(async (query: string) => {
		if (query.trim()) {
			isSearching = true;
			await Promise.all([
				getUsers(query),
				getLocations({ search: query }),
				getRecipes({ search: query })
			]);
			isSearching = false;
			showResults = true;
		} else {
			resp.users = [];
			resp.locations = [];
			resp.recipes = [];
			showResults = false;
		}
	}, 500);

	function handleInput() {
		isSearching = true;
		showResults = false;
		debouncedSearch(searchQuery);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
		}
	}

	function handleClickOutside() {
		showResults = false;
		isSearching = false;
	}

	function getResultsCount(type: typeof activeTab): number {
		switch (type) {
			case 'people':
				return resp.users.length;
			case 'locations':
				return resp.locations.length;
			case 'recipes':
				return resp.recipes.length;
		}
	}

	async function getUserLocation() {
		if ('geolocation' in navigator) {
			try {
				const position = await requestLocation();

				suggestionsResp.locationPermission = 'granted';

				userLocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};

				const permission = await navigator.permissions.query({ name: 'geolocation' });
				permission.addEventListener('change', () => {
					suggestionsResp.locationPermission = permission.state;
				});
			} catch (error) {
				console.error('Error in getUserLocation:', error);
				suggestionsResp.locationPermission = 'denied';
			}
		}
	}

	$effect(() => {
		if (userLocation && activeSuggestionTab === 'people') {
			getSuggestionUsers(userLocation.lat, userLocation.lng, 500);
		} else if (userLocation && activeSuggestionTab === 'locations') {
			const radius = locationFilter === '50km' ? 50000 : locationFilter === '20km' ? 20000 : 5000;
			getSuggestionLocations(userLocation.lat, userLocation.lng, radius);
		}
	});

	onMount(() => {
		if (!('geolocation' in navigator)) {
			suggestionsResp.locationPermission = 'denied';
		}
	});

	const tabs = [
		{ id: 'people', icon: 'solar:users-group-rounded-bold', label: 'People' },
		{ id: 'locations', icon: 'solar:map-point-bold', label: 'Locations' },
		{ id: 'recipes', icon: 'tabler:bowl-filled', label: 'Recipes' }
	] as const;

	const mockSuggestions = {
		recipes: [
			{
				id: 1,
				name: 'Classic  Pizza',
				cuisine: 'Italian',
				time: '30 mins',
				difficulty: 'Easy',
				image:
					'https://vemeet.s3.eu-central-1.amazonaws.com/7f5a4631-33dc-4d2c-a108-1c06f9ae3949.avif'
			},
			{
				id: 2,
				name: 'Spicy Thai Curry',
				cuisine: 'Thai',
				time: '45 mins',
				difficulty: 'Medium',
				image:
					'https://vemeet.s3.eu-central-1.amazonaws.com/7f5a4631-33dc-4d2c-a108-1c06f9ae3949.avif'
			},
			{
				id: 3,
				name: 'Fresh Fresh Roll',
				cuisine: 'Japanese',
				time: '60 mins',
				difficulty: 'Hard',
				image:
					'https://vemeet.s3.eu-central-1.amazonaws.com/7f5a4631-33dc-4d2c-a108-1c06f9ae3949.avif'
			},
			{
				id: 4,
				name: 'Homemade Pasta',
				cuisine: 'Italian',
				time: '40 mins',
				difficulty: 'Medium',
				image:
					'https://vemeet.s3.eu-central-1.amazonaws.com/7f5a4631-33dc-4d2c-a108-1c06f9ae3949.avif'
			}
		]
	};
</script>

<CustomHeader
	class="sticky top-0 z-50 border-b bg-background/95 pl-9 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="mx-auto w-full max-w-2xl py-3">
		<div class="relative" bind:this={searchContainer} use:clickOutside={handleClickOutside}>
			<div class="relative">
				<Input
					bind:value={searchQuery}
					oninput={handleInput}
					placeholder="Search people, locations, recipes..."
					class={cn(
						'h-11 w-full rounded-xl pl-11 pr-11',
						'bg-muted/50 text-foreground placeholder:text-muted-foreground/60',
						'border-transparent',
						'transition-all duration-300 ease-in-out',
						'focus:border-primary/20 focus:bg-background',
						'focus:outline-none focus:ring-2 focus:ring-primary/20',
						'!shadow-none',
						(searchQuery || showResults) &&
							'focus:ring-none rounded-b-none border-none focus:ring-0'
					)}
					onkeypress={handleKeyPress}
				/>
				<Icon
					icon="solar:magnifer-linear"
					class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
					width="20"
					height="20"
				/>
				{#if searchQuery}
					<button
						onclick={() => {
							searchQuery = '';
							showResults = false;
						}}
						class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
					>
						<Icon icon="solar:close-circle-bold" width="20" height="20" />
					</button>
				{/if}
			</div>

			{#if showResults || searchQuery}
				<div
					class="absolute left-1/2 top-full z-50 w-full max-w-[400px] -translate-x-1/2 overflow-hidden rounded-b-xl border bg-background shadow-lg"
				>
					{#if isSearching}
						<div class="flex items-center justify-center p-6">
							<div class="flex flex-col items-center gap-2">
								<Icon icon="solar:spinner-bold" class="size-8 animate-spin text-primary" />
								<p class="text-sm text-muted-foreground">Searching...</p>
							</div>
						</div>
					{:else if !searchQuery}
						<div class="p-4">
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<Icon icon="solar:info-circle-bold" class="size-5" />
								<span>Start typing to search</span>
							</div>
						</div>
					{:else}
						<div>
							<div class="border-b">
								<div class="flex w-full">
									{#each tabs as tab}
										<button
											onclick={() => (activeTab = tab.id)}
											class={cn(
												'flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2.5 text-sm font-medium transition-colors',
												'min-w-0',
												activeTab === tab.id
													? 'border-primary text-primary'
													: 'border-transparent text-muted-foreground hover:text-foreground'
											)}
										>
											<Icon icon={tab.icon} class="size-4 shrink-0" />
											<span class="truncate">{tab.label}</span>
											{#if getResultsCount(tab.id) > 0}
												<span
													class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs"
												>
													{getResultsCount(tab.id)}
												</span>
											{/if}
										</button>
									{/each}
								</div>
							</div>

							<div class="hide-scrollbar max-h-[400px] overflow-y-auto overscroll-contain">
								{#if getResultsCount(activeTab) === 0}
									<div class="flex flex-col items-center justify-center p-8 text-center">
										<div
											class="flex size-12 items-center justify-center rounded-full bg-primary/10"
										>
											<Icon icon="solar:magnifer-linear" class="size-6 text-primary" />
										</div>
										<h3 class="mt-4 font-medium">No results found</h3>
										<p class="mt-2 text-sm text-muted-foreground">
											Try adjusting your search to find what you're looking for
										</p>
									</div>
								{:else}
									<div class="p-2">
										{#if activeTab === 'people'}
											{#each resp.users as user}
												<UserHorizontalCard {user} />
											{/each}
										{:else if activeTab === 'locations'}
											{#each resp.locations as location}
												<LocationCardPreview {location} />
											{/each}
										{:else if activeTab === 'recipes'}
											{#each resp.recipes as recipe}
												<RecipeCardPreview {recipe} />
											{/each}
										{/if}
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</CustomHeader>

<div class="container mx-auto mt-6 w-full max-w-2xl space-y-6">
	<div
		class="flex flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-between"
	>
		<h2 class="text-xl font-semibold">Suggestions</h2>
		<div class="flex gap-2">
			{#each tabs as tab}
				<button
					onclick={() => (activeSuggestionTab = tab.id)}
					class={cn(
						'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
						activeSuggestionTab === tab.id
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:bg-muted'
					)}
				>
					<Icon icon={tab.icon} class="size-4" />
					<span>{tab.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="">
		{#if activeSuggestionTab === 'recipes' || activeSuggestionTab === 'locations'}
			<div class="">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
					<div class="no-scrollbar flex w-full gap-2 overflow-x-auto pb-1 sm:pb-0">
						{#if activeSuggestionTab === 'recipes'}
							{#each [{ value: 'popular', label: 'Most Popular' }, { value: 'weekly', label: 'Weekly Popular' }, { value: 'newest', label: 'Newest' }] as sort}
								<button
									onclick={() => (recipeSort = sort.value as RecipeSort)}
									class={cn(
										'flex-none rounded-full px-3 py-1.5 text-sm transition-colors',
										'whitespace-nowrap',
										recipeSort === sort.value
											? 'bg-primary text-primary-foreground'
											: 'border border-border text-muted-foreground hover:bg-muted'
									)}
								>
									{sort.label}
								</button>
							{/each}
						{:else if activeSuggestionTab === 'locations' && suggestionsResp.locationPermission === 'granted'}
							{#each [{ value: '50km', label: 'Within 50km' }, { value: '20km', label: 'Within 20km' }, { value: 'city', label: 'Search by City' }] as filter}
								<button
									onclick={() => (locationFilter = filter.value as LocationFilter)}
									class={cn(
										'flex-none rounded-full px-3 py-1.5 text-sm transition-colors',
										'whitespace-nowrap',
										locationFilter === filter.value
											? 'bg-primary text-primary-foreground'
											: 'border border-border text-muted-foreground hover:bg-muted'
									)}
								>
									{filter.label}
								</button>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if activeSuggestionTab === 'people'}
			{#if suggestionsResp.locationPermission !== 'granted'}
				<div class="rounded-lg border bg-card p-4">
					<div class="flex items-start gap-4">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10"
						>
							<Icon icon="solar:map-point-bold" class="size-5 text-primary" />
						</div>
						<div class="flex-1">
							<h3 class="font-medium">Enable Location Services</h3>
							<p class="mt-1 text-sm text-muted-foreground">
								Allow access to your location to discover people nearby. We only use your location
								to suggest new connections.
							</p>
							<button
								onclick={getUserLocation}
								class="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
							>
								<Icon icon="solar:map-point-bold" class="size-4" />
								Enable Location
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="divide-y">
					{#if suggestionsResp.users.length === 0 && !suggestionsResp.isLoading}
						<div class="flex flex-col items-center justify-center p-8 text-center">
							<div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
								<Icon icon="solar:users-group-rounded-bold" class="size-6 text-primary" />
							</div>
							<h3 class="mt-4 font-medium">No users found nearby</h3>
							<p class="mt-2 text-sm text-muted-foreground">
								Try adjusting your location settings or check back later
							</p>
						</div>
					{:else}
						{#each suggestionsResp.users as user}
							<UserHorizontalCard {user} />
						{/each}

						{#if suggestionsResp.hasMore}
							<div
								use:useIntersection={{
									once: false,
									onIntersect: () => {
										if (userLocation) {
											loadMore(userLocation.lat, userLocation.lng, 1000);
										}
									}
								}}
								class="flex items-center justify-center p-4"
							>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<Icon icon="solar:spinner-bold" class="size-4 animate-spin" />
									Loading more...
								</div>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		{:else if activeSuggestionTab === 'locations'}
			{#if suggestionsResp.locationPermission !== 'granted'}
				<div class="rounded-lg border bg-card p-4">
					<div class="flex items-start gap-4">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10"
						>
							<Icon icon="solar:map-point-bold" class="size-5 text-primary" />
						</div>
						<div class="flex-1">
							<h3 class="font-medium">Enable Location Services</h3>
							<p class="mt-1 text-sm text-muted-foreground">
								Allow access to your location to discover places nearby. We only use your location
								to suggest new connections.
							</p>
							<button
								onclick={getUserLocation}
								class="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
							>
								<Icon icon="solar:map-point-bold" class="size-4" />
								Enable Location
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="grid gap-4 p-4 sm:grid-cols-2">
					{#if suggestionsResp.locations.length === 0 && !suggestionsResp.isLoading}
						<div class="flex flex-col items-center justify-center p-8 text-center">
							<div class="flex size-12 items-center justify-center rounded-full bg-primary/10">
								<Icon icon="solar:map-point-bold" class="size-6 text-primary" />
							</div>
							<h3 class="mt-4 font-medium">No locations found nearby</h3>
							<p class="mt-2 text-sm text-muted-foreground">
								Try adjusting your distance filter or check back later
							</p>
						</div>
					{:else}
						{#each suggestionsResp.locations as location}
							<LocationCardPreview {location} />
						{/each}

						{#if suggestionsResp.hasMore}
							<div
								use:useIntersection={{
									once: false,
									onIntersect: () => {
										if (userLocation) {
											const radius =
												locationFilter === '50km'
													? 50000
													: locationFilter === '20km'
														? 20000
														: 5000;
											loadMore(userLocation.lat, userLocation.lng, radius, 'locations');
										}
									}
								}}
								class="col-span-2 flex items-center justify-center p-4"
							>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<Icon icon="solar:spinner-bold" class="size-4 animate-spin" />
									Loading more...
								</div>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		{:else}
			<div class="grid gap-4 p-4 sm:grid-cols-2">
				{#each mockSuggestions.recipes as recipe}
					<div class="overflow-hidden rounded-lg border bg-card">
						<img src={recipe.image} alt={recipe.name} class="h-32 w-full object-cover" />
						<div class="p-3">
							<h3 class="font-medium">{recipe.name}</h3>
							<div
								class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
							>
								<span>{recipe.cuisine}</span>
								<span>•</span>
								<span>{recipe.time}</span>
								<span>•</span>
								<span>{recipe.difficulty}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
