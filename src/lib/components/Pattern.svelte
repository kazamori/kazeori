<!--
  kazeori の模様（`pattern:<名前>`）を描く。色は CSS 変数で塗るので、デッキの配色（blue / green）に合う。
  フラクタルの模様は、枠の縦横比に合わせて正方形を敷き詰めて描くので、表示している枠の大きさを測る。
-->
<script lang="ts">
	import { drawPattern, parsePattern } from '../patterns';

	let { name, label = '' }: { name: string; label?: string } = $props();

	const fills = ['var(--kz-accent1)', 'var(--kz-accent3)', 'var(--kz-accent4)'];

	let aspect = $state(1);
	let spec = $derived(parsePattern(name));
	let drawing = $derived(spec ? drawPattern(spec, aspect) : null);

	function measure(node: SVGSVGElement) {
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			if (width > 0 && height > 0) aspect = width / height;
		});
		observer.observe(node);
		return () => observer.disconnect();
	}
</script>

{#if drawing}
	<svg
		class="pattern"
		viewBox="0 0 {drawing.width} {drawing.height}"
		preserveAspectRatio="xMidYMid slice"
		role="img"
		aria-label={label || name}
		{@attach measure}
	>
		<rect class="background" width={drawing.width} height={drawing.height} />
		{#each drawing.rects as rect (`${rect.x}-${rect.y}-${rect.size}`)}
			<rect
				x={rect.x}
				y={rect.y}
				width={rect.size}
				height={rect.size}
				style:fill={fills[rect.level]}
			/>
		{/each}
	</svg>
{/if}

<style>
	.pattern {
		display: block;
		width: 100%;
		height: 100%;
		/* 隣り合うマスの境界に細い線が出ないようにする */
		shape-rendering: crispEdges;
	}

	.background {
		fill: color-mix(in srgb, var(--kz-accent1) 10%, var(--kz-white));
	}
</style>
