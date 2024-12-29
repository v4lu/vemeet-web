<script lang="ts">
	import { useVeganLocation } from '$lib/api/use-single-vegan-location.svelte.js';
	import { LocationCard } from '$lib/components/cards/index.js';
	import { MainWrapper } from '$lib/components/layout';
	import { LocationCardSkeleton } from '$lib/components/skeleton';

	let { data } = $props();
	const { resp, deleteLocation, updateLocation, createReview, deleteReview, patchReview } =
		useVeganLocation(data.accessToken, +data.id);
</script>

<svelte:head>
	<title>Vemeet - {resp.location?.name}</title>
</svelte:head>

<MainWrapper class="p-0 pt-8">
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
</MainWrapper>
