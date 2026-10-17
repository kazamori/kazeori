<!--
  スライドの枠の装飾（スライドマスターにあたる部分）。
  左上と右下の正方形、右下の正方形の中のページ番号、左下のフッター。
  variant が section のときは、右側の accent1 の帯に重ねるため右下の正方形を白にする。
-->
<script lang="ts">
	import Square from './Square.svelte';

	let {
		number,
		footer,
		variant = 'content'
	}: { number: number; footer: string | null; variant?: 'content' | 'section' } = $props();
</script>

<Square x={0} y={0} size={63.2} color="var(--kz-accent2)" />
<Square x={63.2} y={62.8} size={36.7} color="var(--kz-accent3)" />
<Square x={99.9} y={36.5} size={26.5} color="var(--kz-accent4)" />
<Square x={1788.7} y={948.7} size={41.6} color="var(--kz-accent3)" />
<div class={['page', variant]}>{number}</div>
{#if footer}
	<div class="footer">{footer}</div>
{/if}

<style>
	.page {
		position: absolute;
		left: 1830.4px;
		top: 990.4px;
		width: 89.6px;
		height: 89.6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 24px;
		background: var(--kz-accent1);
		color: var(--kz-white);
	}

	.page.section {
		background: var(--kz-white);
		color: var(--kz-accent1);
	}

	.footer {
		position: absolute;
		left: 27.5px;
		top: 1020px;
		font-size: 20px;
		color: var(--kz-text-faint);
	}
</style>
