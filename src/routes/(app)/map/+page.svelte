<script lang="ts">
	console.warn = () => {};
	import { browser } from '$app/environment';
	import { useVeganLocations } from '$lib/api/use-vegan-locations.svelte';
	import { CreateLocationModal } from '$lib/components/locations';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { VeganLocation } from '$lib/types/geo.types';
	import { clickOutside, debounce } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';
	import { onMount } from 'svelte';

	let { data } = $props();
	const { resp, getLocations, createLocation } = useVeganLocations(data.accessToken);

	let mapElement: HTMLElement;
	let map: LeafletMap;
	let searchInput = $state('');
	let markers: Marker[] = $state([]);
	let searchResults: VeganLocation[] = $state([]);
	let showDropdown = $state(false);
	let isOpenCreateModal = $state(false);
	let isSearching = $state(false);

	function getMarkerColor(type: string): string {
		switch (type.toLowerCase()) {
			case 'restaurant':
				return '#f87171';
			case 'cafe':
				return '#15803d';
			case 'shop':
				return '#8b5cf6';
			case 'bar':
				return '#0891b2';
			default:
				return '#FFA500';
		}
	}

	onMount(async () => {
		if (browser) {
			const leafletCSS = document.createElement('link');
			leafletCSS.rel = 'stylesheet';
			leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			document.head.appendChild(leafletCSS);

			const L = await import('leaflet');
			initializeMap(L);
		}
	});

	function initializeMap(L: any) {
		if (!mapElement) return;

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
				const markerColor = getMarkerColor(location.type);
				const markerSvg = getMarkerSvg(location.type, markerColor);
				const marker = L.marker([location.latitude, location.longitude], {
					icon: L.divIcon({
						className: 'custom-div-icon',
						html: markerSvg,
						iconSize: [54, 54],
						iconAnchor: [27, 54],
						popupAnchor: [0, -54]
					})
				}).addTo(map).bindPopup(`
                <div class="popup-content">
                    <h3 style="color:${markerColor};">${location.name}</h3>
                    <p>${location.address}</p>
                    <p><strong>Type:</strong> ${location.type}</p>
                </div>
            `);
				markers.push(marker);
			});
		} else {
			console.error('resp.locations.content is not an array:', resp.locations);
		}

		setTimeout(() => {
			map.invalidateSize();
		}, 100);
	}

	function getMarkerSvg(type: string, color: string): string {
		let path = '';
		switch (type.toLowerCase()) {
			case 'bar':
				path =
					'M7 5h16v18H7zm0 0h16V3c0-1.105-.895-2-1.994-2H8.994A1.99 1.99 0 0 0 7 3zM1 8.009C1 6.899 1.898 6 2.998 6H7v12H2.998A2.005 2.005 0 0 1 1 15.991zM11 8v10m4-10v10m4-10v10';
				break;
			case 'restaurant':
				path =
					'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z';
				break;
			case 'cafe':
				path =
					'M4 19h16v2H4zm4-4h8v2H8zm10-3H6v2h12zm1.26-4.34A6 6 0 1 0 11 3.26a6 6 0 0 0 2.26 8.4z';
				break;
			case 'shop':
				path =
					'M21.9 8.89l-1.05-4.37c-.22-.9-1-1.52-1.91-1.52H5.05c-.9 0-1.69.63-1.9 1.52L2.1 8.89c-.24 1.02-.02 2.06.62 2.88.08.11.19.19.28.29V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6.94c.09-.09.2-.18.28-.28.64-.82.87-1.87.62-2.89zm-2.99-3.9l1.05 4.37c.1.42.01.84-.25 1.17-.14.18-.44.47-.94.47-.61 0-1.14-.49-1.21-1.14L16.98 5l1.93-.01zM13 5h1.96l.54 4.52c.05.39-.07.78-.33 1.07-.22.26-.54.41-.95.41-.67 0-1.22-.59-1.22-1.31V5zM8.49 9.52L9.04 5H11v4.69c0 .72-.55 1.31-1.29 1.31-.34 0-.65-.15-.89-.41-.25-.29-.37-.68-.33-1.07zm-4.45-.16L5.05 5h1.97l-.58 4.86c-.08.65-.6 1.14-1.21 1.14-.49 0-.8-.29-.93-.47-.27-.32-.36-.75-.26-1.17zM5 19v-6.03c.08.01.15.03.23.03.87 0 1.66-.36 2.24-.95.6.6 1.4.95 2.31.95.87 0 1.65-.36 2.23-.93.59.57 1.39.93 2.29.93.84 0 1.64-.35 2.24-.95.58.59 1.37.95 2.24.95.08 0 .15-.02.23-.03V19H5z';
				break;
			default:
				path =
					'M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z';
		}
		return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" width="54" height="54">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feOffset in="blur" dx="0" dy="1" result="offsetBlur" />
                    <feMerge>
                        <feMergeNode in="offsetBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <circle cx="27" cy="27" r="24" fill="${color}" filter="url(#shadow)" />
            <circle cx="27" cy="27" r="22" fill="white" />
            <g transform="translate(15,15) scale(0.9)">
                <path d="${path}" fill="${color}"/>
            </g>
        </svg>
    `;
	}

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
						const markerColor = getMarkerColor(location.type);
						const markerSvg = getMarkerSvg(location.type, markerColor);
						const marker = L.marker([location.latitude, location.longitude], {
							icon: L.divIcon({
								className: 'custom-div-icon',
								html: markerSvg,
								iconSize: [54, 54],
								iconAnchor: [27, 54],
								popupAnchor: [0, -54]
							})
						}).addTo(map).bindPopup(`
                        <div class="popup-content">
                            <h3 style="color:${markerColor};">
                                <a href="/map/${location.id}" style="color:${markerColor}; text-decoration:none;">
                                    ${location.name}
                                </a>
                            </h3>
                            <p>${location.address}</p>
                            <p><strong>Type:</strong> ${location.type}</p>
                        </div>
                    `);
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
		if (searchTerm.length < 3) {
			searchResults = [];
			showDropdown = false;
			isSearching = false;
			return;
		}

		isSearching = true;
		showDropdown = true;

		try {
			await getLocations(0, searchTerm);
			searchResults = resp.locations;
		} catch (error) {
			console.error('Error fetching locations:', error);
			searchResults = [];
		} finally {
			isSearching = false;
			showDropdown = searchResults.length > 0;
		}
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

	function handleKeyDown(event: KeyboardEvent, location: VeganLocation) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectLocation(location);
		}
	}
</script>

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
				{#if isSearching}
					<div
						class="absolute z-50 mt-1 flex max-h-60 w-full items-center justify-center overflow-auto rounded-md bg-popover py-1 text-sm shadow-md"
					>
						<Icon icon="eos-icons:loading" class="size-5 animate-spin text-primary" />
					</div>
				{:else}
					<ul
						class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-sm shadow-md"
						role="listbox"
					>
						{#each searchResults as result}
							<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
							<li
								onkeydown={(event) => handleKeyDown(event, result)}
								class="cursor-pointer px-4 py-2 hover:bg-muted"
								onclick={() => selectLocation(result)}
								tabindex="0"
								role="button"
							>
								<strong>{result.name}</strong>
								<br />
								<span class="text-xs text-muted-foreground">{result.address}</span>
							</li>
						{/each}
					</ul>
				{/if}
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
		border-radius: 8px;
		padding: 5px;
	}
	:global(.leaflet-popup-content) {
		margin: 8px 12px;
		font-size: 14px;
	}
	:global(.custom-div-icon) {
		background: transparent;
		border: none;
	}
	:global(.custom-div-icon .marker-pin) {
		width: 30px;
		height: 30px;
		border-radius: 50% 50% 50% 0;
		position: absolute;
		transform: rotate(-45deg);
		left: 50%;
		top: 50%;
		margin: -15px 0 0 -15px;
		box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
	}
	:global(.custom-div-icon svg) {
		position: absolute;
		width: 22px;
		height: 22px;
		left: 0;
		right: 0;
		margin: 10px auto;
		text-align: center;
	}
	:global(.popup-content h3) {
		margin: 0 0 5px 0;
		font-size: 16px;
	}
	:global(.popup-content p) {
		margin: 0;
		font-size: 14px;
	}
</style>
