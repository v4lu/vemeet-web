<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div>
	<div class="overflow-hidden bg-card shadow-lg">
		<div class="relative">
			<div class="flex items-center justify-between p-4">
				<div class="flex items-center">
					<Skeleton class="h-12 w-12 rounded-full" />
					<div class="ml-3">
						<Skeleton class="h-4 w-32" />
						<Skeleton class="mt-1 h-3 w-24" />
					</div>
				</div>
				<Skeleton class="h-8 w-8 rounded-full" />
			</div>

			<Skeleton class="h-[20rem] w-full" />

			<div class="my-3 flex justify-center space-x-1.5">
				<Skeleton class="h-2.5 w-2.5 rounded-full" />
				<Skeleton class="h-2.5 w-2.5 rounded-full" />
				<Skeleton class="h-2.5 w-2.5 rounded-full" />
			</div>

			<div class="px-4 py-3">
				<Skeleton class="h-4 w-full" />
				<Skeleton class="mt-2 h-4 w-3/4" />
			</div>

			<div class="flex items-center justify-between border-t border-border p-4">
				<div class="flex items-center space-x-4">
					<Skeleton class="h-6 w-16" />
					<Skeleton class="h-6 w-16" />
				</div>
				<Skeleton class="h-6 w-16" />
			</div>
		</div>

		<div class="border-t border-border p-4">
			<Skeleton class="mb-2 h-4 w-32" />
			<Skeleton class="h-24 w-full rounded-lg" />
			<div class="mt-2 flex justify-end">
				<Skeleton class="h-9 w-24 rounded-full" />
			</div>
		</div>

		<div class="border-t border-border">
			<div class="p-4">
				<Skeleton class="h-5 w-24" />
			</div>
			{#each Array(3) as _}
				<div class="mb-4 px-4">
					<div class="flex items-start space-x-3">
						<Skeleton class="h-10 w-10 rounded-full" />
						<div class="flex-1">
							<Skeleton class="h-24 w-full rounded-lg" />
							<div class="mt-2 flex items-center space-x-4">
								<Skeleton class="h-4 w-16" />
								<Skeleton class="h-4 w-16" />
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
