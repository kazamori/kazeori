<!-- セクション扉。pptx の slide13（slideLayout17）。 -->
<script module lang="ts">
	import type { LayoutChrome } from '../types';

	export const chrome: LayoutChrome = 'section';
</script>

<script lang="ts">
	import Html from '../components/Html.svelte';
	import Picture from '../components/Picture.svelte';
	import SlideTitle from '../components/SlideTitle.svelte';
	import Square from '../components/Square.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let image = $derived(slide.images[0] ?? null);
</script>

<div class="band"></div>
{#if image}
	<div class="image"><Picture {image} /></div>
{:else}
	<Square x={972.7} y={132} size={408} color="var(--kz-accent3)" />
	<Square x={1380.7} y={540} size={408} color="var(--kz-accent2)" />
	<Square x={1176.7} y={540} size={204} color="var(--kz-accent4)" />
	<Square x={1584.7} y={336} size={204} color="var(--kz-white)" />
{/if}

<div class="heading kz-fit">
	<SlideTitle title={slide.title} accent={slide.titleAccent} size={96} />
</div>
<div class="rule"></div>
<div class="sub kz-fit">
	{#if slide.subtitle}<p class="subtitle kz-lines">{slide.subtitle}</p>{/if}
	<Html html={slide.bodyHtml} />
</div>

<style>
	.band {
		position: absolute;
		left: 1382px;
		top: 0;
		width: 538px;
		height: 1080px;
		background: var(--kz-accent1);
	}

	.image {
		position: absolute;
		left: 972.7px;
		top: 132px;
		width: 816px;
		height: 816px;
	}

	.heading {
		position: absolute;
		left: 109.5px;
		top: 160px;
		width: 780px;
		height: 430px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		overflow: hidden;
	}

	.rule {
		position: absolute;
		left: 126px;
		top: 615.6px;
		width: 725.7px;
		height: 4px;
		background: var(--kz-accent1);
	}

	.sub {
		position: absolute;
		left: 109.5px;
		top: 649.3px;
		width: 780px;
		height: 330px;
		overflow: hidden;
	}

	.subtitle {
		margin: 0 0 16px;
		font-family: var(--kz-font-heading);
		font-size: 48px;
		line-height: 1.3;
	}
</style>
