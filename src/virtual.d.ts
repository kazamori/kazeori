// workspace の Vite プラグインが生成する仮想モジュールの型。
declare module 'virtual:kazeori/decks' {
	export const decks: import('./lib/types.ts').Deck[];
}

declare module 'virtual:kazeori/layouts' {
	export const layouts: Record<
		string,
		{
			component: import('svelte').Component<import('./lib/types.ts').LayoutProps>;
			chrome: import('./lib/types.ts').LayoutChrome;
		}
	>;
}
