import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { ArchifyExtractError, extractArchify } from '../src/lib/archify/extract.ts';

const fixture = (name: string) =>
	fs.readFileSync(path.join(import.meta.dir, 'fixtures/archify', name), 'utf-8');

describe('extractArchify', () => {
	const figure = extractArchify(fixture('minimal.html'), '構成図');

	test('viewer のアイコンではなく、図の svg を取り出す', () => {
		expect(figure.svg).toStartWith('<svg viewBox="0 0 400 200"');
		expect(figure.preset).toBe('classic');
		expect(figure.alt).toBe('構成図');
	});

	test('svg の width / height、script、イベント属性を取り除く', () => {
		expect(figure.svg).not.toContain('width="400"');
		expect(figure.svg).not.toContain('<script');
		expect(figure.svg).not.toContain('onclick');
	});

	test('@font-face を分け、:root を Shadow DOM 用に :host へ置き換える', () => {
		expect(figure.fontFaceCss).toContain('@font-face');
		expect(figure.css).not.toContain('@font-face');
		expect(figure.css).toContain(':host, [data-theme="dark"]');
		expect(figure.css).toContain('[data-theme="light"]');
	});

	test('図の svg がない HTML はエラーになる', () => {
		expect(() => extractArchify(fixture('no-svg.html'), '')).toThrow(ArchifyExtractError);
	});

	// archify スキルが手元にあれば、公開サンプルでも取り出せることを確かめる
	const sample = path.join(
		process.env.HOME ?? '',
		'.agents/skills/archify/examples/dataflow-product-analytics.html'
	);
	test.skipIf(!fs.existsSync(sample))('archify の公開サンプルから図を取り出せる', () => {
		const real = extractArchify(fs.readFileSync(sample, 'utf-8'), '');
		expect(real.svg).toContain('viewBox=');
		expect(real.fontFaceCss).toContain('JetBrains Mono');
	});
});
