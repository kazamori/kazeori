// archify が出力した standalone HTML から、図の SVG と、それが参照する CSS を取り出す。
import { parseHTML } from 'linkedom';
import type { ArchifyFigureData } from '../types.ts';

export class ArchifyExtractError extends Error {}

/**
 * Shadow DOM の中で使えるように CSS を書き換える。
 * - `:root` の変数定義は Shadow DOM の中では当たらないので `:host` に置き換える。
 * - `@font-face` は Shadow DOM の中では読み込まれないので、別に取り出して文書側に置く。
 */
function splitCss(css: string): { css: string; fontFaceCss: string } {
	const fontFaces: string[] = [];
	const rest = css.replace(/@font-face\s*\{[^}]*\}/g, (block) => {
		fontFaces.push(block);
		return '';
	});
	return {
		css: rest.replace(/:root\b/g, ':host'),
		fontFaceCss: fontFaces.join('\n')
	};
}

/** archify の HTML を解析して、図のデータを返す。図が見つからなければ ArchifyExtractError を投げる。 */
export function extractArchify(html: string, alt: string): ArchifyFigureData {
	const { document } = parseHTML(html);
	const svgs = [...document.querySelectorAll('svg')];
	// viewer の部品（アイコンなど）にも svg があり得るので、図を表す svg を選ぶ
	const svg =
		svgs.find((s) => s.getAttribute('role') === 'img' && s.hasAttribute('viewBox')) ??
		svgs.find((s) => s.hasAttribute('viewBox') && s.hasAttribute('data-preset'));
	if (!svg) {
		throw new ArchifyExtractError('図の <svg viewBox> が見つかりません');
	}
	const styles = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '');
	if (styles.length === 0) {
		throw new ArchifyExtractError('<style> が見つかりません');
	}

	// スクリプトとイベント属性は取り込まない
	for (const el of [...svg.querySelectorAll('script')]) el.remove();
	for (const el of [svg, ...svg.querySelectorAll('*')]) {
		for (const attr of [...el.attributes]) {
			if (attr.name.toLowerCase().startsWith('on')) el.removeAttribute(attr.name);
		}
	}
	svg.removeAttribute('width');
	svg.removeAttribute('height');

	const { css, fontFaceCss } = splitCss(styles.join('\n'));
	return {
		alt,
		css,
		fontFaceCss,
		svg: svg.outerHTML,
		preset: svg.getAttribute('data-preset')
	};
}
