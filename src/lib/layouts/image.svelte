<!-- 画像を全面に置く（Slidev の image と同じ）。タイトルがあれば左下の accent1 の帯に重ねる。 -->
<script module lang="ts">
	import type { LayoutChrome } from '../types';

	export const chrome: LayoutChrome = 'none';
</script>

<script lang="ts">
	import Picture from '../components/Picture.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();
</script>

<div class="image"><Picture image={slide.images[0]} /></div>
{#if slide.title || slide.subtitle}
	<div class="caption kz-fit">
		{#if slide.title}<p class="title kz-lines">{slide.title}</p>{/if}
		{#if slide.subtitle}<p class="subtitle kz-lines">{slide.subtitle}</p>{/if}
	</div>
{/if}

<style>
	.image {
		position: absolute;
		inset: 0;
	}

	.caption {
		position: absolute;
		left: 0;
		bottom: 120px;
		max-width: 1100px;
		max-height: 400px;
		padding: 40px 60px 40px 110px;
		background: var(--kz-accent1);
		color: var(--kz-white);
		overflow: hidden;
	}

	.title {
		margin: 0;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 64px;
		line-height: 1.2;
	}

	.subtitle {
		margin: 12px 0 0;
		font-size: 30px;
	}
</style>
