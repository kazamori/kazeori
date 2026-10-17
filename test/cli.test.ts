import { afterAll, describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const main = path.join(import.meta.dir, '../cli/main.ts');
const ws = path.join(import.meta.dir, 'fixtures/ws');
const broken = path.join(import.meta.dir, 'fixtures/broken');

async function kazeori(args: string[], cwd = ws) {
	const proc = Bun.spawn(['bun', main, ...args], { cwd, stdout: 'pipe', stderr: 'pipe' });
	const [stdout, stderr, code] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited
	]);
	return { stdout, stderr, code };
}

describe('kazeori check', () => {
	test('workspace のサブディレクトリからでも kazeori.yaml を見つけて検査する', async () => {
		const { code, stderr } = await kazeori(['check'], path.join(ws, 'decks/2026'));
		expect(stderr).toContain('1 件のデッキを検査しました（エラー 0 件');
		expect(code).toBe(0);
	});

	test('不備のあるデッキはパスと行番号付きで報告し、終了コード 1 を返す', async () => {
		const { code, stderr } = await kazeori(['check', '--workspace', broken]);
		expect(stderr).toMatch(/decks\/2026\/bad\/slides\.md:5: エラー: 未知のレイアウト/);
		expect(code).toBe(1);
	});

	test('--json は機械可読な結果を標準出力に出す', async () => {
		const { stdout } = await kazeori(['check', '--json']);
		expect(JSON.parse(stdout)).toMatchObject({ decks: ['2026/2026-01-01-basic'], errors: 0 });
	});

	test('未知のデッキ名は終了コード 1', async () => {
		const { code, stderr } = await kazeori(['check', '--deck', 'nothing']);
		expect(stderr).toContain('デッキ「nothing」が見つかりません');
		expect(code).toBe(1);
	});
});

describe('kazeori build と pdf', () => {
	test('不備のあるデッキは出力せずに終了コード 1 で止まる', async () => {
		const out = path.join(broken, 'dist');
		const { code } = await kazeori(['build', '--workspace', broken, '--out', out]);
		expect(code).toBe(1);
		expect(fs.existsSync(out)).toBe(false);
	});
});

describe('kazeori new と templates', () => {
	const created = path.join(ws, 'decks/2027');
	afterAll(() => fs.rmSync(created, { recursive: true, force: true }));

	test('workspace の雛形を優先して一覧に出す', async () => {
		const { stdout } = await kazeori(['templates', '--json']);
		const list = JSON.parse(stdout) as { name: string; source: string }[];
		expect(list.find((t) => t.name === 'talk')?.source).toBe('workspace');
		expect(list.find((t) => t.name === 'default')?.source).toBe('kazeori');
	});

	test('雛形から decks/<年>/<日付>-<名前>/slides.md を作り、プレースホルダーを置き換える', async () => {
		const { code } = await kazeori([
			'new',
			'lt',
			'--template',
			'talk',
			'--date',
			'2027-04-01',
			'--title',
			'新しい発表',
			'--event',
			'勉強会 #1: 春'
		]);
		expect(code).toBe(0);
		const text = fs.readFileSync(path.join(created, '2027-04-01-lt/slides.md'), 'utf-8');
		expect(text).toContain('title: "新しい発表"');
		expect(text).toContain('color: "green"');
		expect(text).toContain('author: "発表者"');
		expect(text).toContain('event: "勉強会 #1: 春"');
	});

	test('同じデッキがあれば上書きせずに失敗する', async () => {
		const { code, stderr } = await kazeori([
			'new',
			'lt',
			'--template',
			'talk',
			'--date',
			'2027-04-01'
		]);
		expect(code).toBe(1);
		expect(stderr).toContain('すでにあります');
	});
});
