<script lang="ts">
	import { useFeed } from '$lib/api/use-feed.svelte.js';
	import { PostCard } from '$lib/components/cards/index.js';
	import { CreatePost } from '$lib/components/profile/index.js';
	import { SkeletonCard } from '$lib/components/ui/skeleton/index.js';
	let { data } = $props();

	const { loadFeed, resp, createPost, postLikeToggle, deletePost } = useFeed(data.accessToken);

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
		if (resp.currentPage === 0 && resp.posts.length === 0) {
			loadFeed(0);
		}
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<main class="my-8">
	<CreatePost
		authToken={data.accessToken}
		isSubmittingCreatePost={resp.isSumbmittingNewPost}
		{createPost}
	/>

	<div class="posts-container">
		{#each resp.posts as post (post.id)}
			<PostCard {post} {postLikeToggle} {deletePost} />
		{/each}
	</div>
	{#if resp.isLoading}
		{#each Array(8) as _}
			<SkeletonCard />
		{/each}
	{:else if !resp.hasMore && resp.posts.length > 0}
		<div class="pt-4">
			<p class="text-center text-muted-foreground">No more posts to show</p>
		</div>
	{:else if !resp.hasMore && resp.posts.length === 0}
		<div class="pt-4">
			<p class="text-center text-muted-foreground">No posts available</p>
		</div>
	{/if}
	<div bind:this={target} class="h-1"></div>
</main>
