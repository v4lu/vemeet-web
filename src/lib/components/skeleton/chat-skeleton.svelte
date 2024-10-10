<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import Icon from '@iconify/svelte';

	const skeletonMessageCount = $state(6);
</script>

<div class="flex h-[calc(100vh-130px)] flex-col">
	<div class="flex items-center justify-between border-b p-4">
		<div class="flex items-center">
			<Skeleton class="h-10 w-10 rounded-full" />
			<Skeleton class="ml-3 h-6 w-32" />
		</div>
		<Button variant="ghost" size="icon" disabled>
			<Icon icon="solar:menu-dots-bold" width="24" height="24" />
		</Button>
	</div>

	<div class="flex flex-1 flex-col-reverse overflow-y-auto p-4">
		{#each Array(skeletonMessageCount) as _, i}
			<div class={`mb-4 flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
				<div class={`max-w-[70%] ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
					<Skeleton class="h-16 w-48 rounded-lg" />
					<Skeleton class="mt-1 h-4 w-24" />
				</div>
			</div>
		{/each}
	</div>

	<div class="border-t p-4">
		<div class="flex items-center gap-4">
			<Skeleton class="h-10 flex-1" />
			<Skeleton class="h-10 w-10 rounded-md" />
		</div>
	</div>
</div>
