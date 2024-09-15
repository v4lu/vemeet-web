<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="mt-6">
	<div class="mb-4 overflow-hidden rounded-lg border border-border bg-card shadow">
		<div class="relative">
			<div class="flex items-center justify-between px-4 pb-2 pt-4">
				<div class="flex items-center">
					<Skeleton class="h-10 w-10 rounded-full" />
					<div class="ml-3">
						<Skeleton class="h-4 w-24" />
						<Skeleton class="mt-1 h-3 w-16" />
					</div>
				</div>
			</div>

			<Skeleton class="h-64 w-full" />

			<div class="px-4 py-3">
				<Skeleton class="h-4 w-3/4" />
				<Skeleton class="mt-2 h-4 w-1/2" />
			</div>

			<div class="flex items-center justify-between border-t border-border p-4">
				<Skeleton class="h-6 w-20" />
			</div>
		</div>

		<div class="border-t border-border p-4">
			<Skeleton class="h-10 w-full rounded" />
		</div>

		<div class="border-t border-border">
			<div class="p-4">
				<Skeleton class="h-4 w-24" />
			</div>
			{#each Array(3) as _}
				<div class="mb-4 px-4">
					<div class="flex items-start space-x-3">
						<Skeleton class="h-8 w-8 rounded-full" />
						<div class="flex-1">
							<Skeleton class="h-20 w-full rounded" />
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
