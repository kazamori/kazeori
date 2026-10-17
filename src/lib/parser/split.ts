// slides.md をスライド単位に分割する。区切りとフロントマターの規則は Slidev に合わせる。
import { parse as parseYaml } from 'yaml';
import type { Diagnostic } from '../types.ts';

export interface RawSlide {
	frontmatter: Record<string, unknown>;
	/** フロントマターを除いた本文 */
	content: string;
	/** content の 1 行目が元ファイルの何行目か（1 始まり） */
	contentLine: number;
	/** スライドの開始行（フロントマターを含む、1 始まり） */
	line: number;
	file: string;
}

const fencePattern = /^\s*(`{3,}|~{3,})/;

/**
 * コードフェンス（``` や ~~~）の中にいるかを追う。
 * 開始と同じ文字で、開始以上の長さの行だけが終了になる（CommonMark と同じ規則）。
 */
function createFenceTracker() {
	let open: string | null = null;
	return {
		/** 行がフェンスの開始か終了なら true を返し、状態を進める。 */
		consume(line: string): boolean {
			const m = fencePattern.exec(line);
			if (!m) return false;
			const marker = m[1];
			if (open === null) open = marker;
			else if (marker[0] === open[0] && marker.length >= open.length && line.trim() === marker)
				open = null;
			return true;
		},
		get inside(): boolean {
			return open !== null;
		}
	};
}

function isSeparator(line: string): boolean {
	return line.trimEnd() === '---';
}

function parseFrontmatter(
	yaml: string,
	file: string,
	line: number,
	diagnostics: Diagnostic[]
): Record<string, unknown> {
	if (yaml.trim() === '') return {};
	try {
		const value = parseYaml(yaml);
		if (value === null || value === undefined) return {};
		if (typeof value !== 'object' || Array.isArray(value)) {
			diagnostics.push({
				level: 'error',
				file,
				line,
				message: 'フロントマターはキーと値の組で書いてください'
			});
			return {};
		}
		return value as Record<string, unknown>;
	} catch (e) {
		const offset = (e as { linePos?: { line: number }[] }).linePos?.[0]?.line ?? 1;
		diagnostics.push({
			level: 'error',
			file,
			line: line + offset - 1,
			message: `フロントマターを YAML として読めません: ${(e as Error).message.split('\n')[0]}`
		});
		return {};
	}
}

/**
 * markdown をスライドに分割する。
 * - `---` の行で区切る。コードフェンスの中の `---` は区切りにしない。
 * - 区切りの直後の行が空行でなければ、次の `---` までをフロントマターとみなす。
 * - ファイル先頭の `---` から始まるブロックは headmatter で、1 枚目のフロントマターを兼ねる。
 * - フロントマターのないスライドが ```yaml のブロックで始まるときは、それをフロントマターとみなす。
 */
export function splitSlides(text: string, file: string, diagnostics: Diagnostic[]): RawSlide[] {
	const lines = text.replace(/\r\n?/g, '\n').split('\n');
	const slides: RawSlide[] = [];

	let i = 0;
	let fmLines: string[] | null = null;
	let fmLine = 1;
	let start = 0;

	// フロントマターのブロックを読む。i は開始の `---` の行を指していること。
	const readFrontmatter = () => {
		const begin = i + 1;
		let end = begin;
		while (end < lines.length && !isSeparator(lines[end])) end++;
		if (end >= lines.length) {
			diagnostics.push({
				level: 'error',
				file,
				line: i + 1,
				message: 'フロントマターを閉じる `---` がありません'
			});
		}
		fmLines = lines.slice(begin, end);
		fmLine = begin + 1;
		i = end + 1;
	};

	const startSlide = () => {
		start = i;
		fmLines = null;
		if (i < lines.length && isSeparator(lines[i]) && lines[i + 1]?.trim()) {
			readFrontmatter();
		} else if (i < lines.length && isSeparator(lines[i])) {
			i++;
		}
	};

	const pushSlide = (endExclusive: number, contentStart: number) => {
		const contentLines = lines.slice(contentStart, endExclusive);
		let frontmatter: Record<string, unknown> = {};
		let content = contentLines.join('\n');
		let contentLine = contentStart + 1;
		if (fmLines) {
			frontmatter = parseFrontmatter(fmLines.join('\n'), file, fmLine, diagnostics);
		} else {
			// ```yaml で始まるスライドは、そのブロックをフロントマターとして扱う
			const first = contentLines.findIndex((l) => l.trim() !== '');
			if (first >= 0 && /^```ya?ml\s*$/.test(contentLines[first].trim())) {
				const close = contentLines.findIndex((l, k) => k > first && l.trim() === '```');
				if (close > first) {
					frontmatter = parseFrontmatter(
						contentLines.slice(first + 1, close).join('\n'),
						file,
						contentStart + first + 2,
						diagnostics
					);
					content = contentLines.slice(close + 1).join('\n');
					contentLine = contentStart + close + 2;
				}
			}
		}
		slides.push({ frontmatter, content, contentLine, line: start + 1, file });
	};

	// 先頭の headmatter
	if (lines.length > 0 && isSeparator(lines[0])) {
		start = 0;
		readFrontmatter();
	}
	let contentStart = i;
	const fence = createFenceTracker();

	for (; i < lines.length; i++) {
		const line = lines[i];
		if (fence.consume(line)) continue;
		if (!fence.inside && isSeparator(line)) {
			pushSlide(i, contentStart);
			startSlide();
			contentStart = i;
			i--; // ループの i++ を打ち消す
		}
	}
	pushSlide(lines.length, contentStart);

	// 区切りだけで中身のない末尾のスライドは捨てる（ファイル末尾の --- など）
	const last = slides.at(-1);
	if (
		slides.length > 1 &&
		last &&
		last.content.trim() === '' &&
		Object.keys(last.frontmatter).length === 0
	) {
		slides.pop();
	}
	return slides;
}

/** 本文末尾の HTML コメントを発表者のノートとして取り出す（Slidev と同じ規則）。 */
export function extractNotes(content: string): { content: string; notes: string | null } {
	const m = /<!--([\s\S]*?)-->\s*$/.exec(content);
	if (!m) return { content, notes: null };
	const notes = m[1].trim();
	return { content: content.slice(0, m.index), notes: notes === '' ? null : notes };
}

/**
 * `::name::` の行で本文を名前付きスロットに分ける。最初の区切りより前は default になる。
 * コードフェンスの中は区切りにしない。
 */
export function splitSlots(content: string): { name: string; content: string; offset: number }[] {
	const lines = content.split('\n');
	const result: { name: string; content: string; offset: number }[] = [];
	let name = 'default';
	let begin = 0;
	const fence = createFenceTracker();
	for (let i = 0; i < lines.length; i++) {
		if (fence.consume(lines[i])) continue;
		const slot = fence.inside ? null : /^::([\w-]+)::\s*$/.exec(lines[i]);
		if (slot) {
			result.push({ name, content: lines.slice(begin, i).join('\n'), offset: begin });
			name = slot[1];
			begin = i + 1;
		}
	}
	result.push({ name, content: lines.slice(begin).join('\n'), offset: begin });
	return result;
}
