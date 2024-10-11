<script lang="ts">
	import { formatTimestamp } from '$lib/date';
	import type {
		AddressSuggestion,
		LocationReviewResponse,
		NominatimResponse,
		VeganLocation,
		VeganLocationUpdateRequest
	} from '$lib/types/geo.types';
	import Icon from '@iconify/svelte';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { Button } from '../ui/button';
	import { Dropdown } from '../ui/dropdown';
	import { ConfirmModal, ImageModal, Modal } from '../ui/modals';
	import UserHorizontalCard from './user-horizontal-card.svelte';
	import { Input, inputVariants } from '../ui/input';
	import { Field } from '../ui/field';
	import { toast } from '$lib/stores/toast.store';
	import { uploadImage } from '$lib/api';
	import { clickOutside, debounce } from '$lib/utils';
	import { sessionStore } from '$lib/stores/session.store';

	type VeganLocationCardProps = {
		location: VeganLocation;
		deleteLocation: () => Promise<void>;
		updateLocation: (payload: VeganLocationUpdateRequest) => Promise<void>;
		isLocationDeleting: boolean;
		authToken: string;
	};

	let {
		location,
		deleteLocation,
		updateLocation,
		isLocationDeleting,
		authToken
	}: VeganLocationCardProps = $props();
	let isSettingsOpen = $state(false);
	let currentImageIndex = $state(0);
	let isImageModalOpen = $state(false);
	let isDeleteModalConfirmOpen = $state(false);
	let isReviewsModalOpen = $state(false);
	let isUpdateModalOpen = $state(false);
	let updatePayload: VeganLocationUpdateRequest = $state({});

	let hasNextImage = $derived(currentImageIndex < location.images.length - 1);
	let hasPrevImage = $derived(currentImageIndex > 0);

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

	function handleUpdate() {
		isSettingsOpen = false;
		isUpdateModalOpen = true;
		updatePayload = {
			name: location.name,
			description: location.description,
			address: location.address,
			city: location.city,
			country: location.country,
			latitude: location.latitude,
			longitude: location.longitude,
			type: location.type,
			websiteUrl: location.websiteUrl,
			phoneNumber: location.phoneNumber,
			openingHours: location.openingHours,
			priceRange: location.priceRange
		};
		imagesToAdd = [];
		imageIdsToRemove = [];
	}

	function nextImage() {
		if (currentImageIndex < location.images.length - 1) {
			currentImageIndex++;
		}
	}

	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}

	function setImage(index: number) {
		currentImageIndex = index;
	}

	async function handleDeleteLocation() {
		await deleteLocation();
		isDeleteModalConfirmOpen = false;
	}

	function handleInputFileClick(): void {
		if (!fileInput) return;
		fileInput.click();
	}

	async function handleImageUpload(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			const totalImages =
				location.images.length + imagesToAdd.length - imageIdsToRemove.length + input.files.length;
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
			isUpdateModalOpen = false;
			toast.success('Location updated successfully');
		} catch (error) {
			console.error('Error updating location:', error);
			toast.error('Failed to update location');
		}
	}

	function getAverageRating(reviews: LocationReviewResponse[]): number {
		if (reviews.length === 0) return 0;
		const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
		return Math.round((sum / reviews.length) * 10) / 10;
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

<div
	class="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
>
	<div class="relative">
		{#if $sessionStore.id === location.user.id}
			<div class="absolute right-3 top-3 z-10">
				<Dropdown
					triggerIcon="solar:menu-dots-bold"
					bind:isOpen={isSettingsOpen}
					triggerClass="size-8 flex min-w-0 p-0 shadow-none justify-center bg-none rounded-full hover:bg-none transition-colors border-none"
					triggerIconClass="m-0 p-0 size-5 hover:text-primary"
					class="right-0 top-10"
				>
					<div class="flex w-full flex-col gap-1 p-1">
						<Button
							variant="ghost"
							class="flex w-full justify-start"
							size="sm"
							onclick={handleUpdate}
						>
							<Icon icon="solar:pen-bold" class="mr-2" />
							Edit
						</Button>
						<Button
							variant="ghost"
							size="sm"
							class="flex w-full justify-start text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
							onclick={() => {
								isDeleteModalConfirmOpen = true;
								isSettingsOpen = false;
							}}
						>
							<Icon icon="solar:trash-bin-2-bold" class="mr-2" />
							Delete
						</Button>
					</div>
				</Dropdown>
			</div>
		{/if}
		<div class="relative mb-4 flex items-center justify-between p-4">
			<div class="flex flex-col">
				<h2 class="text-xl font-semibold text-foreground">{location.name}</h2>
				<p class="text-sm text-muted-foreground">
					{location.address}, {location.city}, {location.country}
				</p>
				<p class="text-xs text-muted-foreground">Added on {formatTimestamp(location.createdAt)}</p>
			</div>
			{#if location.isVerified}
				<div class="flex items-center text-primary">
					<Icon icon="solar:verified-check-bold" class="mr-1 size-5" />
					<span class="text-sm font-medium">Verified</span>
				</div>
			{/if}
		</div>

		{#if location.images && location.images.length > 0}
			<div class="relative mb-4">
				<div
					role="button"
					tabindex="0"
					aria-label="Open image gallery"
					aria-describedby="image-description"
					onkeydown={(e) => e.key === 'Enter' && (isImageModalOpen = true)}
					onclick={() => (isImageModalOpen = true)}
					class="h-[20rem] w-full overflow-hidden"
				>
					{#key currentImageIndex}
						<img
							src={location.images[currentImageIndex].url}
							alt={location.name}
							class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
							in:slide={{
								duration: 300,
								axis: 'x'
							}}
							out:fade={{ duration: 200, easing: elasticOut }}
						/>
					{/key}
				</div>
				{#if location.images.length > 1}
					{#if hasPrevImage}
						<button
							class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
							onclick={prevImage}
						>
							<Icon class="size-5" icon="lucide:chevron-left" />
						</button>
					{/if}
					{#if hasNextImage}
						<button
							class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
							onclick={nextImage}
						>
							<Icon class="size-5" icon="lucide:chevron-right" />
						</button>
					{/if}
				{/if}
			</div>
			{#if location.images.length > 1}
				<div class="mb-3 flex justify-center space-x-1.5">
					{#each location.images as _, index}
						<button
							class="h-2.5 w-2.5 rounded-full transition-colors"
							class:bg-primary={index === currentImageIndex}
							class:bg-gray-300={index !== currentImageIndex}
							onclick={() => setImage(index)}
						></button>
					{/each}
				</div>
			{/if}
		{/if}

		<div class="mb-4 px-4">
			<p class="text-foreground">{location.description}</p>
		</div>

		<div class="mb-4 grid grid-cols-2 gap-4 px-4 text-sm">
			<div>
				<p class="font-medium">Type:</p>
				<p>{location.type}</p>
			</div>
			{#if location.websiteUrl}
				<div>
					<p class="font-medium">Website:</p>
					<a
						href={location.websiteUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline">{location.websiteUrl}</a
					>
				</div>
			{/if}
			{#if location.phoneNumber}
				<div>
					<p class="font-medium">Phone:</p>
					<p>{location.phoneNumber}</p>
				</div>
			{/if}
			{#if location.openingHours}
				<div>
					<p class="font-medium">Opening Hours:</p>
					<p>{location.openingHours}</p>
				</div>
			{/if}
			{#if location.priceRange}
				<div>
					<p class="font-medium">Price Range:</p>
					<p>{location.priceRange}</p>
				</div>
			{/if}
		</div>

		<div class="flex items-center justify-between border-t border-border p-4">
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center space-x-4">
					<button
						class="group flex items-center text-sm transition-colors"
						onclick={() => (isReviewsModalOpen = true)}
					>
						<Icon icon="solar:star-bold" class="size-6 text-yellow-400" />
						<span class="ml-1.5 font-medium"
							>{getAverageRating(location.reviews)} ({location.reviews.length})</span
						>
					</button>
				</div>
				<button
					class="flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
				>
					<Icon icon="solar:multiple-forward-right-bold" class="size-6" />
					<span class="ml-1.5 font-medium">Share</span>
				</button>
			</div>
		</div>
	</div>
</div>

{#if isImageModalOpen}
	<ImageModal
		src={location.images[currentImageIndex].url}
		alt={`Full size image of ${location.name}`}
		onClose={() => (isImageModalOpen = false)}
	/>
{/if}

{#if isDeleteModalConfirmOpen}
	<ConfirmModal
		title="Delete Location"
		desc="Deleting this location is a permanent action. All associated data will be removed and cannot be recovered."
		onClose={() => (isDeleteModalConfirmOpen = false)}
		onConfirm={handleDeleteLocation}
		submitting={isLocationDeleting}
		confirmText="Delete Location"
	/>
{/if}

{#if isUpdateModalOpen}
	<Modal
		onClose={() => (isUpdateModalOpen = false)}
		class="flex h-[600px] w-full max-w-md flex-col"
	>
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
				<Field name="City">
					<Input bind:value={updatePayload.city} placeholder="City" required />
				</Field>
				<Field name="Country">
					<Input bind:value={updatePayload.country} placeholder="Country" required />
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
							{#each location.images as image}
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
									location.images.length + imagesToAdd.length - imageIdsToRemove.length >= 5}
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
					<Button variant="outline" onclick={() => (isUpdateModalOpen = false)} type="button"
						>Cancel</Button
					>
					<Button type="submit">Update Location</Button>
				</div>
			</div>
		</form>
	</Modal>
{/if}

{#if isReviewsModalOpen}
	<Modal onClose={() => (isReviewsModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Reviews</h2>
			<div class="grid gap-4">
				{#each location.reviews as review}
					<div class="border-b border-border pb-4 last:border-b-0">
						<div class="flex items-center justify-between">
							<UserHorizontalCard user={review.user} />
							<div class="flex items-center">
								<Icon icon="solar:star-bold" class="mr-1 size-5 text-yellow-400" />
								<span class="font-medium">{review.rating}</span>
							</div>
						</div>
						{#if review.comment}
							<p class="mt-2 text-sm text-muted-foreground">{review.comment}</p>
						{/if}
						{#if review.images && review.images.length > 0}
							<div class="mt-2 flex gap-2 overflow-x-auto">
								{#each review.images as image}
									<img src={image.url} alt="Review" class="h-20 w-20 rounded-md object-cover" />
								{/each}
							</div>
						{/if}
						<p class="mt-1 text-xs text-muted-foreground">{formatTimestamp(review.createdAt)}</p>
					</div>
				{/each}
			</div>
		</div>
	</Modal>
{/if}

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
