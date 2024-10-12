<script lang="ts">
	import { Button } from '../ui/button';
	import { Modal } from '../ui/modals';
	import { Input, inputVariants } from '../ui/input';
	import { Field } from '../ui/field';
	import { toast } from '$lib/stores/toast.store';
	import { uploadImage } from '$lib/api';
	import { clickOutside, debounce } from '$lib/utils';
	import { sessionStore } from '$lib/stores/session.store';
	import type {
		AddressSuggestion,
		NominatimResponse,
		VeganLocationUpdateRequest
	} from '$lib/types/geo.types';
	import Icon from '@iconify/svelte';

	type Props = {
		onClose: () => void;
		updateLocation: (payload: VeganLocationUpdateRequest) => Promise<void>;
		authToken: string;
		initialData: VeganLocationUpdateRequest;
		locationImages: { id: number; url: string }[];
	};

	let { onClose, updateLocation, authToken, initialData, locationImages }: Props = $props();

	let updatePayload: VeganLocationUpdateRequest = $state(initialData);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);
	let imagesToAdd: string[] = $state([]);
	let imageIdsToRemove: number[] = $state([]);

	let addressSuggestions = $state<AddressSuggestion[]>([]);
	let showSuggestions = $state(false);
	let isSearching = $state(false);

	const locationTypes = $state(['Cafe', 'Bar', 'Restaurant', 'Shop']);
	const priceRanges = $state([
		{ value: '', label: '-' },
		{ value: '$', label: '$' },
		{ value: '$$', label: '$$' },
		{ value: '$$$', label: '$$$' }
	]);

	function handleInputFileClick(): void {
		if (!fileInput) return;
		fileInput.click();
	}

	async function handleImageUpload(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			const totalImages =
				locationImages.length + imagesToAdd.length - imageIdsToRemove.length + input.files.length;
			if (totalImages <= 5) {
				imageUploadLoading = true;
				try {
					await Promise.all(
						Array.from(input.files).map((file) =>
							uploadImage({
								authToken,
								file,
								setImageUploadLoading: () => (imageUploadLoading = true),
								setImageUrl: (img) => (imagesToAdd = [...imagesToAdd, img])
							})
						)
					);
				} catch (error) {
					console.error('Error uploading images:', error);
					toast.error('Failed to upload images');
				} finally {
					imageUploadLoading = false;
				}
			} else {
				toast.error(`You can upload a maximum of 5 images.`);
			}
		}
	}

	function toggleImageRemoval(imageId: number): void {
		if (imageIdsToRemove.includes(imageId)) {
			imageIdsToRemove = imageIdsToRemove.filter((id) => id !== imageId);
		} else {
			imageIdsToRemove = [...imageIdsToRemove, imageId];
		}
	}

	function removeNewImage(index: number): void {
		imagesToAdd = imagesToAdd.filter((_, i) => i !== index);
	}

	async function handleUpdateLocation() {
		if (!updatePayload.name || !updatePayload.address || !updatePayload.type) {
			toast.error('Please fill in all required fields');
			return;
		}

		const finalPayload: VeganLocationUpdateRequest = {
			...updatePayload,
			imagesToAdd,
			imageIdsToRemove
		};

		try {
			await updateLocation(finalPayload);
			onClose();
			toast.success('Location updated successfully');
		} catch (error) {
			console.error('Error updating location:', error);
			toast.error('Failed to update location');
		}
	}

	const debouncedSearchAddress = debounce(async () => {
		if (!updatePayload.address || updatePayload.address.length < 3) {
			addressSuggestions = [];
			showSuggestions = false;
			isSearching = false;
			return;
		}

		isSearching = true;

		try {
			let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(updatePayload.address)}&limit=5&addressdetails=1`;
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

		updatePayload.address = addressParts.join(', ');
		updatePayload.latitude = suggestion.lat;
		updatePayload.longitude = suggestion.lon;

		updatePayload.city = suggestion.address.city || '';
		updatePayload.country = suggestion.address.country || '';

		showSuggestions = false;
	}

	function handleKeyDown(event: KeyboardEvent, suggestion: AddressSuggestion) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectAddress(suggestion);
		}
	}
</script>

<Modal {onClose} class="flex h-[600px] w-full max-w-md flex-col">
	<div class="flex-shrink-0 border-b border-border p-4">
		<h2 class="text-2xl font-bold">Update Vegan Location</h2>
	</div>
	<form onsubmit={handleUpdateLocation} class="flex flex-grow flex-col overflow-hidden">
		<div class="flex-grow space-y-4 overflow-y-auto p-4">
			<Field name="Name">
				<Input bind:value={updatePayload.name} placeholder="Name" required />
			</Field>
			<Field name="Description" optional>
				<Input bind:value={updatePayload.description} placeholder="Description" />
			</Field>
			<Field name="Address">
				<div class="space-y-2" use:clickOutside={() => (showSuggestions = false)}>
					<Input
						bind:value={updatePayload.address}
						placeholder="Address"
						required
						oninput={handleAddressInput}
					/>
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
				<select class={inputVariants()} bind:value={updatePayload.type} required>
					<option value="" disabled>Select a type</option>
					{#each locationTypes as locationType}
						<option value={locationType}>{locationType}</option>
					{/each}
				</select>
			</Field>
			<Field name="Website URL" optional>
				<Input bind:value={updatePayload.websiteUrl} type="url" placeholder="Website URL" />
			</Field>
			<Field name="Phone Number" optional>
				<Input bind:value={updatePayload.phoneNumber} type="tel" placeholder="Phone Number" />
			</Field>
			<Field name="Opening Hours" optional>
				<Input bind:value={updatePayload.openingHours} placeholder="Opening Hours" />
			</Field>
			<Field name="Price Range" optional>
				<select class={inputVariants()} bind:value={updatePayload.priceRange}>
					{#each priceRanges as range}
						<option value={range.value}>{range.label}</option>
					{/each}
				</select>
			</Field>

			<Field name="Images" optional>
				<div class="space-y-2">
					<div class="mb-4 flex flex-wrap gap-2">
						{#each locationImages as image}
							<div class="relative h-24 w-24 overflow-hidden rounded-lg">
								<img
									src={image.url}
									alt="Location"
									class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
									class:opacity-50={imageIdsToRemove.includes(image.id)}
								/>
								<button
									type="button"
									onclick={() => toggleImageRemoval(image.id)}
									class="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75"
									aria-label={imageIdsToRemove.includes(image.id)
										? 'Undo remove image'
										: 'Remove image'}
								>
									<Icon
										icon={imageIdsToRemove.includes(image.id)
											? 'solar:refresh-circle-bold'
											: 'solar:close-circle-bold'}
										class="size-4"
									/>
								</button>
							</div>
						{/each}
						{#each imagesToAdd as imageUrl, i}
							<div class="relative h-24 w-24 overflow-hidden rounded-lg">
								<img
									src={imageUrl}
									alt="New location"
									class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
								/>
								<button
									type="button"
									onclick={() => removeNewImage(i)}
									class="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75"
									aria-label="Remove new image"
								>
									<Icon icon="solar:close-circle-bold" class="size-4" />
								</button>
							</div>
						{/each}
					</div>
					<div class="flex items-center gap-2">
						<Button
							type="button"
							disabled={imageUploadLoading ||
								locationImages.length + imagesToAdd.length - imageIdsToRemove.length >= 5}
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
				<Button type="submit">Update Location</Button>
			</div>
		</div>
	</form>
</Modal>
