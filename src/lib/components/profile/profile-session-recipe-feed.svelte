<script lang="ts">
	import type { Recipe } from '$lib/types/recipe.types';
	import { RecipeCard } from '../cards';
	import { SkeletonCard } from '../ui/skeleton';

	type Props = {
		recipes: Recipe[];
		currentPage: number;
		isLoading: boolean;
		hasMore: boolean;
		loadRecipes: (page: number) => Promise<void>;
	};

	let { currentPage, hasMore, isLoading, loadRecipes, recipes }: Props = $props();

	let target = $state<HTMLElement | null>(null);

	$effect(() => {
		const handleScroll = () => {
			if (target && !isLoading && hasMore) {
				const rect = target.getBoundingClientRect();
				const isInViewport = rect.top <= window.innerHeight;
				if (isInViewport) {
					loadRecipes(currentPage + 1);
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		if (currentPage === 0 && recipes.length === 0) {
			loadRecipes(0);
		}
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<div class="posts-container">
	{#each recipes as recipe (recipe.id)}
		<RecipeCard {recipe} />
	{/each}
</div>
{#if isLoading}
	{#each Array(8) as _}
		<SkeletonCard />
	{/each}
{:else if !hasMore && recipes.length > 0}
	<div class="pt-4">
		<p class="text-center text-muted-foreground">No more recipes to show</p>
	</div>
{:else if !hasMore && recipes.length === 0}
	<div class="pt-4">
		<p class="text-center text-muted-foreground">No recipes available</p>
	</div>
{/if}

<div bind:this={target} class="h-1"></div>
