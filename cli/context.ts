// CLI の各コマンドで共有する処理（workspace の決定、診断の表示、終了コード）。
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
	CONFIG_FILE,
	findWorkspaceRoot,
	kazeoriRoot,
	listDeckIds,
	loadWorkspace,
	resolveDeckId,
	WorkspaceError,
	type Workspace
} from '../src/lib/workspace/config.ts';
import type { Diagnostic } from '../src/lib/types.ts';

/** コマンドを実行したディレクトリ。Vite の起動前に kazeori のルートへ移るので、表示用に覚えておく。 */
export const invocationDir = process.cwd();

/** 表示用に、実行したディレクトリの中のファイルは相対パスにする。 */
export function displayPath(file: string): string {
	const relative = path.relative(invocationDir, file);
	// 実行したディレクトリの外にあるファイルは、絶対パスのほうが読みやすい
	return relative && !relative.startsWith('..') ? relative : file;
}

/** 終了コード。デッキの不備は 1、実行環境の問題は 2。 */
export const EXIT_OK = 0;
export const EXIT_DECK = 1;
export const EXIT_ENV = 2;

/** 終了コードを持つエラー。main で受けて表示し、そのコードで終了する。 */
export class CliError extends Error {
	constructor(
		message: string,
		readonly code: number = EXIT_DECK
	) {
		super(message);
	}
}

export interface CommonOptions {
	workspace?: string;
	brand?: string;
}

/**
 * workspace のルートを決める。
 * --workspace、環境変数 KAZEORI_WORKSPACE、カレントディレクトリの順に kazeori.yaml を親へ探す。
 * どこにもなければ null（ツール同梱のサンプル workspace を使う）。
 */
export function resolveWorkspaceRoot(options: CommonOptions, cwd = process.cwd()): string | null {
	const start = options.workspace ?? process.env.KAZEORI_WORKSPACE;
	if (start) {
		const found = findWorkspaceRoot(path.resolve(cwd, start));
		if (!found) {
			throw new CliError(`${start} とその親に ${CONFIG_FILE} が見つかりません`, EXIT_DECK);
		}
		return found;
	}
	return findWorkspaceRoot(cwd);
}

export function openWorkspace(options: CommonOptions): Workspace {
	const root = resolveWorkspaceRoot(options);
	const brand = options.brand ? path.resolve(options.brand) : null;
	if (brand && !fs.existsSync(brand)) {
		throw new CliError(`--brand のファイル ${options.brand} が見つかりません`);
	}
	return loadWorkspace(root, brand);
}

/** --deck の指定をデッキ ID に解決する。 */
export function resolveDeckIds(ws: Workspace, queries: string[]): string[] {
	const ids = listDeckIds(ws.paths.decks);
	try {
		return queries.map((q) => resolveDeckId(ids, q));
	} catch (e) {
		if (e instanceof WorkspaceError) throw new CliError(e.message);
		throw e;
	}
}

const labels = { error: 'エラー', warning: '警告', info: '情報' } as const;

export function formatDiagnostic(d: Diagnostic): string {
	const file = displayPath(d.file);
	return `${file}${d.line ? `:${d.line}` : ''}: ${labels[d.level]}: ${d.message}`;
}

/** 診断を標準エラー出力に表示する。info は verbose のときだけ表示する。 */
export function printDiagnostics(diagnostics: Diagnostic[], verbose = false) {
	for (const d of diagnostics) {
		if (d.level === 'info' && !verbose) continue;
		console.error(formatDiagnostic(d));
	}
}

export function countErrors(diagnostics: Diagnostic[]): number {
	return diagnostics.filter((d) => d.level === 'error').length;
}

/**
 * Vite（SvelteKit）を動かす前の準備。
 * SvelteKit はカレントディレクトリをプロジェクトのルートとして扱うので、kazeori のルートに移る。
 * workspace などの指定は環境変数で vite.config.ts に渡す。
 */
export function prepareVite(
	ws: Workspace,
	options: CommonOptions,
	extra: Record<string, string> = {}
) {
	process.env.KAZEORI_WORKSPACE = ws.root;
	if (options.brand) process.env.KAZEORI_BRAND = path.resolve(options.brand);
	// SvelteKit の作業ディレクトリは kazeori の中に workspace ごとに分けて置く。
	// ビルド結果が @sveltejs/kit などを import するので、kazeori の依存を解決できる場所でなければならない
	const key = createHash('sha256').update(ws.root).digest('hex').slice(0, 12);
	process.env.KAZEORI_KIT_DIR = path.join(kazeoriRoot, '.svelte-kit', 'workspaces', key);
	for (const [key, value] of Object.entries(extra)) process.env[key] = value;
	process.chdir(kazeoriRoot);
}

export const viteConfigFile = path.join(kazeoriRoot, 'vite.config.ts');
