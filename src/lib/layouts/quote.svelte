<!--
  引用。pptx の slide12（Quotation Picture）。
  引用（>）を左の accent1 の枠に、画像をその下に、タイトルと本文を右に置く。
  「ラベル 75%」の形の箇条書きは進捗バーとして描く。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import Picture from '../components/Picture.svelte';
	import ProgressList from '../components/ProgressList.svelte';
	import SideColumn from '../components/SideColumn.svelte';
	import { splitBlockquote } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let quote = $derived(splitBlockquote(slide.bodyHtml).quote);
	// 右の段には、引用と箇条書きを除いた本文を置く
	let rest = $derived(splitBlockquote(slide.introHtml + slide.restHtml).rest);
	let image = $derived(slide.images[0] ?? null);
</script>

<div class={['quote', 'kz-fit', { tall: !image }]}>
	<span class="mark">“</span>
	<Html html={quote} class="quote-body" />
</div>
{#if image}
	<div class="image"><Picture {image} /></div>
{/if}

<SideColumn {slide} x={1100} width={710} html={rest}>
	<div class="list"><ProgressList items={slide.items} /></div>
</SideColumn>

<style>
	.quote {
		position: absolute;
		left: 0;
		top: 120px;
		width: 800px;
		height: 520px;
		padding: 60px 70px 60px 140px;
		box-sizing: border-box;
		background: var(--kz-accent1);
		color: var(--kz-white);
		overflow: hidden;
	}

	.quote.tall {
		height: 840px;
	}

	.mark {
		position: absolute;
		left: 50px;
		top: 30px;
		font-family: Georgia, serif;
		font-size: 140px;
		line-height: 1;
		color: var(--kz-accent4);
	}

	.quote :global(.quote-body) {
		color: var(--kz-white);
		font-size: 34px;
		line-height: 1.6;
	}

	.image {
		position: absolute;
		left: 420px;
		top: 560px;
		width: 440px;
		height: 440px;
	}

	.list {
		margin-top: 40px;
	}
</style>
