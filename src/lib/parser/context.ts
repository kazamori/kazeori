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

/** フロントマターの値を文字列にする。YAML の日付は YYYY-MM-DD にする。 */
export function asString(value: unknown): string | null {
	if (value === undefined || value === null) return null;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return String(value);
}
