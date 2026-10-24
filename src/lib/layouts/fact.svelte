<!--
  大きな数値を見せる（Slidev の fact と同じ）。タイトルを数値として大きく描く。
  「### 220」のように見出しを持つ箇条書きは、数値と説明の組として横に並べる（pptx の slide9 の 220、+87）。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import { accentAt } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let stats = $derived(slide.items.filter((item) => item.title !== null));
	let body = $derived(stats.length > 0 ? slide.introHtml + slide.restHtml : slide.bodyHtml);
</script>

<div class="fact kz-fit">
	{#if slide.titleHtml}
		<p class="value kz-lines">
			{@html slide.titleHtml}{#if slide.titleAccentHtml}<span class="unit"
					>{@html slide.titleAccentHtml}</span
				>{/if}
		</p>
	{/if}
	{#if slide.subtitleHtml}<p class="subtitle kz-lines">{@html slide.subtitleHtml}</p>{/if}
	<Html html={body} class="fact-body" />
	{#if stats.length > 0}
		<div class="stats">
			{#each stats as stat, i (i)}
				<div class="stat">
					<span class="stat-value" style:color={accentAt(i === 0 ? 0 : 2)}>{stat.title}</span>
					<Html html={stat.html} class="stat-body" />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.fact {
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
		overflow: hidden;
	}

	.value {
		margin: 0;
		font-family: var(--kz-font-heading);
		font-weight: 800;
		font-size: 220px;
		line-height: 1;
		color: var(--kz-accent1);
	}

	.unit {
		font-size: 0.45em;
		margin-left: 0.1em;
	}

	.subtitle {
		margin: 24px 0 0;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 44px;
		color: var(--kz-text);
	}

	.fact :global(.fact-body) {
		margin-top: 24px;
		font-size: 32px;
	}

	.stats {
		margin-top: 60px;
		display: flex;
		gap: 120px;
	}

	.stat {
		max-width: 420px;
	}

	.stat-value {
		display: block;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 72px;
	}

	.stat :global(.stat-body) {
		font-size: 24px;
	}
</style>
