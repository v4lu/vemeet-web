<script lang="ts">
	import { useSearch } from '$lib/api/use-search.svelte';
	import { cn } from '$lib/cn';
	import { UserHorizontalCard } from '$lib/components/cards';
	import { Input } from '$lib/components/ui/input';
	import { clickOutside, debounce } from '$lib/utils';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const { getUsers, resp } = useSearch(data.accessToken);
	let searchQuery = $state('');
	let isSearching = $state(false);
	let showResults = $state(false);
	let searchContainer: HTMLDivElement;

	const debouncedSearch = debounce(async (query: string) => {
		if (query.trim()) {
			await getUsers(query);
		} else {
			resp.users = [];
		}
		isSearching = false;
		showResults = true;
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
</script>

<div class="container mt-6" bind:this={searchContainer} use:clickOutside={handleClickOutside}>
	<div
		class="rounded-lg border border-border bg-background shadow-lg transition-all duration-300 hover:shadow-xl"
	>
		<div class="relative">
			<Input
				bind:value={searchQuery}
				oninput={handleInput}
				placeholder="Search for users..."
				class={cn(
					'w-full rounded-lg p-3 pl-10',
					'bg-muted/50 text-foreground placeholder:text-muted-foreground/50',
					'border-none',
					'transition-all duration-300 ease-in-out',
					'focus:bg-background',
					'focus:outline-none focus:ring-2 focus:ring-primary',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
					'!shadow-none !outline-none',
					'appearance-none'
				)}
				onkeypress={handleKeyPress}
			/>
			<Icon
				icon="solar:magnifer-linear"
				class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
				width="20"
				height="20"
			/>
		</div>

		{#if searchQuery.trim() && (isSearching || showResults)}
			<div class="max-h-80 overflow-y-auto">
				{#if isSearching}
					<div class="flex items-center justify-center p-3">
						<Icon icon="eos-icons:loading" class="size-6 animate-spin text-primary" />
						<span class="ml-2 text-sm text-muted-foreground">Searching...</span>
					</div>
				{:else if showResults}
					{#if resp.users.length > 0}
						{#each resp.users as user}
							<UserHorizontalCard {user} notRounded />
						{/each}
					{:else}
						<div class="p-3 text-sm text-muted-foreground">
							No users found matching your search.
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>
