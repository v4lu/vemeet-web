<script lang="ts">
	import { uploadImage } from '$lib/api.js';
	import { useSwiperProfile } from '$lib/api/use-swiper-profile.svelte';
	import { cn } from '$lib/cn';
	import { Button } from '$lib/components/ui/button';
	import { CustomHeaderWithTitle } from '$lib/components/ui/custom-header/index.js';
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

<CustomHeaderWithTitle title="Profile Settings" />

<div
	class="my-6 min-h-full bg-background px-4 py-4 sm:px-6 lg:border-x lg:border-border lg:bg-card lg:px-8"
>
	<div class="mx-auto max-w-3xl space-y-6">
		<div class="space-y-2">
			<p class="text-sm text-muted-foreground">
				Customize your profile to help others get to know you better
			</p>
		</div>

		{#if resp.isLoading}
			<div class="flex h-64 items-center justify-center">
				<Icon icon="solar:spinner-bold" class="size-10 animate-spin text-primary" />
			</div>
		{:else if resp.user}
			<div class="space-y-4 rounded-lg border bg-card shadow-sm sm:p-6">
				<div
					class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0"
				>
					<div
						class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
					>
						<Icon icon="solar:user-id-bold" class="size-5 sm:size-6" />
					</div>
					<div class="flex flex-1 flex-col space-y-4">
						<div>
							<h3 class="text-base font-medium text-foreground sm:text-lg">Main Profile Image</h3>
							<p class="text-sm text-muted-foreground">This is the first image people will see</p>
							<div
								role="button"
								tabindex="0"
								aria-roledescription="click to open image upload"
								class="group relative mt-4 h-64 w-full cursor-pointer overflow-hidden rounded-lg"
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
				</div>

				<div class="border-t"></div>

				<div
					class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0"
				>
					<div
						class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
					>
						<Icon icon="solar:gallery-wide-bold" class="size-5 sm:size-6" />
					</div>
					<div class="flex flex-1 flex-col space-y-4">
						<div>
							<h3 class="text-base font-medium text-foreground sm:text-lg">Additional Photos</h3>
							<p class="text-sm text-muted-foreground">Add up to 5 more photos to your profile</p>
							<div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
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
											<Icon icon="solar:trash-bin-trash-bold" class="size-4" />
										</button>
									</div>
								{/each}
								{#if otherImages.length < 5}
									<button
										class="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 text-muted-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
										onclick={() => multipleFileInput?.click()}
									>
										<Icon icon="solar:add-circle-bold" class="size-8" />
									</button>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<div class="border-t"></div>

				<div
					class="flex flex-col space-y-4 p-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0"
				>
					<div
						class="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-12"
					>
						<Icon icon="solar:pen-bold" class="size-5 sm:size-6" />
					</div>
					<div class="flex flex-1 flex-col space-y-2">
						<h3 class="text-base font-medium text-foreground sm:text-lg">About You</h3>
						<p class="text-sm text-muted-foreground">Tell others about yourself</p>
						<textarea
							bind:value={description}
							class={cn(inputVariants(), 'h-32 w-full resize-none')}
							placeholder="Share your interests, hobbies, or anything else you'd like others to know..."
						></textarea>
					</div>
				</div>
			</div>

			<div class="rounded-lg border bg-card/50 p-4">
				<div class="flex items-start space-x-2">
					<Icon icon="solar:info-circle-bold" class="mt-1 size-5 text-muted-foreground" />
					<div class="flex-1 text-sm text-muted-foreground">
						<p>
							Your profile helps others get to know you better. Add photos and a description that
							best represent you.
						</p>
						<p class="mt-2">
							All changes will be saved automatically when you update your profile.
						</p>
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
					class="px-6"
				>
					{#if resp.isSubmittingUpdate}
						<Icon icon="solar:spinner-bold" class="mr-2 size-4 animate-spin" />
						Updating...
					{:else}
						<Icon icon="solar:check-circle-bold" class="mr-2 size-5" />
						Save Changes
					{/if}
				</Button>
			</div>
		{/if}
	</div>
</div>
