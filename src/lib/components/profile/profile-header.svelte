<script lang="ts">
	import { formatBday } from '$lib/date';
	import type { User } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';
	import { UserHorizontalCard } from '../cards';
	import { Avatar } from '../ui/avatar';
	import { Button } from '../ui/button';
	import Modal from '../ui/modals/modal.svelte';

	type ProfileHeaderProps = {
		user: User;
		followers: User[];
		following: User[];
		unfollowUser: () => void;
		followUser: () => void;
		isFollowing: boolean;
	};
	let { user, followers, following, followUser, unfollowUser, isFollowing }: ProfileHeaderProps =
		$props();
	let formattedDate = $derived(formatBday(user.birthday));
	let isFollowersModalOpen = $state(false);
	let isFollowingModalOpen = $state(false);
</script>

<div class="rounded-t-xl">
	<div class="flex flex-col items-start px-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center">
			<div class="relative">
				<Avatar class="size-24 " {user} />
			</div>
			<div class="ml-4">
				<h1 class="text-2xl font-bold text-foreground">@{user.username}</h1>
				{#if user?.name}
					<p class="text-sm text-muted-foreground">{user.name}</p>
				{/if}
			</div>
		</div>
		<div class="mt-4 flex flex-wrap gap-3 py-1 sm:mt-0">
			<Button
				onclick={() => (isFollowing ? unfollowUser() : followUser())}
				size="sm"
				variant={isFollowing ? 'outline' : 'default'}
				class="min-w-[120px] transition-all duration-300 ease-in-out hover:shadow-md"
			>
				<Icon
					icon={isFollowing ? 'solar:user-block-bold' : 'solar:users-group-rounded-bold'}
					class="mr-2 size-4"
				/>
				<span class="font-medium">
					{isFollowing ? 'Unfollow' : 'Follow'}
				</span>
			</Button>
			<Button
				size="sm"
				variant="outline"
				class="min-w-[120px] transition-all duration-300 ease-in-out hover:bg-primary hover:text-primary-foreground hover:shadow-md"
			>
				<Icon icon="solar:chat-line-bold" class="mr-2 size-4" />
				<span class="font-medium">Message</span>
			</Button>
		</div>
	</div>

	{#if user.bio}
		<p class="mt-4 max-w-2xl px-6 text-muted-foreground">{user.bio}</p>
	{/if}

	<div class="mt-4 flex flex-wrap gap-4 px-6 text-sm text-muted-foreground">
		{#if user?.cityName || user?.countryName}
			<span class="flex items-center">
				<Icon icon="solar:map-point-bold" class="mr-2 size-6 text-primary" />
				<span class="mr-1 text-xl">{user.countryFlag}</span>
				{#if user.cityName && user.countryName}
					{user.cityName}, {user.countryName}
				{:else if user.cityName}
					{user.cityName}
				{:else if user.countryName}
					{user.countryName}
				{/if}
			</span>
		{/if}

		{#if user?.birthday}
			<span class="flex items-center">
				<Icon icon="ph:egg-crack-duotone" class="mr-2 size-6 text-primary" />
				{formattedDate}
			</span>
		{/if}
	</div>

	<div class="mt-6 flex items-center space-x-6 border-t border-border px-6 py-3">
		<button
			class="group flex items-center"
			disabled={followers.length === 0}
			onclick={() => {
				if (followers.length > 0) {
					isFollowersModalOpen = true;
				}
			}}
		>
			<span class="text-lg font-semibold text-foreground group-hover:text-primary"
				>{followers.length}</span
			>
			<span class="ml-2 text-sm text-muted-foreground group-hover:text-primary">Followers</span>
		</button>
		<button
			class="group flex items-center"
			disabled={following.length === 0}
			onclick={() => {
				if (following.length > 0) {
					isFollowingModalOpen = true;
				}
			}}
		>
			<span class="text-lg font-semibold text-foreground group-hover:text-primary"
				>{following.length}</span
			>
			<span class="ml-2 text-sm text-muted-foreground group-hover:text-primary">Following</span>
		</button>
	</div>
</div>

{#if isFollowersModalOpen}
	<Modal onClose={() => (isFollowersModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Followers</h2>
			<div class="grid gap-2">
				{#each followers as user}
					<UserHorizontalCard {user} />
				{/each}
			</div>
		</div>
	</Modal>
{/if}

{#if isFollowingModalOpen}
	<Modal onClose={() => (isFollowingModalOpen = false)}>
		<div class="hide-scrollbar max-h-[25rem] overflow-y-auto">
			<h2 class="mb-4 text-xl font-semibold">Following</h2>
			<div class="grid gap-2">
				{#each following as user}
					<UserHorizontalCard {user} />
				{/each}
			</div>
		</div>
	</Modal>
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
