<script lang="ts">
	import { uploadImage } from '$lib/api';
	import { sessionStore } from '$lib/stores/session.store';
	import { toast } from '$lib/stores/toast.store';
	import type { AddressSuggestion, CreateLocation, NominatimResponse } from '$lib/types/geo.types';
	import { clickOutside, debounce } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { Field } from '../ui/field';
	import { Input, inputVariants } from '../ui/input';
	import { Modal } from '../ui/modals';

	type Props = {
		createLocation: (payload: CreateLocation) => Promise<void>;
		onClose: () => void;
		authToken: string;
	};
	let { createLocation, onClose, authToken }: Props = $props();

	let name = $state('');
	let description = $state('');
	let address = $state('');
	let city = $state('');
	let country = $state('');
	let latitude = $state<number | null>(null);
	let longitude = $state<number | null>(null);
	let type = $state('');
	let websiteUrl = $state('');
	let phoneNumber = $state('');
	let openingHours = $state('');
	let priceRange = $state('');
	let imageUrls = $state<string[]>([]);
	let isSearching = $state(false);

	let addressSuggestions = $state<AddressSuggestion[]>([]);
	let showSuggestions = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);

	const locationTypes = $state(['Cafe', 'Bar', 'Restaurant', 'Shop']);
	const priceRanges = $state([
		{ value: '', label: '-' },
		{ value: '$', label: '$' },
		{ value: '$$', label: '$$' },
		{ value: '$$$', label: '$$$' }
	]);

	const debouncedSearchAddress = debounce(async () => {
		if (!address || address.length < 3) {
			addressSuggestions = [];
			showSuggestions = false;
			isSearching = false;
			return;
		}

		isSearching = true;

		try {
			let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`;
			if ($sessionStore?.cityLat && $sessionStore?.cityLng) {
				url += `&viewbox=${$sessionStore.cityLng - 0.1},${$sessionStore.cityLat - 0.1},${$sessionStore.cityLng + 0.1},${$sessionStore.cityLat + 0.1}`;
			}

			const response = await fetch(url, {
				headers: {
					'Accept-Language': 'en'
				}
			});
			const data: NominatimResponse[] = await response.json();

			addressSuggestions = data.map((item: NominatimResponse) => ({
				display_name: item.display_name,
				lat: Number.parseFloat(item.lat),
				lon: Number.parseFloat(item.lon),
				address: {
					house_number: item.address.house_number,
					road: item.address.road,
					pedestrian: item.address.pedestrian,
					city: item.address.city || item.address.town || item.address.village,
					country: item.address.country
				}
			}));

			showSuggestions = addressSuggestions.length > 0;
		} catch (error) {
			console.error('Error fetching address suggestions:', error);
			toast.error('Failed to fetch address suggestions');
		} finally {
			isSearching = false;
		}
	}, 400);
	function handleAddressInput() {
		debouncedSearchAddress();
	}

	function selectAddress(suggestion: AddressSuggestion) {
		const addressParts = [];

		const street = suggestion.address.road || suggestion.address.pedestrian;
		if (suggestion.address.house_number && street) {
			addressParts.push(`${street} ${suggestion.address.house_number}`);
		} else if (street) {
			addressParts.push(street);
		}

		if (suggestion.address.city) {
			addressParts.push(suggestion.address.city);
		}

		if (suggestion.address.country) {
			addressParts.push(suggestion.address.country);
		}

		address = addressParts.join(', ');
		latitude = suggestion.lat;
		longitude = suggestion.lon;

		city = suggestion.address.city || '';
		country = suggestion.address.country || '';

		showSuggestions = false;
	}

	function handleClickOutside() {
		showSuggestions = false;
	}

	function handleInputFileClick(): void {
		if (!fileInput) return;
		fileInput.click();
	}

	async function handleImageUpload(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			const totalImages = imageUrls.length + input.files.length;
			if (totalImages <= 5) {
				imageUploadLoading = true;
				try {
					await Promise.all(
						Array.from(input.files).map((file) =>
							uploadImage({
								authToken,
								file,
								setImageUploadLoading: () => (imageUploadLoading = true),
								setImageUrl: (img) => (imageUrls = [img, ...imageUrls])
							})
						)
					);
				} catch (error) {
					console.error('Error uploading images:', error);
				} finally {
					imageUploadLoading = false;
				}
			} else {
				toast.error(`You can upload a maximum of 5 images.`);
			}
		}
	}

	function deleteImage(index: number): void {
		imageUrls = imageUrls.filter((_, i) => i !== index);
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!name || !address || !type) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (!latitude || !longitude) {
			toast.error('Please try again later, server issue');
			return;
		}

		const newLocation: CreateLocation = {
			name,
			description,
			address,
			city,
			country,
			latitude,
			longitude,
			type,
			websiteUrl,
			phoneNumber,
			openingHours,
			priceRange,
			images: imageUrls
		};

		try {
			await createLocation(newLocation);
			onClose();
		} catch (error) {
			console.error('Error creating location:', error);
			toast.error('Failed to create location');
		}
	}

	function handleKeyDown(event: KeyboardEvent, suggestion: any) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectAddress(suggestion);
		}
	}
</script>

<Modal {onClose} class="flex h-[600px] w-full max-w-md flex-col">
	<div class="flex-shrink-0 border-b border-border p-4">
		<h2 class="text-2xl font-bold">Add New Vegan Location</h2>
	</div>
	<form onsubmit={handleSubmit} class="flex flex-grow flex-col overflow-hidden">
		<div class="flex-grow space-y-4 overflow-y-auto p-4">
			<Field name="Name">
				<Input bind:value={name} placeholder="Name" required />
			</Field>
			<Field name="Description" optional>
				<Input bind:value={description} placeholder="Description" />
			</Field>
			<Field name="Address">
				<div class="space-y-2" use:clickOutside={handleClickOutside}>
					<Input bind:value={address} placeholder="Address" required oninput={handleAddressInput} />
					{#if isSearching}
						<div
							class="absolute z-50 mt-1 flex max-h-60 w-full items-center justify-center overflow-auto rounded-md bg-popover py-1 text-sm shadow-md"
						>
							<Icon icon="eos-icons:loading" class="size-5 animate-spin text-primary" />
						</div>
					{:else if showSuggestions}
						<ul
							class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-sm shadow-md"
							role="listbox"
						>
							{#each addressSuggestions as suggestion}
								<li>
									<button
										type="button"
										class="w-full cursor-pointer px-4 py-2 text-left hover:bg-muted"
										onclick={() => selectAddress(suggestion)}
										onkeydown={(event) => handleKeyDown(event, suggestion)}
									>
										{suggestion.display_name}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</Field>
			<Field name="Type">
				<select class={inputVariants()} bind:value={type} required>
					<option value="" disabled selected>Select a type</option>
					{#each locationTypes as locationType}
						<option value={locationType}>{locationType}</option>
					{/each}
				</select>
			</Field>
			<Field name="Website URL" optional>
				<Input bind:value={websiteUrl} type="url" placeholder="Website URL" />
			</Field>
			<Field name="Phone Number" optional>
				<Input bind:value={phoneNumber} type="tel" placeholder="Phone Number" />
			</Field>
			<Field name="Opening Hours" optional>
				<Input bind:value={openingHours} placeholder="Opening Hours" />
			</Field>
			<Field name="Price Range" optional>
				<select class={inputVariants()} bind:value={priceRange}>
					{#each priceRanges as range}
						<option value={range.value}>{range.label}</option>
					{/each}
				</select>
			</Field>

			<Field name="Images" optional>
				<div class="space-y-2">
					{#if imageUrls.length > 0}
						<div class="mb-4 flex flex-wrap gap-2">
							{#each imageUrls as imageUrl, i}
								<div class="relative h-24 w-24 overflow-hidden rounded-lg">
									<img
										src={imageUrl}
										alt="Location"
										class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
									/>
									<button
										onclick={() => deleteImage(i)}
										class="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75"
										aria-label="Delete image"
									>
										<Icon icon="solar:close-circle-bold" class="size-4" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
					<div class="flex items-center gap-2">
						<Button
							type="button"
							disabled={imageUploadLoading || imageUrls.length >= 5}
							onclick={handleInputFileClick}
							variant="outline"
							size="icon-sm"
							class="rounded-full transition-all duration-300 hover:bg-primary hover:text-white"
						>
							<Icon icon="solar:gallery-add-bold" class="size-5" />
						</Button>
						<input
							bind:this={fileInput}
							type="file"
							multiple={true}
							class="hidden"
							onchange={handleImageUpload}
							accept="image/*"
						/>
						{#if imageUploadLoading}
							<Icon icon="eos-icons:loading" class="ml-2 size-5 animate-spin text-primary" />
						{/if}
					</div>
				</div>
			</Field>
		</div>
		<div class="flex-shrink-0 border-t border-border bg-card p-4">
			<div class="flex justify-end space-x-2">
				<Button variant="outline" onclick={onClose} type="button">Cancel</Button>
				<Button type="submit">Create Location</Button>
			</div>
		</div>
	</form>
</Modal>
