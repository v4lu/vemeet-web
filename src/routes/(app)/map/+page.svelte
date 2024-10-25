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

		// L.control.zoom({ position: 'topright' }).addTo(map);

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

				// L.control.zoom({ position: 'topright' }).addTo(map);

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

<div class="fixed left-0 top-[64px] h-[calc(100dvh-64px-65px)] w-full">
	<!-- Map Container -->
	<div bind:this={mapElement} class="h-full w-full"></div>

	<!-- Search Bar - Mobile Optimized -->
	<div class="absolute inset-x-4 top-4 z-[1000] flex flex-col items-center gap-2">
		<div
			class="relative w-full max-w-[calc(100vw-32px)] shadow-lg"
			use:clickOutside={handleClickOutside}
		>
			<Input
				type="text"
				placeholder="Search vegan locations..."
				bind:value={searchInput}
				oninput={handleSearch}
				class="h-11 w-full rounded-full border-none bg-background/95 pr-10 backdrop-blur-sm focus:ring-2 focus:ring-primary sm:pr-12"
			/>
			<div class="absolute right-3 top-1/2 -translate-y-1/2">
				{#if searchInput}
					<button
						class="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
						onclick={() => {
							searchInput = '';
							showDropdown = false;
						}}
					>
						<Icon icon="solar:close-circle-bold" class="size-5" />
					</button>
				{:else}
					<Icon icon="solar:magnifer-bold" class="size-5 text-muted-foreground" />
				{/if}
			</div>

			<!-- Search Results Dropdown -->
			{#if showDropdown}
				<div
					class="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg bg-background/95 shadow-lg backdrop-blur-sm"
				>
					{#if isSearching}
						<div class="flex items-center justify-center p-4">
							<Icon icon="eos-icons:loading" class="size-5 animate-spin text-primary" />
						</div>
					{:else}
						<ul class="max-h-[40vh] overflow-auto overscroll-contain py-1" role="listbox">
							{#each searchResults as result}
								<li
									onkeydown={(event) => handleKeyDown(event, result)}
									class="cursor-pointer px-4 py-3 hover:bg-muted/50 active:bg-muted"
									onclick={() => selectLocation(result)}
									tabindex="0"
									role="button"
								>
									<div class="flex items-start gap-3">
										<div class="rounded-full bg-primary/10 p-2">
											<Icon
												icon={result.type.toLowerCase() === 'restaurant'
													? 'solar:bowl-chopsticks-bold'
													: result.type.toLowerCase() === 'cafe'
														? 'solar:cup-bold'
														: 'solar:shop-bold'}
												class="size-4 text-primary"
											/>
										</div>
										<div>
											<strong class="text-sm font-medium">{result.name}</strong>
											<p class="mt-0.5 text-xs text-muted-foreground">{result.address}</p>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Create Location Button - Mobile Optimized -->
	<div class="absolute inset-x-0 bottom-6 z-[1000] flex justify-center">
		<Button
			onclick={() => (isOpenCreateModal = true)}
			size="lg"
			class="h-12 rounded-full px-6 shadow-lg"
		>
			<Icon icon="lucide:plus" class="mr-2 size-5" />
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

	ul {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	ul::-webkit-scrollbar {
		display: none;
	}

	:global(.leaflet-control-zoom a) {
		width: 44px !important;
		height: 44px !important;
		line-height: 44px !important;
	}

	:global(.leaflet-popup-content-wrapper) {
		border-radius: 12px;
		padding: 8px;
	}

	:global(.leaflet-popup-content) {
		margin: 10px 14px;
		font-size: 15px;
	}

	:global(.popup-content h3) {
		margin: 0 0 8px 0;
		font-size: 17px;
	}

	:global(.popup-content p) {
		margin: 4px 0;
		font-size: 15px;
	}

	:global(.leaflet-control-zoom .leaflet-bar .leaflet-control) {
		display: hidden !important;
	}
</style>
