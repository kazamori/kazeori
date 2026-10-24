// デッキとスライドの型。パーサ（Node 側）とレイアウト（ブラウザ側）で共有する。

export const colors = ['blue', 'green'] as const;
export type ColorName = (typeof colors)[number];

/** kazeori.yaml や headmatter に書くブランド設定。ロゴは絶対パスに解決済みのものを保持する。 */
export interface BrandConfig {
	name?: string;
	copyright?: string;
	logo?: {
		blue?: string;
		green?: string;
		white?: string;
	};
}

/** スライドの描画に使う、配色ごとに確定したブランド情報。ロゴは配信用の URL。 */
export interface ResolvedBrand {
	name: string | null;
	copyright: string | null;
	logo: string | null;
	logoWhite: string | null;
}

export interface SlideImage {
	src: string;
	alt: string;
	/** `pattern:<名前>` で指定した模様の名前。このとき src は空 */
	pattern?: string | null;
	/** 図の下に添える説明（markdown の画像のタイトル `![alt](src "キャプション")`） */
	caption?: string | null;
}

export interface SlideItem {
	title: string | null;
	html: string;
	image: SlideImage | null;
}

/** archify の HTML から取り出した図。 */
export interface ArchifyFigureData {
	alt: string;
	css: string;
	fontFaceCss: string;
	svg: string;
	preset: string | null;
	/** 図の下に添える説明（markdown の画像のタイトル） */
	caption?: string | null;
}

export interface Slide {
	/** 発表ビューでの 1 始まりのページ番号 */
	number: number;
	layout: string;
	className: string;
	frontmatter: Record<string, unknown>;
	/** タイトルの素の文字列（markdown の書式と HTML のタグを除く）。改行は \n */
	title: string | null;
	titleAccent: string | null;
	subtitle: string | null;
	/** タイトルを描く HTML（インラインの markdown を変換したもの）。改行は \n のまま残す */
	titleHtml: string | null;
	titleAccentHtml: string | null;
	subtitleHtml: string | null;
	/** タイトルを収める行数（フロントマターの titleLines）。指定がなければ null で、レイアウトの既定に従う */
	titleLines: number | null;
	/** 最初の箇条書きより前の本文 */
	introHtml: string;
	/** 最初の箇条書きの各項目 */
	items: SlideItem[];
	/** 最初の箇条書きより後の本文 */
	restHtml: string;
	/** タイトル、サブタイトル、単独の画像を除いた本文全体 */
	bodyHtml: string;
	images: SlideImage[];
	figures: ArchifyFigureData[];
	/** `::name::` で区切った名前付きスロット（default 以外） */
	slots: Record<string, string>;
	notes: string | null;
	source: { file: string; line: number };
}

export interface DeckMeta {
	id: string;
	/** 題名の素の文字列（markdown の書式と HTML のタグを除く） */
	title: string;
	/** 題名を描く HTML */
	titleHtml: string;
	color: ColorName;
	author: string | null;
	/** イベント名の素の文字列 */
	event: string | null;
	/** イベント名を描く HTML */
	eventHtml: string | null;
	date: string | null;
	slideCount: number;
}

export interface Deck extends DeckMeta {
	brand: ResolvedBrand;
	slides: Slide[];
}

export interface Diagnostic {
	level: 'error' | 'warning' | 'info';
	file: string;
	line?: number;
	message: string;
}

/**
 * レイアウトが描かせる枠の装飾（左上と右下の正方形、ページ番号、フッター）。
 * - content: 通常のスライドの装飾
 * - section: 右側の accent 色の帯に重ねるため、ページ番号の正方形を白にする
 * - none: 装飾を描かない（表紙や全面の画像など、レイアウトが自前で描く）
 * レイアウトは `<script module>` で `export const chrome = 'none'` のように書き出す。書き出さなければ content。
 */
export type LayoutChrome = 'content' | 'section' | 'none';

export interface LayoutProps {
	slide: Slide;
	deck: Deck;
	brand: ResolvedBrand;
}
