<!--
  参考文献。リンクの文言の下に URL をそのまま表示する（印刷した PDF でも出典が分かるように）。
  タイトルを省略すると「参考文献」にする。
  文字の大きさは項目の数で決め、項目が少ないときは大きく描いて、離れて見ても読めるようにする。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	// 項目名、URL、項目の間の大きさ（項目が 4 以下、5、6 以上）。本文の枠（高さ 700px）に収まる大きさにする
	const SIZES = [
		{ title: 40, url: 30, gap: 36 },
		{ title: 34, url: 26, gap: 26 },
		{ title: 28, url: 22, gap: 18 }
	];
	let size = $derived(SIZES[slide.items.length <= 4 ? 0 : slide.items.length === 5 ? 1 : 2]);
</script>

<SlideHeader slide={{ ...slide, titleHtml: slide.titleHtml ?? '参考文献' }} />
<div
	class="body kz-fit"
	style:--title-size="{size.title}px"
	style:--url-size="{size.url}px"
	style:--gap="{size.gap}px"
>
	<Html html={slide.bodyHtml} class="refs" />
</div>

<style>
	.body {
		position: absolute;
		left: 109.5px;
		top: 260px;
		width: 1700px;
		height: 700px;
		overflow: hidden;
	}

	.body :global(.refs) {
		font-size: var(--title-size);
	}

	.body :global(.refs li) {
		margin-bottom: var(--gap);
	}

	.body :global(.refs a) {
		color: var(--kz-text);
		text-decoration: none;
		font-weight: 700;
	}

	.body :global(.refs a[href^='http']::after) {
		content: attr(href);
		display: block;
		font-weight: 400;
		font-size: var(--url-size);
		color: var(--kz-accent1);
		text-decoration: underline;
		text-decoration-skip-ink: none;
		text-underline-offset: 0.3em;
	}
</style>
