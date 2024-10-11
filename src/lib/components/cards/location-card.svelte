<script lang="ts">
	import { formatTimestamp } from '$lib/date';
	import type {
		AddressSuggestion,
		LocationReviewRequest,
		LocationReviewResponse,
		LocationReviewUpdate,
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
	import { Input, inputVariants } from '../ui/input';
	import { Field } from '../ui/field';
	import { toast } from '$lib/stores/toast.store';
	import { uploadImage } from '$lib/api';
	import { clickOutside, debounce } from '$lib/utils';
	import { sessionStore } from '$lib/stores/session.store';
	import { ReviewCard } from '.';

	type VeganLocationCardProps = {
		location: VeganLocation;
		deleteLocation: () => Promise<void>;
		updateLocation: (payload: VeganLocationUpdateRequest) => Promise<void>;
		createReview: (payload: LocationReviewRequest) => Promise<void>;
		deleteReview: (reviewId: number) => Promise<void>;
		patchReview: (payload: LocationReviewUpdate, reviewId: number) => Promise<void>;
		isLocationDeleting: boolean;
		authToken: string;
	};

	let {
		location,
		deleteLocation,
		updateLocation,
		createReview,
		deleteReview,
		patchReview,
		isLocationDeleting,
		authToken
	}: VeganLocationCardProps = $props();
	let isSettingsOpen = $state(false);
	let currentImageIndex = $state(0);
	let isImageModalOpen = $state(false);
	let isDeleteModalConfirmOpen = $state(false);
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

	let isAddReviewModalOpen = $state(false);
	let newReview: LocationReviewRequest = $state({ rating: 0, comment: '' });
	let editingReview: LocationReviewResponse | null = $state(null);
	let reviewImagesToAdd: string[] = $state([]);
	let reviewFileInput = $state<HTMLInputElement>();
	let reviewImageIdsToRemove: number[] = $state([]);

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

	function handleAddReview() {
		isAddReviewModalOpen = true;
		newReview = { rating: 0, comment: '' };
		reviewImagesToAdd = [];
	}

	async function handleDeleteReview(reviewId: number) {
		try {
			await deleteReview(reviewId);
			toast.success('Review deleted successfully');
		} catch (error) {
			console.error('Error deleting review:', error);
			toast.error('Failed to delete review');
		}
	}

	async function handleReviewImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			try {
				for (const file of input.files) {
					if (reviewImagesToAdd.length < 5) {
						await uploadImage({
							authToken,
							file,
							setImageUploadLoading: (loading) => {
								imageUploadLoading = loading;
							},
							setImageUrl: (url) => {
								reviewImagesToAdd = [...reviewImagesToAdd, url];
							}
						});
					} else {
						toast.error('Maximum of 5 images allowed');
						break;
					}
				}
			} catch (error) {
				console.error('Error uploading review image:', error);
				toast.error('Failed to upload review image');
			}
		}
	}

	function handleReviewInputFileClick() {
		if (reviewFileInput) {
			reviewFileInput.click();
		}
	}

	function deleteReviewImage(image: { id?: number; url: string }) {
		if (image.id) {
			reviewImageIdsToRemove = [...reviewImageIdsToRemove, image.id];
		} else {
			reviewImagesToAdd = reviewImagesToAdd.filter((url) => url !== image.url);
		}
	}

	async function submitReview() {
		if (newReview.rating === 0) {
			toast.error('Please provide a rating');
			return;
		}

		const reviewPayload: LocationReviewRequest = {
			...newReview,
			images: reviewImagesToAdd
		};

		try {
			await createReview(reviewPayload);
			isAddReviewModalOpen = false;
			reviewImagesToAdd = [];
			toast.success('Review added successfully');
		} catch (error) {
			console.error('Error adding review:', error);
			toast.error('Failed to add review');
		}
	}

	async function submitEditReview() {
		if (!editingReview) return;

		const reviewPayload: LocationReviewUpdate = {
			rating: newReview.rating,
			comment: newReview.comment,
			imagesToAdd: reviewImagesToAdd,
			imageIdsToRemove: reviewImageIdsToRemove
		};

		try {
			await patchReview(reviewPayload, editingReview.id);
			editingReview = null;
			reviewImagesToAdd = [];
			reviewImageIdsToRemove = [];
			toast.success('Review updated successfully');
		} catch (error) {
			console.error('Error updating review:', error);
			toast.error('Failed to update review');
		}
	}
	function handleEditReview(review: LocationReviewResponse) {
		editingReview = review;
		newReview = {
			rating: review.rating,
			comment: review.comment || ''
		};
		reviewImagesToAdd = [];
		reviewImageIdsToRemove = [];
	}
