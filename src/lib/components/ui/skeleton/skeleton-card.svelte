<script lang="ts">
	import Skeleton from './skeleton.svelte';
</script>

<div class="mb-4 rounded-lg border border-border bg-card/80 shadow">
	<div class="p-4">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center">
				<Skeleton class="mr-3 h-10 w-10 rounded-full" />
				<div>
					<Skeleton class="mb-2 h-4 w-40" />
					<Skeleton class="h-3 w-32" />
				</div>
			</div>
		</div>
		<Skeleton class="mb-4 h-4 w-full" />
		<Skeleton class="mb-4 h-4 w-3/4" />
		<div class="flex items-center justify-between pt-3">
			<Skeleton class="h-6 w-full" />
		</div>
	</div>
</div>
