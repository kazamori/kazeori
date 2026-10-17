<!--
  画像 3 枚と、それぞれの説明。pptx の slide10（Three Picture）。
  画像は本文の画像を順に使い、説明は箇条書きの項目を順に対応させる。画像枠は正方形にしている。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import Picture from '../components/Picture.svelte';
	import SideColumn from '../components/SideColumn.svelte';
	import { accentAt } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let columns = $derived(
		[0, 1, 2].map((i) => ({ image: slide.images[i] ?? null, item: slide.items[i] ?? null }))
	);
</script>

<SideColumn {slide} width={440} html={slide.introHtml} fontSize={22} />

{#each columns as column, i (i)}
	<div class="column" style:left="{620 + i * 440}px" style:top="{i === 1 ? 260 : 180}px">
		<div class="picture"><Picture image={column.image} fill={accentAt(i + 1)} /></div>
		{#if column.item}
			<div class="text kz-fit">
				{#if column.item.title}
					<strong
						class="item-title"
						style:color={i === 2 ? 'var(--kz-accent5)' : 'var(--kz-accent1)'}
						>{column.item.title}</strong
					>
				{/if}
				<Html html={column.item.html} class="item-body" />
			</div>
		{/if}
	</div>
{/each}

<style>
	.column {
		position: absolute;
		width: 400px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.picture {
		height: 400px;
	}

	.text {
		max-height: 220px;
		overflow: hidden;
		text-align: center;
	}

	.item-title {
		display: block;
		font-family: var(--kz-font-heading);
		font-size: 26px;
		margin-bottom: 8px;
	}

	.text :global(.item-body) {
		font-size: 21px;
		line-height: 1.5;
	}
</style>
