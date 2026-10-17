<!-- 画像を右に置く（Slidev の image-right と同じ）。 -->
<script lang="ts">
	import ImageSide from '../components/ImageSide.svelte';
	import type { LayoutProps } from '../types';

	let props: LayoutProps = $props();
</script>

<ImageSide {...props} side="right" />
