<!--
  年表。pptx の slide17（Timeline Infographic）。
  箇条書きの各項目を 1 つの出来事とし、見出しを矢羽根の上の日付、続く本文を説明として上下交互に置く。
-->
<script lang="ts">
	import Html from '../components/Html.svelte';
	import SlideHeader from '../components/SlideHeader.svelte';
	import { accentAt } from '../format';
	import type { LayoutProps } from '../types';

	let { slide }: LayoutProps = $props();

	let count = $derived(Math.max(1, slide.items.length));
</script>

<SlideHeader {slide} align="center" />

<ol class="events" style:--count={count}>
	{#each slide.items as event, i (i)}
		<li class={['event', i % 2 === 0 ? 'above' : 'below']} style:--color={accentAt(i)}>
			<div class="text kz-fit"><Html html={event.html} class="event-body" /></div>
			<div class="arrow"><span>{event.title ?? ''}</span></div>
		</li>
	{/each}
</ol>

<style>
	.events {
		position: absolute;
		left: 110px;
		top: 260px;
		width: 1700px;
		height: 700px;
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(var(--count), 1fr);
	}

	.event {
		position: relative;
	}

	.arrow {
		position: absolute;
		left: 0;
		right: -24px;
		top: 300px;
		height: 72px;
		background: var(--color);
		clip-path: polygon(
			0 0,
			calc(100% - 28px) 0,
			100% 50%,
			calc(100% - 28px) 100%,
			0 100%,
			28px 50%
		);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--kz-white);
		font-family: var(--kz-font-heading);
		font-weight: 700;
		font-size: 24px;
	}

	.text {
		position: absolute;
		left: 12px;
		right: 12px;
		height: 260px;
		overflow: hidden;
		text-align: center;
		display: flex;
		flex-direction: column;
	}

	.above .text {
		top: 20px;
		justify-content: flex-end;
	}

	.below .text {
		top: 412px;
		justify-content: flex-start;
	}

	.text :global(.event-body) {
		font-size: 22px;
		line-height: 1.5;
	}

	.text :global(.event-body strong) {
		display: block;
		color: var(--color);
		font-family: var(--kz-font-heading);
		font-size: 26px;
	}
</style>
