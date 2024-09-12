<script lang="ts">
	import { api, createAuthHeaders, uploadImage } from '$lib/api';
	import { cn } from '$lib/cn';
	import { toast } from '$lib/stores/toast.store';
	import type { Post } from '$lib/types/post.types';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { inputVariants } from '../ui/input';

	type CreatePostProps = {
		authToken: string;
		onNewPost: (post: Post) => void;
	};

	let { authToken, onNewPost }: CreatePostProps = $props();

	let postContent = $state('');
	let imageUrls = $state<string[]>([]);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);
	let submitting = $state(false);

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
								setImageUrl: (url: string) => {
									imageUrls.push(url);
								},
								setImageUploadLoading: (loading: boolean) => {
									imageUploadLoading = loading;
								}
							});
						})
					);
				} catch (error) {
					console.error('Error uploading images:', error);
				} finally {
					imageUploadLoading = false;
				}
			} else {
				toast.error('You can upload a maximum of 5 images.');
			}
		}
	}

	function deleteImage(index: number): void {
		imageUrls.splice(index, 1);
	}

	async function handleSubmit(): Promise<void> {
		if (!postContent.trim() && imageUrls.length === 0) {
			toast.error('Please enter content or upload an image.');
			return;
		}

		submitting = true;
		const payload = {
			content: postContent,
			images: imageUrls
		};
		try {
			const res = await api
				.post<Post>('posts', {
					json: payload,
					headers: createAuthHeaders(authToken)
				})
				.json();

			onNewPost(res);
			postContent = '';
			imageUrls = [];
			toast.success('Post created successfully!');
		} catch (error) {
			console.error('Error creating post:', error);
			toast.error('Something went wrong, please try again later!');
		} finally {
			submitting = false;
		}
	}
</script>

<div class="my-6 rounded-lg border border-border bg-background p-4 shadow">
	<input
		type="file"
		accept="image/*"
		class="hidden"
		bind:this={fileInput}
		onchange={handleImageUpload}
		multiple
	/>
	<textarea
		bind:value={postContent}
		placeholder="What's on your mind?"
		rows="4"
		class={cn(inputVariants({ variant: 'empty' }), 'h-24 resize-none')}
	></textarea>

	{#if imageUrls}
		<div class="flex items-center justify-start gap-2">
			{#each imageUrls as imageUrl, i}
				<div class="relative mb-4">
					<img
						src={imageUrl}
						alt="Uploaded file"
						class="size-20 rounded-lg object-cover object-center"
					/>
					<button
						onclick={(): void => deleteImage(i)}
						class="absolute right-0 top-0 rounded-full bg-black bg-opacity-50 p-1 text-white transition-colors hover:bg-opacity-75"
						aria-label="Delete image"
					>
						<Icon icon="solar:close-circle-bold" class="size-5" />
					</button>
					{#if imageUploadLoading}
						<Icon icon="eos-icons:loading" class="mr-2 size-4 animate-spin" />
					{/if}
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
			>
				<Icon icon="solar:gallery-add-bold" class="size-5" />
			</Button>
			<input
				id="file-input"
				type="file"
				accept="image/*"
				multiple={true}
				class="hidden"
				onchange={handleImageUpload}
			/>
			{#if imageUploadLoading}
				<Icon icon="eos-icons:loading" class="ml-2 size-5 animate-spin" />
			{/if}
		</div>
		<Button
			onclick={handleSubmit}
			size="sm"
			isLoading={submitting}
			disabled={submitting || (!postContent.trim() && imageUrls.length === 0)}>Create :)</Button
		>
	</div>
</div>
