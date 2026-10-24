// slides.md を読み、レイアウトに渡す Deck 構造に変換する。
// 1 枚ずつの組み立ては slide.ts、画像の解決は images.ts、共通スライドの展開は sources.ts が受け持つ。
import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml } from '../format.ts';
import type { ColorName, Deck, Diagnostic, ResolvedBrand, Slide } from '../types.ts';
import { colors } from '../types.ts';
import { DECK_FILE, isColor, mergeBrand, parseBrand, type Workspace } from '../workspace/config.ts';
import {
	asString,
	isRecord,
	normalizeTitle,
	report,
	type AssetResolver,
	type DeckContext
} from './context.ts';
import { builtinLayouts, checkKeys, layoutAliases, themeConfigKeys } from './keys.ts';
import { parseInline } from './markdown.ts';
import { buildSlide } from './slide.ts';
import { expandSources, readText } from './sources.ts';
import { splitSlides, type RawSlide } from './split.ts';

export type { AssetResolver } from './context.ts';
export { builtinLayouts, layoutAliases } from './keys.ts';

/** headmatter の themeConfig から配色を決める。省略時は workspace の既定値。 */
function resolveColor(
	headmatter: Record<string, unknown>,
	file: string,
	ctx: DeckContext
): ColorName {
	const themeConfig = headmatter.themeConfig;
	if (themeConfig === undefined) return ctx.workspace.defaults.color;
	if (!isRecord(themeConfig)) {
		report(ctx, 'error', file, 1, 'themeConfig はオブジェクトで指定してください');
		return ctx.workspace.defaults.color;
	}
	for (const key of Object.keys(themeConfig)) {
		if (!themeConfigKeys.has(key)) {
			report(ctx, 'warning', file, 1, `themeConfig に未知の項目「${key}」があります`);
		}
	}
	if (themeConfig.color === undefined) return ctx.workspace.defaults.color;
	if (isColor(themeConfig.color)) return themeConfig.color;
	report(
		ctx,
		'error',
		file,
		1,
		`themeConfig.color は ${colors.join(' または ')} で指定してください`
	);
	return ctx.workspace.defaults.color;
}

/** ブランド設定を、配色に応じたロゴと置き換え済みの copyright に確定する。 */
function resolveBrand(
	headmatter: Record<string, unknown>,
	color: ColorName,
	date: string | null,
	file: string,
	ctx: DeckContext
): ResolvedBrand {
	const brand = mergeBrand(
		ctx.workspace.brand,
		parseBrand(headmatter.brand, ctx.deckDir, file, ctx.diagnostics)
	);
	const asset = (abs: string | undefined, what: string) => {
		if (!abs) return null;
		if (!fs.existsSync(abs)) {
			report(
				ctx,
				'error',
				ctx.workspace.configFile ?? file,
				undefined,
				`${what}のファイル ${abs} が見つかりません`
			);
			return null;
		}
		return ctx.resolveAsset(abs);
	};
	const name = brand.name ?? null;
	const year = /^\d{4}/.exec(date ?? '')?.[0] ?? String(new Date().getFullYear());
	return {
		name,
		copyright: brand.copyright
			? brand.copyright.replaceAll('{year}', year).replaceAll('{name}', name ?? '')
			: null,
		logo: asset(brand.logo?.[color], 'ロゴ'),
		logoWhite: asset(brand.logo?.white, '白抜きロゴ')
	};
}

/** スライドのレイアウトを決める。1 枚目の既定は cover、それ以外は default。未知の名前は default にする。 */
function resolveLayout(raw: RawSlide, index: number, ctx: DeckContext): string {
	const fm = raw.frontmatter;
	const layout = typeof fm.layout === 'string' ? fm.layout : index === 0 ? 'cover' : 'default';
	if (!ctx.layouts.has(layout)) {
		report(
			ctx,
			'error',
			raw.file,
			raw.line,
			`未知のレイアウト「${layout}」です。default で描画します`
		);
		return 'default';
	}
	return layoutAliases[layout] ?? layout;
}

export interface ParseDeckOptions {
	resolveAsset: AssetResolver;
	/** workspace の独自レイアウトの名前 */
	customLayouts?: string[];
}

export interface ParseDeckResult {
	deck: Deck;
	diagnostics: Diagnostic[];
	/** 読み込んだファイル（共通スライド、画像、archify の HTML を含む）。dev server の監視に使う */
	files: string[];
}

/** デッキを読み込む。 */
export async function parseDeck(
	workspace: Workspace,
	id: string,
	options: ParseDeckOptions
): Promise<ParseDeckResult> {
	const deckDir = path.join(workspace.paths.decks, id);
	const file = path.join(deckDir, DECK_FILE);
	const diagnostics: Diagnostic[] = [];
	const files = new Set<string>([file]);
	const ctx: DeckContext = {
		workspace,
		deckDir,
		resolveAsset: (abs) => {
			files.add(abs);
			return options.resolveAsset(abs);
		},
		diagnostics,
		layouts: new Set([
			...builtinLayouts,
			...Object.keys(layoutAliases),
			...(options.customLayouts ?? [])
		]),
		track: (abs) => files.add(abs)
	};

	const text = readText(file) ?? '';
	if (!text) report(ctx, 'error', file, undefined, 'slides.md を読めないか、中身が空です');
	const top = splitSlides(text, file, diagnostics);
	const headmatter = top[0]?.frontmatter ?? {};

	const color = resolveColor(headmatter, file, ctx);
	const fallbackTitle = id.split('/').at(-1) ?? id;
	const titleSource = normalizeTitle(asString(headmatter.title)) ?? fallbackTitle;
	const title = parseInline(titleSource) ?? {
		text: fallbackTitle,
		html: escapeHtml(fallbackTitle)
	};
	const author = asString(headmatter.author) ?? workspace.defaults.author;
	const eventSource = asString(headmatter.event);
	const event = parseInline(eventSource);
	const date = asString(headmatter.date);

	// 共通スライドの本文は markdown として解析するので、書式を残した元の文字列で置き換える
	const raws = expandSources(top, ctx, { title: titleSource, author, event: eventSource, date }, [
		file
	]);
	for (const raw of raws) files.add(raw.file);

	const slides: Slide[] = [];
	for (const [index, raw] of raws.entries()) {
		checkKeys(raw, index === 0 && raw.file === file, ctx);
		if (raw.frontmatter.hide === true || raw.frontmatter.disabled === true) continue;
		slides.push(await buildSlide(raw, slides.length + 1, resolveLayout(raw, index, ctx), ctx));
	}

	return {
		deck: {
			id,
			title: title.text,
			titleHtml: title.html,
			color,
			author,
			event: event?.text ?? null,
			eventHtml: event?.html ?? null,
			date,
			slideCount: slides.length,
			brand: resolveBrand(headmatter, color, date, file, ctx),
			slides
		},
		diagnostics,
		files: [...files]
	};
}
