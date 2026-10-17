// workspace（kazeori.yaml を置いたディレクトリ）の探索と設定の読み込み。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { colors, type BrandConfig, type ColorName, type Diagnostic } from '../types.ts';

export const CONFIG_FILE = 'kazeori.yaml';

/** kazeori のパッケージのルート（この repo、または node_modules/kazeori）。 */
export const kazeoriRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export interface WorkspaceDefaults {
	color: ColorName;
	author: string | null;
}

export interface WorkspacePaths {
	decks: string;
	templates: string;
	partials: string;
	layouts: string;
	dist: string;
}

export interface Workspace {
	root: string;
	configFile: string | null;
	brand: BrandConfig;
	defaults: WorkspaceDefaults;
	paths: WorkspacePaths;
	diagnostics: Diagnostic[];
}

export class WorkspaceError extends Error {}

/** start から親へ kazeori.yaml を探し、見つかったディレクトリを返す。 */
export function findWorkspaceRoot(start: string): string | null {
	let dir = path.resolve(start);
	for (;;) {
		if (fs.existsSync(path.join(dir, CONFIG_FILE))) return dir;
		const parent = path.dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

/** 設定ファイルが見つからないときに使う、ツール同梱のサンプル workspace。 */
function exampleWorkspaceRoot(): string {
	return path.join(kazeoriRoot, 'examples');
}

const configKeys = new Set(['brand', 'defaults', 'paths']);
const brandKeys = new Set(['name', 'copyright', 'logo']);
const logoKeys = new Set(['blue', 'green', 'white']);
const defaultsKeys = new Set(['color', 'author']);
const pathKeys = new Set(['decks', 'templates', 'partials', 'layouts', 'dist']);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function warnUnknownKeys(
	value: Record<string, unknown>,
	known: Set<string>,
	where: string,
	file: string,
	diagnostics: Diagnostic[]
) {
	for (const key of Object.keys(value)) {
		if (!known.has(key)) {
			diagnostics.push({
				level: 'warning',
				file,
				message: `${where}未知の項目「${key}」があります`
			});
		}
	}
}

/**
 * ブランド設定を読み、ロゴのパスを baseDir からの絶対パスに解決する。
 * logo を文字列で書いたときは、全配色と白抜きに同じファイルを使う。
 */
export function parseBrand(
	value: unknown,
	baseDir: string,
	file: string,
	diagnostics: Diagnostic[]
): BrandConfig {
	if (value === undefined || value === null) return {};
	if (!isRecord(value)) {
		diagnostics.push({ level: 'error', file, message: 'brand はオブジェクトで指定してください' });
		return {};
	}
	warnUnknownKeys(value, brandKeys, 'brand に', file, diagnostics);
	const brand: BrandConfig = {};
	if (typeof value.name === 'string') brand.name = value.name;
	if (typeof value.copyright === 'string') brand.copyright = value.copyright;
	const logo = value.logo;
	if (typeof logo === 'string') {
		const resolved = path.resolve(baseDir, logo);
		brand.logo = { blue: resolved, green: resolved, white: resolved };
	} else if (isRecord(logo)) {
		warnUnknownKeys(logo, logoKeys, 'brand.logo に', file, diagnostics);
		brand.logo = {};
		for (const key of logoKeys) {
			const v = logo[key];
			if (typeof v === 'string') {
				brand.logo[key as 'blue' | 'green' | 'white'] = path.resolve(baseDir, v);
			}
		}
	}
	return brand;
}

/** 後から渡した設定で上書きする。logo は配色ごとに上書きする。 */
export function mergeBrand(...layers: BrandConfig[]): BrandConfig {
	const merged: BrandConfig = {};
	for (const layer of layers) {
		if (layer.name !== undefined) merged.name = layer.name;
		if (layer.copyright !== undefined) merged.copyright = layer.copyright;
		if (layer.logo) merged.logo = { ...merged.logo, ...layer.logo };
	}
	return merged;
}

export function isColor(value: unknown): value is ColorName {
	return typeof value === 'string' && (colors as readonly string[]).includes(value);
}

/** YAML ファイルを読む。読めないときは diagnostics にエラーを積んで null を返す。 */
function readYamlFile(file: string, diagnostics: Diagnostic[]): unknown {
	let text: string;
	try {
		text = fs.readFileSync(file, 'utf-8');
	} catch {
		diagnostics.push({ level: 'error', file, message: 'ファイルを読めません' });
		return null;
	}
	try {
		return parseYaml(text) ?? {};
	} catch (e) {
		const line = (e as { linePos?: { line: number }[] }).linePos?.[0]?.line;
		diagnostics.push({
			level: 'error',
			file,
			line,
			message: `YAML として読めません: ${(e as Error).message.split('\n')[0]}`
		});
		return null;
	}
}

/**
 * workspace を読み込む。root が null のときはサンプル workspace を使う。
 * brandFile（CLI の --brand）は kazeori.yaml の brand を上書きする。
 */
export function loadWorkspace(root: string | null, brandFile?: string | null): Workspace {
	const wsRoot = root ?? exampleWorkspaceRoot();
	const configFile = path.join(wsRoot, CONFIG_FILE);
	const diagnostics: Diagnostic[] = [];
	let raw: Record<string, unknown> = {};
	const hasConfig = fs.existsSync(configFile);
	if (hasConfig) {
		const value = readYamlFile(configFile, diagnostics);
		if (isRecord(value)) {
			raw = value;
			warnUnknownKeys(raw, configKeys, '', configFile, diagnostics);
		} else if (value !== null) {
			diagnostics.push({
				level: 'error',
				file: configFile,
				message: 'kazeori.yaml はオブジェクトで書いてください'
			});
		}
	}

	let brand = parseBrand(raw.brand, wsRoot, configFile, diagnostics);
	if (brandFile) {
		const file = path.resolve(brandFile);
		const value = readYamlFile(file, diagnostics);
		// --brand のファイルは brand の中身だけを書いても、brand: の下に書いてもよい
		const body = isRecord(value) && isRecord(value.brand) ? value.brand : value;
		brand = mergeBrand(brand, parseBrand(body, path.dirname(file), file, diagnostics));
	}

	const defaults: WorkspaceDefaults = { color: 'blue', author: null };
	if (isRecord(raw.defaults)) {
		warnUnknownKeys(raw.defaults, defaultsKeys, 'defaults に', configFile, diagnostics);
		const { color, author } = raw.defaults;
		if (color !== undefined) {
			if (isColor(color)) defaults.color = color;
			else
				diagnostics.push({
					level: 'error',
					file: configFile,
					message: `defaults.color は ${colors.join(' または ')} で指定してください`
				});
		}
		if (typeof author === 'string') defaults.author = author;
	}

	const rawPaths = isRecord(raw.paths) ? raw.paths : {};
	if (isRecord(raw.paths)) {
		warnUnknownKeys(raw.paths, pathKeys, 'paths に', configFile, diagnostics);
	}
	const p = (key: keyof WorkspacePaths) =>
		path.resolve(wsRoot, typeof rawPaths[key] === 'string' ? (rawPaths[key] as string) : key);

	return {
		root: wsRoot,
		configFile: hasConfig ? configFile : null,
		brand,
		defaults,
		paths: {
			decks: p('decks'),
			templates: p('templates'),
			partials: p('partials'),
			layouts: p('layouts'),
			dist: p('dist')
		},
		diagnostics
	};
}

export const DECK_FILE = 'slides.md';

/** decks ディレクトリ配下の slides.md を探し、デッキ ID（decks からの相対パス）の一覧を返す。 */
export function listDeckIds(decksDir: string): string[] {
	const ids: string[] = [];
	const walk = (dir: string) => {
		let entries: fs.Dirent[];
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		if (dir !== decksDir && entries.some((e) => e.isFile() && e.name === DECK_FILE)) {
			ids.push(path.relative(decksDir, dir).split(path.sep).join('/'));
			return;
		}
		for (const e of entries) {
			if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
				walk(path.join(dir, e.name));
			}
		}
	};
	walk(decksDir);
	return ids.sort();
}

/**
 * --deck の指定をデッキ ID に解決する。ID そのもの、または一意に決まるディレクトリ名（日付の接頭辞を除いた名前も可）を受け付ける。
 * 見つからないか曖昧なときは WorkspaceError を投げる。
 */
export function resolveDeckId(ids: string[], query: string): string {
	const q = query.replace(/\/+$/, '');
	if (ids.includes(q)) return q;
	// ディレクトリ名、または日付の接頭辞（YYYY-MM-DD-）を除いた名前で探す
	const name = (id: string) => id.split('/').at(-1) ?? id;
	let matches = ids.filter((id) => name(id) === q);
	if (matches.length === 0) {
		matches = ids.filter((id) => name(id).replace(/^\d{4}-\d{2}-\d{2}-/, '') === q);
	}
	if (matches.length === 1) return matches[0];
	if (matches.length > 1) {
		throw new WorkspaceError(`デッキ「${query}」は複数あります: ${matches.join(', ')}`);
	}
	throw new WorkspaceError(`デッキ「${query}」が見つかりません`);
}
