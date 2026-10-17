// 画像の参照先の解決。ローカルの画像、URL、archify の図、kazeori の模様を区別する。
import fs from 'node:fs';
import path from 'node:path';
import { ArchifyExtractError, extractArchify } from '../archify/extract.ts';
import { isPatternName, PATTERN_PREFIX, patternNames } from '../patterns.ts';
import type { ArchifyFigureData, SlideImage } from '../types.ts';
import { report, type DeckContext } from './context.ts';

/** 参照先を解決した結果。画像として描くもの（image）、archify の図（figure）、どちらでもないもの（null）。 */
export type ResolvedImage =
	{ kind: 'image'; image: SlideImage } | { kind: 'figure'; figure: ArchifyFigureData } | null;

function locate(url: string, slideFile: string, ctx: DeckContext, line: number): string {
	const clean = decodeURI(url.split(/[?#]/)[0]);
	if (!clean.startsWith('/')) return path.resolve(path.dirname(slideFile), clean);
	// `/` で始まるパスは、Slidev と同じくデッキの public/ から、なければ workspace のルートから探す
	const inPublic = path.join(ctx.deckDir, 'public', clean);
	const inRoot = path.join(ctx.workspace.root, clean);
	const publicExists = fs.existsSync(inPublic);
	if (publicExists && fs.existsSync(inRoot)) {
		report(
			ctx,
			'warning',
			slideFile,
			line,
			`${url} はデッキの public/ と workspace のルートの両方にあります。public/ のものを使います`
		);
	}
	return publicExists ? inPublic : inRoot;
}

function loadFigure(abs: string, alt: string, slideFile: string, line: number, ctx: DeckContext) {
	ctx.track(abs);
	try {
		return extractArchify(fs.readFileSync(abs, 'utf-8'), alt);
	} catch (e) {
		const reason = e instanceof ArchifyExtractError ? e.message : String(e);
		const name = path.relative(ctx.workspace.root, abs);
		report(ctx, 'error', slideFile, line, `archify の図 ${name} を読み込めません: ${reason}`);
		return null;
	}
}

function resolve(
	url: string,
	alt: string,
	caption: string | null,
	slideFile: string,
	line: number,
	ctx: DeckContext
): ResolvedImage {
	// キャプションがあるときだけ項目を持たせる
	const extra = caption ? { caption } : {};
	if (url.startsWith(PATTERN_PREFIX)) {
		const name = url.slice(PATTERN_PREFIX.length);
		if (isPatternName(name)) {
			return { kind: 'image', image: { src: '', alt, pattern: name, ...extra } };
		}
		const known = patternNames.join(', ');
		report(ctx, 'error', slideFile, line, `未知の模様「${name}」です。使える模様: ${known}`);
		return null;
	}
	if (/^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith('data:')) {
		return { kind: 'image', image: { src: url, alt, ...extra } };
	}
	const abs = locate(url, slideFile, ctx, line);
	if (!fs.existsSync(abs)) {
		report(ctx, 'error', slideFile, line, `画像 ${url} が見つかりません`);
		return null;
	}
	if (path.extname(abs).toLowerCase() === '.html') {
		const figure = loadFigure(abs, alt, slideFile, line, ctx);
		return figure ? { kind: 'figure', figure: { ...figure, ...extra } } : null;
	}
	return { kind: 'image', image: { src: ctx.resolveAsset(abs), alt, ...extra } };
}

/**
 * スライドの画像の参照先を解決する関数を作る。
 * 同じ画像を何度解決しても（本文と箇条書きの両方に現れるなど）、診断を一度しか積まないよう結果を覚えておく。
 */
export function createImageResolver(ctx: DeckContext, slideFile: string) {
	const cache = new Map<string, ResolvedImage>();
	return (url: string, alt: string, line: number, caption: string | null = null): ResolvedImage => {
		const key = `${url}\n${alt}\n${caption ?? ''}`;
		if (!cache.has(key)) cache.set(key, resolve(url, alt, caption, slideFile, line, ctx));
		return cache.get(key)!;
	};
}

export type ImageResolver = ReturnType<typeof createImageResolver>;
