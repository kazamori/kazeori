<!--
  左にタイトルと導入文、右に番号付きの帯で項目を並べる。pptx の slide3。
  current で指定した番号の帯を accent1 で強調する（アジェンダで現在の章を示すため）。
  強調した帯はテンプレートと同じく右へ伸ばし、左端に accent4 の縦の帯を付ける（テンプレートの三角の印の代わり）。
-->
<script lang="ts">
	import { pad2 } from '../format';
	import type { LayoutProps } from '../types';
	import Html from './Html.svelte';
	import SideColumn from './SideColumn.svelte';

	let { slide }: LayoutProps = $props();

	let current = $derived(
		typeof slide.frontmatter.current === 'number' ? slide.frontmatter.current : null
	);
	// 帯を並べる領域の高さ（.bars の height と同じ値）
	const AREA = 800;
	// 帯 1 本の高さ（padding を含む）と帯の間隔。項目が多いときは、領域に収まるよう両方を縮める
	let count = $derived(Math.max(1, slide.items.length));
	let gap = $derived(count <= 6 ? 22 : count <= 9 ? 14 : 8);
	let rowHeight = $derived(Math.min(144, Math.floor((AREA - gap * (count - 1)) / count)));
</script>

<SideColumn {slide} width={500} html={slide.introHtml} />

<ol class="bars kz-fit" style:gap="{gap}px">
	{#each slide.items as item, i (i)}
		<li
			class={['bar', { current: current === i + 1, compact: rowHeight < 96 }]}
			style:min-height="{rowHeight}px"
		>
			<span class="number">{pad2(i + 1)}.</span>
			<div class="text">
				{#if item.title}<strong class="item-title">{item.title}</strong>{/if}
				<Html html={item.html} class="item-body" />
			</div>
		</li>
	{/each}
</ol>

{#if slide.restHtml}
	<div class="rest kz-fit"><Html html={slide.restHtml} /></div>
{/if}

<style>
	.bars {
		position: absolute;
		left: 669px;
		top: 130px;
		width: 1111px;
		height: 800px;
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
	}

	.bar {
		position: relative;
		margin-right: 40px;
		display: flex;
		align-items: center;
		gap: 24px;
		/* min-height に padding を含め、帯の高さの計算と実際の高さをそろえる */
		box-sizing: border-box;
		padding: 16px 32px;
		background: var(--kz-surface);
	}

	.bar.compact {
		padding: 8px 32px;
	}

	.bar.current {
		background: var(--kz-accent1);
		color: var(--kz-white);
		margin-right: 0;
	}

	/* 四角を基調とした意匠にそろえ、強調した帯の左端に accent4 の縦の帯を付ける */
	.bar.current::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 12px;
		background: var(--kz-accent4);
	}

	.number {
		flex: none;
		width: 64px;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 32px;
		color: var(--kz-accent1);
	}

	.current .number {
		color: var(--kz-white);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 26px;
	}

	.item-title {
		font-family: var(--kz-font-heading);
		font-size: 28px;
		color: var(--kz-text);
	}

	.current .item-title,
	.current .text :global(.item-body) {
		color: var(--kz-white);
	}

	.text :global(.item-body) {
		font-size: 24px;
		line-height: 1.45;
	}

	.rest {
		position: absolute;
		left: 669px;
		top: 940px;
		width: 1071px;
		height: 40px;
		overflow: hidden;
	}
</style>
