<!--
  2 枚の画像を左右に並べて比べる（Before と After など）。
  箇条書きの各項目を左右の見出し（見出しが名前、残りが補足）、画像だけの段落の画像を左右の画像にする。
  画像は枠に収めて（contain）描くので、縦横比の違う図も切れない。archify の図も並べられる。
  箇条書きのあとの段落は、画像の下に添える説明にする。
-->
<script lang="ts">
	import Figure from '../components/Figure.svelte';
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import { accentAt } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let visuals = $derived(slide.figures.length + slide.images.length);
	let hasCaption = $derived(slide.restHtml.trim() !== '');
	let columns = $derived(
		[0, 1].map((i) => ({ item: slide.items[i] ?? null, hasVisual: i < visuals }))
	);
</script>

<SlideHeader {slide} />

{#each columns as column, i (i)}
	<div
		class={['col', i === 0 ? 'left' : 'right', { 'with-caption': hasCaption }]}
		style:--color={accentAt(i)}
	>
		{#if column.item}
			<div class="label kz-fit">
				{#if column.item.title}<strong class="name">{column.item.title}</strong>{/if}
				<Html html={column.item.html} class="note" />
			</div>
		{/if}
		<div class="frame">
			{#if column.hasVisual}<Figure {slide} index={i} />{/if}
		</div>
	</div>
{/each}

{#if hasCaption}
	<div class="caption kz-fit"><Html html={slide.restHtml} /></div>
{/if}

<style>
	.col {
		position: absolute;
		top: 270px;
		width: 810px;
		height: 700px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.col.with-caption {
		height: 640px;
	}

	.left {
		left: 109.5px;
	}

	.right {
		left: 999.5px;
	}

	.label {
		display: flex;
		align-items: baseline;
		gap: 20px;
		height: 56px;
		overflow: hidden;
	}

	.name {
		font-family: var(--kz-font-heading);
		font-size: 36px;
		color: var(--color);
	}

	.label :global(.note) {
		font-size: 24px;
	}

	.frame {
		flex: 1;
		min-height: 0;
		padding: 16px;
		background: var(--kz-surface);
	}

	.caption {
		position: absolute;
		left: 109.5px;
		top: 930px;
		width: 1700px;
		height: 60px;
		overflow: hidden;
		text-align: center;
	}

	.caption :global(.kz-prose) {
		font-size: 26px;
	}
</style>
