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
		address: string;
	}

	const predefinedLocations: Location[] = [
		{ name: 'Café in London', coords: [51.5074, -0.1278], address: '123 Oxford St, London, UK' },
		{
			name: 'Bar in Berlin',
			coords: [52.52, 13.405],
			address: '456 Unter den Linden, Berlin, Germany'
		},
		{
			name: 'Restaurant in Paris',
			coords: [48.8566, 2.3522],
			address: '789 Champs-Élysées, Paris, France'
		},
		{
			name: 'Pub in Dublin',
			coords: [53.3498, -6.2603],
			address: "101 O'Connell St, Dublin, Ireland"
		},
		{
			name: 'Bistro in Rome',
			coords: [41.9028, 12.4964],
			address: '202 Via del Corso, Rome, Italy'
		},
		{ name: 'Tavern in Athens', coords: [37.9838, 23.7275], address: '303 Ermou, Athens, Greece' },
		{
			name: 'Café in Amsterdam',
			coords: [52.3676, 4.9041],
			address: '404 Damrak, Amsterdam, Netherlands'
		},
		{
			name: 'Bar in Prague',
			coords: [50.0755, 14.4378],
			address: '505 Wenceslas Square, Prague, Czech Republic'
		},
		{
			name: 'Restaurant in Vienna',
			coords: [48.2082, 16.3738],
			address: '606 Kärntner Straße, Vienna, Austria'
		},
		{
			name: 'Pub in Edinburgh',
			coords: [55.9533, -3.1883],
			address: '707 Royal Mile, Edinburgh, UK'
		}
	];

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let searchInput = '';
	let markers: Marker[] = [];
	let searchResults: Location[] = [];
	let showDropdown = false;

	onMount(() => {
		if (browser) {
			import('leaflet').then((L) => {
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

				// Add markers for predefined locations
				predefinedLocations.forEach((location) => {
					const marker = L.marker(location.coords)
						.addTo(map)
						.bindPopup(`<b>${location.name}</b><br>${location.address}`);
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

	const debouncedSearch = debounce(async (searchTerm: string) => {
		if (searchTerm.length < 3) return;

		// First, search in predefined locations
		const predefinedResults = predefinedLocations.filter(
			(location) =>
				location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				location.address.toLowerCase().includes(searchTerm.toLowerCase())
		);

		// If we have predefined results, use them
		if (predefinedResults.length > 0) {
			searchResults = predefinedResults;
			showDropdown = true;
			return;
		}

		// If no predefined results, search for addresses
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`
			);
			const data = await response.json();
			searchResults = data.map((item: any) => ({
				name: item.display_name,
				coords: [Number.parseFloat(item.lat), Number.parseFloat(item.lon)] as LatLngTuple,
				address: item.display_name
			}));
			showDropdown = searchResults.length > 0;
		} catch (error) {
			console.error('Error fetching address data:', error);
		}
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

<div class="fixed left-0 top-[64px] h-[calc(100vh-64px-65px)] w-full">
	<div bind:this={mapElement} class="h-full w-full"></div>
	<div class="absolute left-4 top-4 z-[1000] w-[340px]">
		<div class="relative w-full max-w-sm" use:clickOutside={handleClickOutside}>
			<Input
				type="text"
				placeholder="Search for our locations or addresses..."
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
