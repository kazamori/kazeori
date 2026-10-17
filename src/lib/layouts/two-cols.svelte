<!--
  2 段組み。既定のスロットを左、::right:: を右に置く（Slidev の two-cols と同じ）。
  Slidev の two-cols-header のように ::left:: を書いた場合は、それを左に使う。
-->
<script lang="ts">
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
</script>

<SlideHeader {slide} subtitle={hasLeftSlot} />

<div class="col left kz-fit"><Html html={left} /></div>
<div class="col right kz-fit"><Html html={slide.slots.right ?? ''} /></div>

<style>
	.col {
		position: absolute;
		top: 300px;
		width: 810px;
		height: 660px;
		overflow: hidden;
	}

	.left {
		left: 109.5px;
	}

	.right {
		left: 999.5px;
	}
</style>
