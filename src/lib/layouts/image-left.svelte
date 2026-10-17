<!-- 画像を左に置く（Slidev の image-left と同じ）。 -->
<script lang="ts">
	import ImageSide from '../components/ImageSide.svelte';
	import type { LayoutProps } from '../types';

	let props: LayoutProps = $props();
</script>

<ImageSide {...props} side="left" />
