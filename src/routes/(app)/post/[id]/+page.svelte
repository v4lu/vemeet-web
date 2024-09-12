<script lang="ts">
	import { goto } from '$app/navigation';
	import { api, createAuthHeaders } from '$lib/api.js';
	import { PostExpandedCard } from '$lib/components/cards/index.js';
	import { toast } from '$lib/stores/toast.store.js';

	let { data } = $props();

	async function handlePostDeletion() {
		try {
			await api
				.delete(`posts/${data.id}`, {
					headers: createAuthHeaders(data.accessToken)
				})
				.json();
			goto('/profile');
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post. Please try again.');
		}
	}
</script>

{#await data.post}
	<p>Loading</p>
{:then post}
	<PostExpandedCard
		{post}
		authToken={data.accessToken}
		postId={+data.id}
		onPostDelete={handlePostDeletion}
	/>
{/await}
