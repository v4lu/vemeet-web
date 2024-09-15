<script lang="ts">
	import { api, createAuthHeaders, uploadImage } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { formatBday } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { ResponseFollowStats } from '$lib/types/follow.types';
	import type { User } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { UserHorizontalCard } from '../cards';
	import { Modal } from '../ui/modals';
	import { Skeleton } from '../ui/skeleton';

	type HeaderProps = {
		authToken: string;
	};

	let { authToken }: HeaderProps = $props();

	let formattedDate = $derived(formatBday($sessionStore.birthday));

	let imageUrl = $state('');
	let fileInput: HTMLInputElement | null = $state(null);
	let imageUploadLoading = $state(false);
	let isHovering = $state(false);
	let followStats = $state<ResponseFollowStats>();
	let followStatsLoading = $state(false);

	let isFollowersModalOpen = $state(false);
	let isFollowingModalOpen = $state(false);
	let followers: User[] = $state([]);
	let following: User[] = $state([]);
	let isLoading = $state(false);

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

	async function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.length) {
			await uploadImage({
				authToken,
				file: input.files[0],
				setImageUrl,
				setImageUploadLoading
			});
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

	async function loadFollowStats() {
		followStatsLoading = true;
		const res = await api
			.get<ResponseFollowStats>(`followers/stats/${$sessionStore.id}`, {
				headers: createAuthHeaders(authToken)
			})
			.json();
		followStats = res;
		followStatsLoading = false;
	}

	onMount(() => loadFollowStats());

	async function fetchFollowers() {
		isLoading = true;
		try {
			const res = await api
				.get<User[]>(`followers/followers/${$sessionStore.id}`, {
					headers: createAuthHeaders(authToken)
				})
				.json();
			followers = res;
		} catch (error) {
			console.error('Failed to fetch followers:', error);
		} finally {
			isLoading = false;
		}
	}

	async function fetchFollowing() {
		isLoading = true;
		try {
			const res = await api
				.get<User[]>(`followers/following/${$sessionStore.id}`, {
					headers: createAuthHeaders(authToken)
				})
				.json();
			following = res;
		} catch (error) {
			console.error('Failed to fetch following:', error);
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		if (isFollowersModalOpen) {
			fetchFollowers();
		}
	});

	$effect(() => {
		if (isFollowingModalOpen) {
			fetchFollowing();
		}
	});
</script>

<div class="flex items-start justify-between pt-4">
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
					accept="image/*,.heic,.heif"
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
		{#if followStatsLoading}
			<Skeleton class="h-6 w-20" />
		{:else}
			<button
				class="group cursor-pointer"
				disabled={!followStats || followStats.followerCount === 0}
				onclick={() => {
					if (followStats && followStats.followerCount > 0) {
						isFollowersModalOpen = true;
					}
				}}
			>
				<span class="font-semibold group-hover:text-primary">{followStats?.followerCount}</span>
				<span class="text-sm text-muted-foreground group-hover:text-primary">Followers</span>
			</button>
		{/if}
	</div>
	<div class="mr-6">
		{#if followStatsLoading}
			<Skeleton class="h-6 w-20" />
		{:else}
			<button
				disabled={!followStats || followStats.followingCount === 0}
				class="group cursor-pointer"
				onclick={() => {
					if (followStats && followStats.followingCount > 0) {
						isFollowingModalOpen = true;
					}
				}}
			>
				<span class="font-semibold group-hover:text-primary">{followStats?.followingCount}</span>
				<span class="text-sm text-muted-foreground group-hover:text-primary">Following</span>
			</button>
		{/if}
	</div>
</div>

{#if isFollowersModalOpen}
	<Modal onClose={() => (isFollowersModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Followers</h2>
			<div class="grid gap-2">
				{#if isLoading}
					<p>Loading followers...</p>
				{:else}
					{#each followers as user}
						<UserHorizontalCard {user} />
					{/each}
				{/if}
			</div>
		</div>
	</Modal>
{/if}

{#if isFollowingModalOpen}
	<Modal onClose={() => (isFollowingModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Following</h2>
			<div class="grid gap-2">
				{#if isLoading}
					<p>Loading following...</p>
				{:else}
					{#each following as user}
						<UserHorizontalCard {user} />
					{/each}
				{/if}
			</div>
		</div>
	</Modal>
{/if}

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	.hide-scrollbar::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
