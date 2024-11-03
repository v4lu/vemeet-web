<script lang="ts">
	import { Skeleton } from '../ui/skeleton';

	let { count = 24 }: { count?: number } = $props();
</script>

<div class="my-12 flex flex-1 flex-col-reverse overflow-y-auto p-4">
	{#each Array(count) as _, i}
		<div class={`mb-4 flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
			<div class={`max-w-[70%] ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
				<Skeleton class="h-16 w-48 rounded-lg" />
				<Skeleton class="mt-1 h-4 w-24" />
			</div>
		</div>
	{/each}
</div>
