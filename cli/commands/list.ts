// kazeori list: デッキの一覧を表示する。
import { loadDecks } from '../../src/lib/workspace/decks.ts';
import { EXIT_OK, openWorkspace, type CommonOptions } from '../context.ts';

export interface ListOptions extends CommonOptions {
	year?: string;
	json?: boolean;
}

export async function list(options: ListOptions): Promise<number> {
	const ws = openWorkspace(options);
	const { decks } = await loadDecks(
		{ workspaceRoot: ws.root, brandFile: options.brand ?? null },
		(abs) => abs
	);
	const rows = decks
		.filter((d) => !options.year || d.id.startsWith(`${options.year}/`))
		.map((d) => ({
			id: d.id,
			title: d.title,
			color: d.color,
			date: d.date,
			slides: d.slideCount
		}));
	if (options.json) {
		console.log(JSON.stringify(rows, null, 2));
		return EXIT_OK;
	}
	if (rows.length === 0) {
		console.log('デッキがありません');
		return EXIT_OK;
	}
	for (const r of rows) {
		console.log(`${r.id}\t${r.title}\t${r.color}\t${r.date ?? '-'}\t${r.slides} 枚`);
	}
	return EXIT_OK;
}
