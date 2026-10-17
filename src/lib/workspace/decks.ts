// workspace の全デッキと独自レイアウトの読み込み。Vite プラグインと CLI（check、list など）で共有する。
import fs from 'node:fs';
import path from 'node:path';
import { builtinLayouts, parseDeck, type AssetResolver } from '../parser/deck.ts';
import type { Deck, Diagnostic } from '../types.ts';
import { listDeckIds, loadWorkspace, type Workspace } from './config.ts';

export interface LoadOptions {
	/** workspace のルート。null ならサンプル workspace を使う */
	workspaceRoot: string | null;
	/** CLI の --brand */
	brandFile?: string | null;
	/** 対象にするデッキ ID。省略時は全デッキ */
	deckIds?: string[] | null;
}

/** workspace の layouts/ にある独自レイアウト（名前 → 絶対パス）。 */
export function listCustomLayouts(ws: Workspace): Record<string, string> {
	let files: string[];
	try {
		files = fs.readdirSync(ws.paths.layouts);
	} catch {
		return {};
	}
	return Object.fromEntries(
		files
			.filter((f) => f.endsWith('.svelte'))
			.sort()
			.map((f) => [path.basename(f, '.svelte'), path.join(ws.paths.layouts, f)])
	);
}

/** 独自レイアウトの名前の検査。組み込みレイアウトと同じ名前はエラーにする。 */
function checkCustomLayouts(custom: Record<string, string>): Diagnostic[] {
	return Object.entries(custom)
		.filter(([name]) => (builtinLayouts as readonly string[]).includes(name))
		.map(([name, file]) => ({
			level: 'error',
			file,
			message: `独自レイアウト「${name}」は組み込みレイアウトと同じ名前です。別の名前にしてください`
		}));
}

export interface LoadedDecks {
	workspace: Workspace;
	decks: Deck[];
	diagnostics: Diagnostic[];
	/** 読み込んだファイル。dev server の監視に使う */
	files: string[];
}

/** workspace の全デッキを読み込む。resolveAsset はローカルファイルの絶対パスを配信用の値に変える。 */
export async function loadDecks(
	options: LoadOptions,
	resolveAsset: AssetResolver
): Promise<LoadedDecks> {
	const workspace = loadWorkspace(options.workspaceRoot, options.brandFile);
	const custom = listCustomLayouts(workspace);
	const diagnostics = [...workspace.diagnostics, ...checkCustomLayouts(custom)];
	const files = new Set<string>();
	if (workspace.configFile) files.add(workspace.configFile);
	const ids = listDeckIds(workspace.paths.decks).filter(
		(id) => !options.deckIds || options.deckIds.includes(id)
	);
	const decks: Deck[] = [];
	for (const id of ids) {
		const result = await parseDeck(workspace, id, {
			resolveAsset,
			customLayouts: Object.keys(custom)
		});
		decks.push(result.deck);
		diagnostics.push(...result.diagnostics);
		for (const f of result.files) files.add(f);
	}
	return { workspace, decks, diagnostics, files: [...files] };
}
