// スライドの図と画像を、レイアウトが描く順に並べる。
import type { ArchifyFigureData, Slide, SlideImage } from './types';

export type Visual =
	{ kind: 'figure'; figure: ArchifyFigureData } | { kind: 'image'; image: SlideImage };

/**
 * スライドの図と画像を、archify の図が先、画像が後の順に並べる。
 * Figure の index はこの並びの位置で、画像を描くレイアウトはこの並びの数で枠を決める。
 */
export function slideVisuals(slide: Slide): Visual[] {
	return [
		...slide.figures.map((figure) => ({ kind: 'figure' as const, figure })),
		...slide.images.map((image) => ({ kind: 'image' as const, image }))
	];
}
