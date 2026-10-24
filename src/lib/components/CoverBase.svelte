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
	let title = $derived(slide.titleHtml ?? deck.titleHtml);
	let subtitle = $derived(slide.subtitleHtml ?? deck.eventHtml);
	let meta = $derived([formatDate(deck.date), deck.author].filter(Boolean).join('　'));
	// サブタイトルにイベント名を使っていなければ、日付と発表者の行の下に添える
	let metaEvent = $derived(slide.subtitleHtml ? deck.eventHtml : null);
	let white = $derived(light ? 'var(--kz-surface)' : 'var(--kz-white)');

	// タイトルの大きさの上限と、サブタイトルの大きさ（タイトルに対する比と上限）
	const TITLE_SIZE = 96;
	const SUBTITLE_RATIO = 0.6;
	const SUBTITLE_MAX = 48;
	// タイトルが長くて縮んだときは、サブタイトルも合わせて小さくし、タイトルより目立たないようにする
	let titleSize = $state(TITLE_SIZE);
	let subtitleSize = $derived(Math.min(SUBTITLE_MAX, Math.round(titleSize * SUBTITLE_RATIO)));
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
		<SlideTitle
			{title}
			accent={slide.titleAccentHtml}
			titleLines={slide.titleLines}
			size={TITLE_SIZE}
			light={!light}
			onfit={(fitted) => (titleSize = fitted)}
		/>
		{#if subtitle}<p class="subtitle kz-lines" style:font-size="{subtitleSize}px">
				{@html subtitle}
			</p>{/if}
		<Html html={slide.bodyHtml} class="cover-body" />
	</div>

	{#if meta || metaEvent}
		<div class="meta">
			{#if meta}<p>{meta}</p>{/if}
			{#if metaEvent}<p class="kz-lines">{@html metaEvent}</p>{/if}
		</div>
	{/if}
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

	/*
	  タイトルとサブタイトルの塊。下端（y=770）をそろえ、下の日付の行との間を空ける。
	  上端は、画像があるときのロゴ（y=288）にかからない位置にする
	*/
	.text {
		position: absolute;
		left: 109.5px;
		top: 380px;
		width: 800px;
		height: 390px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow: hidden;
	}

	/* タイトルとの間は、サブタイトルの大きさに合わせて空ける（48px のとき 24px） */
	.subtitle {
		margin: 0.5em 0 0;
		font-family: var(--kz-font-heading);
		line-height: 1.4;
	}

	.text :global(.cover-body) {
		margin-top: 24px;
		color: inherit;
		font-size: 28px;
	}

	/* 日付と発表者の行と、その下のイベント名。イベント名が長ければ、右側の正方形にかからない幅で折り返す */
	.meta {
		position: absolute;
		left: 109.5px;
		top: 836.5px;
		width: 800px;
		font-size: 28px;
		line-height: 1.5;
	}

	.meta p {
		margin: 0;
	}

	/* 日付と発表者の行と、イベント名の行を分けて見せる */
	.meta p + p {
		margin-top: 0.5em;
	}
</style>
