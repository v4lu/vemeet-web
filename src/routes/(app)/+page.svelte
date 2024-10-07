<script lang="ts">
	import { useFeed } from '$lib/api/use-feed.svelte.js';
	import { PostCard, RecipeCard } from '$lib/components/cards/index.js';

	import { CreatePost } from '$lib/components/profile/index.js';
	import { SkeletonCard } from '$lib/components/ui/skeleton/index.js';

	let { data } = $props();
	const { loadFeed, resp, createPost, deletePost, postLikeToggle, deleteRecipe, recipeLikeToggle } =
		useFeed(data.accessToken);

	let target = $state<HTMLElement | null>(null);

	$effect(() => {
		const handleScroll = () => {
			if (target && !resp.isLoading && resp.hasMore) {
				const rect = target.getBoundingClientRect();
				const isInViewport = rect.top <= window.innerHeight;
				if (isInViewport) {
					loadFeed(resp.currentPage + 1);
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		if (!resp.isInitialized) {
			loadFeed(0);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<main class="container my-8">
	<CreatePost
		authToken={data.accessToken}
		isSubmittingCreatePost={resp.isSubmittingNewPost}
		{createPost}
	/>
	<div class="feed-container">
		{#each resp.items as item (`${item.type}-${item.item.id}`)}
			{#if item.type === 'post'}
				<PostCard post={item.item} {postLikeToggle} {deletePost} />
			{:else if item.type === 'recipe'}
				<RecipeCard recipe={item.item} {recipeLikeToggle} {deleteRecipe} />
			{/if}
		{/each}
	</div>
	{#if resp.isLoading}
		{#each Array(8) as _}
			<SkeletonCard />
		{/each}
	{:else if !resp.hasMore && resp.items.length > 0}
		<div class="pt-4">
			<p class="text-center text-muted-foreground">No more items to show</p>
		</div>
	{:else if !resp.hasMore && resp.items.length === 0}
		<div class="pt-4">
			<p class="text-center text-muted-foreground">No items available</p>
		</div>
	{/if}
	<div bind:this={target} class="h-1"></div>
</main>
