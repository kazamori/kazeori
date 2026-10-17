<!--
  発表ビュー。矢印キー、Space、PageUp / PageDown、マウスのクリックで移動し、f で全画面、o で一覧表示に切り替える。
  現在のスライド番号を URL のハッシュ（#3）に保持して、リロードしても位置を保つ。
-->
<script lang="ts">
	import Slide from '#lib/components/Slide.svelte';
	import SlideCanvas from '#lib/components/SlideCanvas.svelte';

	let { data } = $props();

	let deck = $derived(data.deck);
	let total = $derived(deck.slides.length);
	let current = $state(0);
	let overview = $state(false);

	function readHash() {
		const n = Number(location.hash.slice(1));
		current = Number.isInteger(n) && n >= 1 ? Math.min(n, total) - 1 : 0;
	}

	function go(index: number) {
		const next = Math.max(0, Math.min(total - 1, index));
		history.replaceState(history.state, '', `#${next + 1}`);
		current = next;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
			case 'PageDown':
			case ' ':
			case 'Enter':
				if (!overview) go(current + 1);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'PageUp':
			case 'Backspace':
				if (!overview) go(current - 1);
				break;
			case 'Home':
				go(0);
				break;
			case 'End':
				go(total - 1);
				break;
			case 'f':
				if (document.fullscreenElement) document.exitFullscreen();
				else document.documentElement.requestFullscreen();
				break;
			case 'o':
				overview = !overview;
				break;
			case 'Escape':
				overview = false;
				break;
			default:
				return;
		}
		event.preventDefault();
	}

	// クリックで次のスライドへ進む。リンクやボタンの操作、文字の選択、一覧表示のときは進まない
	function onclick(event: MouseEvent) {
		if (overview || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
		const target = event.target as Element | null;
		if (target?.closest('a, button, input, textarea, select, summary, [contenteditable]')) return;
		if (window.getSelection()?.toString()) return;
		go(current + 1);
	}

	function select(index: number) {
		go(index);
		overview = false;
	}

	// ハッシュを読むのはブラウザでだけ行う
	function init() {
		readHash();
	}
</script>

<svelte:window {onkeydown} {onclick} onhashchange={readHash} />

<svelte:head>
	<title>{deck.title}</title>
</svelte:head>

<div class={['presenter', { 'kz-dev': import.meta.env.DEV }]} {@attach init}>
	{#if overview}
		<ol class="overview">
			{#each deck.slides as slide, i (slide.number)}
				<li>
					<button class={{ active: i === current }} onclick={() => select(i)}>
						<SlideCanvas><Slide {slide} {deck} /></SlideCanvas>
						<span class="number">{slide.number}</span>
					</button>
				</li>
			{/each}
		</ol>
	{:else if deck.slides[current]}
		<SlideCanvas><Slide slide={deck.slides[current]} {deck} /></SlideCanvas>
	{/if}
</div>

<style>
	.presenter {
		position: fixed;
		inset: 0;
		background: #111;
	}

	.overview {
		height: 100%;
		margin: 0;
		padding: 24px;
		box-sizing: border-box;
		overflow-y: auto;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 24px;
	}

	.overview button {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		padding: 0;
		border: 4px solid transparent;
		background: none;
		cursor: pointer;
	}

	.overview button.active {
		border-color: #44c8f5;
	}

	.number {
		position: absolute;
		left: 8px;
		bottom: 8px;
		padding: 2px 8px;
		background: rgb(0 0 0 / 0.6);
		color: #fff;
		font-size: 14px;
	}
</style>
