<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api.js';
	import { CreatePost, Header, ProfileFeed } from '$lib/components/profile';
	import type { Post, PostsPagableResponse } from '$lib/types/post.types.js';

	let { data } = $props();
	let posts = $state<Post[]>([]);
	let currentPage = $state(0);
	let isLoading = $state(false);
	let hasMore = $state(true);
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

	async function loadPosts(page: number) {
		if (isLoading) return;
		isLoading = true;
		try {
			const response = await api
				.get<PostsPagableResponse>(`posts/session?page=${page}`, {
					headers: createAuthHeaders(data.accessToken)
				})
				.json();
			if (page === 0) {
				posts = response.content;
			} else {
				posts = [...posts, ...response.content];
			}
			currentPage = page;
			hasMore = !response.last;
		} catch (error) {
			console.error('Error fetching posts:', error);
		} finally {
			isLoading = false;
		}
	}

	function handleNewPost(newPost: Post) {
		posts = [newPost, ...posts];
	}
</script>

<Header authToken={data.accessToken} />
<nav class="my-2 flex">
	<a href="#" class="border-b-2 border-primary px-6 py-3 text-sm font-medium"> Posts </a>
	<a
		href="#"
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Recipes
	</a>
	<a
		href="#"
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Media
	</a>
</nav>
<CreatePost onNewPost={handleNewPost} authToken={data.accessToken} />
<ProfileFeed />
<div class="posts-container">
	{#each posts as post}
		<h2>{post.content}</h2>
	{/each}
</div>
{#if isLoading}
	<div class="flex h-32 w-full items-center justify-center">
		<p>Loading posts...</p>
	</div>
{:else if !hasMore && posts.length > 0}
	<div class="flex h-32 w-full items-center justify-center bg-gray-100">
		<p>No more posts to show</p>
	</div>
{:else if !hasMore && posts.length === 0}
	<div class="flex h-32 w-full items-center justify-center bg-gray-100">
		<p>No posts available</p>
	</div>
{/if}
<div bind:this={target} class="h-1"></div>
