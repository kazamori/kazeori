<!--
  画像の枠。`pattern:<名前>` で指定したときは kazeori の模様を描く。
  画像がなければ accent 色の面で埋めて、レイアウトが崩れないようにする。
-->
<script lang="ts">
	import type { SlideImage } from '../types';
	import Pattern from './Pattern.svelte';

	let {
		image,
		fit = 'cover',
		fill = 'var(--kz-accent3)'
	}: { image: SlideImage | null | undefined; fit?: 'cover' | 'contain'; fill?: string } = $props();
</script>

{#if image?.pattern}
	<Pattern name={image.pattern} label={image.alt} />
{:else if image}
	<img class="picture" src={image.src} alt={image.alt} style:object-fit={fit} />
{:else}
	<div class="picture placeholder" style:background={fill}></div>
{/if}

<style>
	.picture {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
