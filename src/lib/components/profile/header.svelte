<script lang="ts">
	import { api, createAuthHeaders, uploadImage } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { formatMemberSince } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { User } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';

	type HeaderProps = {
		authToken: string;
	};

	let { authToken }: HeaderProps = $props();

	let formattedDate = $derived(formatMemberSince($sessionStore.birthday));

	let imageUrl = $state('');
	let file: File | null = $state(null);
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);
	let isHovering = $state(false);

	function handleInputFileClick(): void {
		if (!fileInput) return;
		fileInput.click();
	}

	function setImageUrl(url: string): void {
		imageUrl = url;
	}

	function setImageUploadLoading(loadingState: boolean): void {
		imageUploadLoading = loadingState;
	}

	async function handleFileChange(e: Event): Promise<void> {
		const input = e.target as HTMLInputElement;
		if (input.files?.length) {
			file = input.files[0];
			if (authToken) {
				await uploadImage({
					authToken,
					file,
					setImageUrl,
					setImageUploadLoading
				});
			}
		}
	}

	async function saveImage(): Promise<void> {
		if (!imageUrl) return;

		const payload = {
			newImageUrl: imageUrl
		};

		try {
			const res = await api
				.patch<User>('users', {
					json: payload,
					headers: createAuthHeaders(authToken)
				})
				.json();
			sessionStore.setUser(res);
			imageUrl = '';
		} catch (error) {
			console.error(error);
		}
	}
</script>

<div class="flex items-start justify-between">
	<div class="flex items-center">
		<div class="relative">
			<button
				aria-label="Upload profile picture"
				class="relative cursor-pointer rounded-full border-[3px] border-white shadow-xl"
				onclick={handleInputFileClick}
				onmouseenter={(): boolean => (isHovering = true)}
				onmouseleave={(): boolean => (isHovering = false)}
			>
				<img
					height="80"
					width="80"
					class="size-20 rounded-full bg-cover bg-center object-cover object-center"
					src={imageUrl ||
						($sessionStore.profileImage
							? $sessionStore.profileImage.url
							: '/placeholder-user.webp')}
					alt={$sessionStore.username}
				/>
				{#if isHovering && !imageUploadLoading}
					<div
						class="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-900/30 text-neutral-50"
					>
						<Icon icon="solar:upload-linear" class="size-8" />
					</div>
				{/if}
				{#if imageUploadLoading}
					<div
						class="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-900/30 text-neutral-50"
					>
						<Icon icon="eos-icons:loading" class="size-8 animate-spin" />
					</div>
				{/if}
				<input
					type="file"
					accept="image/*"
					class="hidden"
					bind:this={fileInput}
					onchange={handleFileChange}
				/>
			</button>
			{#if imageUrl}
				<div class="absolute -right-1 bottom-0 z-20 flex space-x-1">
					<Button
						size="icon-xs"
						variant="default"
						onclick={saveImage}
						aria-label="Save new profile picture"
					>
						<Icon icon="mdi:check" class="size-4" />
					</Button>
				</div>
			{/if}
		</div>
		<div class="ml-4">
			<h1 class="text-2xl font-bold">@{$sessionStore.username}</h1>

			{#if $sessionStore?.name}
				<p class="text-sm text-muted-foreground">{$sessionStore.name}</p>
			{/if}
		</div>
	</div>
</div>

{#if $sessionStore.bio}
	<p class="mt-4 max-w-md text-sm">{$sessionStore.bio}</p>
{/if}
<div class="mt-4 flex space-x-6 text-sm text-muted-foreground">
	{#if $sessionStore?.cityName || $sessionStore?.countryName}
		<span class="flex items-center">
			<Icon icon="solar:map-point-bold" class="mr-2 size-5" />
			{#if $sessionStore.cityName && $sessionStore.countryName}
				{$sessionStore.cityName}, {$sessionStore.countryName}
			{:else if $sessionStore.cityName}
				{$sessionStore.cityName}
			{:else if $sessionStore.countryName}
				{$sessionStore.countryName}
			{/if}
		</span>
	{/if}

	{#if $sessionStore?.birthday}
		<span class="flex items-center">
			<Icon icon="ph:egg-crack-duotone" class="mr-2 size-5" />
			{formattedDate}</span
		>
	{/if}
</div>
<div class="mt-4 flex items-center pb-2">
	<div class="mr-8">
		<span class="font-semibold">50K</span>
		<span class="text-sm text-muted-foreground">Following</span>
	</div>

	<div class="mr-6">
		<span class="font-semibold">500K</span>
		<span class="text-sm text-muted-foreground">Followers</span>
	</div>
</div>
