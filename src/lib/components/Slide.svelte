<!--
  1 枚のスライド。レイアウトを選び、枠の装飾と組み合わせて 1920 x 1080 に描く。
  描画後に .kz-fit の要素から文字がはみ出していないかを調べ、はみ出していれば data-overflow を付ける。
-->
<script lang="ts">
	import { layouts } from 'virtual:kazeori/layouts';
	import type { Deck, Slide } from '../types';
	import Chrome from './Chrome.svelte';

	let { slide, deck }: { slide: Slide; deck: Deck } = $props();

	let layout = $derived(layouts[slide.layout] ?? layouts.default);
	let Layout = $derived(layout.component);

	function checkOverflow(node: HTMLElement) {
		// slide を読んで、スライドが変わるたびに調べ直す
		void slide;
		const check = () => {
			for (const el of node.querySelectorAll<HTMLElement>('.kz-fit')) {
				const over = el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2;
				el.toggleAttribute('data-overflow', over);
			}
		};
		const frame = requestAnimationFrame(check);
		document.fonts?.ready.then(check);
		return () => cancelAnimationFrame(frame);
	}
</script>

<section
	class={['kz-theme', 'kz-slide', `kz-layout-${slide.layout}`, slide.className]}
	data-color={deck.color}
	data-slide={slide.number}
	{@attach checkOverflow}
>
	<Layout {slide} {deck} brand={deck.brand} />
	{#if layout.chrome !== 'none'}
		<Chrome number={slide.number} footer={deck.brand.copyright} variant={layout.chrome} />
	{/if}
</section>

<style>
	.kz-slide {
		position: relative;
		width: 1920px;
		height: 1080px;
		overflow: hidden;
		background: var(--kz-white);
	}
</style>
