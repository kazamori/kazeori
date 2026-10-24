// 1 枚のスライドの markdown を、レイアウトに渡す Slide に組み立てる。
//
// 既定のスロット（`::name::` で区切る前の部分）は、次の順に各部分へ割り当てる。
// 1. 画像だけの段落 → images（archify の図は figures）
// 2. 最初の # 見出し → title（フロントマターに title がないとき）
// 3. 最初の ## 見出し → subtitle
// 4. 最初の箇条書き → items（その前後の本文は introHtml、restHtml）
// 割り当てなかった要素は bodyHtml に残し、内容が消えないようにする。
import type { Heading, List, ListItem, Parent, RootContent } from 'mdast';
import { toString } from 'mdast-util-to-string';
import type { ArchifyFigureData, Slide, SlideImage, SlideItem } from '../types.ts';
import { asString, report, type DeckContext } from './context.ts';
import { createImageResolver, type ImageResolver } from './images.ts';
import { checkLayoutVisuals } from './keys.ts';
import {
	createHtmlRenderer,
	headingToInline,
	isImageOnlyParagraph,
	parseInline,
	parseMarkdown,
	type HtmlRenderer
} from './markdown.ts';
import { extractNotes, splitSlots, type RawSlide } from './split.ts';

const vuePattern =
	/<v-clicks?\b|<v-after\b|\bv-(?:click|after|motion|mark)\b|<[A-Z][A-Za-z0-9]*[\s/>]/;

/** 位置情報を持つ mdast の節から、元のファイルでの行番号を求める関数。 */
type LineOf = (node: { position?: { start: { line: number } } }) => number;

interface SlideScope {
	ctx: DeckContext;
	raw: RawSlide;
	resolveImage: ImageResolver;
	render: HtmlRenderer;
	/** 積んだ警告（同じ警告を重ねないため） */
	warned: Set<string>;
}

/**
 * 本文中の画像の参照先を書き換えた複製を返す（元の節は変えない）。
 * 文中には描けないもの（archify の図、模様、見つからない画像）は取り除き、図と模様は警告する。
 * 箇条書きの項目の中の画像は、項目の画像として別に描くので警告しない。
 * 同じ節を複数の部分（introHtml と bodyHtml など）に使うので、複製してから書き換える。
 */
function rewriteInlineImages(nodes: RootContent[], scope: SlideScope, lineOf: LineOf) {
	const warn = (line: number, message: string) => {
		// 同じ節を何度も書き換えるので、同じ警告は一度だけ積む
		const key = `${line}:${message}`;
		if (scope.warned.has(key)) return;
		scope.warned.add(key);
		report(scope.ctx, 'warning', scope.raw.file, line, message);
	};
	const visit = (parent: Parent, inItem: boolean) => {
		parent.children = parent.children.filter((child) => {
			if (child.type !== 'image') {
				if ('children' in child) visit(child, inItem || child.type === 'listItem');
				return true;
			}
			const resolved = scope.resolveImage(child.url, child.alt ?? '', lineOf(child));
			if (resolved?.kind === 'image' && !resolved.image.pattern) {
				child.url = resolved.image.src;
				return true;
			}
			if (resolved?.kind === 'figure' && !inItem) {
				warn(
					lineOf(child),
					'archify の図は、既定のスロットに画像だけの段落として置いてください。この図は描画しません'
				);
			}
			if (resolved?.kind === 'image' && resolved.image.pattern && !inItem) {
				warn(
					lineOf(child),
					'模様は、既定のスロットの画像だけの段落かフロントマターの image で指定してください。この位置の模様は描画しません'
				);
			}
			return false;
		});
	};
	const root: Parent = { type: 'root', children: structuredClone(nodes) } as Parent;
	visit(root, false);
	// 画像を取り除いて空になった段落は残さない
	return (root.children as RootContent[]).filter(
		(node) => !(node.type === 'paragraph' && node.children.length === 0)
	);
}

/** 箇条書きの 1 項目を組み立てる。項目の中の最初の見出しを項目名に、最初の画像だけの段落を項目の画像にする。 */
function buildItem(item: ListItem, scope: SlideScope, lineOf: LineOf): SlideItem {
	let title: string | null = null;
	let image: SlideImage | null = null;
	const rest: RootContent[] = [];
	for (const child of item.children as RootContent[]) {
		if (title === null && child.type === 'heading') {
			title = toString(child);
			continue;
		}
		if (image === null && isImageOnlyParagraph(child) && child.type === 'paragraph') {
			const img = child.children.find((c) => c.type === 'image');
			const resolved =
				img?.type === 'image' ? scope.resolveImage(img.url, img.alt ?? '', lineOf(img)) : null;
			if (resolved?.kind === 'image') {
				image = resolved.image;
				continue;
			}
		}
		rest.push(child);
	}
	return { title, html: scope.render(rewriteInlineImages(rest, scope, lineOf)), image };
}

