<!--
  スライドの図。slideVisuals の並び（archify の図が先、画像が後）の index 番目を、枠いっぱいに収めて描く。
  キャプション（markdown の画像のタイトル）があれば、枠の中で図の下に添える。
-->
<script lang="ts">
	import type { Slide } from '../types';
	import { slideVisuals } from '../visuals';
	import ArchifyFigure from './ArchifyFigure.svelte';
	import Captioned from './Captioned.svelte';
	import Picture from './Picture.svelte';

	let { slide, index = 0 }: { slide: Slide; index?: number } = $props();

	let visual = $derived(slideVisuals(slide)[index] ?? null);
</script>

{#if visual?.kind === 'figure'}
	<Captioned caption={visual.figure.caption}><ArchifyFigure figure={visual.figure} /></Captioned>
{:else if visual?.kind === 'image'}
	<Picture image={visual.image} fit="contain" />
{/if}
