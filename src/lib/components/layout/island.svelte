<script lang="ts">
	import { cn } from '$lib/cn';
	import Icon from '@iconify/svelte';
	import { buttonVariants } from '../ui/button';

	type Props = {
		pathname: string;
	};
	type NavigationType = {
		path: string;
		icon: string;
	};

	let navigation = $state<NavigationType[]>([
		{
			path: '/',
			icon: 'solar:home-angle-2-bold'
		},
		{
			path: '/explore',
			icon: 'solar:rounded-magnifer-bold'
		},
		{
			path: '/swiper',
			icon: 'solar:flame-bold-duotone'
		},
		{
			path: '/profile',
			icon: 'solar:user-bold'
		},
		{
			path: '/settings',
			icon: 'solar:settings-bold'
		}
	]);

	let { pathname }: Props = $props();
</script>

{#if !pathname.startsWith('/swiper')}
	<div class="fixed bottom-0 left-0 right-0 border-t bg-background px-4 py-3 shadow-md">
		<div class="container mx-auto flex items-center justify-between">
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
	</div>
{/if}
