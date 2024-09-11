<script lang="ts">
	import { cn } from '$lib/cn';
	import { buttonVariants } from '$lib/components/ui/button';
	import { formatMemberSince } from '$lib/date';
	import type { User } from '$lib/types/user.types';
	import Icon from '@iconify/svelte';
	import { MediaQuery } from 'runed';

	type HeaderProps = {
		user: User;
	};

	let { user }: HeaderProps = $props();
	let formattedDate = $derived(formatMemberSince(user.birthday));
	const screen = new MediaQuery('(min-width: 640px)');
</script>

<div class="flex items-start justify-between">
	<div class="flex items-center">
		<div class="rounded-full shadow-lg">
			<img
				height="80"
				width="80"
				class="size-20 rounded-full"
				src={user.profileImage ? user.profileImage.url : '/placeholder-user.webp'}
				alt={user.username}
			/>
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
	<span class="flex items-center">
		<Icon icon="solar:map-point-outline" class="mr-1 size-5" />
		Wuppertal my tal
	</span>

	<span class="flex items-center">
		<Icon icon="heroicons:cake" class="mr-1 size-5" />
		{formattedDate}</span
	>
</div>
<div class="mt-4 flex items-center">
	<div class="mr-8">
		<span class="font-semibold">50K</span>
		<span class="text-sm text-muted-foreground">Following</span>
	</div>

	<div class="mr-6">
		<span class="font-semibold">500K</span>
		<span class="text-sm text-muted-foreground">Followers</span>
	</div>

	<a href="/settings" class={buttonVariants({ size: 'sm' })}>
		<Icon icon="solar:settings-bold" class={cn('size-4', screen.matches && 'mr-2')} />
		<span class={cn(!screen.matches && 'hidden')}>Settings</span>
	</a>
</div>
