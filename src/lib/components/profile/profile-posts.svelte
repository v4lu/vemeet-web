<script lang="ts">
	import { useSessionProfilePosts } from '$lib/api/use-session-profile-posts.svelte';
	import { CreatePost, ProfileFeed } from '$lib/components/profile';

	type ProfilePostsProps = {
		authToken: string;
	};

	let { authToken }: ProfilePostsProps = $props();
	const { resp, loadPosts, createPost, deletePost, postLikeToggle } =
		useSessionProfilePosts(authToken);
	const { currentPage, hasMore, isLoading, posts } = resp;

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

<CreatePost {createPost} isSubmittingCreatePost={resp.isSumbmittingNewPost} {authToken} />
<ProfileFeed
	isPostDeleteing={resp.isSubmittingPostDeleting}
	posts={resp.posts}
	currentPage={resp.currentPage}
	isLoading={resp.isLoading}
	hasMore={resp.hasMore}
	{deletePost}
	{postLikeToggle}
	{loadPosts}
	{authToken}
/>
