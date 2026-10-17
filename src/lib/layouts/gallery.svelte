<!-- 画像の格子と導入文。pptx の slide11（Gallery Images）。 -->
<script lang="ts">
	import Picture from '../components/Picture.svelte';
	import SideColumn from '../components/SideColumn.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	// 画像が足りないマスは accent 色で埋めて、テンプレートの市松模様に近づける
	const fills = ['var(--kz-accent4)', 'var(--kz-surface)', 'var(--kz-accent2)'];
	let rows = $derived(Math.ceil(Math.max(6, Math.min(9, slide.images.length)) / 3));
	// マスは正方形にし、3 行になるときは小さくして本文領域に収める
	let cell = $derived(rows === 3 ? 270 : 340);
	let cells = $derived(
		Array.from(
			{ length: Math.max(6, Math.min(9, slide.images.length)) },
			(_, i) => slide.images[i] ?? null
		)
	);
</script>

<SideColumn {slide} width={560} html={slide.bodyHtml} />

<div class="grid" style:--cell="{cell}px" style:top="{(1080 - rows * cell) / 2}px">
	{#each cells as image, i (i)}
		<div class="cell"><Picture {image} fill={fills[i % fills.length]} /></div>
	{/each}
</div>

<style>
	.grid {
		position: absolute;
		/* 縦方向の中央寄せは top で行う（transform を使うと PDF の印刷で位置がずれる） */
		right: 110px;
		display: grid;
		grid-template-columns: repeat(3, var(--cell));
		grid-auto-rows: var(--cell);
		gap: 0;
	}

	.cell {
		min-height: 0;
	}
</style>
