<script lang="ts">
	import { uploadImg } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { toast } from '$lib/stores/toast.store';
	import type { CreateStoryRequest } from '$lib/types/story.types';
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';

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

<div class="fixed inset-0 z-[100] bg-background" transition:fade={{ duration: 200 }}>
	<div class="flex h-full flex-col">
		<div class="flex h-14 items-center justify-between border-b px-4">
			<button
				onclick={onClose}
				class="rounded-full p-2 text-foreground hover:bg-muted"
				disabled={isUploading || isSubmitting}
			>
				<Icon icon="lucide:x" class="size-6" />
			</button>
			<h2 class="text-lg font-medium">New Story</h2>
			<Button
				onclick={handleSubmit}
				disabled={!selectedFile || isUploading || isSubmitting}
				variant="ghost"
				class="h-auto px-3 py-1.5 font-medium"
			>
				{#if isUploading}
					<Icon icon="eos-icons:loading" class="mr-2 size-4 animate-spin" />
					Uploading...
				{:else if isSubmitting}
					<Icon icon="eos-icons:loading" class="mr-2 size-4 animate-spin" />
					Sharing...
				{:else}
					Share
				{/if}
			</Button>
		</div>

		<div class="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/30 px-4">
			<div class="relative w-full max-w-sm">
				<div class="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-white shadow-lg">
					{#if imagePreviewUrl}
						<img src={imagePreviewUrl} alt="Story preview" class="h-full w-full object-cover" />
						<button
							class="absolute bottom-6 right-6 rounded-full bg-white/90 p-3 shadow-lg hover:bg-white"
							onclick={() => fileInput?.click()}
							disabled={isUploading || isSubmitting}
						>
							<Icon icon="solar:camera-bold" class="size-6 text-foreground" />
						</button>
					{:else}
						<div class="flex h-full w-full flex-col items-center justify-center">
							<button
								class="flex flex-col items-center gap-4"
								onclick={() => fileInput?.click()}
								disabled={isUploading || isSubmitting}
							>
								<div class="rounded-full bg-muted p-6">
									<Icon icon="solar:camera-add-bold" class="size-8 text-muted-foreground" />
								</div>
								<div class="text-center">
									<p class="text-lg font-medium">Create a Story</p>
									<p class="text-sm text-muted-foreground">Share a photo with your followers</p>
								</div>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<input
			type="file"
			accept="image/*"
			class="hidden"
			bind:this={fileInput}
			onchange={handleFileSelect}
		/>
	</div>
</div>
