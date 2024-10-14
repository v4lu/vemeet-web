<script lang="ts">
	import { uploadImage } from '$lib/api';
	import { cn } from '$lib/cn';
	import { toast } from '$lib/stores/toast.store';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';

	type CreatePostProps = {
		createPost: (content: string, imageUrls: string[]) => Promise<void>;
		isSubmittingCreatePost: boolean;
		authToken: string;
	};

	let { createPost, authToken, isSubmittingCreatePost }: CreatePostProps = $props();
	let postContent = $state('');
	let imageUrls = $state<string[]>([]);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);

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

	async function handleSubmit(): Promise<void> {
		if (!postContent.trim() && imageUrls.length === 0) {
			toast.error('Please enter content or upload an image.');
			return;
		}
		createPost(postContent, imageUrls);
		postContent = '';
		imageUrls = [];
	}
</script>

<div
	class="my-6 rounded-lg border border-border bg-background p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
>
	<div class="mb-4">
		<textarea
			bind:value={postContent}
			placeholder="What's on your mind?"
			rows="4"
			class={cn(
				inputVariants({ variant: 'empty' }),
				'h-24 w-full resize-none rounded-lg p-3',
				'bg-muted/50 text-foreground placeholder:text-muted-foreground/50',
				'border-2 border-transparent',
				'transition-all duration-300 ease-in-out',
				'focus:border-primary focus:bg-background',
				'focus:outline-none focus:ring-2 focus:ring-primary',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
				'!shadow-none !outline-none',
				'appearance-none'
			)}
		></textarea>
	</div>

	{#if imageUrls.length > 0}
		<div class="mb-4 flex flex-wrap gap-2">
			{#each imageUrls as imageUrl, i}
				<div class="relative h-24 w-24 overflow-hidden rounded-lg">
					<img
						src={imageUrl}
						alt="Uploaded file"
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

	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Button
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
			/>
			{#if imageUploadLoading}
				<Icon icon="eos-icons:loading" class="ml-2 size-5 animate-spin text-primary" />
			{/if}
		</div>
		<Button
			onclick={handleSubmit}
			size="sm"
			isLoading={isSubmittingCreatePost}
			disabled={isSubmittingCreatePost || (!postContent.trim() && imageUrls.length === 0)}
			class=" transition-all duration-300 "
		>
			Create Post
		</Button>
	</div>
</div>
