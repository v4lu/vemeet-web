<script lang="ts">
	import { Skeleton } from '../ui/skeleton';
	let skeletonMessageCount = $state(24);
</script>

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
