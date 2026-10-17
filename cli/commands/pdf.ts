// kazeori pdf: デッキを PDF に出力する。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { listDeckIds } from '../../src/lib/workspace/config.ts';
import {
	CliError,
	displayPath,
	EXIT_DECK,
	EXIT_ENV,
	EXIT_OK,
	openWorkspace,
	resolveDeckIds,
	type CommonOptions
} from '../context.ts';
import { buildSite } from './build.ts';

export interface PdfOptions extends CommonOptions {
	deck?: string[];
	year?: string;
	all?: boolean;
	out?: string;
	strict?: boolean;
}

/** 静的サイトのディレクトリを配信する簡易サーバー。/a/ は /a/index.html を返す。 */
function serveStatic(root: string) {
	return Bun.serve({
		port: 0,
		hostname: '127.0.0.1',
		fetch(request) {
			const url = new URL(request.url);
			let file = path.join(root, decodeURIComponent(url.pathname));
			if (!file.startsWith(root)) return new Response('forbidden', { status: 403 });
			if (fs.existsSync(file) && fs.statSync(file).isDirectory())
				file = path.join(file, 'index.html');
			if (!fs.existsSync(file)) return new Response('not found', { status: 404 });
			return new Response(Bun.file(file));
		}
	});
}

async function launchBrowser(): Promise<Browser> {
	try {
		return await chromium.launch();
	} catch (e) {
		throw new CliError(
			`Chromium を起動できません。\`bunx playwright install chromium\` でインストールしてください。\n${(e as Error).message.split('\n')[0]}`,
			EXIT_ENV
		);
	}
}

interface Overflow {
	slide: string;
	slot: string;
}

export async function pdf(options: PdfOptions): Promise<number> {
	const ws = openWorkspace(options);
	let deckIds: string[];
	if (options.all) {
		deckIds = listDeckIds(ws.paths.decks);
	} else if (options.year) {
		deckIds = listDeckIds(ws.paths.decks).filter((id) => id.startsWith(`${options.year}/`));
	} else if (options.deck?.length) {
		deckIds = resolveDeckIds(ws, options.deck);
	} else {
		throw new CliError('--deck、--year、--all のいずれかで対象のデッキを指定してください');
	}
	if (deckIds.length === 0) throw new CliError('対象のデッキがありません');

	const browser = await launchBrowser();
	const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kazeori-pdf-'));
	try {
		const built = await buildSite({ ...options, deck: deckIds, out: siteDir, quiet: true });
		if (built.code !== EXIT_OK) return built.code;

		const server = serveStatic(siteDir);
		const outDir = options.out ? path.resolve(options.out) : ws.paths.dist;
		let overflowFound = false;
		try {
			const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
			for (const id of deckIds) {
				await page.goto(`${server.url}print/${id}/`, { waitUntil: 'networkidle' });
				await page.evaluate(() => document.fonts.ready);
				// レイアウトのはみ出し判定（requestAnimationFrame で行う）を待つ
				await page.evaluate(
					() =>
						new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
				);
				const overflows: Overflow[] = await page.evaluate(() =>
					[...document.querySelectorAll<HTMLElement>('[data-overflow]')].map((el) => ({
						slide: el.closest<HTMLElement>('[data-slide]')?.dataset.slide ?? '?',
						slot: [...el.classList]
							.filter((c) => !c.startsWith('svelte-') && c !== 'kz-fit')
							.join('.')
					}))
				);
				for (const o of overflows) {
					console.error(
						`${id}: 警告: ${o.slide} 枚目の ${o.slot || 'スロット'} から文字がはみ出しています`
					);
				}
				if (overflows.length > 0) overflowFound = true;

				const file = path.join(outDir, `${id}.pdf`);
				fs.mkdirSync(path.dirname(file), { recursive: true });
				await page.pdf({ path: file, width: '1920px', height: '1080px', printBackground: true });
				console.log(`${displayPath(file)} を出力しました`);
			}
		} finally {
			server.stop(true);
		}
		if (overflowFound && options.strict) {
			console.error('--strict が指定されているため、はみ出しをエラーとして扱います');
			return EXIT_DECK;
		}
		return EXIT_OK;
	} finally {
		await browser.close();
		fs.rmSync(siteDir, { recursive: true, force: true });
	}
}
