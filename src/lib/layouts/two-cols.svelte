<!--
  2 段組み。既定のスロットを左、::right:: を右に置く（Slidev の two-cols と同じ）。
  Slidev の two-cols-header のように ::left:: を書いた場合は、それを左に使う。
  既定のスロットに書いた画像だけの段落（パーサが images と figures に取り出したもの）は、左の段の本文の下に描く。
-->
<script lang="ts">
	import Figure from '../components/Figure.svelte';
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import { escapeHtml } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	// ::left:: がなければ、既定のスロットの ## 見出し（サブタイトルとして取り出されている）を左の段の中に戻し、右の段とそろえる
	let hasLeftSlot = $derived(slide.slots.left !== undefined);
	let left = $derived(
		slide.slots.left ??
			(slide.subtitle ? `<h2>${escapeHtml(slide.subtitle)}</h2>` : '') + slide.bodyHtml
	);
	let visuals = $derived(
		Array.from({ length: slide.figures.length + slide.images.length }, (_, i) => i)
	);
</script>

<SlideHeader {slide} subtitle={hasLeftSlot} />

<div class="col left kz-fit">
	<Html html={left} />
	{#each visuals as index (index)}
		<div class="visual"><Figure {slide} {index} /></div>
	{/each}
</div>
<div class="col right kz-fit"><Html html={slide.slots.right ?? ''} /></div>

<style>
	.col {
		position: absolute;
		top: 300px;
		width: 810px;
		height: 660px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow: hidden;
	}

	.left {
		left: 109.5px;
	}

	.right {
		left: 999.5px;
	}

	/* 段の残りの高さを、画像で分け合う */
	.visual {
		flex: 1;
		min-height: 0;
	}

	/* 段の中に書いた画像（::right:: など）は、段の幅と高さに収める */
	.col :global(.kz-prose img) {
		display: block;
		max-width: 100%;
		max-height: 560px;
		object-fit: contain;
	}
</style>
