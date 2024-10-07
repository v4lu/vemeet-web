<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { clickOutside, debounce } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { LatLngTuple, Map as LeafletMap, Marker } from 'leaflet';
	import { onMount } from 'svelte';

	interface Location {
		name: string;
		coords: LatLngTuple;
	}

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let searchInput = '';
	let markers: Marker[] = [];
	let searchResults: Location[] = [];
	let showDropdown = false;

	const locations: Location[] = [
		{ name: 'Café in London', coords: [51.5074, -0.1278] },
		{ name: 'Bar in Berlin', coords: [52.52, 13.405] },
		{ name: 'Restaurant in Paris', coords: [48.8566, 2.3522] },
		{ name: 'Pub in Dublin', coords: [53.3498, -6.2603] },
		{ name: 'Bistro in Rome', coords: [41.9028, 12.4964] },
		{ name: 'Tavern in Athens', coords: [37.9838, 23.7275] },
		{ name: 'Café in Amsterdam', coords: [52.3676, 4.9041] },
		{ name: 'Bar in Prague', coords: [50.0755, 14.4378] },
		{ name: 'Restaurant in Vienna', coords: [48.2082, 16.3738] },
		{ name: 'Pub in Edinburgh', coords: [55.9533, -3.1883] }
	];

	onMount(() => {
		if (browser) {
			import('leaflet').then((L) => {
				map = L.map(mapElement, {
					center: [51.505, -0.09],
					zoom: 5,
					zoomControl: false
				});

				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

				L.control.zoom({ position: 'topright' }).addTo(map);

				locations.forEach((location) => {
					const marker = L.marker(location.coords).addTo(map).bindPopup(location.name);
					markers.push(marker);
				});

				setTimeout(() => {
					map.invalidateSize();
				}, 100);
			});
		}

		return () => {
			if (map) {
				map.remove();
			}
		};
	});

	const debouncedSearch = debounce((searchTerm: string) => {
		searchResults = locations.filter((location) =>
			location.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		showDropdown = searchResults.length > 0;
	}, 300);

	function handleSearch(event: Event) {
		const input = event.target as HTMLInputElement;
		searchInput = input.value;
		debouncedSearch(searchInput);
	}

	function selectLocation(location: Location) {
		map.setView(location.coords, 13);
		markers.forEach((marker) => {
			if (marker.getLatLng().equals(location.coords)) {
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

<div class="fixed left-0 top-[64px] h-[calc(100dvh-64px-65px)] w-full">
	<div bind:this={mapElement} class="h-full w-full"></div>
	<div class="absolute left-4 top-4 z-[1000] w-full max-w-[320px]">
		<div class="relative w-full" use:clickOutside={handleClickOutside}>
			<Input
				type="text"
				placeholder="Search locations..."
				bind:value={searchInput}
				oninput={handleSearch}
				class="w-full min-w-full pr-10"
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
							{result.name}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>

	<div class="absolute bottom-4 left-4 z-[1000]">
		<Button size="sm">
			<Icon icon="lucide:plus" class="ml-2 size-5" />
			Create New Location
		</Button>
	</div>
</div>

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
