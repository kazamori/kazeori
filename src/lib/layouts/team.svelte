<!--
  チーム紹介。pptx の slide15（Our Team）。
  箇条書きの各項目を 1 人として、項目の画像を写真、見出しを氏名、続く本文を役職と紹介文にする。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import Picture from '../components/Picture.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import { accentAt } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	// 名前の色はテンプレートと同じく、3 人目までを青系、4 人目をオレンジにする
	const nameColors = [accentAt(0), accentAt(1), accentAt(2), accentAt(4)];
	let columns = $derived(Math.min(4, Math.max(1, slide.items.length)));
</script>

<SlideHeader {slide} align="center" />

<ul class="members kz-fit" style:--columns={columns}>
	{#each slide.items as member, i (i)}
		<li class="member">
			<div class="photo"><Picture image={member.image} fill="var(--kz-surface)" /></div>
			{#if member.title}<strong class="name" style:color={nameColors[i % nameColors.length]}
					>{member.title}</strong
				>{/if}
			<Html html={member.html} class="member-body" />
		</li>
	{/each}
</ul>

<style>
	.members {
		position: absolute;
		left: 160px;
		top: 300px;
		width: 1600px;
		height: 660px;
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(var(--columns), minmax(0, 370px));
		justify-content: center;
		gap: 50px;
		overflow: hidden;
	}

	.photo {
		width: 100%;
		aspect-ratio: 1;
		margin-bottom: 24px;
	}

	.name {
		display: block;
		font-family: var(--kz-font-heading);
		font-size: 30px;
		margin-bottom: 6px;
	}

	.member :global(.member-body) {
		font-size: 22px;
		line-height: 1.5;
	}

	.member :global(.member-body p:first-child) {
		font-style: italic;
		color: var(--kz-text-faint);
	}
</style>
