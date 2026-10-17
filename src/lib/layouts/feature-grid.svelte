<!-- 項目をカードの格子で並べる。pptx の slide4（Featured Icon）。項目の画像があればアイコンとして使う。 -->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import { accentAt, pad2 } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let columns = $derived(slide.items.length <= 4 ? 2 : 3);
</script>

<SlideHeader {slide} align="center" intro={slide.introHtml} />

<ul class="grid kz-fit" style:--columns={columns}>
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
		grid-template-columns: repeat(var(--columns), 1fr);
		grid-auto-rows: 1fr;
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
