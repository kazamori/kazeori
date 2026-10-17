<!-- 装飾の正方形。座標と大きさは 1920 x 1080 のキャンバス上の px。 -->
<script lang="ts">
	let { x, y, size, color }: { x: number; y: number; size: number; color: string } = $props();
</script>

<div
	class="square"
	style:left="{x}px"
	style:top="{y}px"
	style:width="{size}px"
	style:height="{size}px"
	style:background={color}
></div>

<style>
	.square {
		position: absolute;
	}
</style>
