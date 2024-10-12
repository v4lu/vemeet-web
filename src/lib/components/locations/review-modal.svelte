<script lang="ts">
	import { Button } from '../ui/button';
	import { Field } from '../ui/field';
	import { inputVariants } from '../ui/input';
	import { Modal } from '../ui/modals';
	import Icon from '@iconify/svelte';
	import { toast } from '$lib/stores/toast.store';
	import { uploadImage } from '$lib/api';
	import type {
		LocationReviewRequest,
		LocationReviewResponse,
		LocationReviewUpdate
	} from '$lib/types/geo.types';

	type Props = {
		onClose: () => void;
		editingReview: LocationReviewResponse | null;
		authToken: string;
		onSubmit: (review: LocationReviewRequest | LocationReviewUpdate) => Promise<void>;
	};

	let { onClose, editingReview, authToken, onSubmit }: Props = $props();

	let newReview: LocationReviewRequest = $state({ rating: 0, comment: '' });
	let reviewImagesToAdd: string[] = $state([]);
	let reviewFileInput: HTMLInputElement;
	let reviewImageIdsToRemove: number[] = $state([]);
	let imageUploadLoading = $state(false);

	$effect(() => {
		if (editingReview) {
			newReview = {
				rating: editingReview.rating,
				comment: editingReview.comment || ''
			};
			reviewImagesToAdd = [];
			reviewImageIdsToRemove = [];
		} else {
			newReview = { rating: 0, comment: '' };
			reviewImagesToAdd = [];
			reviewImageIdsToRemove = [];
		}
	});

	function handleReviewInputFileClick() {
		if (reviewFileInput) {
			reviewFileInput.click();
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

	function deleteReviewImage(image: { id?: number; url: string }) {
		if (image.id) {
			reviewImageIdsToRemove = [...reviewImageIdsToRemove, image.id];
		} else {
			reviewImagesToAdd = reviewImagesToAdd.filter((url) => url !== image.url);
		}
	}

	async function handleSubmit() {
		if (newReview.rating === 0) {
			toast.error('Please provide a rating');
			return;
		}

		const reviewPayload: LocationReviewRequest | LocationReviewUpdate = editingReview
			? {
					rating: newReview.rating,
					comment: newReview.comment,
					imagesToAdd: reviewImagesToAdd,
					imageIdsToRemove: reviewImageIdsToRemove
				}
			: {
					...newReview,
					images: reviewImagesToAdd
				};

		try {
			await onSubmit(reviewPayload);
			onClose();
		} catch (error) {
			console.error('Error submitting review:', error);
			toast.error('Failed to submit review');
		}
	}
</script>

<Modal {onClose} class="w-full max-w-lg">
	<h2 class="mb-6 text-2xl font-semibold">
		{editingReview ? 'Edit Review' : 'Add Review'}
	</h2>
	<form onsubmit={handleSubmit} class="space-y-6">
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
			<Button type="button" variant="outline" onclick={onClose}>Cancel</Button>
			<Button type="submit" disabled={newReview.rating === 0}>
				{editingReview ? 'Update Review' : 'Submit Review'}
			</Button>
		</div>
	</form>
</Modal>