</script>

<div
	class="mb-6 rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
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
					<div class="group flex items-center text-sm transition-colors">
						<Icon icon="solar:star-bold" class="size-6 text-yellow-400" />
						<span class="ml-1.5 font-medium"
							>{getAverageRating(location.reviews)} ({location.reviews.length})</span
						>
					</div>
				</div>
				<Button variant="outline" onclick={handleAddReview}>
					<Icon icon="solar:pen-new-square-bold" class="mr-2 size-4" />
					Add Review
				</Button>
			</div>
		</div>
	</div>

	<div class="space-y-6 border-t border-border bg-card shadow-lg last:rounded-b-xl">
		{#each location.reviews as review (review.id)}
			<ReviewCard {review} {handleEditReview} {handleDeleteReview} />
		{/each}
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

{#if isAddReviewModalOpen || editingReview}
	<Modal
		onClose={() => {
			isAddReviewModalOpen = false;
			editingReview = null;
			reviewImagesToAdd = [];
			reviewImageIdsToRemove = [];
		}}
		class="w-full max-w-lg"
	>
		<h2 class="mb-6 text-2xl font-semibold">
			{editingReview ? 'Edit Review' : 'Add Review'}
		</h2>
		<form onsubmit={editingReview ? submitEditReview : submitReview} class="space-y-6">
			<Field name="Rating">
				<div class="flex items-center gap-3">
					{#each Array(5) as _, i}
						<button
							type="button"
							onclick={() => (newReview.rating = i + 1)}
							class="text-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						>
							<Icon
								icon={i < newReview.rating ? 'solar:star-bold' : 'solar:star-line-duotone'}
								class="size-8 text-yellow-400"
							/>
						</button>
					{/each}
				</div>
			</Field>

			<Field name="Comment" optional>
				<textarea
					bind:value={newReview.comment}
					class={inputVariants({ class: 'h-32 w-full resize-none' })}
					placeholder="Write your review here..."
				></textarea>
			</Field>

			<Field name="Images" optional>
				{#if editingReview}
					<div class="mb-4 flex flex-wrap gap-2">
						{#each editingReview.images as image}
							{#if !reviewImageIdsToRemove.includes(image.id)}
								<div class="relative h-24 w-24 overflow-hidden rounded-lg">
									<img
										src={image.url}
										alt="Review"
										class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
									/>
									<button
										onclick={() => deleteReviewImage(image)}
										class="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75"
										aria-label="Delete image"
									>
										<Icon icon="solar:close-circle-bold" class="size-4" />
									</button>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
				{#if reviewImagesToAdd.length > 0}
					<div class="mb-4 flex flex-wrap gap-2">
						{#each reviewImagesToAdd as imageUrl}
							<div class="relative h-24 w-24 overflow-hidden rounded-lg">
								<img
									src={imageUrl}
									alt="New review"
									class="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-110"
								/>
								<button
									onclick={() => deleteReviewImage({ url: imageUrl })}
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
						disabled={imageUploadLoading || reviewImagesToAdd.length >= 5}
						onclick={handleReviewInputFileClick}
						variant="outline"
						size="icon-sm"
						class="rounded-full transition-all duration-300 hover:bg-primary hover:text-white"
					>
						<Icon icon="solar:gallery-add-bold" class="size-5" />
					</Button>
					<input
						bind:this={reviewFileInput}
						type="file"
						accept="image/*"
						multiple={true}
						class="hidden"
						onchange={handleReviewImageUpload}
					/>
					{#if imageUploadLoading}
						<Icon icon="eos-icons:loading" class="ml-2 size-5 animate-spin text-primary" />
					{/if}
					<span class="text-sm text-muted-foreground">
						{reviewImagesToAdd.length}/5 images
					</span>
				</div>
			</Field>

			<div class="flex justify-end space-x-3 pt-4">
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						isAddReviewModalOpen = false;
						editingReview = null;
					}}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={newReview.rating === 0}>
					{editingReview ? 'Update Review' : 'Submit Review'}
				</Button>
			</div>
		</form>
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
