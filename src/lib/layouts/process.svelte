<!-- 番号付きの工程。pptx の slide16（Process Infographic）。箇条書きの各項目を 1 工程とする。 -->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import { itemColorAt, pad2 } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let count = $derived(Math.max(1, slide.items.length));
</script>

<SlideHeader {slide} align="center" intro={slide.introHtml} />

<ol class="steps kz-fit" style:--count={count}>
	{#each slide.items as step, i (i)}
		<li class="step" style:--color={itemColorAt(i)}>
			<div class="chevron"><span>{pad2(i + 1)}</span></div>
			{#if step.title}<strong class="step-title">{step.title}</strong>{/if}
			<Html html={step.html} class="step-body" />
		</li>
	{/each}
</ol>

<style>
	.steps {
		position: absolute;
		left: 110px;
		top: 330px;
		width: 1700px;
		height: 630px;
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(var(--count), 1fr);
		gap: 0 36px;
		overflow: hidden;
	}

	.chevron {
		height: 260px;
		margin-right: -60px;
		margin-bottom: 40px;
		background: var(--color);
		clip-path: polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%, 22% 50%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--kz-white);
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 56px;
	}

	.step:last-child .chevron {
		margin-right: 0;
	}

	.step-title {
		display: block;
		font-family: var(--kz-font-heading);
		font-size: 26px;
		color: var(--color);
		margin-bottom: 10px;
	}

	.step :global(.step-body) {
		font-size: 22px;
		line-height: 1.5;
	}
</style>
