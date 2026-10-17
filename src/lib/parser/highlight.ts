// shiki によるコードのハイライト。Slidev の行ハイライト記法（```ts {2,3}）に対応する。
import type { Element, Root } from 'hast';
import { bundledLanguages, createHighlighter, type Highlighter } from 'shiki';

const theme = 'github-light';

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	highlighterPromise ??= createHighlighter({ themes: [theme], langs: [] });
	return highlighterPromise;
}

function isSupportedLanguage(lang: string): boolean {
	return lang in bundledLanguages;
}

/** 使う言語をまとめて読み込んだハイライタを返す。未対応の言語は無視する（プレーンテキストで描く）。 */
export async function prepareHighlighter(langs: Iterable<string>): Promise<Highlighter> {
	const highlighter = await getHighlighter();
	const loaded = new Set(highlighter.getLoadedLanguages());
	const missing = [...new Set(langs)].filter((l) => isSupportedLanguage(l) && !loaded.has(l));
	if (missing.length > 0) {
		await highlighter.loadLanguage(...(missing as (keyof typeof bundledLanguages)[]));
	}
	return highlighter;
}

/**
 * コードフェンスのメタ情報 `{2,4-5}` から強調する行番号を求める。
 * Slidev のクリックで切り替える記法 `{1|2-3}` は、最初の段階だけを使う（静的な出力のため）。
 */
export function parseHighlightLines(meta: string | null | undefined): Set<number> {
	const lines = new Set<number>();
	const m = meta ? /\{([^}]*)\}/.exec(meta) : null;
	if (!m) return lines;
	const first = m[1].split('|')[0].trim();
	if (first === '' || first === '*' || first === 'all') return lines;
	for (const part of first.split(',')) {
		const range = /^(\d+)(?:-(\d+))?$/.exec(part.trim());
		if (!range) continue;
		const from = Number(range[1]);
		const to = range[2] ? Number(range[2]) : from;
		for (let n = from; n <= to; n++) lines.add(n);
	}
	return lines;
}

/** コードを hast の <pre> 要素に変換する。 */
export function highlightToHast(
	highlighter: Highlighter,
	code: string,
	lang: string | null | undefined,
	meta: string | null | undefined
): Element {
	const language = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
	const highlighted = parseHighlightLines(meta);
	const root = highlighter.codeToHast(code, {
		lang: language,
		theme,
		transformers: [
			{
				line(node, line) {
					if (highlighted.size > 0) {
						this.addClassToHast(node, highlighted.has(line) ? 'highlighted' : 'dimmed');
					}
				}
			}
		]
	}) as Root;
	return root.children[0] as Element;
}
