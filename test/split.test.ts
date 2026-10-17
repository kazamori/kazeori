import { describe, expect, test } from 'bun:test';
import { extractNotes, splitSlides, splitSlots } from '../src/lib/parser/split.ts';
import type { Diagnostic } from '../src/lib/types.ts';

function split(text: string) {
	const diagnostics: Diagnostic[] = [];
	const slides = splitSlides(text, 'slides.md', diagnostics);
	return { slides, diagnostics };
}

describe('splitSlides', () => {
	test('headmatter は 1 枚目のスライドのフロントマターを兼ねる', () => {
		const { slides } = split(
			'---\ntitle: デッキ\nlayout: cover\n---\n\n# 表紙\n\n---\n\n# 2 枚目\n'
		);
		expect(slides).toHaveLength(2);
		expect(slides[0].frontmatter).toEqual({ title: 'デッキ', layout: 'cover' });
		expect(slides[0].content.trim()).toBe('# 表紙');
		expect(slides[1].content.trim()).toBe('# 2 枚目');
	});

	test('区切りの直後が空行でなければ、次の --- までをフロントマターとして読む', () => {
		const { slides } = split('# 1\n\n---\nlayout: section\n---\n\n# 2\n');
		expect(slides[1].frontmatter).toEqual({ layout: 'section' });
		expect(slides[1].content.trim()).toBe('# 2');
		expect(slides[1].line).toBe(3);
		expect(slides[1].contentLine).toBe(6);
	});

	test('コードフェンスの中の --- では区切らない', () => {
		const { slides } = split('# 1\n\n```yaml\na: 1\n---\nb: 2\n```\n');
		expect(slides).toHaveLength(1);
		expect(slides[0].content).toContain('---');
	});

	test('```yaml で始まるスライドは、そのブロックをフロントマターとして扱う', () => {
		const { slides } = split('# 1\n\n---\n\n```yaml\nlayout: center\n```\n\n# 2\n');
		expect(slides[1].frontmatter).toEqual({ layout: 'center' });
		expect(slides[1].content.trim()).toBe('# 2');
	});

	test('YAML として読めないフロントマターは行番号付きのエラーになる', () => {
		const { slides, diagnostics } = split('# 1\n\n---\nlayout: [\n---\n\n# 2\n');
		expect(slides[1].frontmatter).toEqual({});
		expect(diagnostics).toHaveLength(1);
		expect(diagnostics[0]).toMatchObject({ level: 'error', line: 4 });
	});

	test('ファイル末尾の区切りだけのスライドは捨てる', () => {
		const { slides } = split('# 1\n\n---\n');
		expect(slides).toHaveLength(1);
	});
});

describe('extractNotes', () => {
	test.each([
		['末尾のコメントはノートになる', '本文\n\n<!-- ノート -->\n', '本文\n\n', 'ノート'],
		['途中のコメントはノートにしない', '<!-- 途中 -->\n本文\n', '<!-- 途中 -->\n本文\n', null],
		['空のコメントはノートにしない', '本文\n<!-- -->', '本文\n', null]
	])('%s', (_, input, content, notes) => {
		expect(extractNotes(input)).toEqual({ content, notes });
	});
});

describe('splitSlots', () => {
	test('::name:: の行で名前付きスロットに分ける', () => {
		const slots = splitSlots('左\n\n::right::\n\n右\n');
		expect(slots.map((s) => [s.name, s.content.trim()])).toEqual([
			['default', '左'],
			['right', '右']
		]);
	});

	test('コードフェンスの中の ::name:: では分けない', () => {
		const slots = splitSlots('```\n::right::\n```\n');
		expect(slots).toHaveLength(1);
	});
});
