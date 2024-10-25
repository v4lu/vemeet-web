<script lang="ts">
	import { useVeganLocation } from '$lib/api/use-single-vegan-location.svelte.js';
	import { LocationCard } from '$lib/components/cards/index.js';
	import { LocationCardSkeleton } from '$lib/components/skeleton';

	let { data } = $props();
	const { resp, deleteLocation, updateLocation, createReview, deleteReview, patchReview } =
		useVeganLocation(data.accessToken, +data.id);
</script>

<main class="mb-12">
	{#if resp.location}
		<LocationCard
			authToken={data.accessToken}
			location={resp.location}
			{deleteLocation}
			{updateLocation}
			{createReview}
			{deleteReview}
			{patchReview}
			isLocationDeleting={resp.isLoading}
		/>
	{:else if resp.isLoading}
		<LocationCardSkeleton />
	{/if}
</main>
