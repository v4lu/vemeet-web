<script lang="ts">
	import { Header } from '$lib/components/profile';

	let { data } = $props();
</script>

<Header authToken={data.accessToken} />
