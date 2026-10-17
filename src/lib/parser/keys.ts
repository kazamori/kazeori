// レイアウトの名前と、フロントマターの項目の一覧。
import type { RawSlide } from './split.ts';
import { report, type DeckContext } from './context.ts';

/** kazeori に組み込まれたレイアウト。 */
export const builtinLayouts = [
	'cover',
	'cover-light',
	'section',
	'default',
	'center',
	'full',
	'agenda',
	'references',
	'end',
	'diagram',
	'two-cols',
	'compare',
	'features',
	'feature-grid',
	'image-left',
	'image-right',
	'image',
	'three-images',
	'gallery',
	'quote',
	'fact',
	'profile',
	'team',
	'process',
	'timeline'
] as const;

/** Slidev にだけある組み込みレイアウト名と、それを描く kazeori のレイアウト。 */
export const layoutAliases: Record<string, string> = {
	intro: 'cover-light',
	statement: 'center',
	none: 'full',
	'two-cols-header': 'two-cols'
};

/** 画像が必要なレイアウト。画像がなければ警告する。 */
export const layoutsNeedingImage = new Set(['image-left', 'image-right', 'image']);

/**
 * 組み込みレイアウトが描く画像（画像だけの段落とフロントマターの image）の数と、archify の図を描くか。
 * これを超える画像や、描かない図は、check で警告する（書いた画像が黙って消えないようにするため）。
 * 箇条書きの項目の画像（team、feature-grid のアイコンなど）は数えない。
 */
export const layoutVisuals: Record<string, { images: number; figures: boolean }> = {
	cover: { images: 1, figures: false },
	'cover-light': { images: 1, figures: false },
	section: { images: 1, figures: false },
	default: { images: 1, figures: true },
	center: { images: 0, figures: false },
	full: { images: 1, figures: true },
	agenda: { images: 0, figures: false },
	references: { images: 0, figures: false },
	end: { images: 0, figures: false },
	diagram: { images: 1, figures: true },
	'two-cols': { images: Infinity, figures: true },
	compare: { images: 2, figures: true },
	features: { images: 0, figures: false },
	'feature-grid': { images: 0, figures: false },
	'image-left': { images: 1, figures: false },
	'image-right': { images: 1, figures: false },
	image: { images: 1, figures: false },
	'three-images': { images: 3, figures: false },
	gallery: { images: 9, figures: false },
	quote: { images: 1, figures: false },
	fact: { images: 0, figures: false },
	profile: { images: 1, figures: false },
	team: { images: 0, figures: false },
	process: { images: 0, figures: false },
	timeline: { images: 0, figures: false }
};

const slideKeys = new Set([
	'layout',
	'class',
	'hide',
	'disabled',
	'src',
	'title',
	'titleAccent',
	'image',
	'images',
	'current',
	'columns'
]);

/** 正の整数で指定する項目（agenda の current、feature-grid の columns）。 */
const positiveIntegerKeys = new Set(['current', 'columns']);

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
		if (positiveIntegerKeys.has(key) && !(Number.isInteger(value) && (value as number) >= 1)) {
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
