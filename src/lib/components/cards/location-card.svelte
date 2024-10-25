<script lang="ts">
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import { toast } from '$lib/stores/toast.store';
	import type {
		LocationReviewRequest,
		LocationReviewResponse,
		LocationReviewUpdate,
		VeganLocation,
		VeganLocationUpdateRequest
	} from '$lib/types/geo.types';
	import Icon from '@iconify/svelte';
	import { elasticOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { ReviewCard } from '.';
	import { EditLocation, ReviewModal } from '../locations';
	import { Button } from '../ui/button';
	import { Dropdown } from '../ui/dropdown';
	import { ConfirmModal, ImageModal } from '../ui/modals';

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

	let isAddReviewModalOpen = $state(false);
	let editingReview: LocationReviewResponse | null = $state(null);

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
	}

	async function handleUpdateLocation(payload: VeganLocationUpdateRequest) {
		try {
			await updateLocation(payload);
			isUpdateModalOpen = false;
			toast.success('Location updated successfully');
		} catch (error) {
			console.error('Error updating location:', error);
			toast.error('Failed to update location');
		}
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

	function getAverageRating(reviews: LocationReviewResponse[]): number {
		if (reviews.length === 0) return 0;
		const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
		return Math.round((sum / reviews.length) * 10) / 10;
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

	function handleEditReview(review: LocationReviewResponse) {
		editingReview = review;
		isAddReviewModalOpen = true;
	}

	async function handleReviewSubmit(reviewPayload: LocationReviewRequest | LocationReviewUpdate) {
		if (editingReview) {
			await patchReview(reviewPayload as LocationReviewUpdate, editingReview.id);
			toast.success('Review updated successfully');
		} else {
			await createReview(reviewPayload as LocationReviewRequest);
			toast.success('Review added successfully');
		}
		isAddReviewModalOpen = false;
		editingReview = null;
	}
</script>

<div
	class="container mb-6 border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
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
				<Button variant="outline" onclick={() => (isAddReviewModalOpen = true)}>
					<Icon icon="solar:pen-new-square-bold" class="mr-2 size-4" />
					Add Review
				</Button>
			</div>
		</div>
	</div>

	<div class="space-y-6 border-t border-border bg-card">
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
	<EditLocation
		onClose={() => (isUpdateModalOpen = false)}
		updateLocation={handleUpdateLocation}
		{authToken}
		initialData={updatePayload}
		locationImages={location.images}
	/>
{/if}

{#if isAddReviewModalOpen || editingReview}
	<ReviewModal
		onClose={() => {
			isAddReviewModalOpen = false;
			editingReview = null;
		}}
		{editingReview}
		{authToken}
		onSubmit={handleReviewSubmit}
	/>
{/if}
