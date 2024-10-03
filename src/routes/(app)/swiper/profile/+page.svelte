<script lang="ts">
	import { uploadImage } from '$lib/api.js';
	import { useSwiperProfile } from '$lib/api/use-swiper-profile.svelte';
	import { Button } from '$lib/components/ui/button';
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

{#if resp.isLoading}
	<p>Loading</p>
{:else if resp.user}
	<div class="mb-24 space-y-6">
		<h1 class="mb-6 mt-6 text-2xl font-bold">Your Profile</h1>

		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Main Image</h2>
			<div
				role="button"
				tabindex="0"
				aria-roledescription="click to open image upload"
				class="group relative h-64 w-full cursor-pointer"
				onclick={() => singleFileInput?.click()}
				onkeypress={() => {}}
			>
				<img
					src={mainImageUrl || '/placeholder-user.webp'}
					alt="Main Profile"
					class="h-full w-full rounded-lg object-cover object-center"
				/>
				<div
					class="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<Icon icon="solar:add-circle-bold" class="text-5xl text-white" />
				</div>
				{#if mainImageLoading}
					<div
						class="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50"
					>
						<Icon icon="solar:refresh-circle-bold" class="animate-spin text-5xl text-white" />
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Other Images</h2>
			<div class="grid grid-cols-3 gap-4">
				{#each otherImages as image, index}
					<div class="group relative">
						<img
							src={image}
							alt={`Profile ${index + 1}`}
							class="h-32 w-full rounded-lg object-cover"
						/>
						<button
							class="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							onclick={() => removeImage(index)}
						>
							<Icon icon="solar:trash-bin-trash-bold" class="text-lg" />
						</button>
					</div>
				{/each}
				{#if otherImages.length < 5}
					<button
						class="relative flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors duration-300 hover:border-gray-400 hover:text-gray-500"
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

		<div class="space-y-2">
			<h2 class="text-xl font-semibold">Description</h2>
			<textarea
				bind:value={description}
				class="h-32 w-full resize-none rounded-lg border p-2"
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
			>
				Update Profile
			</Button>
		</div>
	</div>
{/if}
