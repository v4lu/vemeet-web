<script lang="ts">
	import { Header } from '$lib/components/profile';

	let { data } = $props();
</script>

{#await data.user}
	<div>Loading...</div>
{:then user}
	{#if user}
		<Header {user} authToken={data.accessToken} />
	{:else}
		<div>User not logged in</div>
	{/if}
{:catch error}
	<div>Error: {error.message}</div>
{/await}
