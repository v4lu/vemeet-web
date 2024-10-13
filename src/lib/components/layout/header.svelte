<script lang="ts">
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/cn';
	import { buttonVariants } from '../ui/button';
	import { useNotification } from '$lib/api/use-notification.svelte';
	import { formatTimestamp } from '$lib/date';
	import { Avatar } from '../ui/avatar';
	import { onMount } from 'svelte';

	type Props = {
		pathname: string;
		authToken: string;
	};
	type NavigationType = {
		path: string;
		icon: string;
	};
	let { pathname, authToken }: Props = $props();
	let { resp } = useNotification(authToken);
	let navigation = $state<NavigationType[]>([
		{
			path: '/messages',
			icon: 'solar:chat-square-bold'
		}
	]);
	let isNotificationDropdownOpen = $state(false);
	let notificationButton = $state<HTMLButtonElement>();
	let dropdownContent = $state<HTMLDivElement>();

	function toggleDropdown() {
		isNotificationDropdownOpen = !isNotificationDropdownOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		if (!notificationButton || !dropdownContent) return;
		if (
			isNotificationDropdownOpen &&
			!notificationButton.contains(event.target as Node) &&
			!dropdownContent.contains(event.target as Node)
		) {
			isNotificationDropdownOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="fixed inset-x-0 top-0 z-[90] w-full border-b border-border bg-background">
	<header class="container flex items-center justify-between py-3">
		<a href="/" class="text-lg font-bold text-primary">Vemeet</a>
		<div class="flex items-center justify-center gap-2">
			<div class="relative">
				<button
					bind:this={notificationButton}
					class={cn(
						buttonVariants({ size: 'icon', variant: 'ghost' }),
						'ml-none mr-none max-h-10 min-w-10 max-w-10 items-center justify-center p-0'
					)}
					onclick={toggleDropdown}
				>
					<Icon icon="solar:bell-bold" class="size-6" />
					{#if resp.nonMessageNotification.length > 0}
						<div
							class="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background"
						>
							{resp.nonMessageNotification.length > 9 ? '9+' : resp.nonMessageNotification.length}
						</div>
					{/if}
				</button>
				{#if isNotificationDropdownOpen}
					<div
						bind:this={dropdownContent}
						class="absolute right-0 top-12 z-[120] w-80 rounded-md border border-border bg-card p-2 shadow-md"
					>
						<div class="hide-scrollbar max-h-[20rem] overflow-y-auto">
							{#if resp.nonMessageNotification.length === 0}
								<p class="p-4 text-center text-muted-foreground">No new notifications</p>
							{:else}
								{#each resp.nonMessageNotification as notification (notification.id)}
									<div class="mb-2 rounded-lg border border-border p-3 hover:bg-accent">
										<div class="flex items-center gap-3">
											<Avatar user={notification.user} class="size-10" />
											<div class="flex-1">
												<p class="text-sm font-medium">{notification.content}</p>
												<p class="text-xs text-muted-foreground">
													{formatTimestamp(notification.createdAt)}
												</p>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			</div>
			{#each navigation as { path, icon }}
				<a class={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), 'relative')} href={path}>
					<Icon {icon} class="size-6" />
					{#if path === '/messages' && resp.messageNotification.length > 0}
						<div
							class="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background"
						>
							{resp.messageNotification.length > 9 ? '9+' : resp.messageNotification.length}
						</div>
					{/if}
				</a>
			{/each}
		</div>
	</header>
</div>

<style lang="postcss">
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
