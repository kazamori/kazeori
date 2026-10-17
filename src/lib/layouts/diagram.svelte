<!-- 図を本文領域いっぱいに置く。archify の図を想定する。本文は図の下に短い説明として置く。 -->
<script lang="ts">
	import Figure from '../components/Figure.svelte';
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let hasCaption = $derived(slide.bodyHtml.trim() !== '');
</script>

<SlideHeader {slide} size={60} />

<div class={['figure', { 'with-caption': hasCaption }]}><Figure {slide} /></div>
{#if hasCaption}
	<div class="caption kz-fit"><Html html={slide.bodyHtml} /></div>
{/if}

<style>
	.figure {
		position: absolute;
		left: 109.5px;
		top: 250px;
		width: 1700px;
		height: 720px;
	}

	.figure.with-caption {
		height: 610px;
	}

	.caption {
		position: absolute;
		left: 109.5px;
		top: 880px;
		width: 1660px;
		height: 90px;
		overflow: hidden;
	}

	.caption :global(.kz-prose) {
		font-size: 24px;
	}
</style>
