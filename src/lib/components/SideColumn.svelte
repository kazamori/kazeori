<!--
  スライドの左（または右）の段。2 行のタイトル、サブタイトル、本文を縦方向の中央に並べる。
  位置と大きさは props で決め、残りの内容は children で足せる。
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Slide } from '../types';
	import Html from './Html.svelte';
	import SlideTitle from './SlideTitle.svelte';

	let {
		slide,
		x = 109.5,
		y = 200,
		width,
		height = 760,
		html = '',
		fontSize = 24,
		children
	}: {
		slide: Slide;
		x?: number;
		y?: number;
		width: number;
		height?: number;
		/** サブタイトルの下に置く本文（HTML） */
		html?: string;
		fontSize?: number;
		children?: Snippet;
	} = $props();
</script>

<div
	class="side kz-fit"
	style:left="{x}px"
	style:top="{y}px"
	style:width="{width}px"
	style:height="{height}px"
	style:--body-size="{fontSize}px"
>
	<SlideTitle title={slide.titleHtml} accent={slide.titleAccentHtml} />
	{#if slide.subtitleHtml}<p class="kz-subtitle side-subtitle">{@html slide.subtitleHtml}</p>{/if}
	<Html {html} class="side-body" />
	{@render children?.()}
</div>

<style>
	.side {
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
	}

	.side-subtitle {
		margin-top: 40px;
	}

	.side :global(.side-body) {
		margin-top: 12px;
		font-size: var(--body-size);
	}
</style>
