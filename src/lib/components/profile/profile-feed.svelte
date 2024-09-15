<script lang="ts">
	import type { Post } from '$lib/types/post.types.js';
	import { PostCard } from '../cards';
	import { SkeletonCard } from '../ui/skeleton';

	type ProfileFeedProps = {
		posts: Post[];
		currentPage: number;
		isLoading: boolean;
		hasMore: boolean;
		loadPosts: (page: number) => Promise<void>;
		deletePost: (id: number) => void;
		isPostDeleteing: boolean;
		postLikeToggle: (postId: number, isLiked: boolean, userId: number) => Promise<void>;
		authToken: string;
	};

	let {
		isPostDeleteing,
		posts,
		currentPage,
		isLoading,
		hasMore,
		deletePost,
		loadPosts,
		postLikeToggle,
		authToken
	}: ProfileFeedProps = $props();

	let target = $state<HTMLElement | null>(null);

	$effect(() => {
		const handleScroll = () => {
			if (target && !isLoading && hasMore) {
				const rect = target.getBoundingClientRect();
				const isInViewport = rect.top <= window.innerHeight;
				if (isInViewport) {
					loadPosts(currentPage + 1);
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		if (currentPage === 0 && posts.length === 0) {
			loadPosts(0);
		}
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<div class="posts-container">
	{#each posts as post (post.id)}
		<PostCard {authToken} {isPostDeleteing} {post} {deletePost} {postLikeToggle} />
	{/each}
</div>
{#if isLoading}
	{#each Array(5) as _}
		<SkeletonCard />
	{/each}
{:else if !hasMore && posts.length > 0}
	<div class="pt-4">
		<p class="text-center text-muted-foreground">No more posts to show</p>
	</div>
{:else if !hasMore && posts.length === 0}
	<div class="pt-4">
		<p class="text-center text-muted-foreground">No posts available</p>
	</div>
{/if}
<div bind:this={target} class="h-1"></div>
