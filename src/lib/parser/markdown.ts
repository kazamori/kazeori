// markdown の解析と HTML への変換。コードは shiki でハイライトする。
import type { Element } from 'hast';
import { toHtml } from 'hast-util-to-html';
import type { Code, Heading, Image, Link, PhrasingContent, Root, RootContent } from 'mdast';
import { defaultHandlers, toHast, type State } from 'mdast-util-to-hast';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { normalizeTitle } from './context.ts';
import { highlightToHast, prepareHighlighter } from './highlight.ts';

const processor = unified().use(remarkParse).use(remarkGfm);

/**
 * タイトルとサブタイトルの解析に使う。ブロックの書式を無効にし、「1. 」や「# 」で始まる行も段落として読む。
 * 行頭の HTML（htmlFlow）も無効にして、`<a href>` などを段落の中の HTML として読む。
 */
const inlineProcessor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(function () {
		const data = this.data();
		(data.micromarkExtensions ??= []).push({
			disable: {
				null: [
					'blockQuote',
					'codeFenced',
					'codeIndented',
					'definition',
					'gfmFootnoteDefinition',
					'headingAtx',
					'htmlFlow',
					'list',
					'setextUnderline',
					'table',
					'thematicBreak'
				]
			}
		});
	});

export function parseMarkdown(text: string): Root {
	return processor.parse(text) as Root;
}

function collectCodeLangs(node: Root | RootContent, langs: Set<string>) {
	if (node.type === 'code' && node.lang) langs.add(node.lang);
	if ('children' in node) for (const child of node.children) collectCodeLangs(child, langs);
}

/** 画像だけ（と空白）からなる段落か。 */
export function isImageOnlyParagraph(node: RootContent): boolean {
	if (node.type !== 'paragraph') return false;
	const meaningful = node.children.filter((c) => !(c.type === 'text' && c.value.trim() === ''));
	return meaningful.length > 0 && meaningful.every((c) => c.type === 'image');
}

export type HtmlRenderer = (nodes: RootContent[]) => string;

/** 外部の URL へのリンクは、発表中のデッキから離れないように別のタブで開く。 */
function linkToHast(state: State, node: Link): Element {
	const element = defaultHandlers.link(state, node);
	if (/^https?:\/\//i.test(node.url)) {
		element.properties.target = '_blank';
		element.properties.rel = ['noopener', 'noreferrer'];
	}
	return element;
}

/**
 * 本文中の画像を hast にする。画像のタイトル（`![alt](src "キャプション")`）があれば、画像の下にキャプションを添える。
 * 段落の中に置かれるので、<figure> ではなく <span> で包む（表示は CSS でブロックにする）。
 */
function imageToHast(node: Image): Element {
	const img: Element = {
		type: 'element',
		tagName: 'img',
		properties: { src: node.url, alt: node.alt ?? '' },
		children: []
	};
	if (!node.title) return img;
	return {
		type: 'element',
		tagName: 'span',
		properties: { className: ['kz-figure'] },
		children: [
			img,
			{
				type: 'element',
				tagName: 'span',
				properties: { className: ['kz-caption'] },
				children: [{ type: 'text', value: node.title }]
			}
		]
	};
}

/**
 * mdast の節を HTML にする関数を作る。木に含まれるコードの言語を先に読み込んでおく。
 * markdown は workspace の持ち主が書いたもので、Slidev と同じく HTML の直書きも許す。
 */
export async function createHtmlRenderer(trees: Root[]): Promise<HtmlRenderer> {
	const langs = new Set<string>();
	for (const tree of trees) collectCodeLangs(tree, langs);
	const highlighter = await prepareHighlighter(langs);
	return (nodes) => {
		const hast = toHast({ type: 'root', children: nodes } as Root, {
			allowDangerousHtml: true,
			handlers: {
				code: (_state, node: Code): Element =>
					highlightToHast(highlighter, node.value, node.lang, node.meta),
				image: (_state, node: Image): Element => imageToHast(node),
				link: linkToHast
			}
		});
		return toHtml(hast, { allowDangerousHtml: true });
	};
}

/** タイトルやサブタイトルの、素の文字列と HTML。どちらも改行は \n で表す。 */
export interface InlineText {
	text: string;
	html: string;
}

const brPattern = /^<br\s*\/?>$/i;

/** 句の並びの `<br>` を改行の文字に置き換えた複製を返す。 */
function replaceBreaks(nodes: PhrasingContent[]): PhrasingContent[] {
	return nodes.map((node): PhrasingContent => {
		if (node.type === 'html' && brPattern.test(node.value.trim()))
			return { type: 'text', value: '\n' };
		if ('children' in node)
			return { ...node, children: replaceBreaks(node.children) } as PhrasingContent;
		return node;
	});
}

/** 句の並びを、タイトル向けの素の文字列と HTML にする。素の文字列からは HTML のタグを除く。 */
function phrasingToInline(nodes: PhrasingContent[]): InlineText | null {
	const children = replaceBreaks(nodes);
	const text = normalizeTitle(toString({ type: 'paragraph', children }, { includeHtml: false }));
	if (text === null) return null;
	const hast = toHast({ type: 'root', children: [{ type: 'paragraph', children }] } as Root, {
		allowDangerousHtml: true,
		handlers: { link: linkToHast }
	});
	// 段落の <p> は描かず、中身だけを使う
	const paragraph = hast.type === 'root' ? hast.children.find((c) => c.type === 'element') : null;
	const html = toHtml(paragraph && 'children' in paragraph ? paragraph.children : [], {
		allowDangerousHtml: true
	}).trim();
	return { text, html };
}

/**
 * フロントマターに書いたタイトルなどの文字列を、インラインの markdown として解析する。
 * `<br>` と YAML の改行は改行にする。リンク、太字、インラインのコード、HTML の直書きを使える。
 */
export function parseInline(value: string | null): InlineText | null {
	const source = normalizeTitle(value);
	if (source === null) return null;
	const tree = inlineProcessor.parse(source) as Root;
	// 空行で段落が分かれたときは、改行でつなぐ
	const nodes: PhrasingContent[] = [];
	for (const node of tree.children) {
		if (node.type !== 'paragraph') continue;
		if (nodes.length > 0) nodes.push({ type: 'text', value: '\n' });
		nodes.push(...node.children);
	}
	return phrasingToInline(nodes);
}

/** 本文の見出しを、タイトル向けの素の文字列と HTML にする。 */
export function headingToInline(node: Heading): InlineText | null {
	return phrasingToInline(node.children);
}
