<!--
  archify の図を Shadow DOM の中に描く。archify の CSS がスライドの CSS と干渉しないようにするため。
  @font-face は Shadow DOM の中では読み込まれないので、文書の <head> に一度だけ追加する。
-->
<script lang="ts">
	import type { ArchifyFigureData } from '../types';

	let { figure }: { figure: ArchifyFigureData } = $props();

	const overrides = `
:host { display: block; width: 100%; height: 100%; }
.kz-archify-root { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: transparent; }
.kz-archify-root > svg { width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; }
/* 静的な出力（PDF）にするため、動きを止める */
*, *::before, *::after { animation: none !important; transition: none !important; }
`;

	function escapeAttr(value: string): string {
		return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
	}

	function render(node: HTMLElement) {
		const fontFaceCss = figure.fontFaceCss;
		if (fontFaceCss) {
			const key = String(fontFaceCss.length) + fontFaceCss.slice(0, 64);
			const exists = [...document.head.querySelectorAll('style[data-kz-archify-fonts]')].some(
				(s) => s.getAttribute('data-kz-archify-fonts') === key
			);
			if (!exists) {
				const style = document.createElement('style');
				style.setAttribute('data-kz-archify-fonts', key);
				style.textContent = fontFaceCss;
				document.head.append(style);
			}
		}
		const root = node.shadowRoot ?? node.attachShadow({ mode: 'open' });
		const preset = figure.preset ? ` data-preset="${escapeAttr(figure.preset)}"` : '';
		root.innerHTML = `<style>${figure.css}</style><style>${overrides}</style><div class="kz-archify-root" data-theme="light"${preset}>${figure.svg}</div>`;
	}
</script>

<div class="figure" role="img" aria-label={figure.alt} {@attach render}></div>

<style>
	.figure {
		width: 100%;
		height: 100%;
	}
</style>
