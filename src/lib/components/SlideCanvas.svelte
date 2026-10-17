<!--
  1920 x 1080 px の固定キャンバス。fit のときは親要素の大きさに合わせて縮小拡大する。
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, fit = true }: { children: Snippet; fit?: boolean } = $props();

	let scale = $state(1);

	function observe(node: HTMLElement) {
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			scale = Math.min(width / 1920, height / 1080);
		});
		observer.observe(node);
		return () => observer.disconnect();
	}
</script>

{#if fit}
	<div class="viewport" {@attach observe}>
		<div class="canvas fit" style:transform="translate(-50%, -50%) scale({scale})">
			{@render children()}
		</div>
	</div>
{:else}
	<div class="canvas">
		{@render children()}
	</div>
{/if}

<style>
	.viewport {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.canvas {
		position: relative;
		width: 1920px;
		height: 1080px;
		overflow: hidden;
	}

	.canvas.fit {
		position: absolute;
		top: 50%;
		left: 50%;
		transform-origin: center center;
	}
</style>
