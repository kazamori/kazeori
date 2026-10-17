<!-- 印刷用のビュー。全スライドを縦に並べ、1 スライドを 1 ページ（1920 x 1080 px）にする。PDF 出力で使う。 -->
<script lang="ts">
	import Slide from '#lib/components/Slide.svelte';
	import SlideCanvas from '#lib/components/SlideCanvas.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.deck.title}</title>
</svelte:head>

<div class={['print', { 'kz-dev': import.meta.env.DEV }]}>
	{#each data.deck.slides as slide (slide.number)}
		<div class="page">
			<SlideCanvas fit={false}><Slide {slide} deck={data.deck} /></SlideCanvas>
		</div>
	{/each}
</div>

<style>
	@page {
		size: 1920px 1080px;
		margin: 0;
	}

	.page {
		width: 1920px;
		height: 1080px;
		break-after: page;
		overflow: hidden;
	}

	.page:last-child {
		break-after: auto;
	}

	@media print {
		:global(html),
		:global(body) {
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
	}
</style>
