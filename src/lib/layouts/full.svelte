<!-- 本文だけを全面に描く。Slidev の full と none もこのレイアウトで描く。 -->
<script lang="ts">
	import Figure from '../components/Figure.svelte';
	import Html from '../components/Html.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();
</script>

<div class="full kz-fit">
	<Html html={slide.bodyHtml} />
	{#if slide.figures.length + slide.images.length > 0}
		<div class="figure"><Figure {slide} /></div>
	{/if}
</div>

<style>
	.full {
		position: absolute;
		left: 109.5px;
		top: 110px;
		width: 1700px;
		height: 850px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		overflow: hidden;
	}

	.figure {
		flex: 1;
		min-height: 0;
	}
</style>
