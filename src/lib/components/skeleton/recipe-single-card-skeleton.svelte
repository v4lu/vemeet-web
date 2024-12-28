<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="relative mx-auto mt-12 max-w-4xl">
	<div class="mb-8">
		<Skeleton class="mb-4 h-10 w-3/4" />
		<div class="mb-4 flex items-center">
			<Skeleton class="mr-4 h-12 w-12 rounded-full" />
			<div>
				<Skeleton class="mb-2 h-4 w-32" />
				<Skeleton class="h-3 w-24" />
			</div>
		</div>
		<div class="mb-4 grid grid-cols-2 gap-4">
			<Skeleton class="h-6 w-full" />
			<Skeleton class="h-6 w-full" />
		</div>
	</div>

	<Skeleton class="mb-8 h-64 w-full" />

	<div class="mb-8">
		<Skeleton class="mb-4 h-8 w-1/4" />
		<div class="space-y-2">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-3/4" />
		</div>
	</div>

	<div>
		<Skeleton class="mb-4 h-8 w-1/4" />
		<div class="space-y-4">
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-full" />
			<Skeleton class="h-4 w-3/4" />
		</div>
	</div>
</div>
