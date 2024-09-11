<script lang="ts">
	import { cn } from '$lib/cn';

	interface SkeletonProps {
		class?: string;
	}

	let { class: className }: SkeletonProps = $props();
</script>

<template>
	<div class={cn('animate-pulse rounded-md bg-muted', className)}></div>
</template>
