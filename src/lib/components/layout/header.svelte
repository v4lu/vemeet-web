<script lang="ts">
	import Icon from '@iconify/svelte';

	import { cn } from '$lib/cn';
	import { buttonVariants } from '../ui/button';

	type Props = {
		pathname: string;
	};
	type NavigationType = {
		path: string;
		icon: string;
	};

	let { pathname }: Props = $props();

	let navigation = $state<NavigationType[]>([
		{
			path: '/notifications',
			icon: 'solar:bell-bold'
		},
		{
			path: '/messages',
			icon: 'solar:chat-square-bold'
		}
	]);
</script>

<div class="fixed inset-x-0 top-0 z-[90] w-full border-b border-border bg-background">
	<header class="container flex items-center justify-between py-3">
		<a href="/" class="text-lg font-bold text-primary">Vemeet</a>
		<div class="flex items-center justify-center gap-2">
			{#each navigation as { path, icon }}
				<a
					class={cn(
						pathname === path && 'text-primary',
						buttonVariants({ size: 'icon', variant: 'ghost' })
					)}
					href={path}
				>
					<Icon {icon} class="size-6" />
				</a>
			{/each}
		</div>
	</header>
</div>
