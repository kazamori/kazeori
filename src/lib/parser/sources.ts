// `src` で読み込む共通スライドの展開。
import fs from 'node:fs';
import path from 'node:path';
import { report, type DeckContext } from './context.ts';
import { splitSlides, type RawSlide } from './split.ts';

const placeholderPattern = /\{\{\s*(title|author|event|date)\s*\}\}/g;

/** 共通スライドの本文で置き換える値（デッキの headmatter の値）。 */
export type PlaceholderValues = Record<'title' | 'author' | 'event' | 'date', string | null>;

/** ファイルの本文を読む。読めなければ null。 */
export function readText(file: string): string | null {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch {
		return null;
	}
}

/**
 * `src` で読み込む共通スライドを展開する。stack は読み込み中のファイルで、循環の検出に使う。
 * 読み込む側のフロントマターは、読み込んだ最初のスライドに上書きで合成する（Slidev と同じ）。
 */
export function expandSources(
	slides: RawSlide[],
	ctx: DeckContext,
	values: PlaceholderValues,
	stack: string[]
): RawSlide[] {
	const result: RawSlide[] = [];
	for (const slide of slides) {
		const { src, ...override } = slide.frontmatter;
		if (src === undefined) {
			result.push(slide);
			continue;
		}
		if (typeof src !== 'string') {
			report(ctx, 'error', slide.file, slide.line, 'src は文字列で指定してください');
			continue;
		}
		const file = src.startsWith('/')
			? path.join(ctx.workspace.root, src)
			: path.resolve(path.dirname(slide.file), src);
		if (stack.includes(file)) {
			const chain = [...stack, file].map((f) => path.relative(ctx.workspace.root, f)).join(' → ');
			report(
				ctx,
				'error',
				slide.file,
				slide.line,
				`共通スライドの読み込みが循環しています: ${chain}`
			);
			continue;
		}
		const text = readText(file);
		if (text === null) {
			report(ctx, 'error', slide.file, slide.line, `共通スライド ${src} が見つかりません`);
			continue;
		}
		const replaced = text.replace(
			placeholderPattern,
			(whole, key: keyof PlaceholderValues) => values[key] ?? whole
		);
		const imported = expandSources(splitSlides(replaced, file, ctx.diagnostics), ctx, values, [
			...stack,
			file
		]);
		if (imported.length > 0) {
			imported[0] = { ...imported[0], frontmatter: { ...imported[0].frontmatter, ...override } };
		}
		result.push(...imported);
	}
	return result;
}
