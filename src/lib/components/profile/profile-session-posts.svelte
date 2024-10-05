<script lang="ts">
	import { useSessionProfilePosts } from '$lib/api/use-session-profile-posts.svelte';
	import { CreatePost, ProfileSessionFeed } from '$lib/components/profile';

	type ProfilePostsProps = {
		authToken: string;
	};

	let { authToken }: ProfilePostsProps = $props();
	const { resp, loadPosts, createPost, deletePost, postLikeToggle } =
		useSessionProfilePosts(authToken);
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
