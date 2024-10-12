<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';
	import { cn } from '$lib/cn';
	import { uploadImage } from '$lib/api';
	import type { ChatAssetReq, CreateMessage } from '$lib/types/chat.types';

	type Props = {
		handleSubmit: (message: Omit<CreateMessage, 'firstTime'>) => Promise<void>;
		authToken: string;
		isSubmitting: boolean;
		receipantId: number;
	};

	let { handleSubmit, receipantId, authToken, isSubmitting }: Props = $props();
	let newMessage = $state('');
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
						Array.from(input.files).map(async (file) => {
							await uploadImage({
								authToken,
								file,
								setImageUploadLoading: () => (imageUploadLoading = true),
								setImageUrl: (img) => (imageUrls = [...imageUrls, img])
							});
						})
					);
				} catch (error) {
					console.error('Error uploading images:', error);
				} finally {
					imageUploadLoading = false;
				}
			} else {
				// TODO: Use toast for this error message
				console.error('You can upload a maximum of 5 images.');
			}
		}
	}

	function deleteImage(index: number): void {
		imageUrls = imageUrls.filter((_, i) => i !== index);
	}

	async function onSubmit(event: Event) {
		event.preventDefault();
		if (newMessage.trim().length === 0 && imageUrls.length === 0) return;

		const chatAssets: ChatAssetReq[] = imageUrls.map((url) => ({
			assetUrl: url,
			fileSize: 0,
			fileType: 'IMAGE',
			durationSeconds: 0,
			mimeType: '.png'
		}));

		const messageData: Omit<CreateMessage, 'firstTime'> = {
			recipientId: receipantId,
			messageType: chatAssets.length > 0 ? 'IMAGE' : 'TEXT',
			content: newMessage,
			isOneTime: false,
			chatAssets: chatAssets.length > 0 ? chatAssets : undefined
		};

		await handleSubmit(messageData);
		newMessage = '';
		imageUrls = [];
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onSubmit(event);
		}
	}
</script>

<div class="container border-t bg-card p-4 px-6 shadow-lg">
	<form onsubmit={onSubmit} class="flex flex-col gap-4">
		{#if imageUrls.length > 0}
			<div class="flex flex-wrap gap-2">
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
							type="button"
						>
							<Icon icon="solar:close-circle-bold" class="size-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
		<div class="flex items-center gap-4">
			<textarea
				onkeydown={handleKeyDown}
				class={cn(
					inputVariants({ variant: 'empty' }),
					'h-12 max-h-32 min-h-[3rem] flex-grow resize-none rounded-full px-4 py-2',
					'bg-muted/50 text-foreground placeholder:text-muted-foreground/50',
					'border-2 border-transparent transition-all duration-300 ease-in-out',
					'focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary'
				)}
				placeholder="Type a message..."
				bind:value={newMessage}
			></textarea>
			<Button
				disabled={imageUploadLoading || imageUrls.length >= 5}
				onclick={handleInputFileClick}
				variant="outline"
				size="icon-sm"
				class="rounded-full transition-all duration-300 hover:bg-primary hover:text-white"
				type="button"
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
			{#if newMessage.length > 0 || imageUrls.length > 0}
				<div in:fly={{ x: 20, duration: 300 }} out:fade={{ duration: 200 }}>
					<Button disabled={isSubmitting} type="submit" size="icon" class="rounded-full">
						{#if !isSubmitting}
							<Icon icon="solar:plain-bold" class="size-5" />
						{:else}
							<Icon icon="eos-icons:loading" class="size-5 animate-spin" />
						{/if}
					</Button>
				</div>
			{/if}
		</div>
	</form>
</div>
