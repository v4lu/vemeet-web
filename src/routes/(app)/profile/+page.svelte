<script lang="ts">
	import { uploadImage } from '$lib/api.js';
	import { cn } from '$lib/cn.js';
	import { Header } from '$lib/components/profile';
	import { Button } from '$lib/components/ui/button/index.js';
	import { inputVariants } from '$lib/components/ui/input/index.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();

	let postContent = $state('');
	let imageUrl = $state('');
	let file: File | null = $state(null);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);

	function handleInputFileClick(): void {
		if (!fileInput) return;
		fileInput.click();
	}

	async function handleImageUpload(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			file = input.files[0];
			imageUploadLoading = true;
			try {
				await uploadImage({
					authToken: data.accessToken,
					file,
					setImageUrl: (url: string) => {
						imageUrl = url;
					},
					setImageUploadLoading: (loading: boolean) => {
						imageUploadLoading = loading;
					}
				});
			} catch (error) {
				console.error('Error uploading image:', error);
			} finally {
				imageUploadLoading = false;
			}
		}
	}

	function deleteImage(): void {
		imageUrl = '';
		file = null;
	}

	function handleCreatePost(): void {
		postContent = '';
		imageUrl = '';
	}
</script>

<Header authToken={data.accessToken} />
<nav class="my-2 flex">
	<a href="#" class="border-b-2 border-primary px-6 py-3 text-sm font-medium"> Posts </a>
	<a
		href="#"
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Recipes
	</a>
	<a
		href="#"
		class="px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
	>
		Media
	</a>
</nav>
<div class="mb-6 rounded-lg border bg-background p-4">
	<input
		type="file"
		accept="image/*"
		class="hidden"
		bind:this={fileInput}
		onchange={handleImageUpload}
	/>
	<textarea
		bind:value={postContent}
		placeholder="What's on your mind?"
		rows="4"
		class={cn(inputVariants({ variant: 'empty' }), 'h-24 resize-none')}
	></textarea>

	{#if imageUrl}
		<div class="relative mb-4 inline-block">
			<img src={imageUrl} alt="Uploaded file" class="size-24 rounded-lg object-cover" />
			<button
				onclick={deleteImage}
				class="absolute right-0 top-0 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75"
				aria-label="Delete image"
			>
				<Icon icon="solar:close-circle-bold" class="size-5" />
			</button>
		</div>
	{/if}

	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-2">
			<Button
				disabled={imageUploadLoading}
				onclick={handleInputFileClick}
				variant="outline"
				size="icon-sm"
			>
				<Icon icon="solar:gallery-add-bold" class="size-5" />
			</Button>
			<input
				id="file-input"
				type="file"
				accept="image/*"
				class="hidden"
				onchange={handleImageUpload}
			/>
		</div>
		<Button onclick={handleCreatePost} size="sm" disabled={!postContent.trim() && !imageUrl}
			>Create :)</Button
		>
	</div>
</div>
