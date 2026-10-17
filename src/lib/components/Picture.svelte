<!--
  画像の枠。`pattern:<名前>` で指定したときは kazeori の模様を描く。
  画像にキャプション（markdown の画像のタイトル）があれば、枠の中で画像の下に添える。
  画像がなければ accent 色の面で埋めて、レイアウトが崩れないようにする。
-->
<script lang="ts">
	import type { SlideImage } from '../types';
	import Captioned from './Captioned.svelte';
	import Pattern from './Pattern.svelte';

	let {
		image,
		fit = 'cover',
		fill = 'var(--kz-accent3)',
		overlayCaption = false
	}: {
		image: SlideImage | null | undefined;
		fit?: 'cover' | 'contain';
		fill?: string;
		/** キャプションを画像に重ねる（全面の画像のように、画像を縮めたくないとき） */
		overlayCaption?: boolean;
	} = $props();
</script>

{#if image}
	<Captioned caption={image.caption} overlay={overlayCaption}>
		{#if image.pattern}
			<Pattern name={image.pattern} label={image.alt} />
		{:else}
			<img class="picture" src={image.src} alt={image.alt} style:object-fit={fit} />
		{/if}
	</Captioned>
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
