<!--
  スライドの図。archify の図があればそれを、なければ画像を枠いっぱいに収めて描く。
  キャプション（markdown の画像のタイトル）があれば、枠の中で図の下に添える。
-->
<script lang="ts">
	import type { Slide } from '../types';
	import ArchifyFigure from './ArchifyFigure.svelte';
	import Captioned from './Captioned.svelte';
	import Picture from './Picture.svelte';

	let { slide, index = 0 }: { slide: Slide; index?: number } = $props();

	let figure = $derived(slide.figures[index] ?? null);
	let image = $derived(figure ? null : (slide.images[index - slide.figures.length] ?? null));
</script>

{#if figure}
	<Captioned caption={figure.caption}><ArchifyFigure {figure} /></Captioned>
{:else if image}
	<Picture {image} fit="contain" />
{/if}
