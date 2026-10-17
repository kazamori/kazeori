<!--
  参考文献。リンクの文言の下に URL をそのまま表示する（印刷した PDF でも出典が分かるように）。
  タイトルを省略すると「参考文献」にする。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();
</script>

<SlideHeader slide={{ ...slide, title: slide.title ?? '参考文献' }} />
<div class="body kz-fit">
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
		font-size: 28px;
	}

	.body :global(.refs li) {
		margin-bottom: 18px;
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
		font-size: 22px;
		color: var(--kz-accent1);
		text-decoration: underline;
	}
</style>
