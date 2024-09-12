<script>
	import Icon from '@iconify/svelte';

	import { buttonVariants } from '../ui/button';
</script>

<div class="fixed inset-x-0 top-0 z-[90] w-full border-b border-border bg-background">
	<header class="container flex justify-between py-3">
		<a href="/profile" class="text-lg font-bold text-primary">Vemeet</a>
		<div class="flex items-center justify-center gap-2">
			<a href="/settings" class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
				<Icon icon="solar:settings-bold" class="size-5" />
			</a>
			<a href="/messages" class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}>
				<Icon icon="solar:chat-line-bold" class="size-5" />
			</a>
		</div>
	</header>
</div>
