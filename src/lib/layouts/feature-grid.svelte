<!--
  項目をカードの格子で並べる。pptx の slide4（Featured Icon）。項目の画像があればアイコンとして使う。
  列数はフロントマターの columns（1〜4）で指定でき、省略すると項目数から決める
  （1〜2 個は 2 列、3 個は 3 列、4 個は 2 列 2 行、5 個以上は 3 列）。
  行が少ないときもカードは 2 行のときと同じ高さにとどめ、格子を本文領域の上下中央に置く。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import { accentAt, pad2 } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	// 格子を置く領域（.grid の幅と高さ）とカードの間隔
	const WIDTH = 1676.4;
	const HEIGHT = 570;
	const GAP = 28;

	let count = $derived(Math.max(1, slide.items.length));
	let requested = $derived(slide.frontmatter.columns);
	let columns = $derived(
		Number.isInteger(requested) && (requested as number) >= 1 && (requested as number) <= 4
			? (requested as number)
			: count <= 2
				? 2
				: count === 3
					? 3
					: count === 4
						? 2
						: 3
	);
	let rows = $derived(Math.ceil(count / columns));
	let columnWidth = $derived((WIDTH - GAP * (columns - 1)) / columns);
	// 1〜2 行のときは 2 行のときのカードの高さにそろえ、3 行以上は領域を等分する
	let rowHeight = $derived((HEIGHT - GAP * (Math.max(rows, 2) - 1)) / Math.max(rows, 2));
</script>

<SlideHeader {slide} align="center" intro={slide.introHtml} />

<ul
	class="grid kz-fit"
	style:--columns={Math.min(columns, count)}
	style:--column-width="{columnWidth}px"
	style:--row-height="{rowHeight}px"
>
	{#each slide.items as item, i (i)}
		<li class="card" style:--color={accentAt(i)}>
			<div class="icon">
				{#if item.image}
					<img src={item.image.src} alt={item.image.alt} />
				{:else}
					{pad2(i + 1)}
				{/if}
			</div>
			<div class="text">
				{#if item.title}<strong class="item-title">{item.title}</strong>{/if}
				<Html html={item.html} class="item-body" />
			</div>
		</li>
	{/each}
</ul>

<style>
	.grid {
		position: absolute;
		left: 121.8px;
		top: 380px;
		width: 1676.4px;
		height: 570px;
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(var(--columns), var(--column-width));
		grid-auto-rows: var(--row-height);
		/* 項目が列数より少ないときや行が少ないときは、格子を領域の中央に置く */
		justify-content: center;
		align-content: center;
		gap: 28px;
		overflow: hidden;
	}

	.card {
		display: flex;
		gap: 36px;
		padding: 40px;
		background: var(--kz-surface);
		min-height: 0;
	}

	.icon {
		flex: none;
		width: 97px;
		height: 97px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color);
		color: var(--kz-white);
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 36px;
	}

	.icon img {
		width: 56px;
		height: 56px;
		object-fit: contain;
		filter: brightness(0) invert(1);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}

	.item-title {
		font-family: var(--kz-font-heading);
		font-size: 28px;
		color: var(--color);
	}

	.text :global(.item-body) {
		font-size: 22px;
		line-height: 1.5;
	}
</style>
