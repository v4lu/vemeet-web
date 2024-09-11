<script lang="ts">
	import { fade } from 'svelte/transition';
	type ToastProps = {
		message: string;
		type: 'success' | 'error';
	};

	let { message, type }: ToastProps = $props();
</script>

<div
	transition:fade={{ duration: 300 }}
	class="fixed bottom-4 right-4 rounded p-4 shadow-lg {type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white"
>
	{message}
</div>
