<script lang="ts">
	import { uploadImage } from '$lib/api';
	import { toast } from '$lib/stores/toast.store';
	import type { CreateLocation } from '$lib/types/geo.types';
	import { clickOutside } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Modal } from '../ui/modals';

	type Props = {
		createLocation: (payload: CreateLocation) => Promise<void>;
		onClose: () => void;
		authToken: string;
	};
	let { createLocation, onClose, authToken }: Props = $props();

	let name = $state('');
	let description = $state('');
	let address = $state('');
	let city = $state('');
	let country = $state('');
	let latitude = $state<number | null>(null);
	let longitude = $state<number | null>(null);
	let type = $state('');
	let websiteUrl = $state('');
	let phoneNumber = $state('');
	let openingHours = $state('');
	let priceRange = $state('');
	let imageUrls = $state<string[]>([]);

	let addressSuggestions = $state<any[]>([]);
	let showSuggestions = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);

	async function searchAddress() {
		if (!address || address.length < 3) {
			addressSuggestions = [];
			showSuggestions = false;
			return;
		}

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`
			);
			addressSuggestions = await response.json();
			showSuggestions = addressSuggestions.length > 0;
		} catch (error) {
			console.error('Error fetching address suggestions:', error);
			toast.error('Failed to fetch address suggestions');
		}
	}

	function selectAddress(suggestion: any) {
		address = suggestion.display_name;
		latitude = Number.parseFloat(suggestion.lat);
		longitude = Number.parseFloat(suggestion.lon);

		if (suggestion.address) {
			city = suggestion.address.city || suggestion.address.town || suggestion.address.village || '';
			country = suggestion.address.country || '';
		} else {
			const parts = suggestion.display_name.split(', ');
			city = parts[parts.length - 3] || '';
			country = parts[parts.length - 1] || '';
		}

		showSuggestions = false;
	}

	function handleClickOutside() {
		showSuggestions = false;
	}

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

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!name || !address || !type || latitude === null || longitude === null) {
			toast.error('Please fill in all required fields');
			return;
		}

		const newLocation: CreateLocation = {
			name,
			description,
			address,
			city,
			country,
			latitude,
			longitude,
			type,
			websiteUrl,
			phoneNumber,
			openingHours,
			priceRange,
			images: imageUrls
		};

		try {
			await createLocation(newLocation);
			toast.success('Location created successfully!');
			onClose();
		} catch (error) {
			console.error('Error creating location:', error);
			toast.error('Failed to create location');
		}
	}
</script>

<Modal {onClose} class="flex h-[600px] w-full max-w-md flex-col">
	<div class="flex-shrink-0 border-b border-border p-4">
		<h2 class="text-2xl font-bold">Add New Vegan Location</h2>
	</div>
	<form onsubmit={handleSubmit} class="flex flex-grow flex-col overflow-hidden">
		<div class="flex-grow space-y-4 overflow-y-auto p-4">
			<Input bind:value={name} placeholder="Name" required />
			<Input bind:value={description} placeholder="Description" />
			<div class="space-y-2" use:clickOutside={handleClickOutside}>
				<Input bind:value={address} placeholder="Address" required oninput={searchAddress} />
				{#if showSuggestions}
					<ul
						class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-sm shadow-md"
					>
						{#each addressSuggestions as suggestion}
							<li
								class="cursor-pointer px-4 py-2 hover:bg-muted"
								onclick={() => selectAddress(suggestion)}
							>
								{suggestion.display_name}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<Input bind:value={type} placeholder="Type (e.g., Restaurant, Cafe)" required />
			<Input bind:value={websiteUrl} type="url" placeholder="Website URL" />
			<Input bind:value={phoneNumber} type="tel" placeholder="Phone Number" />
			<Input bind:value={openingHours} placeholder="Opening Hours" />
			<Input bind:value={priceRange} placeholder="Price Range" />

			<div class="space-y-2">
				<label class="text-sm font-medium">Images</label>
				{#if imageUrls.length > 0}
					<div class="mb-4 flex flex-wrap gap-2">
						{#each imageUrls as imageUrl, i}
							<div class="relative h-24 w-24 overflow-hidden rounded-lg">
								<img
									src={imageUrl}
									alt="Location"
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
				<div class="flex items-center gap-2">
					<Button
						type="button"
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
						accept="image/*"
					/>
					{#if imageUploadLoading}
						<Icon icon="eos-icons:loading" class="ml-2 size-5 animate-spin text-primary" />
					{/if}
				</div>
			</div>
		</div>
		<div class="flex-shrink-0 border-t border-border bg-card p-4">
			<div class="flex justify-end space-x-2">
				<Button variant="outline" onclick={onClose} type="button">Cancel</Button>
				<Button type="submit">Create Location</Button>
			</div>
		</div>
	</form>
</Modal>
