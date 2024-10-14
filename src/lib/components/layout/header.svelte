<script lang="ts">
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/cn';
	import { Button, buttonVariants } from '../ui/button';
	import { useNotification } from '$lib/api/use-notification.svelte';
	import { Avatar } from '../ui/avatar';
	import { sessionStore } from '$lib/stores/session.store';
	import { clickOutside } from '$lib/utils';
	import { slide } from 'svelte/transition';

	type Props = {
		authToken: string;
	};
	type NavigationType = {
		path: string;
		icon: string;
		name: string;
	};
	let { authToken }: Props = $props();
	let { resp } = useNotification(authToken);
	let isNotificationDropdownOpen = $state(false);
	let navigation = $state<NavigationType[]>([
		{
			path: '/swiper',
			icon: 'solar:flame-bold-duotone',
			name: 'Meet New People'
		},
		{
			path: '/settings',
			icon: 'solar:settings-bold',
			name: 'Settings'
		}
	]);
</script>

<div class="fixed inset-x-0 top-0 z-[90] h-16 w-full border-b border-border bg-background">
	<header class="container flex items-center justify-between py-3">
		<div use:clickOutside={() => (isNotificationDropdownOpen = false)} class="relative">
			<button
				onclick={() => (isNotificationDropdownOpen = !isNotificationDropdownOpen)}
				class="focus:outline-none"
			>
				<Avatar user={$sessionStore} class="size-9" />
			</button>
			{#if isNotificationDropdownOpen}
				<div
					transition:slide={{ duration: 300 }}
					class="absolute left-0 top-12 z-[120] w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
				>
					<div class="flex flex-col">
						{#each navigation as { name, path, icon }}
							<a
								href={path}
								class={cn(
									buttonVariants({ variant: 'ghost' }),
									'justify-start py-2 text-sm hover:bg-muted'
								)}
							>
								<Icon {icon} class="mr-2 size-4" />
								{name}
							</a>
						{/each}
						<hr class="my-1 border-border" />
						<Button
							variant="ghost"
							class="justify-start py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
						>
							<Icon icon="solar:logout-2-bold" class="mr-2 size-4" />
							Logout
						</Button>
					</div>
				</div>
			{/if}
		</div>
		<a href="/" class="text-lg font-bold text-primary">Vemeet</a>
		<div class="flex items-center justify-center gap-2">
			<a
				class={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), 'relative')}
				href="/messages"
			>
				<Icon icon="solar:chat-square-bold" class="size-6" />
				{#if resp.messageNotification.length > 0}
					<div
						class="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background"
					>
						{resp.messageNotification.length > 9 ? '9+' : resp.messageNotification.length}
					</div>
				{/if}
			</a>
		</div>
	</header>
</div>
