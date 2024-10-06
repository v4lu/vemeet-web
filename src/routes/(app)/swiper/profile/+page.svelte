<script lang="ts">
	import { uploadImage } from '$lib/api.js';
	import { useSwiperProfile } from '$lib/api/use-swiper-profile.svelte';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { inputVariants } from '$lib/components/ui/input';
	import type { SwipeProfileUpdate } from '$lib/types/user.types.js';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	const { resp, updateProfile } = useSwiperProfile(data.accessToken, data.user.id);
	let description = $state(resp.user?.description ?? '');
	let mainImageUrl = $state(resp.user?.mainImageUrl ?? '');
	let otherImages = $state<string[]>(resp.user?.otherImages ?? []);
	let singleFileInput: HTMLInputElement | null = $state(null);
	let multipleFileInput: HTMLInputElement | null = $state(null);
	let mainImageLoading = $state(false);
	let otherImagesLoading = $state(false);

	async function handleUpdateProfile() {
		const payload: SwipeProfileUpdate = {
			description,
			otherImages,
			mainImageUrl
		};
		await updateProfile(payload);
	}

	async function handleMainImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			mainImageLoading = true;
			try {
				await uploadImage({
					authToken: data.accessToken,
					file: input.files[0],
					setImageUrl: (url) => (mainImageUrl = url),
					setImageUploadLoading: () => {}
				});
			} catch (error) {
				console.error('Error uploading main image:', error);
			} finally {
				mainImageLoading = false;
			}
		}
	}

	async function handleOtherImagesUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			otherImagesLoading = true;
			try {
				for (let i = 0; i < input.files.length; i++) {
					if (otherImages.length >= 5) break;
					await uploadImage({
						authToken: data.accessToken,
						file: input.files[i],
						setImageUrl: (url) => {
							otherImages = [...otherImages, url];
						},
						setImageUploadLoading: () => {}
					});
				}
			} catch (error) {
				console.error('Error uploading other images:', error);
			} finally {
				otherImagesLoading = false;
			}
		}
	}

	function removeImage(index: number): void {
		otherImages = otherImages.filter((_, i) => i !== index);
	}

	$effect(() => {
		description = resp.user?.description ?? '';
		mainImageUrl = resp.user?.mainImageUrl ?? '';
		otherImages = resp.user?.otherImages ?? [];
	});

	let profileChanged = $derived(
		description !== resp.user?.description ||
			mainImageUrl !== resp.user?.mainImageUrl ||
			JSON.stringify(otherImages) !== JSON.stringify(resp.user?.otherImages)
	);
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	{#if resp.isLoading}
		<div class="flex h-64 items-center justify-center">
			<Icon icon="solar:refresh-circle-bold" class="animate-spin text-5xl text-primary" />
		</div>
	{:else if resp.user}
		<div class="space-y-8">
			<h1 class="text-3xl font-bold text-primary">Your Profile</h1>

			<div class="rounded-lg bg-card p-6 shadow-lg">
				<h2 class="mb-4 text-xl font-semibold">Main Image</h2>
				<div
					role="button"
					tabindex="0"
					aria-roledescription="click to open image upload"
					class="group relative h-64 w-full cursor-pointer overflow-hidden rounded-lg"
					onclick={() => singleFileInput?.click()}
					onkeypress={() => {}}
				>
					<img
						src={mainImageUrl || '/placeholder-user.webp'}
						alt="Main Profile"
						class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
					/>
					<div
						class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						<Icon icon="solar:camera-add-bold" class="text-5xl text-white" />
					</div>
					{#if mainImageLoading}
						<div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
							<Icon icon="solar:refresh-circle-bold" class="animate-spin text-5xl text-white" />
						</div>
					{/if}
				</div>
			</div>

			<div class="rounded-lg bg-card p-6 shadow-lg">
				<h2 class="mb-4 text-xl font-semibold">Other Images</h2>
				<div class="grid grid-cols-3 gap-4">
					{#each otherImages as image, index}
						<div class="group relative h-32 overflow-hidden rounded-lg">
							<img
								src={image}
								alt={`Profile ${index + 1}`}
								class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
							/>
							<button
								class="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								onclick={() => removeImage(index)}
							>
								<Icon icon="solar:trash-bin-trash-bold" class="text-lg" />
							</button>
						</div>
					{/each}
					{#if otherImages.length < 5}
						<button
							class="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 text-muted-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
							onclick={() => multipleFileInput?.click()}
						>
							<Icon icon="solar:add-circle-bold" class="text-3xl" />
							{#if otherImagesLoading}
								<div
									class="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50"
								>
									<Icon icon="solar:refresh-circle-bold" class="animate-spin text-3xl text-white" />
								</div>
							{/if}
						</button>
					{/if}
				</div>
			</div>

			<div class="rounded-lg bg-card p-6 shadow-lg">
				<h2 class="mb-4 text-xl font-semibold">Description</h2>
				<textarea
					bind:value={description}
					class={cn(inputVariants(), 'h-32 w-full resize-none')}
					placeholder="Tell us about yourself..."
				></textarea>
			</div>

			<input
				type="file"
				accept="image/*,.heic,.heif"
				class="hidden"
				bind:this={singleFileInput}
				onchange={handleMainImageUpload}
			/>
			<input
				type="file"
				accept="image/*,.heic,.heif"
				multiple
				class="hidden"
				bind:this={multipleFileInput}
				onchange={handleOtherImagesUpload}
			/>

			<div class="flex justify-end">
				<Button
					onclick={handleUpdateProfile}
					disabled={!profileChanged || resp.isSubmittingUpdate}
					isLoading={resp.isSubmittingUpdate}
					class="px-6 py-2"
				>
					{#if resp.isSubmittingUpdate}
						<Icon icon="solar:refresh-circle-bold" class="mr-2 animate-spin" />
						Updating...
					{:else}
						<Icon icon="solar:user-check-rounded-bold" class="mr-2" />
						Update Profile
					{/if}
				</Button>
			</div>
		</div>
	{/if}
</div>
