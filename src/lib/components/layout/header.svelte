<script lang="ts">
	import { useNotification } from '$lib/api/use-notification.svelte';
	import { cn } from '$lib/cn';
	import Icon from '@iconify/svelte';
	import { buttonVariants } from '../ui/button';
	import { Logo } from '../ui/logo';
	type Props = {
		authToken: string;
	};

	let { authToken }: Props = $props();
	let { resp } = useNotification(authToken);
</script>

<div
	class="container fixed inset-x-0 top-0 z-[90] h-16 w-full border-b border-border bg-card shadow-lg lg:border-x"
>
	<header class="container flex items-center justify-between py-3">
		<a href="/" class=" flex items-center justify-center gap-2 text-xl font-bold text-primary">
			<Logo class="size-10" />
			<span class="-mt-1"> Vemeet </span>
		</a>
		<div class="flex items-center justify-center gap-2">
			<a class={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), 'relative')} href="/swiper">
				<Icon icon="solar:flame-bold-duotone" class="size-6" />
			</a>
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
			<a
				class={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), 'relative')}
				href="/notifications"
			>
				<Icon icon="solar:bell-bold" class="size-6" />
			</a>
		</div>
	</header>
</div>
