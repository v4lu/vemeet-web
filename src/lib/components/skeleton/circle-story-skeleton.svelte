<script>
	import { Skeleton } from '../ui/skeleton';
</script>

{#each Array(8) as _}
	<div class="flex flex-col items-center">
		<Skeleton class="size-16 rounded-full" />
		<Skeleton class="mt-1 h-3 w-12" />
	</div>
{/each}
