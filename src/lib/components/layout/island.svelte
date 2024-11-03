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
			path: '/map',
			icon: 'solar:map-point-bold'
		},
		{
			path: '/profile',
			icon: 'solar:user-bold'
		}
	]);

	let { pathname }: Props = $props();
</script>

<div
	class="container fixed bottom-0 left-0 right-0 z-[30] border-t bg-card py-3 shadow-md lg:border-x lg:border-border"
>
	<div class="flex items-center justify-between">
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
