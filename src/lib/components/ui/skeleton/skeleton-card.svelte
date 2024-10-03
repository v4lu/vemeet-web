<script lang="ts">
	import Skeleton from './skeleton.svelte';
</script>

<div class="mb-6 overflow-hidden rounded-xl border border-border bg-card/80 shadow-lg">
	<div class="relative p-4">
		<div class="absolute right-3 top-3">
			<Skeleton class="h-8 w-8 rounded-full" />
		</div>

		<div class="mb-4 flex items-center">
			<Skeleton class="mr-3 h-12 w-12 rounded-full" />
			<div>
				<Skeleton class="mb-2 h-4 w-40" />
				<Skeleton class="h-3 w-32" />
			</div>
		</div>

		<Skeleton class="mb-4 h-[20rem] w-full rounded-lg" />

		<div class="mb-3 flex justify-center space-x-1.5">
			<Skeleton class="h-2.5 w-2.5 rounded-full" />
			<Skeleton class="h-2.5 w-2.5 rounded-full" />
			<Skeleton class="h-2.5 w-2.5 rounded-full" />
		</div>

		<Skeleton class="mb-2 h-4 w-full" />
		<Skeleton class="mb-4 h-4 w-3/4" />

		<div class="flex items-center justify-between border-t border-border pt-4">
			<div class="flex items-center space-x-4">
				<Skeleton class="h-6 w-16" />
				<Skeleton class="h-6 w-16" />
			</div>
			<Skeleton class="h-6 w-16" />
		</div>
	</div>
</div>
