<!--
  人物紹介。pptx の slide14。
  写真枠はテンプレートでは縦長だが、カザモリスタイルの正方形の意匠にそろえて正方形にしている。
  タイトルを氏名、サブタイトルを役職、最初の箇条書きより前の本文を紹介文、画像を写真にする。
  「ラベル 75%」の形の箇条書きは進捗バーとして、それ以外は通常の本文として右に置く。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import Picture from '../components/Picture.svelte';
	import ProgressList from '../components/ProgressList.svelte';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();
</script>

<div class="card kz-fit">
	{#if slide.title}<p class="name kz-lines">{slide.title}</p>{/if}
	{#if slide.subtitle}<p class="role kz-lines">{slide.subtitle}</p>{/if}
	<Html html={slide.introHtml} class="bio" />
</div>
<div class="photo"><Picture image={slide.images[0]} fill="var(--kz-accent3)" /></div>

<div class="side kz-fit">
	<ProgressList items={slide.items} fontSize={28} />
	<Html html={slide.restHtml} />
</div>

<style>
	.card {
		position: absolute;
		left: 110px;
		top: 320px;
		width: 520px;
		height: 480px;
		padding: 56px 40px;
		box-sizing: border-box;
		background: var(--kz-accent1);
		color: var(--kz-white);
		overflow: hidden;
	}

	.name {
		margin: 0;
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 48px;
		line-height: 1.2;
	}

	.role {
		margin: 8px 0 0;
		font-style: italic;
		font-size: 26px;
	}

	.card :global(.bio) {
		margin-top: 60px;
		font-size: 26px;
		color: var(--kz-white);
	}

	.photo {
		position: absolute;
		left: 630px;
		top: 260px;
		width: 440px;
		height: 440px;
	}

	.side {
		position: absolute;
		left: 1170px;
		top: 200px;
		width: 640px;
		height: 760px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 40px;
		overflow: hidden;
	}

	.side :global(.kz-prose) {
		font-size: 28px;
	}
</style>
