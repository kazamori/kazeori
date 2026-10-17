// archify で作った構成図の HTML から、図（SVG）だけをライトテーマで PNG に書き出す。
// README から参照する docs/architecture/*.png を作り直すときに使う。
//
// 実行: bun scripts/diagram-png.ts            （docs/architecture/ の全図）
//       bun scripts/diagram-png.ts <html>...   （指定した図だけ）
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dir, '..');
const docs = path.join(root, 'docs/architecture');

const targets =
	process.argv.length > 2
		? process.argv.slice(2).map((f) => path.resolve(f))
		: fs
				.readdirSync(docs, { withFileTypes: true })
				.filter((e) => e.isDirectory())
				.map((e) => path.join(docs, e.name, `${e.name}.html`))
				.filter((f) => fs.existsSync(f));

const browser = await chromium.launch();
try {
	const page = await browser.newPage({
		viewport: { width: 1600, height: 1000 },
		deviceScaleFactor: 2
	});
	for (const html of targets) {
		await page.goto(`file://${html}`);
		// archify の viewer は data-theme でライトとダークを切り替える
		await page.evaluate(() => {
			for (const el of [document.documentElement, ...document.querySelectorAll('[data-theme]')]) {
				el.setAttribute('data-theme', 'light');
			}
		});
		await page.waitForTimeout(300);
		const out = path.join(docs, `${path.basename(html, '.html')}.png`);
		await page.locator('svg[role="img"]').first().screenshot({ path: out });
		console.log(path.relative(process.cwd(), out));
	}
} finally {
	await browser.close();
}
