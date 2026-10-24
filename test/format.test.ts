import { describe, expect, test } from 'bun:test';
import { formatDate, itemColorAt, parseProgress, splitBlockquote } from '../src/lib/format.ts';
import { parseHighlightLines } from '../src/lib/parser/highlight.ts';
import { drawPattern, parsePattern, squareTiles, type PatternSpec } from '../src/lib/patterns.ts';

describe('formatDate', () => {
	test.each([
		['2026-10-17', '2026年10月17日'],
		['2026-01-05', '2026年1月5日'],
		['2026年秋', '2026年秋'],
		[null, null]
	])('%p は %p になる', (input, expected) => {
		expect(formatDate(input)).toBe(expected);
	});
});

describe('itemColorAt', () => {
	test.each([
		[0, 'var(--kz-item1)'],
		[5, 'var(--kz-item6)'],
		[6, 'var(--kz-item1)']
	])('%p 番目の項目は %p で塗り、6 色で 1 周する', (index, expected) => {
		expect(itemColorAt(index)).toBe(expected);
	});
});

describe('parseProgress', () => {
	test.each([
		['Go 75%', { label: 'Go', value: 75 }],
		['Python：60％', { label: 'Python', value: 60 }],
		['割合なし', null]
	])('%p', (input, expected) => {
		expect(parseProgress(input)).toEqual(expected);
	});
});

describe('parseHighlightLines', () => {
	test.each([
		['{2,4-5}', [2, 4, 5]],
		['{1|3}', [1]],
		['{*}', []],
		[null, []]
	])('%p', (meta, expected) => {
		expect([...parseHighlightLines(meta)]).toEqual(expected);
	});
});

describe('splitBlockquote', () => {
	test('最初の blockquote とそれ以外に分ける', () => {
		expect(splitBlockquote('<p>a</p><blockquote><p>q</p></blockquote><p>b</p>')).toEqual({
			quote: '<p>q</p>',
			rest: '<p>a</p><p>b</p>'
		});
	});
});

describe('parsePattern', () => {
	test.each<[string, PatternSpec | null]>([
		['wave', { kind: 'wave', name: 'wave' }],
		['fractal-inward', { kind: 'fractal', rule: 'inward', corner: 'br' }],
		['fractal-mirror-tl', { kind: 'fractal', rule: 'mirror', corner: 'tl' }],
		['fractal-nothing', null],
		['fractal-inward-xx', null],
		['nothing', null]
	])('%p', (name, expected) => {
		expect(parsePattern(name)).toEqual(expected);
	});
});

describe('drawPattern', () => {
	test('波の模様は 8 x 8 のマスで、塊、縁、散る四角の 3 段を含む', () => {
		const drawing = drawPattern({ kind: 'wave', name: 'wave' });
		expect([drawing.width, drawing.height]).toEqual([8, 8]);
		expect(new Set(drawing.rects.map((r) => r.level))).toEqual(new Set([0, 1, 2]));
	});

	test('フラクタルの模様は、正方形の枠では 4 分割を 3 段繰り返し、各段で 3 倍ずつマスが増える', () => {
		const drawing = drawPattern({ kind: 'fractal', rule: 'fixed', corner: 'br' });
		expect([drawing.width, drawing.height]).toEqual([8, 8]);
		const count = (level: number) => drawing.rects.filter((r) => r.level === level).length;
		expect([count(0), count(1), count(2)]).toEqual([1, 3, 9]);
		expect(drawing.rects.find((r) => r.level === 0)).toEqual({ x: 4, y: 4, size: 4, level: 0 });
	});

	test('16:9 の枠は正方形だけで敷き詰め、すき間も重なりもない', () => {
		const drawing = drawPattern({ kind: 'fractal', rule: 'inward', corner: 'br' }, 16 / 9);
		expect([drawing.width, drawing.height]).toEqual([14, 8]);
		const tiles = squareTiles(14, 8);
		expect(tiles.map((t) => t.size)).toEqual([8, 6, 2, 2, 2]);
		expect(tiles.reduce((sum, t) => sum + t.size * t.size, 0)).toBe(14 * 8);
	});
});
