<!--
  表紙（pptx の slide1、slide2）。light のときは白背景にする。
  画像があれば右下に置き（slide1）、なければ正方形の組み合わせで右側を埋める（slide2）。
-->
<script lang="ts">
	import { formatDate } from '../format';
	import type { LayoutProps } from '../types';
	import Html from './Html.svelte';
	import Logo from './Logo.svelte';
	import Picture from './Picture.svelte';
	import SlideTitle from './SlideTitle.svelte';
	import Square from './Square.svelte';

	let { slide, deck, brand, light = false }: LayoutProps & { light?: boolean } = $props();

	let image = $derived(slide.images[0] ?? null);
	let title = $derived(slide.title ?? deck.title);
	let subtitle = $derived(slide.subtitle ?? deck.event);
	// サブタイトルにイベント名を使っていなければ、日付と発表者の行に添える
	let meta = $derived(
		[formatDate(deck.date), slide.subtitle ? deck.event : null, deck.author]
			.filter(Boolean)
			.join('　')
	);
	let white = $derived(light ? 'var(--kz-surface)' : 'var(--kz-white)');
</script>

<div class={['cover', { light }]}>
	{#if image}
		<Square x={840} y={0} size={212.6} color="var(--kz-accent3)" />
		<Square x={689.1} y={212.6} size={150.9} color="var(--kz-accent4)" />
		<Square x={466.9} y={106.3} size={90.9} color="var(--kz-accent2)" />
		<div class="image"><Picture {image} /></div>
	{:else}
		<Square x={1067.4} y={858.9} size={221.1} color="var(--kz-accent2)" />
		<Square x={958.7} y={702} size={108.7} color="var(--kz-accent4)" />
		<Square x={1288.5} y={448.6} size={410.4} color="var(--kz-accent3)" />
		<Square x={1131.6} y={291.7} size={156.9} color={white} />
		<Square x={1698.9} y={227.5} size={221.1} color="var(--kz-accent4)" />
		<Square x={1536.9} y={65.5} size={162} color="var(--kz-accent2)" />
		<Square x={958.7} y={200.4} size={94.5} color="var(--kz-accent2)" />
		<Square x={1698.9} y={859} size={139.9} color="var(--kz-accent2)" />
		<Square x={1698.9} y={0} size={65.6} color={white} />
	{/if}

	<div class={['logo', { 'with-image': image }]}>
		<Logo src={light ? brand.logo : brand.logoWhite} name={brand.name} white={!light} />
	</div>

	<div class="text kz-fit">
		<SlideTitle {title} accent={slide.titleAccent} size={96} light={!light} />
		{#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
		<Html html={slide.bodyHtml} class="cover-body" />
	</div>

	{#if meta}<p class="meta">{meta}</p>{/if}
</div>

<style>
	.cover {
		position: absolute;
		inset: 0;
		background: var(--kz-accent1);
		color: var(--kz-white);
	}

	.cover.light {
		background: var(--kz-white);
		color: var(--kz-text);
	}

	.image {
		position: absolute;
		left: 1052.6px;
		top: 212.6px;
		width: 867.4px;
		height: 867.4px;
	}

	.logo {
		position: absolute;
		left: 129.4px;
		top: 126px;
	}

	.logo.with-image {
		top: 288px;
	}

	.text {
		position: absolute;
		left: 109.5px;
		top: 380px;
		width: 800px;
		height: 500px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow: hidden;
	}

	.subtitle {
		margin: 24px 0 0;
		font-family: var(--kz-font-heading);
		font-size: 48px;
		line-height: 1.3;
	}

	.text :global(.cover-body) {
		margin-top: 24px;
		color: inherit;
		font-size: 28px;
	}

	.meta {
		position: absolute;
		left: 109.5px;
		top: 916.5px;
		margin: 0;
		font-size: 28px;
	}
</style>
