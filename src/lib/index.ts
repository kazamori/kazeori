// 独自レイアウト（workspace の layouts/*.svelte）向けの公開 API。
// レイアウトはこれらの部品と CSS 変数（--kz-accent1 など）を使って、カザモリスタイルの意匠をそろえる。
export { default as SlideTitle } from './components/SlideTitle.svelte';
export { default as SlideHeader } from './components/SlideHeader.svelte';
export { default as SideColumn } from './components/SideColumn.svelte';
export { default as ProgressList } from './components/ProgressList.svelte';
export { default as Html } from './components/Html.svelte';
export { default as Picture } from './components/Picture.svelte';
export { default as Pattern } from './components/Pattern.svelte';
export { default as Figure } from './components/Figure.svelte';
export { default as Logo } from './components/Logo.svelte';
export { default as Square } from './components/Square.svelte';
export { default as ProgressBar } from './components/ProgressBar.svelte';
export { drawPattern, parsePattern, patternNames } from './patterns';
export { accentAt, formatDate, pad2, parseProgress, splitBlockquote, stripTags } from './format';
export type {
	ArchifyFigureData,
	Deck,
	LayoutChrome,
	LayoutProps,
	ResolvedBrand,
	Slide,
	SlideImage,
	SlideItem
} from './types';
