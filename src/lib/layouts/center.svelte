<!-- タイトルと本文を中央にそろえる。Slidev の center と statement もこのレイアウトで描く。 -->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import SlideTitle from '../components/SlideTitle.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();
</script>

<div class="center kz-fit">
	<SlideTitle title={slide.titleHtml} accent={slide.titleAccentHtml} size={84} align="center" />
	{#if slide.subtitleHtml}<p class="subtitle kz-lines">{@html slide.subtitleHtml}</p>{/if}
	<Html html={slide.bodyHtml} class="center-body" />
</div>

<style>
	.center {
		position: absolute;
		left: 160px;
		top: 130px;
		width: 1600px;
		height: 820px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 32px;
		overflow: hidden;
	}

	.subtitle {
		margin: 0;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 36px;
		color: var(--kz-accent1);
	}

	.center :global(.center-body) {
		font-size: 36px;
	}
</style>