function isHeading(depth: number) {
	return (node: RootContent) => node.type === 'heading' && node.depth === depth;
}

/** 1 枚のスライドを組み立てる。 */
export async function buildSlide(
	raw: RawSlide,
	number: number,
	layout: string,
	ctx: DeckContext
): Promise<Slide> {
	const { content, notes } = extractNotes(raw.content);
	const fm = raw.frontmatter;

	if (vuePattern.test(content)) {
		report(
			ctx,
			'warning',
			raw.file,
			raw.line,
			'Vue コンポーネントや v-click などの段階表示には対応していません。中身だけを描画します'
		);
	}

	const parts = splitSlots(content).map((part) => ({ ...part, tree: parseMarkdown(part.content) }));
	const scope: SlideScope = {
		ctx,
		raw,
		resolveImage: createImageResolver(ctx, raw.file),
		render: await createHtmlRenderer(parts.map((p) => p.tree)),
		warned: new Set()
	};

	const images: SlideImage[] = [];
	const figures: ArchifyFigureData[] = [];
	const collect = (url: string, alt: string, line: number, caption: string | null = null) => {
		const resolved = scope.resolveImage(url, alt, line, caption);
		if (resolved?.kind === 'image') images.push(resolved.image);
		if (resolved?.kind === 'figure') figures.push(resolved.figure);
	};

	// フロントマターの image / images（Slidev の image-left などと同じ指定）
	const fmImages = [fm.image, ...(Array.isArray(fm.images) ? fm.images : [fm.images])];
	for (const url of fmImages) if (typeof url === 'string') collect(url, '', raw.line);

	const title = parseInline(
		typeof fm.title === 'string' || typeof fm.title === 'number' ? String(fm.title) : null
	);
	const titleAccent = parseInline(asString(fm.titleAccent));
	const slide: Slide = {
		number,
		layout,
		className: typeof fm.class === 'string' ? fm.class : '',
		frontmatter: fm,
		title: title?.text ?? null,
		titleAccent: titleAccent?.text ?? null,
		subtitle: null,
		titleHtml: title?.html ?? null,
		titleAccentHtml: titleAccent?.html ?? null,
		subtitleHtml: null,
		introHtml: '',
		items: [],
		restHtml: '',
		bodyHtml: '',
		images,
		figures,
		slots: {},
		notes,
		source: { file: raw.file, line: raw.line }
	};

	for (const part of parts) {
		const lineOf: LineOf = (node) =>
			raw.contentLine + part.offset + (node.position?.start.line ?? 1) - 1;

		if (part.name !== 'default') {
			slide.slots[part.name] = scope.render(rewriteInlineImages(part.tree.children, scope, lineOf));
			continue;
		}

		const body: RootContent[] = [];
		for (const node of part.tree.children) {
			if (isImageOnlyParagraph(node) && node.type === 'paragraph') {
				for (const img of node.children) {
					if (img.type === 'image') collect(img.url, img.alt ?? '', lineOf(img), img.title ?? null);
				}
			} else {
				body.push(node);
			}
		}

		if (slide.title === null) {
			const i = body.findIndex(isHeading(1));
			if (i >= 0) {
				const heading = headingToInline(body.splice(i, 1)[0] as Heading);
				slide.title = heading?.text ?? null;
				slide.titleHtml = heading?.html ?? null;
			}
		}
		const sub = body.findIndex(isHeading(2));
		if (sub >= 0) {
			const heading = headingToInline(body.splice(sub, 1)[0] as Heading);
			slide.subtitle = heading?.text ?? null;
			slide.subtitleHtml = heading?.html ?? null;
		}

		const listIndex = body.findIndex((node) => node.type === 'list');
		if (listIndex >= 0) {
			const list = body[listIndex] as List;
			slide.items = list.children.map((item) => buildItem(item, scope, lineOf));
			slide.introHtml = scope.render(rewriteInlineImages(body.slice(0, listIndex), scope, lineOf));
			slide.restHtml = scope.render(rewriteInlineImages(body.slice(listIndex + 1), scope, lineOf));
		} else {
			slide.introHtml = scope.render(rewriteInlineImages(body, scope, lineOf));
		}
		slide.bodyHtml = scope.render(rewriteInlineImages(body, scope, lineOf));
	}

	checkLayoutVisuals(
		layout,
		{ images: images.length, figures: figures.length },
		raw.file,
		raw.line,
		ctx
	);
	return slide;
}
