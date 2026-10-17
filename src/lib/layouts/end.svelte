<!--
  締めのスライド。全面 accent1 に、お礼の文言とロゴを置く。
  お礼の文言は、枠に収まる最大の大きさで描く。改行（<br>）を書かなければ 1 行に、書けばその行数に収める。
-->
<script module lang="ts">
	import type { LayoutChrome } from '../types';

	export const chrome: LayoutChrome = 'none';
</script>

<script lang="ts">
	import Html from '../components/Html.svelte';
	import Logo from '../components/Logo.svelte';
	import SlideTitle, { TITLE_LINE_HEIGHT } from '../components/SlideTitle.svelte';
	import Square from '../components/Square.svelte';
	import type { LayoutProps } from '../types';

	let { slide, brand }: LayoutProps = $props();

	// 文言を置く枠の高さ、そのうち文言に使える高さ（titleAccent や本文の分を残す）、文言の大きさの上限
	const MESSAGE_HEIGHT = 440;
	const THANKS_HEIGHT = 400;
	const MAX_SIZE = 160;

	let thanks = $derived(slide.title ?? 'ありがとうございました');
	// 行数分が収まる大きさを上限にする。行の幅に合わせた縮小は SlideTitle が行う
	let size = $derived(
		Math.min(MAX_SIZE, Math.floor(THANKS_HEIGHT / (thanks.split('\n').length * TITLE_LINE_HEIGHT)))
	);
</script>

<div class="end">
	<Square x={1536.9} y={65.5} size={162} color="var(--kz-accent2)" />
	<Square x={1698.9} y={227.5} size={221.1} color="var(--kz-accent4)" />
	<Square x={1288.5} y={448.6} size={410.4} color="var(--kz-accent3)" />
	<Square x={1698.9} y={859} size={139.9} color="var(--kz-accent2)" />
	<Square x={1067.4} y={858.9} size={221.1} color="var(--kz-accent2)" />
	<Square x={0} y={0} size={63.2} color="var(--kz-accent2)" />
	<Square x={63.2} y={62.8} size={36.7} color="var(--kz-accent3)" />

	<div class="message kz-fit" style:height="{MESSAGE_HEIGHT}px">
		<SlideTitle title={thanks} {size} inline light />
		{#if slide.titleAccent}<p class="accent">{slide.titleAccent}</p>{/if}
		<Html html={slide.bodyHtml} class="end-body" />
	</div>

	<div class="logo">
		<Logo src={brand.logoWhite} name={brand.name} white height={64} />
	</div>
	{#if brand.copyright}<p class="copyright">{brand.copyright}</p>{/if}
</div>

<style>
	.end {
		position: absolute;
		inset: 0;
		background: var(--kz-accent1);
		color: var(--kz-white);
	}

	.message {
		position: absolute;
		left: 109.5px;
		top: 300px;
		width: 1100px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
	}

	.accent {
		margin: 16px 0 0;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 56px;
		color: var(--kz-accent4);
	}

	.message :global(.end-body) {
		margin-top: 32px;
		color: inherit;
	}

	.logo {
		position: absolute;
		left: 129.4px;
		top: 860px;
	}

	.copyright {
		position: absolute;
		left: 109.5px;
		top: 980px;
		margin: 0;
		font-size: 22px;
	}
</style>
