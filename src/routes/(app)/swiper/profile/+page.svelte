<script lang="ts">
	import Icon from '@iconify/svelte';
	import { useSwiperProfile } from '$lib/api/use-swiper-profile.svelte';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header/index.js';
	import { inputVariants } from '$lib/components/ui/input';
	import type { SwipeProfileUpdate } from '$lib/types/user.types.js';
	import { MainWrapper, SettingsTitle } from '$lib/components/layout';
	import { CropDrawer } from '$lib/components/drawers';
	import { CropModal } from '$lib/components/ui/modals';
	import { toast } from '$lib/stores/toast.store';
	import { uploadImage } from '$lib/api.js';

	let { data } = $props();
	const { resp, updateProfile } = useSwiperProfile(data.accessToken, data.user.id);
	let description = $state(resp.user?.description ?? '');
	let mainImageUrl = $state(resp.user?.mainImageUrl ?? '');
	let otherImages = $state<string[]>(resp.user?.otherImages ?? []);
	let singleFileInput: HTMLInputElement | null = $state(null);
	let multipleFileInput: HTMLInputElement | null = $state(null);
	let mainImageLoading = $state(false);

	let showCropModal = $state(false);
	let currentCropImage = $state<{ file: File; url: string; type: 'main' | 'other' } | null>(null);
	let isMobile = $state(true);
	const CropDialog = $derived(isMobile ? CropDrawer : CropModal);

	let profileChanged = $derived(
		description !== resp.user?.description ||
			mainImageUrl !== resp.user?.mainImageUrl ||
			JSON.stringify(otherImages) !== JSON.stringify(resp.user?.otherImages)
	);

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
			const file = input.files[0];
			currentCropImage = {
				file,
				url: URL.createObjectURL(file),
				type: 'main'
			};
			showCropModal = true;
			input.value = '';
		}
	}

	async function handleOtherImagesUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			if (otherImages.length >= 5) {
				toast.error('You can upload a maximum of 5 images');
				return;
			}
			const file = input.files[0];
			currentCropImage = {
				file,
				url: URL.createObjectURL(file),
				type: 'other'
			};
			showCropModal = true;
			input.value = '';
		}
	}

	async function handleCroppedImage(croppedBlob: Blob): Promise<void> {
		if (!currentCropImage) return;

		const isMainImage = currentCropImage.type === 'main';

		if (isMainImage) {
			mainImageLoading = true;
		}

		try {
			const croppedFile = new File([croppedBlob], currentCropImage.file.name, {
				type: 'image/jpeg'
			});

			await uploadImage({
				authToken: data.accessToken,
				file: croppedFile,
				setImageUploadLoading: () => {},
				setImageUrl: (url) => {
					if (isMainImage) {
						mainImageUrl = url;
					} else {
						otherImages = [...otherImages, url];
					}
				}
			});
		} catch (error) {
			console.error('Error uploading cropped image:', error);
			toast.error('Failed to upload image');
		} finally {
			if (isMainImage) {
				mainImageLoading = false;
			}
			currentCropImage = null;
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

	$effect(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');

		function handleResize(e: MediaQueryListEvent | MediaQueryList) {
			isMobile = e.matches;
		}

		mediaQuery.addEventListener('change', handleResize);
		handleResize(mediaQuery);

		return () => {
			mediaQuery.removeEventListener('change', handleResize);
		};
	});
</script>

<CustomHeaderWithTitle title="Profile Settings" />

<MainWrapper class="bg-card">
	<div class="  space-y-6">
		{#if resp.isLoading}
			<div class="flex h-64 items-center justify-center">
				<Icon icon="solar:spinner-bold" class="size-10 animate-spin text-primary" />
			</div>
		{:else if resp.user}
			<div class="mt-4 space-y-8">
				<div class="flex flex-col">
					<SettingsTitle
						icon="solar:user-id-bold"
						title="Main Profile Image"
						subtitle="This is the first image people will see"
					/>
					<div class="flex flex-col space-y-4 pt-4">
						<div
							role="button"
							tabindex="0"
							aria-roledescription="click to open image upload"
							class="group relative mt-4 h-64 w-fit cursor-pointer overflow-hidden rounded-lg"
							onclick={() => singleFileInput?.click()}
							onkeypress={() => {}}
						>
							<img
								src={mainImageUrl || '/placeholder-user.webp'}
								alt="Main Profile"
								class="aspect-[4/3] h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
							/>
							<div
								class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								<Icon icon="solar:camera-add-bold" class="size-12 text-white" />
							</div>
							{#if mainImageLoading}
								<div
									class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
								>
									<Icon icon="solar:spinner-bold" class="size-12 animate-spin text-white" />
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="flex flex-col">
					<SettingsTitle
						icon="solar:gallery-wide-bold"
						title="Additional Photos"
						subtitle="Add up to 5 more photos to your profile"
					/>
					<div class="flex flex-col space-y-4 pt-4">
						<div class="mt-4 flex w-full flex-wrap gap-4">
							{#each otherImages as image, index}
								<div class="group relative w-fit overflow-hidden rounded-lg md:h-52">
									<img
										src={image}
										alt={`Profile ${index + 1}`}
										class="aspect-[4/3] object-cover object-center transition-transform duration-300 group-hover:scale-105 md:h-52"
									/>
									<button
										class="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
										onclick={() => removeImage(index)}
									>
										<Icon icon="solar:trash-bin-trash-bold" class="size-4" />
									</button>
								</div>
							{/each}
							{#if otherImages.length < 5}
								<button
									class="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 text-muted-foreground transition-colors duration-300 hover:border-primary hover:text-primary md:h-52"
									onclick={() => multipleFileInput?.click()}
								>
									<Icon icon="solar:add-circle-bold" class="size-8" />
								</button>
							{/if}
						</div>
					</div>
				</div>

				<div class="flex flex-col">
					<SettingsTitle
						icon="solar:pen-bold"
						title="About You"
						subtitle="Tell others about yourself"
					/>
					<div class="flex flex-col space-y-4 pt-8">
						<textarea
							bind:value={description}
							class={cn(inputVariants(), 'h-32 w-full resize-none')}
							placeholder="Share your interests, hobbies, or anything else you'd like others to know..."
						></textarea>
					</div>
				</div>
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
					size="lg"
					class="w-full"
					isLoading={resp.isSubmittingUpdate}
				>
					{#if resp.isSubmittingUpdate}
						Updating...
					{:else}
						Save Changes
					{/if}
				</Button>
			</div>
		{/if}
	</div>
</MainWrapper>

{#if showCropModal && currentCropImage}
	<CropDialog
		imageUrl={currentCropImage.url}
		aspectRatio={4 / 3}
		onClose={() => {
			showCropModal = false;
			currentCropImage = null;
		}}
		onCrop={handleCroppedImage}
	/>
{/if}
