import { describe, expect, test } from 'bun:test';
import path from 'node:path';
import {
	findWorkspaceRoot,
	listDeckIds,
	loadWorkspace,
	mergeBrand,
	resolveDeckId,
	WorkspaceError
} from '../src/lib/workspace/config.ts';

const wsRoot = path.join(import.meta.dir, 'fixtures/ws');

describe('findWorkspaceRoot', () => {
	test('サブディレクトリから親へ kazeori.yaml を探す', () => {
		expect(findWorkspaceRoot(path.join(wsRoot, 'decks/2026'))).toBe(wsRoot);
	});

	test('見つからなければ null を返す', () => {
		expect(findWorkspaceRoot('/')).toBeNull();
	});
});

describe('loadWorkspace', () => {
	test('ブランドのロゴを kazeori.yaml からの絶対パスに解決する', () => {
		const ws = loadWorkspace(wsRoot);
		expect(ws.brand.logo?.blue).toBe(path.join(wsRoot, 'brand/logo.png'));
		expect(ws.defaults).toEqual({ color: 'green', author: '発表者' });
		expect(ws.paths.decks).toBe(path.join(wsRoot, 'decks'));
	});

	test('未知の配色はエラーになる', () => {
		const ws = loadWorkspace(path.join(import.meta.dir, 'fixtures/broken'));
		expect(ws.diagnostics.map((d) => d.level)).toContain('error');
	});
});

describe('mergeBrand', () => {
	test('後の設定が前の設定を上書きし、logo は配色ごとに上書きする', () => {
		expect(
			mergeBrand(
				{ name: 'A', copyright: 'c', logo: { blue: 'b1', white: 'w1' } },
				{ name: 'B', logo: { blue: 'b2' } }
			)
		).toEqual({ name: 'B', copyright: 'c', logo: { blue: 'b2', white: 'w1' } });
	});
});

describe('listDeckIds と resolveDeckId', () => {
	const ids = listDeckIds(path.join(wsRoot, 'decks'));

	test('decks 配下の slides.md を階層の深さによらず探す', () => {
		expect(ids).toEqual(['2026/2026-01-01-basic']);
	});

	test.each([
		['ID そのもの', '2026/2026-01-01-basic'],
		['ディレクトリ名だけ', '2026-01-01-basic'],
		['日付の接頭辞を除いた名前', 'basic'],
		['末尾の /', '2026/2026-01-01-basic/']
	])('%s で指定できる', (_, query) => {
		expect(resolveDeckId(ids, query)).toBe('2026/2026-01-01-basic');
	});

	test('見つからない名前と、複数に一致する名前はエラーになる', () => {
		expect(() => resolveDeckId(ids, 'nothing')).toThrow(WorkspaceError);
		expect(() => resolveDeckId(['2025/x', '2026/x'], 'x')).toThrow('複数あります');
	});
});
