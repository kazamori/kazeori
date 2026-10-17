<!--
  スライドの上部の見出し。1 行のタイトル（title と titleAccent を並べる）、サブタイトル、任意の導入文。
  多くのレイアウトで共通に使い、見出しの位置と大きさをそろえる。
-->
<script lang="ts">
	import type { Slide } from '../types';
	import Html from './Html.svelte';
	import SlideTitle from './SlideTitle.svelte';

	let {
		slide,
		align = 'left',
		size = 72,
		intro = '',
		subtitle = true
	}: {
		slide: Slide;
		align?: 'left' | 'center';
		size?: number;
		/** タイトルの下に置く導入文（HTML） */
		intro?: string;
		/** サブタイトルを見出しに含めるか（本文の側に置くレイアウトでは false にする） */
		subtitle?: boolean;
	} = $props();
</script>

<header class="head" style:text-align={align}>
	<SlideTitle title={slide.title} accent={slide.titleAccent} inline {align} {size} />
	{#if subtitle && slide.subtitle}<p class="kz-subtitle">{slide.subtitle}</p>{/if}
	<Html html={intro} class="intro" />
</header>

<style>
	.head {
		position: absolute;
		left: 109.5px;
		top: 110px;
		width: 1700px;
	}

	.head :global(.intro) {
		margin-top: 24px;
		font-size: 26px;
	}
</style>
