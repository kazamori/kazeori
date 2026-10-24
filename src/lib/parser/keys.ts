// レイアウトの名前と、フロントマターの項目の一覧。
import type { RawSlide } from './split.ts';
import { asPositiveInteger, report, type DeckContext } from './context.ts';

/**
 * 組み込みレイアウトが描く画像（画像だけの段落とフロントマターの image）の扱い。
 * - images: 描く画像の数（archify の図を描くレイアウトでは図も数える）
 * - figures: archify の図を描くか
 * - requires: 画像が必要か（image は画像、visual は画像か図）
 * 数を超える画像や描かない図、足りない画像は check で警告する（書いた画像が黙って消えないようにするため）。
 * 箇条書きの項目の画像（team、feature-grid のアイコンなど）は数えない。
 * 枠の装飾の有無（chrome）は、独自レイアウトでも宣言できるよう、各レイアウトの <script module> に置く。
 */
interface LayoutSpec {
	images: number;
	figures: boolean;
	requires?: 'image' | 'visual';
}

const layoutSpecs = {
	cover: { images: 1, figures: false },
	'cover-light': { images: 1, figures: false },
	section: { images: 1, figures: false },
	default: { images: 1, figures: true },
	center: { images: 0, figures: false },
	full: { images: 1, figures: true },
	agenda: { images: 0, figures: false },
	references: { images: 0, figures: false },
	end: { images: 0, figures: false },
	diagram: { images: 1, figures: true, requires: 'visual' },
	'two-cols': { images: Infinity, figures: true },
	compare: { images: 2, figures: true },
	features: { images: 0, figures: false },
	'feature-grid': { images: 0, figures: false },
	'image-left': { images: 1, figures: false, requires: 'image' },
	'image-right': { images: 1, figures: false, requires: 'image' },
	image: { images: 1, figures: false, requires: 'image' },
	'three-images': { images: 3, figures: false },
	gallery: { images: 9, figures: false },
	quote: { images: 1, figures: false },
	fact: { images: 0, figures: false },
	profile: { images: 1, figures: false },
	team: { images: 0, figures: false },
	process: { images: 0, figures: false },
	timeline: { images: 0, figures: false }
} satisfies Record<string, LayoutSpec>;

/** kazeori に組み込まれたレイアウトの名前。src/lib/layouts/<名前>.svelte に対応する。 */
export const builtinLayouts = Object.keys(layoutSpecs) as (keyof typeof layoutSpecs)[];

/** Slidev にだけある組み込みレイアウト名と、それを描く kazeori のレイアウト。 */
export const layoutAliases: Record<string, string> = {
	intro: 'cover-light',
	statement: 'center',
	none: 'full',
	'two-cols-header': 'two-cols'
};

/**
 * スライドの画像と図の数を、レイアウトが描ける数と比べて検査する。独自レイアウトは検査しない。
 * line はスライドの開始行。
 */
export function checkLayoutVisuals(
	layout: string,
	counts: { images: number; figures: number },
	file: string,
	line: number,
	ctx: DeckContext
) {
	const spec: LayoutSpec | undefined = layoutSpecs[layout as keyof typeof layoutSpecs];
	if (!spec) return;
	if (counts.figures > 0 && !spec.figures) {
		report(ctx, 'warning', file, line, `${layout} レイアウトは archify の図を描きません`);
	}
	const drawable = counts.images + (spec.figures ? counts.figures : 0);
	if (drawable > spec.images) {
		report(
			ctx,
			'warning',
			file,
			line,
			spec.images === 0
				? `${layout} レイアウトは画像を描きません`
				: `${layout} レイアウトが描く画像は ${spec.images} 枚までです。残りの ${drawable - spec.images} 枚は描きません`
		);
	}
	if (spec.requires === 'image' && counts.images === 0) {
		report(
			ctx,
			'warning',
			file,
			line,
			`${layout} レイアウトには画像（フロントマターの image か本文の画像）を置いてください`
		);
	}
	if (spec.requires === 'visual' && drawable === 0) {
		report(
			ctx,
			'warning',
			file,
			line,
			`${layout} レイアウトには図（archify の HTML か画像）を置いてください`
		);
	}
}

const slideKeys = new Set([
	'layout',
	'class',
	'hide',
	'disabled',
	'src',
	'title',
	'titleAccent',
	'titleLines',
	'image',
	'images',
	'current',
	'columns'
]);

/** 正の整数で指定する項目（agenda の current、feature-grid の columns、タイトルの行数）。 */
const positiveIntegerKeys = new Set(['current', 'columns', 'titleLines']);

const headmatterKeys = new Set(['themeConfig', 'author', 'event', 'date', 'brand']);

export const themeConfigKeys = new Set(['color']);

/** Slidev では意味があるが、kazeori では使わない項目。 */
const slidevKeys = new Set([
	'theme',
	'addons',
	'info',
	'colorSchema',
	'highlighter',
	'lineNumbers',
	'monaco',
	'twoslash',
	'remoteAssets',
	'selectable',
	'record',
	'contextMenu',
	'download',
	'export',
	'exportFilename',
	'favicon',
	'titleTemplate',
	'fonts',
	'aspectRatio',
	'canvasWidth',
	'drawings',
	'htmlAttrs',
	'routerMode',
	'presenter',
	'transition',
	'mdc',
	'comark',
	'defaults',
	'css',
	'seoMeta',
	'keywords',
	'wakeLock',
	'codeCopy',
	'plantUmlServer',
	'clicks',
	'clicksStart',
	'preload',
	'routeAlias',
	'zoom',
	'dragPos',
	'level',
	'hideInToc',
	'background',
	'backgroundSize',
	'duration',
	'timer',
	'layoutClass'
]);

/** フロントマターの項目を検査する。Slidev の項目は情報として、どちらにもない項目は警告として報告する。 */
export function checkKeys(raw: RawSlide, isHeadmatter: boolean, ctx: DeckContext) {
	for (const [key, value] of Object.entries(raw.frontmatter)) {
		if (positiveIntegerKeys.has(key) && asPositiveInteger(value) === null) {
			report(ctx, 'warning', raw.file, raw.line, `${key} は 1 以上の整数で指定してください`);
		}
		if (slideKeys.has(key) || (isHeadmatter && headmatterKeys.has(key))) continue;
		if (slidevKeys.has(key)) {
			report(ctx, 'info', raw.file, raw.line, `Slidev の項目「${key}」は kazeori では使いません`);
		} else {
			report(ctx, 'warning', raw.file, raw.line, `フロントマターに未知の項目「${key}」があります`);
		}
	}
}
