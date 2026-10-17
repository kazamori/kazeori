<!-- スライドの図。archify の図があればそれを、なければ画像を枠いっぱいに収めて描く。 -->
<script lang="ts">
	import type { Slide } from '../types';
	import ArchifyFigure from './ArchifyFigure.svelte';
	import Picture from './Picture.svelte';

	let { slide, index = 0 }: { slide: Slide; index?: number } = $props();

	let figure = $derived(slide.figures[index] ?? null);
	let image = $derived(figure ? null : (slide.images[index - slide.figures.length] ?? null));
</script>

{#if figure}
	<ArchifyFigure {figure} />
{:else if image}
	<Picture {image} fit="contain" />
{/if}
