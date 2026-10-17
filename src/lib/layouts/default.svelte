<!--
  標準のレイアウト。タイトル＋本文。
  単独の画像や archify の図があれば、本文を左、図を右に置く。本文がなければ図を全面に置く。
-->
<script lang="ts">
	import Figure from '../components/Figure.svelte';
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let hasFigure = $derived(slide.figures.length + slide.images.length > 0);
	let hasBody = $derived(slide.bodyHtml.trim() !== '');
</script>

<SlideHeader {slide} />

<div class={['main', { split: hasFigure && hasBody }]}>
	{#if hasBody}
		<div class="body kz-fit"><Html html={slide.bodyHtml} /></div>
	{/if}
	{#if hasFigure}
		<div class="figure"><Figure {slide} /></div>
	{/if}
</div>

<style>
	.main {
		position: absolute;
		left: 109.5px;
		top: 300px;
		width: 1700px;
		height: 660px;
		display: grid;
		grid-template-columns: 1fr;
		gap: 60px;
	}

	.main.split {
		grid-template-columns: 1fr 1fr;
	}

	.body {
		overflow: hidden;
		min-height: 0;
	}

	.figure {
		min-width: 0;
		min-height: 0;
	}
</style>
