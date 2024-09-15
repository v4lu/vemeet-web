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

<div class="flex items-start justify-between pt-4">
	<div class="flex items-center">
		<div class="relative">
			<div
				aria-label="Upload profile picture"
				class="relative size-fit rounded-full border-[3px] border-white shadow-xl"
			>
				<Avatar class="size-20" {user} />
			</div>
		</div>
		<div class="ml-4">
			<h1 class="text-2xl font-bold">@{user.username}</h1>

			{#if user?.name}
				<p class="text-sm text-muted-foreground">{user.name}</p>
			{/if}
		</div>
	</div>
</div>

{#if user.bio}
	<p class="mt-4 max-w-md text-sm">{user.bio}</p>
{/if}
<div class="mt-4 flex space-x-6 text-sm text-muted-foreground">
	{#if user?.cityName || user?.countryName}
		<span class="flex items-center">
			<Icon icon="solar:map-point-bold" class="mr-2 size-5" />
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
			<Icon icon="ph:egg-crack-duotone" class="mr-2 size-5" />
			{formattedDate}</span
		>
	{/if}
</div>

<div class="mt-4 flex items-center pb-2">
	<div class="mr-8">
		<button
			class="group cursor-pointer"
			disabled={followers.length === 0}
			onclick={() => {
				if (followers.length > 0) {
					isFollowersModalOpen = true;
				}
			}}
		>
			<span class="font-semibold group-hover:text-primary">{followers.length}</span>
			<span class="text-sm text-muted-foreground group-hover:text-primary">Followers</span>
		</button>
	</div>
	<div class="mr-6">
		<button
			disabled={following.length === 0}
			class="group cursor-pointer"
			onclick={() => {
				if (following.length > 0) {
					isFollowingModalOpen = true;
				}
			}}
		>
			<span class="font-semibold group-hover:text-primary">{following.length}</span>
			<span class="text-sm text-muted-foreground group-hover:text-primary">Following</span>
		</button>
	</div>
</div>

<div class="mt-4 flex items-center gap-4 pb-2">
	<Button onclick={() => (isFollowing ? unfollowUser() : followUser())} size="sm" variant="outline">
		<Icon
			icon={isFollowing ? 'solar:user-block-bold' : 'solar:users-group-rounded-bold'}
			class="mr-2 size-4"
		/>
		{isFollowing ? 'Unfollow' : 'Follow'}
	</Button>
	<Button size="sm" variant="outline">
		<Icon icon="solar:chat-line-bold" class="mr-2 size-4" />
		Message</Button
	>
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
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	.hide-scrollbar::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
