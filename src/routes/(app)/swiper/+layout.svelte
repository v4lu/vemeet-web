<script lang="ts">
	import { SwiperIsland } from '$lib/components/swiper';

	let { children, data } = $props();
</script>

{@render children()}
<SwiperIsland pathname={data.path} />
