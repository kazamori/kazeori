<!--
  箇条書きの項目を並べる。すべての項目が「ラベル 75%」の形なら進捗バーとして描き、そうでなければ通常の箇条書きにする。
  最後のバー（2 本以上のとき）は accent5 で塗り、テンプレートと同じく色に変化を付ける。
-->
<script lang="ts">
	import { parseProgress, stripTags } from '../format';
	import type { SlideItem } from '../types';
	import Html from './Html.svelte';
	import ProgressBar from './ProgressBar.svelte';

	let { items, fontSize = 24 }: { items: SlideItem[]; fontSize?: number } = $props();

	let bars = $derived(items.map((item) => parseProgress(item.title ?? stripTags(item.html))));
	let allBars = $derived(bars.length > 0 && bars.every((b) => b !== null));
</script>

{#if allBars}
	<div class="bars">
		{#each bars as bar, i (i)}
			{#if bar}
				<ProgressBar
					label={bar.label}
					value={bar.value}
					color={i === bars.length - 1 && i > 0 ? 'var(--kz-accent5)' : 'var(--kz-accent1)'}
				/>
			{/if}
		{/each}
	</div>
{:else if items.length > 0}
	<ul class="items" style:font-size="{fontSize}px">
		{#each items as item, i (i)}
			<li>
				{#if item.title}<strong>{item.title}</strong>{/if}
				<Html html={item.html} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	.bars {
		display: flex;
		flex-direction: column;
		gap: 36px;
	}

	.items {
		margin: 0;
		padding-left: 1.2em;
		color: var(--kz-text-muted);
	}
</style>
