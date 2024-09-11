<script lang="ts">
	let { children, data } = $props();
</script>

{#await data.user}
	<div>Loading...</div>
{:then user}
	{#if user}
		<div>Welcome, {user.username}!</div>
	{:else}
		<div>User not logged in</div>
	{/if}
{:catch error}
	<div>Error: {error.message}</div>
{/await}
{@render children()}
