<!--
  片側に画像、反対側にタイトルと本文を置く。pptx の slide5、slide6、slide8。
  Slidev の image-left / image-right と同じく、画像はフロントマターの image か本文の画像を使う。
  画像枠は、カザモリスタイルの正方形の意匠にそろえて正方形にし、スライドの左端または右端に接して置く。
-->
<script lang="ts">
	import type { LayoutProps } from '../types';
	import Picture from './Picture.svelte';
	import SideColumn from './SideColumn.svelte';
	import Square from './Square.svelte';

	let { slide, side }: LayoutProps & { side: 'left' | 'right' } = $props();
</script>

<div class={['image', side]}><Picture image={slide.images[0]} /></div>
{#if side === 'left'}
	<Square x={820} y={830} size={120} color="var(--kz-accent5)" />
	<Square x={940} y={770} size={60} color="var(--kz-accent4)" />
{:else}
	<Square x={980} y={130} size={120} color="var(--kz-accent5)" />
	<Square x={920} y={250} size={60} color="var(--kz-accent4)" />
{/if}

<SideColumn
	{slide}
	x={side === 'left' ? 1060 : 109.5}
	y={150}
	width={780}
	height={800}
	html={slide.bodyHtml}
	fontSize={26}
/>

<style>
	.image {
		position: absolute;
		top: 130px;
		width: 820px;
		height: 820px;
	}

	.image.left {
		left: 0;
	}

	.image.right {
		left: 1100px;
	}
</style>
