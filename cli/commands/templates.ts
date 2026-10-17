// デッキの雛形の探索と、kazeori new / kazeori templates。
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { isColor, kazeoriRoot, type Workspace } from '../../src/lib/workspace/config.ts';
import type { ColorName } from '../../src/lib/types.ts';
import { CliError, displayPath, EXIT_OK, openWorkspace, type CommonOptions } from '../context.ts';

export interface Template {
	name: string;
	dir: string;
	description: string;
	color: ColorName | null;
	source: 'workspace' | 'kazeori';
}

function readTemplate(dir: string, source: Template['source']): Template | null {
	if (!fs.existsSync(path.join(dir, 'slides.md'))) return null;
	let meta: Record<string, unknown> = {};
	const metaFile = path.join(dir, 'template.yaml');
	if (fs.existsSync(metaFile)) {
		try {
			meta = (parseYaml(fs.readFileSync(metaFile, 'utf-8')) as Record<string, unknown>) ?? {};
		} catch (e) {
			throw new CliError(
				`${metaFile} を YAML として読めません: ${(e as Error).message.split('\n')[0]}`
			);
		}
	}
	return {
		name: path.basename(dir),
		dir,
		description: typeof meta.description === 'string' ? meta.description : '',
		color: isColor(meta.color) ? meta.color : null,
		source
	};
}

/** workspace の雛形とツール同梱の雛形を集める。同名なら workspace を優先する。 */
export function listTemplates(ws: Workspace): Template[] {
	const result = new Map<string, Template>();
	const scan = (root: string, source: Template['source']) => {
		if (!fs.existsSync(root)) return;
		for (const name of fs.readdirSync(root).sort()) {
			if (result.has(name)) continue;
			const t = readTemplate(path.join(root, name), source);
			if (t) result.set(name, t);
		}
	};
	scan(ws.paths.templates, 'workspace');
	scan(path.join(kazeoriRoot, 'templates'), 'kazeori');
	return [...result.values()];
}

export async function templates(options: CommonOptions & { json?: boolean }): Promise<number> {
	const ws = openWorkspace(options);
	const list = listTemplates(ws);
	if (options.json) {
		console.log(
			JSON.stringify(
				list.map(({ dir: _dir, ...t }) => (void _dir, t)),
				null,
				2
			)
		);
		return EXIT_OK;
	}
	for (const t of list) {
		const where = t.source === 'workspace' ? 'workspace' : 'kazeori 同梱';
		console.log(`${t.name}\t${t.color ?? '-'}\t${where}\t${t.description}`);
	}
	return EXIT_OK;
}

export interface NewOptions extends CommonOptions {
	template?: string;
	date?: string;
	title?: string;
	event?: string;
}

const placeholder = /\{\{\s*(title|date|author|event|color)\s*\}\}/g;

/**
 * 雛形のプレースホルダーを置き換える。
 * headmatter の中では、値に `#` や `:` が含まれても YAML として壊れないよう、引用符で囲んで書き込む。
 */
export function fillTemplate(text: string, values: Record<string, string>): string {
	const lines = text.split('\n');
	const end =
		lines[0]?.trimEnd() === '---' ? lines.findIndex((l, i) => i > 0 && l.trimEnd() === '---') : -1;
	return lines
		.map((line, i) =>
			line.replace(placeholder, (_, key: string) =>
				i > 0 && i < end ? JSON.stringify(values[key]) : values[key]
			)
		)
		.join('\n');
}

function today(): string {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function newDeck(name: string | undefined, options: NewOptions): Promise<number> {
	if (!name) throw new CliError('デッキの名前を指定してください（例: kazeori new kyotogo-lt）');
	if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
		throw new CliError(
			'デッキの名前には英数字、ハイフン、アンダースコア、ドットだけを使ってください'
		);
	}
	const date = options.date ?? today();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new CliError('--date は YYYY-MM-DD の形式で指定してください');
	}
	const ws = openWorkspace(options);
	const templateName = options.template ?? 'default';
	const template = listTemplates(ws).find((t) => t.name === templateName);
	if (!template) {
		throw new CliError(
			`雛形「${templateName}」が見つかりません。kazeori templates で一覧を確認してください`
		);
	}

	const deckDir = path.join(ws.paths.decks, date.slice(0, 4), `${date}-${name}`);
	if (fs.existsSync(deckDir)) {
		throw new CliError(`${displayPath(deckDir)} はすでにあります`);
	}

	const values: Record<string, string> = {
		title: options.title ?? name,
		date,
		author: ws.defaults.author ?? '',
		event: options.event ?? '',
		color: template.color ?? ws.defaults.color
	};
	fs.mkdirSync(deckDir, { recursive: true });
	for (const entry of fs.readdirSync(template.dir, { withFileTypes: true })) {
		if (entry.name === 'template.yaml') continue;
		const from = path.join(template.dir, entry.name);
		const to = path.join(deckDir, entry.name);
		if (entry.name === 'slides.md') {
			fs.writeFileSync(to, fillTemplate(fs.readFileSync(from, 'utf-8'), values));
		} else {
			fs.cpSync(from, to, { recursive: true });
		}
	}
	console.log(`${displayPath(path.join(deckDir, 'slides.md'))} を作成しました`);
	return EXIT_OK;
}
