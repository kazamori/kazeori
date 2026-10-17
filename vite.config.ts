// kazeori の Vite 設定。workspace の場所などは CLI が環境変数で渡す。
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { kazeoriWorkspace } from './src/lib/workspace/vite-plugin.ts';

const env = process.env;
// 未指定ならサンプル workspace（examples/）を使う
const workspaceRoot = env.KAZEORI_WORKSPACE || null;
const deckIds = env.KAZEORI_DECKS ? env.KAZEORI_DECKS.split(',') : null;

export default defineConfig({
	plugins: [
		kazeoriWorkspace({
			workspaceRoot,
			brandFile: env.KAZEORI_BRAND || null,
			deckIds
		}),
		sveltekit({
			adapter: adapter({ pages: env.KAZEORI_OUT || 'build', strict: true }),
			outDir: env.KAZEORI_KIT_DIR || '.svelte-kit',
			prerender: { handleHttpError: 'fail' }
		})
	]
});
