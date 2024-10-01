<script lang="ts">
	import { useSessionProfilePosts } from '$lib/api/use-session-profile-posts.svelte';
	import { CreatePost, ProfileSessionFeed } from '$lib/components/profile';

	type ProfilePostsProps = {
		authToken: string;
	};

	let { authToken }: ProfilePostsProps = $props();
	const { resp, loadPosts, createPost, deletePost, postLikeToggle } =
		useSessionProfilePosts(authToken);

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

<CreatePost {createPost} isSubmittingCreatePost={resp.isSumbmittingNewPost} {authToken} />
<ProfileSessionFeed
	isPostDeleteing={resp.isSubmittingPostDeleting}
	posts={resp.posts}
	currentPage={resp.currentPage}
	isLoading={resp.isLoading}
	hasMore={resp.hasMore}
	{deletePost}
	{postLikeToggle}
	{loadPosts}
/>
