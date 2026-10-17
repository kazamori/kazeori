// kazeori check: ビルドせずにデッキを検査する。
import { loadDecks } from '../../src/lib/workspace/decks.ts';
import type { Diagnostic } from '../../src/lib/types.ts';
import {
	countErrors,
	EXIT_DECK,
	EXIT_OK,
	openWorkspace,
	printDiagnostics,
	resolveDeckIds,
	type CommonOptions
} from '../context.ts';

export interface CheckOptions extends CommonOptions {
	deck?: string[];
	json?: boolean;
	verbose?: boolean;
}

/** デッキを読み込んで診断を返す。build と pdf も最初にこれを呼ぶ。 */
export async function collectDiagnostics(options: CheckOptions) {
	const ws = openWorkspace(options);
	const deckIds = options.deck?.length ? resolveDeckIds(ws, options.deck) : null;
	const loaded = await loadDecks(
		{ workspaceRoot: ws.root, brandFile: options.brand ?? null, deckIds },
		(abs) => abs
	);
	return { ws, deckIds, ...loaded };
}

export async function check(options: CheckOptions): Promise<number> {
	const { decks, diagnostics } = await collectDiagnostics(options);
	const errors = countErrors(diagnostics);
	if (options.json) {
		const result: { decks: string[]; diagnostics: Diagnostic[]; errors: number } = {
			decks: decks.map((d) => d.id),
			diagnostics,
			errors
		};
		console.log(JSON.stringify(result, null, 2));
	} else {
		printDiagnostics(diagnostics, options.verbose);
		const warnings = diagnostics.filter((d) => d.level === 'warning').length;
		console.error(
			`${decks.length} 件のデッキを検査しました（エラー ${errors} 件、警告 ${warnings} 件）`
		);
	}
	return errors > 0 ? EXIT_DECK : EXIT_OK;
}
