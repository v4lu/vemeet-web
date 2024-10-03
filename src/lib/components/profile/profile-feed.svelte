<script lang="ts">
	import { useProfilePosts } from '$lib/api/use-profile-posts.svelte';
	import PostCard from '../cards/post-card.svelte';
	import { SkeletonCard } from '../ui/skeleton';

	type ProfileFeedProps = {
		userId: number;
		authToken: string;
	};

	let { userId, authToken }: ProfileFeedProps = $props();
	const { resp, loadPosts, postLikeToggle } = useProfilePosts(authToken, userId);
	let target = $state<HTMLElement | null>(null);

	$effect(() => {
		const handleScroll = () => {
			if (target && !resp.isLoading && resp.hasMore) {
				const rect = target.getBoundingClientRect();
				const isInViewport = rect.top <= window.innerHeight;
				if (isInViewport) {
					loadPosts(resp.currentPage + 1);
				}
			}
		};

		window.addEventListener('scroll', handleScroll);

		if (!resp.isInitialized) {
			loadPosts(0);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<div class="posts-container">
	{#each resp.posts as post (post.id)}
		<PostCard {post} {postLikeToggle} />
	{/each}
</div>
{#if resp.isLoading}
	{#each Array(10) as _}
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
