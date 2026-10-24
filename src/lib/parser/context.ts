// パーサの各処理で共有する、デッキの読み込みの文脈と小さな補助関数。
import type { Diagnostic } from '../types.ts';
import type { Workspace } from '../workspace/config.ts';

/** ローカルファイルの絶対パスを、配信用の URL（または埋め込み用の目印）に変換する関数。 */
export type AssetResolver = (absPath: string) => string;

export interface DeckContext {
	workspace: Workspace;
	deckDir: string;
	resolveAsset: AssetResolver;
	diagnostics: Diagnostic[];
	/** 使えるレイアウトの名前（組み込み、Slidev の別名、独自レイアウト） */
	layouts: Set<string>;
	/** 読み込んだファイルを記録する（dev server の監視用） */
	track: (abs: string) => void;
}

/** 診断を積む。 */
export function report(
	ctx: DeckContext,
	level: Diagnostic['level'],
	file: string,
	line: number | undefined,
	message: string
) {
	ctx.diagnostics.push({ level, file, line, message });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** タイトルの改行として扱う `<br>`（`<br/>`、`<br />` も）。 */
const brTag = String.raw`<br\s*\/?>`;
const brTagPattern = new RegExp(`^${brTag}$`, 'i');
const brTagWithSpaces = new RegExp(`[ \\t]*${brTag}[ \\t]*`, 'gi');

/** HTML の断片が、改行として扱う `<br>` か。 */
export function isBrTag(html: string): boolean {
	return brTagPattern.test(html.trim());
}

/**
 * タイトルの文字列を整える。`<br>` と YAML の改行を改行（\n）にそろえ、前後の空白を除く。
 * 改行以外の書式は残し、インラインの markdown として解析する側（markdown.ts の parseInline）に任せる。
 */
export function normalizeTitle(value: string | null): string | null {
	if (value === null) return null;
	const text = value
		.replace(/\r\n?/g, '\n')
		.replace(brTagWithSpaces, '\n')
		.split('\n')
		.map((line) => line.trim())
		.join('\n')
		.trim();
	return text === '' ? null : text;
}

/** フロントマターの値が 1 以上の整数ならその値を、そうでなければ null を返す。 */
export function asPositiveInteger(value: unknown): number | null {
	return typeof value === 'number' && Number.isInteger(value) && value >= 1 ? value : null;
}

/** フロントマターの値を文字列にする。YAML の日付は YYYY-MM-DD にする。 */
export function asString(value: unknown): string | null {
	if (value === undefined || value === null) return null;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return String(value);
}
