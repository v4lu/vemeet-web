<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div
	class="mb-6 rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:shadow-xl"
>
	<div class="relative">
		<div class="relative mb-4 flex items-center justify-between p-4">
			<div class="flex flex-col">
				<Skeleton class="mb-2 h-6 w-48" />
				<Skeleton class="mb-1 h-4 w-64" />
				<Skeleton class="h-3 w-40" />
			</div>
			<Skeleton class="h-6 w-20" />
		</div>

		<div class="relative mb-4">
			<Skeleton class="h-[20rem] w-full" />
		</div>

		<div class="mb-4 px-4">
			<Skeleton class="mb-2 h-4 w-full" />
			<Skeleton class="h-4 w-3/4" />
		</div>

		<div class="mb-4 grid grid-cols-2 gap-4 px-4 text-sm">
			{#each Array(4) as _}
				<div>
					<Skeleton class="mb-1 h-4 w-20" />
					<Skeleton class="h-4 w-32" />
				</div>
			{/each}
		</div>

		<div class="flex items-center justify-between border-t border-border p-4">
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center space-x-4">
					<div class="flex items-center text-sm">
						<Skeleton class="ml-1.5 h-4 w-16" />
					</div>
				</div>
				<Skeleton class="h-9 w-28" />
			</div>
		</div>
	</div>

	<div class="space-y-6 border-t border-border bg-card shadow-lg last:rounded-b-xl">
		{#each Array(3) as _}
			<div class="p-4">
				<div class="mb-2 flex items-center justify-between">
					<Skeleton class="h-4 w-32" />
					<Skeleton class="h-4 w-24" />
				</div>
				<Skeleton class="mb-2 h-4 w-full" />
				<Skeleton class="h-4 w-3/4" />
			</div>
		{/each}
	</div>
</div>
