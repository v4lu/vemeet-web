<script lang="ts">
	import { useVeganLocation } from '$lib/api/use-single-vegan-location.svelte.js';
	import { LocationCard } from '$lib/components/cards/index.js';

	let { data } = $props();
	const { resp, deleteLocation, updateLocation } = useVeganLocation(data.accessToken, +data.id);
</script>

<main class="container mb-12 mt-8">
	{#if resp.location}
		<LocationCard
			authToken={data.accessToken}
			location={resp.location}
			{deleteLocation}
			{updateLocation}
			isLocationDeleting={resp.isLoading}
		/>
	{:else if resp.isLoading}
		<p>Loading...</p>
	{:else if resp.error}
		<p>Error: {resp.error.message}</p>
	{/if}
</main>
