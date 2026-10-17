// markdown の解析と HTML への変換。コードは shiki でハイライトする。
import type { Element } from 'hast';
import { toHtml } from 'hast-util-to-html';
import type { Code, Image, Root, RootContent } from 'mdast';
import { toHast } from 'mdast-util-to-hast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { highlightToHast, prepareHighlighter } from './highlight.ts';

const processor = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdown(text: string): Root {
	return processor.parse(text) as Root;
}

export function walkImages(node: Root | RootContent, visit: (img: Image) => void) {
	if (node.type === 'image') visit(node);
	if ('children' in node) for (const child of node.children) walkImages(child, visit);
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
				image: (_state, node: Image): Element => imageToHast(node)
			}
		});
		return toHtml(hast, { allowDangerousHtml: true });
	};
}
