// kazeori build: 静的サイトをビルドする。
import path from 'node:path';
import { createBuilder } from 'vite';
import {
	countErrors,
	EXIT_DECK,
	EXIT_OK,
	prepareVite,
	printDiagnostics,
	viteConfigFile,
	type CommonOptions
} from '../context.ts';
import { collectDiagnostics } from './check.ts';

export interface BuildOptions extends CommonOptions {
	deck?: string[];
	out?: string;
	quiet?: boolean;
}

/** 静的サイトを out に書き出す。デッキに不備があれば書き出さずに EXIT_DECK を返す。 */
export async function buildSite(
	options: BuildOptions
): Promise<{ code: number; out: string; deckIds: string[] }> {
	const { ws, decks, diagnostics, deckIds } = await collectDiagnostics(options);
	printDiagnostics(diagnostics);
	const out = options.out ? path.resolve(options.out) : path.join(ws.paths.dist, 'site');
	if (countErrors(diagnostics) > 0) {
		console.error('デッキにエラーがあるため、出力しませんでした');
		return { code: EXIT_DECK, out, deckIds: [] };
	}
	prepareVite(ws, options, {
		KAZEORI_OUT: out,
		...(deckIds ? { KAZEORI_DECKS: deckIds.join(',') } : {})
	});
	// SvelteKit はサーバーとクライアントの両方の環境をビルドするので、build() ではなく buildApp() を使う
	const builder = await createBuilder({
		configFile: viteConfigFile,
		logLevel: options.quiet ? 'warn' : 'info'
	});
	await builder.buildApp();
	return { code: EXIT_OK, out, deckIds: decks.map((d) => d.id) };
}

export async function build(options: BuildOptions): Promise<number> {
	const { code, out } = await buildSite(options);
	if (code === EXIT_OK) console.log(`静的サイトを ${out} に出力しました`);
	return code;
}
