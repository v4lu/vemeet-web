<script lang="ts">
	import { PostExpandedCard } from '$lib/components/cards/index.js';

	let { data } = $props();
</script>

<div class="mt-6">
	{#await data.post}
		<p>Loading</p>
	{:then post}
		<PostExpandedCard {post} authToken={data.accessToken} postId={+data.id} />
	{/await}
</div>
