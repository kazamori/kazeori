// workspace のデッキとレイアウトを、仮想モジュールとして SvelteKit に渡す Vite プラグイン。
// - virtual:kazeori/decks: 全デッキ（画像は Vite の import で配信用の URL に変える）
// - virtual:kazeori/layouts: レイアウトの名前 → { component, chrome }（組み込みと workspace の独自レイアウト）
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { builtinLayouts } from '../parser/deck.ts';
import type { Deck, Diagnostic } from '../types.ts';
import { CONFIG_FILE, kazeoriRoot, loadWorkspace, type Workspace } from './config.ts';
import { listCustomLayouts, loadDecks, type LoadOptions } from './decks.ts';

const DECKS_ID = 'virtual:kazeori/decks';
const LAYOUTS_ID = 'virtual:kazeori/layouts';
const resolved = (id: string) => '\0' + id;

const assetToken = (index: number) => `__KZ_ASSET_${index}__`;

/**
 * デッキの仮想モジュールのコードを作る。
 * パーサがローカルの画像を目印（__KZ_ASSET_n__）に置き換えているので、Vite に画像を import させ、
 * 配信用の URL に置き換えてから JSON を読む。
 */
function decksModule(decks: Deck[], assets: string[]): string {
	const imports = assets.map((abs, i) => `import a${i} from ${JSON.stringify(abs + '?url')};`);
	const replaces = assets.map(
		(_, i) =>
			`json = json.split(${JSON.stringify(assetToken(i))}).join(JSON.stringify(a${i}).slice(1, -1));`
	);
	return [
		...imports,
		`let json = ${JSON.stringify(JSON.stringify(decks))};`,
		...replaces,
		'export const decks = JSON.parse(json);'
	].join('\n');
}

/** レイアウトの仮想モジュールのコードを作る。chrome はレイアウトが <script module> で書き出す値。 */
function layoutsModule(files: Record<string, string>): string {
	const entries = Object.entries(files);
	const imports = entries.map(([, file], i) => `import * as L${i} from ${JSON.stringify(file)};`);
	const map = entries.map(
		([name], i) =>
			`${JSON.stringify(name)}: { component: L${i}.default, chrome: L${i}.chrome ?? 'content' }`
	);
	return [...imports, `export const layouts = {\n${map.join(',\n')}\n};`].join('\n');
}

function formatDiagnostic(d: Diagnostic, root: string): string {
	return `${path.relative(root, d.file)}${d.line ? `:${d.line}` : ''}: ${d.message}`;
}

export function kazeoriWorkspace(options: LoadOptions): Plugin {
	let server: ViteDevServer | null = null;
	let workspace: Workspace = loadWorkspace(options.workspaceRoot, options.brandFile);
	// デッキが読み込んだファイル（workspace の外の画像などを含む）
	let tracked = new Set<string>();

	/** ファイルの変更で、デッキやレイアウトを読み直す必要があるか。 */
	const affectsDecks = (file: string) => {
		const abs = path.resolve(file);
		const { paths, root } = workspace;
		return (
			tracked.has(abs) ||
			abs === path.join(root, CONFIG_FILE) ||
			[paths.decks, paths.partials, paths.layouts].some((dir) => abs.startsWith(dir + path.sep))
		);
	};

	// 仮想モジュールを無効にして、ブラウザを再読み込みさせる（スライドの位置は URL のハッシュで保つ）
	const reload = () => {
		if (!server) return;
		for (const id of [DECKS_ID, LAYOUTS_ID]) {
			const mod = server.moduleGraph.getModuleById(resolved(id));
			if (mod) server.moduleGraph.invalidateModule(mod);
		}
		server.ws.send({ type: 'full-reload' });
	};

	return {
		name: 'kazeori-workspace',
		enforce: 'pre',

		config() {
			return {
				resolve: {
					dedupe: ['svelte'],
					alias: { kazeori: path.join(kazeoriRoot, 'src/lib/index.ts') }
				},
				server: { fs: { allow: [kazeoriRoot, workspace.root] } }
			};
		},

		configureServer(s) {
			server = s;
			s.watcher.add([workspace.root]);
			const onChange = (file: string) => {
				if (affectsDecks(file)) reload();
			};
			for (const event of ['change', 'add', 'unlink'] as const) s.watcher.on(event, onChange);
		},

		resolveId(id) {
			return id === DECKS_ID || id === LAYOUTS_ID ? resolved(id) : null;
		},

		async load(id) {
			if (id === resolved(DECKS_ID)) {
				const assets: string[] = [];
				const loaded = await loadDecks(options, (abs) => {
					const index = assets.includes(abs) ? assets.indexOf(abs) : assets.push(abs) - 1;
					return assetToken(index);
				});
				workspace = loaded.workspace;
				tracked = new Set(loaded.files.map((f) => path.resolve(f)));
				for (const d of loaded.diagnostics) {
					if (d.level === 'info') continue;
					const message = `[kazeori] ${formatDiagnostic(d, workspace.root)}`;
					if (d.level === 'error') this.warn(message);
					else server?.config.logger.warn(message);
				}
				return decksModule(loaded.decks, assets);
			}
			if (id === resolved(LAYOUTS_ID)) {
				const builtin = Object.fromEntries(
					builtinLayouts.map((name) => [
						name,
						path.join(kazeoriRoot, 'src/lib/layouts', `${name}.svelte`)
					])
				);
				// 組み込みと同じ名前の独自レイアウトは使わない（check でエラーにしている）
				return layoutsModule({ ...listCustomLayouts(workspace), ...builtin });
			}
			return null;
		}
	};
}
