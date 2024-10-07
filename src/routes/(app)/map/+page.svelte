<script lang="ts">
	import { browser } from '$app/environment';
	import { useVeganLocations } from '$lib/api/use-vegan-locations.svelte';
	import { CreateLocationModal } from '$lib/components/locations';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { VeganLocation } from '$lib/types/geo.types';
	import { clickOutside, debounce } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';

	let { data } = $props();
	const { resp, getLocations, createLocation } = useVeganLocations(data.accessToken);

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let searchInput = $state('');
	let markers: Marker[] = $state([]);
	let searchResults: VeganLocation[] = $state([]);
	let showDropdown = $state(false);
	let isOpenCreateModal = $state(false);

	$effect(() => {
		if (browser && resp.isFetched) {
			(async () => {
				const L = await import('leaflet');
				map = L.map(mapElement, {
					center: [51.505, -0.09],
					zoom: 4,
					zoomControl: false
				});

				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

				L.control.zoom({ position: 'topright' }).addTo(map);

				if (Array.isArray(resp.locations)) {
					resp.locations.forEach((location: VeganLocation) => {
						const marker = L.marker([location.latitude, location.longitude])
							.addTo(map)
							.bindPopup(`<b>${location.name}</b><br>${location.address}`);
						markers.push(marker);
					});
				} else {
					console.error('resp.locations.content is not an array:', resp.locations);
				}

				setTimeout(() => {
					map.invalidateSize();
				}, 100);
			})();
		}

		return () => {
			if (map) {
				map.remove();
			}
		};
	});

	const debouncedSearch = debounce(async (searchTerm: string) => {
		if (searchTerm.length < 3) return;
		await getLocations(0, searchTerm);
		searchResults = resp.locations;
		showDropdown = searchResults.length > 0;
	}, 300);

	function handleSearch(event: Event) {
		const input = event.target as HTMLInputElement;
		searchInput = input.value;
		debouncedSearch(searchInput);
	}

	function selectLocation(location: VeganLocation) {
		map.setView([location.latitude, location.longitude], 13);
		markers.forEach((marker) => {
			if (marker.getLatLng().equals([location.latitude, location.longitude])) {
				marker.openPopup();
			}
		});
		searchInput = location.name;
		showDropdown = false;
	}

	function handleClickOutside() {
		showDropdown = false;
	}
</script>

<svelte:head>
	{#if browser}
		<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
	{/if}
</svelte:head>

<div class="fixed left-0 top-[64px] h-[calc(100vh-64px-65px)] w-full">
	<div bind:this={mapElement} class="h-full w-full"></div>
	<div class="absolute left-4 top-4 z-[1000] w-[340px]">
		<div class="relative w-full max-w-sm" use:clickOutside={handleClickOutside}>
			<Input
				type="text"
				placeholder="Search for vegan locations..."
				bind:value={searchInput}
				oninput={handleSearch}
				class="pr-10"
			/>
			{#if showDropdown}
				<ul
					class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-sm shadow-md"
				>
					{#each searchResults as result}
						<li
							class="cursor-pointer px-4 py-2 hover:bg-muted"
							onclick={() => selectLocation(result)}
						>
							<strong>{result.name}</strong>
							<br />
							<span class="text-xs text-muted-foreground">{result.address}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
	<div class="absolute bottom-4 left-4 z-[1000]">
		<Button onclick={() => (isOpenCreateModal = true)} size="sm">
			<Icon icon="lucide:plus" class="ml-2 size-5" />
			Create New Location
		</Button>
	</div>
</div>

{#if isOpenCreateModal}
	<CreateLocationModal
		authToken={data.accessToken}
		{createLocation}
		onClose={() => (isOpenCreateModal = false)}
	/>
{/if}

<style lang="postcss">
	:global(.leaflet-popup-content-wrapper) {
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 4px;
	}
	:global(.leaflet-popup-content) {
		margin: 8px 12px;
		font-size: 14px;
	}
</style>
