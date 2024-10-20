<script lang="ts">
	import { api, createAuthHeaders, uploadImage } from '$lib/api';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { formatBday } from '$lib/date';
	import { sessionStore } from '$lib/stores/session.store';
	import type { ResponseFollowStats } from '$lib/types/follow.types';
	import type { User } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { UserHorizontalCard } from '../cards';
	import { Avatar } from '../ui/avatar';
	import { Skeleton } from '../ui/skeleton';
	import { cn } from '$lib/cn';
	import { Drawer } from '../ui/drawer';

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

<div class="rounded-t-xl">
	<div
		class="relative flex flex-col items-start px-6 pt-6 sm:flex-row sm:items-center sm:justify-between"
	>
		<a
			href="/settings"
			class={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'absolute right-4 top-8')}
		>
			<Icon icon="solar:settings-bold" class="mr-2 size-5" />
			Settings
		</a>
		<div class="flex items-center">
			<div class="relative">
				<button
					aria-label="Upload profile picture"
					class="relative cursor-pointer rounded-full transition-transform duration-300 hover:scale-105"
					onclick={handleInputFileClick}
					onmouseenter={() => (isHovering = true)}
					onmouseleave={() => (isHovering = false)}
				>
					{#if imageUrl || $sessionStore.profileImage}
						<img
							height="96"
							width="96"
							class="size-24 rounded-full bg-cover bg-center object-cover object-center"
							src={imageUrl || $sessionStore.profileImage?.url}
							alt={$sessionStore.username}
						/>
					{:else}
						<Avatar class="size-24" user={$sessionStore} />
					{/if}
					{#if isHovering && !imageUploadLoading}
						<div
							class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white transition-opacity duration-300"
						>
							<Icon icon="solar:upload-linear" class="size-8" />
						</div>
					{/if}
					{#if imageUploadLoading}
						<div
							class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white"
						>
							<Icon icon="eos-icons:loading" class="size-8 animate-spin" />
						</div>
					{/if}
				</button>
				<input
					type="file"
					accept="image/*,.heic,.heif"
					class="hidden"
					bind:this={fileInput}
					onchange={handleFileChange}
				/>
				{#if imageUrl}
					<div class="absolute -right-1 bottom-0 z-20 flex space-x-1">
						<Button
							size="icon-sm"
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
				<h1 class="text-2xl font-bold text-foreground">@{$sessionStore.username}</h1>
				{#if $sessionStore?.name}
					<p class="text-sm text-muted-foreground">{$sessionStore.name}</p>
				{/if}
			</div>
		</div>
	</div>

	{#if $sessionStore.bio}
		<p class="mt-4 max-w-2xl px-6 text-muted-foreground">{$sessionStore.bio}</p>
	{/if}

	<div class="mt-4 flex flex-wrap gap-4 px-6 text-sm text-muted-foreground">
		{#if $sessionStore?.cityName || $sessionStore?.countryName}
			<span class="flex items-center font-semibold">
				<Icon icon="solar:map-point-bold" class="mr-2 size-6 text-primary" />
				<span class="mr-1 text-xl">{$sessionStore.countryFlag}</span>
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
			<span class="flex items-center font-semibold">
				<Icon icon="ph:egg-crack-duotone" class="mr-2 size-6 text-primary" />
				{formattedDate}
			</span>
		{/if}
	</div>

	<div class="mt-6 flex items-center space-x-6 border-t border-border px-6 py-3">
		{#if followStatsLoading}
			<Skeleton class="h-8 w-24" />
			<Skeleton class="h-8 w-24" />
		{:else}
			<button
				class="group flex items-center"
				disabled={!followStats || followStats.followerCount === 0}
				onclick={() => {
					if (followStats && followStats.followerCount > 0) {
						isFollowersModalOpen = true;
					}
				}}
			>
				<span class="text-lg font-semibold text-foreground group-hover:text-primary"
					>{followStats?.followerCount}</span
				>
				<span class="ml-2 text-sm text-muted-foreground group-hover:text-primary">Followers</span>
			</button>
			<button
				class="group flex items-center"
				disabled={!followStats || followStats.followingCount === 0}
				onclick={() => {
					if (followStats && followStats.followingCount > 0) {
						isFollowingModalOpen = true;
					}
				}}
			>
				<span class="text-lg font-semibold text-foreground group-hover:text-primary"
					>{followStats?.followingCount}</span
				>
				<span class="ml-2 text-sm text-muted-foreground group-hover:text-primary">Following</span>
			</button>
		{/if}
	</div>
</div>

{#if isFollowersModalOpen}
	<Drawer class="h-2/3" onClose={() => (isFollowersModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] w-[18rem] overflow-y-auto">
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
	</Drawer>
{/if}

{#if isFollowingModalOpen}
	<Drawer class="h-2/3" onClose={() => (isFollowingModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] w-[18rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Following</h2>
			<div class="grid w-full gap-2">
				{#if isLoading}
					<p>Loading following...</p>
				{:else}
					{#each following as user}
						<UserHorizontalCard {user} />
					{/each}
				{/if}
			</div>
		</div>
	</Drawer>
{/if}

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
