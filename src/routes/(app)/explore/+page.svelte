<script lang="ts">
	import { useSearch } from '$lib/api/use-search.svelte';
	import { cn } from '$lib/cn';
	import {
		LocationCardPreview,
		RecipeCardPreview,
		UserHorizontalCard
	} from '$lib/components/cards';
	import { CustomHeader } from '$lib/components/ui/custom-header';
	import { Input } from '$lib/components/ui/input';
	import { clickOutside, debounce } from '$lib/utils';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const { getUsers, getRecipes, getLocations, resp } = useSearch(data.accessToken);

	let searchQuery = $state('');
	let isSearching = $state(false);
	let showResults = $state(false);
	let activeCategory = $state<'all' | 'people' | 'locations' | 'recipes'>('all');
	let searchContainer = $state<HTMLDivElement>();

	const debouncedSearch = debounce(async (query: string) => {
		if (query.trim()) {
			isSearching = true;

			switch (activeCategory) {
				case 'all':
					await Promise.all([
						getUsers(query),
						getLocations({ search: query }),
						getRecipes({ search: query })
					]);
					break;
				case 'people':
					await getUsers(query);
					break;
				case 'locations':
					await getLocations({ search: query });
					break;
				case 'recipes':
					await getRecipes({ search: query });
					break;
			}

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

	function handleCategoryChange(category: typeof activeCategory) {
		activeCategory = category;
		if (searchQuery.trim()) {
			debouncedSearch(searchQuery);
		}
	}

	function getResultsCount(): number {
		switch (activeCategory) {
			case 'all':
				return resp.users.length + resp.locations.length + resp.recipes.length;
			case 'people':
				return resp.users.length;
			case 'locations':
				return resp.locations.length;
			case 'recipes':
				return resp.recipes.length;
		}
	}
</script>

<CustomHeader
	class="relative items-center justify-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="w-full max-w-2xl px-4">
		<div class="relative" bind:this={searchContainer} use:clickOutside={handleClickOutside}>
			<div class="relative">
				<Input
					bind:value={searchQuery}
					oninput={handleInput}
					placeholder="Search people, locations, recipes..."
					class={cn(
						'h-11 w-full rounded-full pl-12 pr-12',
						'bg-muted/50 text-foreground placeholder:text-muted-foreground/50',
						'border-transparent',
						'transition-all duration-300 ease-in-out',
						'focus:border-primary/20 focus:bg-background',
						'focus:outline-none focus:ring-2 focus:ring-primary/20',
						'!shadow-none',
						showResults && 'rounded-b-none'
					)}
					onkeypress={handleKeyPress}
				/>
				<Icon
					icon="solar:magnifer-linear"
					class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
					width="20"
					height="20"
				/>
				{#if searchQuery}
					<button
						onclick={() => {
							searchQuery = '';
							showResults = false;
						}}
						class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
					>
						<Icon icon="solar:close-circle-bold" width="20" height="20" />
					</button>
				{/if}
			</div>

			{#if showResults || searchQuery}
				<div
					class="absolute left-0 right-0 top-full z-50 mt-[1px] overflow-hidden rounded-b-2xl border border-t-0 bg-background shadow-xl"
				>
					<!-- Search Categories -->
					<div class="border-b px-2 py-2">
						<div class="flex gap-1">
							{#each ['all', 'people', 'locations', 'recipes'] as category}
								<button
									onclick={() => handleCategoryChange(category)}
									class={cn(
										'rounded-full px-3 py-1 text-sm font-medium transition-colors',
										activeCategory === category
											? 'bg-primary text-primary-foreground'
											: 'text-muted-foreground hover:bg-muted'
									)}
								>
									{category.charAt(0).toUpperCase() + category.slice(1)}
								</button>
							{/each}
						</div>
					</div>

					<div class="max-h-[calc(100vh-180px)] overflow-y-auto overscroll-contain">
						{#if isSearching}
							<div class="flex items-center justify-center p-4">
								<Icon icon="solar:spinner-bold" class="size-5 animate-spin text-primary" />
								<span class="ml-2 text-sm text-muted-foreground">Searching...</span>
							</div>
						{:else if !searchQuery}
							<!--
							 Suggestions
							<div class="p-4">
								Recent Searches
								<div class="space-y-3">
									<h3 class="text-xs font-medium text-muted-foreground">Recent Searches</h3>
									<div class="space-y-1">
										{#each suggestions.recent as item}
											<button
												class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
											>
												<Icon icon={item.icon} class="size-5 text-muted-foreground" />
												<span>{item.name}</span>
											</button>
										{/each}
									</div>
								</div>

								 Trending
								<div class="mt-6 space-y-3">
									<h3 class="text-xs font-medium text-muted-foreground">Trending</h3>
									<div class="space-y-1">
										{#each suggestions.trending as item}
											<button
												class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
											>
												<Icon icon={item.icon} class="size-5 text-muted-foreground" />
												<span>{item.name}</span>
											</button>
										{/each}
									</div>
								</div>

							</div>
						-->
						{:else if getResultsCount() > 0}
							<div class="divide-y">
								{#if (activeCategory === 'all' || activeCategory === 'people') && resp.users.length > 0}
									{#each resp.users as user}
										<UserHorizontalCard {user} />
									{/each}
								{/if}

								{#if (activeCategory === 'all' || activeCategory === 'locations') && resp.locations.length > 0}
									{#each resp.locations as location}
										<LocationCardPreview {location} />
									{/each}
								{/if}

								{#if (activeCategory === 'all' || activeCategory === 'recipes') && resp.recipes.length > 0}
									{#each resp.recipes as recipe}
										<RecipeCardPreview {recipe} />
									{/each}
								{/if}
							</div>
						{:else}
							<div class="flex flex-col items-center justify-center py-12 text-center">
								<div class="flex size-12 items-center justify-center rounded-full bg-muted">
									<Icon icon="solar:magnifer-linear" class="size-6 text-muted-foreground" />
								</div>
								<h3 class="mt-4 text-sm font-medium">No results found</h3>
								<p class="mt-2 text-sm text-muted-foreground">
									Try adjusting your search or filter to find what you're looking for
								</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</CustomHeader>

<div class="mx-auto w-full max-w-pc lg:border-x lg:border-border lg:bg-card"></div>
