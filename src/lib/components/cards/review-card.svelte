<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { Dropdown } from '../ui/dropdown';
	import { Avatar } from '../ui/avatar';
	import { formatTimestamp } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { LocationReviewResponse } from '$lib/types/geo.types';
	import { ConfirmModal, ImageModal } from '../ui/modals';

	type Props = {
		review: LocationReviewResponse;
		handleEditReview: (review: LocationReviewResponse) => void;
		handleDeleteReview: (id: number) => void;
	};

	let { review, handleEditReview, handleDeleteReview }: Props = $props();
	let isSettingsOpen = $state(false);
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
	let showImageModal = $state(false);
	let selectedImage = $state({ url: '', alt: '' });

	function openDeleteConfirm() {
		showDeleteConfirm = true;
		isSettingsOpen = false;
	}

	function closeDeleteConfirm() {
		showDeleteConfirm = false;
	}

	async function confirmDelete() {
		isDeleting = true;
		try {
			await handleDeleteReview(review.id);
		} finally {
			isDeleting = false;
			closeDeleteConfirm();
		}
	}

	function openImageModal(image: { url: string }, index: number) {
		selectedImage = { url: image.url, alt: `Review image ${index + 1}` };
		showImageModal = true;
	}

	function closeImageModal() {
		showImageModal = false;
	}

	function editClick() {
		handleEditReview(review);
		isSettingsOpen = false;
	}
</script>

<div class="rounded-b-xl border-t border-border">
	<div class="p-4">
		<div class="flex items-start space-x-4">
			<Avatar user={review.user} class="h-12 w-12" />
			<div class="flex-1 space-y-2">
				<div class="flex items-center justify-between">
					<a
						href={`/profile/${review.user.id}`}
						class="text-lg font-semibold text-primary hover:underline"
					>
						{review.user.username}
					</a>
					<div class="flex items-center space-x-2">
						<div class="flex items-center">
							<Icon icon="solar:star-bold" class="h-5 w-5 text-yellow-400" />
							<span class="ml-1 font-medium">{review.rating}</span>
						</div>
						<span class="text-sm text-muted-foreground">
							{formatTimestamp(review.createdAt)}
						</span>
						{#if $sessionStore.id === review.user.id}
							<Dropdown
								bind:isOpen={isSettingsOpen}
								triggerIcon="solar:menu-dots-bold"
								triggerClass="size-8 flex min-w-0 p-0 shadow-none justify-center bg-none rounded-full hover:bg-none transition-colors border-none"
								triggerIconClass="h-5 w-5"
								class="right-0 top-10"
							>
								<Button variant="ghost" class="w-full justify-start text-sm" onclick={editClick}>
									<Icon icon="solar:pen-bold" class="mr-2 h-4 w-4" />
									Edit
								</Button>
								<Button
									variant="ghost"
									class="w-full justify-start text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
									onclick={openDeleteConfirm}
								>
									<Icon icon="solar:trash-bin-2-bold" class="mr-2 h-4 w-4" />
									Delete
								</Button>
							</Dropdown>
						{/if}
					</div>
				</div>
				<p class="text-foreground">{review.comment}</p>
				{#if review.images && review.images.length > 0}
					<div class="mt-3 flex space-x-2 overflow-x-auto pb-2">
						{#each review.images as image, index}
							<button onclick={() => openImageModal(image, index)}>
								<img
									src={image.url}
									alt="Review  {index + 1}"
									class="h-24 w-24 cursor-pointer rounded-md object-cover shadow-sm transition-shadow duration-200 hover:shadow-md"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if showDeleteConfirm}
	<ConfirmModal
		title="Delete Review"
		desc="Are you sure you want to delete this review? This action cannot be undone."
		confirmText="Delete"
		onConfirm={confirmDelete}
		onClose={closeDeleteConfirm}
		submitting={isDeleting}
	/>
{/if}

{#if showImageModal}
	<ImageModal src={selectedImage.url} alt={selectedImage.alt} onClose={closeImageModal} />
{/if}
