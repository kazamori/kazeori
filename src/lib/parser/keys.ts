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
	'current'
]);

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
	for (const key of Object.keys(raw.frontmatter)) {
		if (slideKeys.has(key) || (isHeadmatter && headmatterKeys.has(key))) continue;
		if (slidevKeys.has(key)) {
			report(ctx, 'info', raw.file, raw.line, `Slidev の項目「${key}」は kazeori では使いません`);
		} else {
			report(ctx, 'warning', raw.file, raw.line, `フロントマターに未知の項目「${key}」があります`);
		}
	}
}
