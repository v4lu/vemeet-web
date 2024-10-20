<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { toast } from '$lib/stores/toast.store';
	import Icon from '@iconify/svelte';
	import { uploadImg } from '$lib/api';
	import type { CreateStoryRequest } from '$lib/types/story.types';
	import { Modal } from '$lib/components/ui/modals';

	interface CreateStoryProps {
		authToken: string;
		createStory: (payload: CreateStoryRequest) => Promise<void>;
		onClose: () => void;
	}

	let { authToken, createStory, onClose }: CreateStoryProps = $props();

	let fileInput: HTMLInputElement | null = $state(null);
	let selectedFile: File | null = $state(null);
	let imagePreviewUrl: string | null = $state(null);
	let isUploading = $state(false);
	let isSubmitting = $state(false);

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			selectedFile = input.files[0];
			imagePreviewUrl = URL.createObjectURL(selectedFile);
		}
	}

	async function handleSubmit() {
		if (!selectedFile) {
			toast.error('Please select an image for your story.');
			return;
		}

		isSubmitting = true;
		try {
			isUploading = true;
			const uploadedImageUrl = await uploadImg({ authToken, file: selectedFile });
			isUploading = false;

			if (!uploadedImageUrl) {
				toast.error('Failed to upload image. Please try again.');
				return;
			}

			const storyPayload: CreateStoryRequest = {
				assetType: 'IMAGE',
				contentType: selectedFile.type,
				fileContent: uploadedImageUrl
			};

			await createStory(storyPayload);
			toast.success('Story created successfully!');
			onClose();
		} catch (error) {
			console.error('Error creating story:', error);
			toast.error('Failed to create story. Please try again.');
		} finally {
			isSubmitting = false;
			isUploading = false;
		}
	}
</script>

<Modal {onClose}>
	<div class="w-full min-w-[18rem] max-w-md">
		<h2 class="mb-4 text-2xl font-bold">Create a New Story</h2>

		{#if imagePreviewUrl}
			<div class="mb-4 aspect-[9/16] w-full overflow-hidden rounded-lg">
				<img src={imagePreviewUrl} alt="Story preview" class="h-full w-full object-cover" />
			</div>
		{:else}
			<button
				class="mb-4 flex aspect-[9/16] w-full cursor-pointer items-center justify-center rounded-lg bg-muted"
				onclick={() => fileInput?.click()}
				disabled={isUploading || isSubmitting}
			>
				<Icon icon="solar:camera-add-bold" class="size-16 text-muted-foreground" />
			</button>
		{/if}

		<input
			type="file"
			accept="image/*"
			class="hidden"
			bind:this={fileInput}
			onchange={handleFileSelect}
		/>

		<div class="flex justify-between">
			<Button variant="outline" onclick={onClose} disabled={isUploading || isSubmitting}
				>Cancel</Button
			>
			<Button onclick={handleSubmit} disabled={!selectedFile || isUploading || isSubmitting}>
				{#if isUploading}
					<Icon icon="eos-icons:loading" class="mr-2 size-4 animate-spin" />
					Uploading...
				{:else if isSubmitting}
					<Icon icon="eos-icons:loading" class="mr-2 size-4 animate-spin" />
					Creating Story...
				{:else}
					Create Story
				{/if}
			</Button>
		</div>
	</div>
</Modal>
