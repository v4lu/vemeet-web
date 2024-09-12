<script lang="ts">
	import { api, createAuthHeaders } from '$lib/api.js';
	import { CreatePost, Header, ProfileFeed } from '$lib/components/profile';
	import { sessionStore } from '$lib/stores/session.store.js';
	import { toast } from '$lib/stores/toast.store.js';
	import type { Post, PostsPagableResponse } from '$lib/types/post.types.js';
	import type { Reaction } from '$lib/types/reaction.types.js';

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

	async function handleCreatePost(postContent: string, imageUrls: string[]): Promise<void> {
		if (!postContent.trim() && imageUrls.length === 0) {
			toast.error('Please enter content or upload an image.');
			return;
		}

		const payload = {
			content: postContent,
			images: imageUrls
		};

		try {
			const newPost = await api
				.post<Post>('posts', {
					json: payload,
					headers: createAuthHeaders(data.accessToken)
				})
				.json();

			posts = [newPost, ...posts];
			toast.success('Post created successfully!');
		} catch (error) {
			console.error('Error creating post:', error);
			toast.error('Something went wrong, please try again later!');
			throw error;
		}
	}

	async function handlePostDeletion(id: number) {
		try {
			await api
				.delete(`posts/${id}`, {
					headers: createAuthHeaders(data.accessToken)
				})
				.json();
			posts = posts.filter((post) => post.id !== id);
			toast.success('Post deleted successfully!');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post. Please try again.');
		}
	}

	async function handleToggleLike(postId: number, isLiked: boolean) {
		const post = posts.find((p) => p.id === postId);
		if (!post) return;

		try {
			if (isLiked) {
				await api
					.delete(`posts/${postId}/reactions`, {
						headers: createAuthHeaders(data.accessToken)
					})
					.json();
				post.reactions = post.reactions.filter((r) => r.user.id !== $sessionStore.id);
			} else {
				const res = await api
					.post<Reaction>(`posts/${postId}/reactions`, {
						json: { reactionType: 'LIKE' },
						headers: createAuthHeaders(data.accessToken)
					})
					.json();
				post.reactions = [res, ...post.reactions];
			}
			posts = [...posts];
		} catch (error) {
			console.error('Error toggling like:', error);
			toast.error('Failed to update like status. Please try again.');
		}
	}
</script>

<Header authToken={data.accessToken} />
<nav class="my-2 flex">
	<span class="border-b-2 border-primary px-6 py-3 text-sm font-medium"> Posts </span>
	<span
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Recipes
	</span>
	<span
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Media
	</span>
</nav>
<CreatePost onCreatePost={handleCreatePost} authToken={data.accessToken} />
<ProfileFeed
	{posts}
	{currentPage}
	{isLoading}
	{hasMore}
	onPostDelete={handlePostDeletion}
	onToggleLike={handleToggleLike}
	{loadPosts}
	authToken={data.accessToken}
/>
