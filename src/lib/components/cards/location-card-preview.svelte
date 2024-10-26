<script lang="ts">
	import type { VeganLocation } from '$lib/types/geo.types';
	import Icon from '@iconify/svelte';

	type Props = {
		location: VeganLocation;
	};

	let { location }: Props = $props();

	function getLocationTypeIcon(type: string) {
		switch (type.toUpperCase()) {
			case 'RESTAURANT':
				return 'solar:restaurant-food-bold';
			case 'CAFE':
				return 'solar:cup-food-bold';
			case 'SHOP':
				return 'solar:shop-2-bold';
			case 'MARKET':
				return 'solar:shop-bold';
			default:
				return 'solar:map-point-bold';
		}
	}
</script>

<div class="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50">
	<div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
		{#if location.images?.[0]}
			<img src={location.images[0].url} alt={location.name} class="h-full w-full object-cover" />
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-muted">
				<Icon icon={getLocationTypeIcon(location.type)} class="size-8 text-muted-foreground" />
			</div>
		{/if}
		{#if location.isVerified}
			<div class="absolute right-1 top-1 rounded-full bg-primary/90 p-0.5 text-primary-foreground">
				<Icon icon="solar:verified-check-bold" class="size-3" />
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-1">
		<div class="flex items-start justify-between gap-2">
			<div>
				<h3 class="line-clamp-1 font-medium">{location.name}</h3>
				<div class="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
					<span class="flex items-center gap-1">
						<Icon icon={getLocationTypeIcon(location.type)} class="size-4" />
						{location.type}
					</span>
					<span class="text-xs">•</span>
					<span class="line-clamp-1">{location.city}, {location.country}</span>
				</div>
			</div>
			{#if location.priceRange}
				<span class="shrink-0 text-sm font-medium text-muted-foreground">{location.priceRange}</span
				>
			{/if}
		</div>
		{#if location.reviews?.length}
			<div class="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
				<Icon icon="solar:star-bold" class="size-3.5 text-amber-500" />
				<span class="font-medium">
					{(
						location.reviews.reduce((acc, rev) => acc + rev.rating, 0) / location.reviews.length
					).toFixed(1)}
				</span>
				<span>({location.reviews.length} reviews)</span>
			</div>
		{/if}
	</div>
</div>
