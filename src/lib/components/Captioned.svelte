<!--
  図と、その下のキャプションを枠の中に並べる。キャプションの分だけ図の高さを縮め、両方を枠に収める。
  overlay のときは、キャプションを図の右下に重ねる（全面の画像など、図を縮めたくないとき）。
  キャプションがなければ、図だけを枠いっぱいに描く。
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		caption = null,
		overlay = false,
		children
	}: { caption?: string | null; overlay?: boolean; children: Snippet } = $props();
</script>

{#if caption}
	<figure class={['captioned', { overlay }]}>
		<div class="media">{@render children()}</div>
		<figcaption class="kz-caption kz-fit">{caption}</figcaption>
	</figure>
{:else}
	{@render children()}
{/if}

<style>
	.captioned {
		margin: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.media {
		flex: 1;
		min-height: 0;
	}

	figcaption {
		flex: none;
		max-height: 64px;
		overflow: hidden;
		text-align: center;
	}

	.overlay {
		position: relative;
	}

	.overlay figcaption {
		position: absolute;
		right: 0;
		bottom: 0;
		max-width: 60%;
		margin: 0;
		padding: 8px 16px;
		text-align: right;
		background: rgb(0 0 0 / 0.55);
		color: var(--kz-white);
		opacity: 1;
	}
</style>
