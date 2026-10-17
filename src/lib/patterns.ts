// 画像の代わりに使える模様。スライドでは画像の URL の代わりに `pattern:<名前>` と書く。
// 色は段ごとに accent1、accent3、accent4 で塗るので、デッキの配色（blue / green）に合う。
// 乱数は使わず、同じ名前と同じ縦横比なら常に同じ模様になる。
//
// 模様は 2 系統ある。
// - 波の模様（wave など）：ロゴのシンボルのように、塊の縁が階段状に欠け、縁の外へ明るい四角が散る。8 x 8 のマスで描く。
// - フラクタルの模様（fractal-<規則>[-<角>]）：正方形を 4 分割し、1 つのマスを塗り、残りの 3 マスに同じ規則を 3 段まで繰り返す。
//   正方形でない枠では、枠を正方形だけで敷き詰めてから、それぞれの正方形に同じ規則を当てる。

export const PATTERN_PREFIX = 'pattern:';

/** 波の模様の大きさ（マス）。 */
const WAVE_GRID = 8;

/**
 * 波の模様の名前と、列ごとの縁の位置（上から何マス目で塊が始まるか）。
 * 正弦波や直線で決めた縁の高さをマスの単位に丸めたもの。
 */
const wavePatterns = {
	/** 中ほどの高さで穏やかにうねる */
	wave: [4, 3, 3, 4, 4, 5, 5, 4],
	/** 中央が深く沈む谷 */
	valley: [3, 4, 5, 6, 5, 4, 3, 4],
	/** ほぼ平らな縁に、ところどころ欠けがある */
	plateau: [3, 3, 4, 4, 4, 4, 4, 3],
	/** 左下から右上へ斜めに上がる（ロゴのシンボルに近い） */
	rise: [7, 6, 5, 5, 4, 3, 2, 1],
	/** 左上から右下へ斜めに下がる */
	fall: [1, 2, 2, 3, 4, 4, 5, 6],
	/** 大きくうねりながら右へ高くなる */
	swell: [6, 5, 4, 4, 3, 2, 2, 2]
} satisfies Record<string, number[]>;

export type WavePatternName = keyof typeof wavePatterns;

export type Corner = 'tl' | 'tr' | 'br' | 'bl';

const clockwise: Corner[] = ['tl', 'tr', 'br', 'bl'];
const position: Record<Corner, [number, number]> = {
	tl: [0, 0],
	tr: [1, 0],
	bl: [0, 1],
	br: [1, 1]
};
const opposite: Record<Corner, Corner> = { tl: 'br', br: 'tl', tr: 'bl', bl: 'tr' };

function cornerAt(x: number, y: number): Corner {
	return clockwise.find((c) => position[c][0] === x && position[c][1] === y)!;
}

/** 次の段で塗る角の決め方。corner は親で塗った角、child は親の中での子のマスの位置。 */
const fractalRules = {
	/** 常に同じ角を塗る */
	fixed: (corner: Corner) => corner,
	/** 段ごとに塗る角を時計回りに 90 度回す */
	clockwise: (corner: Corner) => clockwise[(clockwise.indexOf(corner) + 1) % 4],
	/** 段ごとに塗る角を反時計回りに 90 度回す */
	counter: (corner: Corner) => clockwise[(clockwise.indexOf(corner) + 3) % 4],
	/** 親の中心に近い角を塗る（中心へ集まる） */
	inward: (_corner: Corner, child: Corner) => opposite[child],
	/** 親の外側の角を塗る（外へ散る） */
	outward: (_corner: Corner, child: Corner) => child,
	/** 塗ったマスに隣り合う子は、塗ったマスの側の角を塗る */
	mirror: (corner: Corner, child: Corner) => {
		const [cx, cy] = position[corner];
		const [x, y] = position[child];
		if (x === cx) return cornerAt(cx, 1 - y);
		if (y === cy) return cornerAt(1 - x, cy);
		return opposite[child];
	}
} satisfies Record<string, (corner: Corner, child: Corner) => Corner>;

export type FractalRule = keyof typeof fractalRules;

export type PatternSpec =
	{ kind: 'wave'; name: WavePatternName } | { kind: 'fractal'; rule: FractalRule; corner: Corner };

/** 模様の名前を解釈する。未知の名前なら null。 */
export function parsePattern(name: string): PatternSpec | null {
	if (Object.hasOwn(wavePatterns, name)) return { kind: 'wave', name: name as WavePatternName };
	const m = /^fractal-([a-z]+)(?:-(tl|tr|bl|br))?$/.exec(name);
	if (m && Object.hasOwn(fractalRules, m[1])) {
		return { kind: 'fractal', rule: m[1] as FractalRule, corner: (m[2] as Corner) ?? 'br' };
	}
	return null;
}

export function isPatternName(name: string): boolean {
	return parsePattern(name) !== null;
}

/** エラーの表示などに使う、模様の名前の一覧。 */
export const patternNames = [
	...Object.keys(wavePatterns),
	...Object.keys(fractalRules).map((rule) => `fractal-${rule}[-tl|-tr|-bl|-br]`)
];

/** 段。0 がいちばん大きく濃い（accent1）、1 が中間（accent3）、2 がいちばん小さく明るい（accent4）。 */
export type PatternLevel = 0 | 1 | 2;

export interface PatternRect {
	x: number;
	y: number;
	size: number;
	level: PatternLevel;
}

export interface PatternDrawing {
	width: number;
	height: number;
	rects: PatternRect[];
}

function drawWave(name: WavePatternName): PatternDrawing {
	const tops = wavePatterns[name];
	const rects: PatternRect[] = [];
	for (let x = 0; x < WAVE_GRID; x++) {
		for (let y = 0; y < WAVE_GRID; y++) {
			// 縁からの距離（上へ正）
			const d = tops[x] - y;
			if (d < 0) rects.push({ x, y, size: 1, level: 0 });
			else if (d === 0) rects.push({ x, y, size: 1, level: 1 });
			// 縁のすぐ上は市松の位置に、さらに 2 段上は決まった間隔でまばらに散らす
			else if (d === 1 && (x + y) % 2 === 0) rects.push({ x, y, size: 1, level: 2 });
			else if (d === 3 && (x * 2 + y) % 5 === 0) rects.push({ x, y, size: 1, level: 2 });
		}
	}
	return { width: WAVE_GRID, height: WAVE_GRID, rects };
}

/** 正方形の大きさ（マス）。正方形の枠は 1 辺 8 マスで描く。 */
const FRACTAL_UNIT = 8;
const MAX_DEPTH = 3;

interface Tile {
	x: number;
	y: number;
	size: number;
}

/**
 * w x h（マス）の長方形を、大きな正方形から順に切り出して正方形だけで敷き詰める（ユークリッドの互除法と同じ手順）。
 */
export function squareTiles(w: number, h: number): Tile[] {
	const tiles: Tile[] = [];
	let x = 0;
	let y = 0;
	let width = w;
	let height = h;
	while (width > 0 && height > 0) {
		if (width >= height) {
			tiles.push({ x, y, size: height });
			x += height;
			width -= height;
		} else {
			tiles.push({ x, y, size: width });
			y += width;
			height -= width;
		}
	}
	return tiles;
}

function drawFractalTile(
	tile: Tile,
	rule: FractalRule,
	corner: Corner,
	depth: number,
	rects: PatternRect[]
) {
	const next = fractalRules[rule];
	// 段数が少ない正方形でも、いちばん明るい色まで使えるように段の色を割り当てる
	const levels: PatternLevel[] = depth >= 3 ? [0, 1, 2] : depth === 2 ? [0, 2] : [0];
	const visit = (x: number, y: number, s: number, c: Corner, d: number) => {
		if (d === depth) return;
		const h = s / 2;
		for (const child of clockwise) {
			const [qx, qy] = position[child];
			const cx = x + qx * h;
			const cy = y + qy * h;
			if (child === c) rects.push({ x: cx, y: cy, size: h, level: levels[d] });
			else visit(cx, cy, h, next(c, child), d + 1);
		}
	};
	visit(tile.x, tile.y, tile.size, corner, 0);
}

function drawFractal(rule: FractalRule, corner: Corner, aspect: number): PatternDrawing {
	// ほぼ正方形の枠は 1 つの正方形で描き、それ以外は短い辺を 8 マスにして正方形で敷き詰める
	const square = Math.abs(aspect - 1) < 0.05;
	const width = square ? FRACTAL_UNIT : Math.max(1, Math.round(FRACTAL_UNIT * Math.max(aspect, 1)));
	const height = square
		? FRACTAL_UNIT
		: Math.max(1, Math.round(FRACTAL_UNIT / Math.min(aspect, 1)));
	const rects: PatternRect[] = [];
	squareTiles(width, height).forEach((tile, i) => {
		// 最初の（最も大きな）正方形は指定の規則と角で、残りは角を時計回りに変えながら固定の規則で描く
		const tileRule: FractalRule = i === 0 ? rule : 'fixed';
		const tileCorner = clockwise[(clockwise.indexOf(corner) + i) % 4];
		// 小さな正方形で模様が細かくなりすぎないよう、正方形の大きさに応じて段数を減らす
		const depth = Math.max(1, Math.min(MAX_DEPTH, Math.floor(Math.log2(tile.size))));
		drawFractalTile(tile, tileRule, tileCorner, depth, rects);
	});
	return { width, height, rects };
}

/** 模様を描く。aspect は枠の横 / 縦の比。 */
export function drawPattern(spec: PatternSpec, aspect = 1): PatternDrawing {
	return spec.kind === 'wave' ? drawWave(spec.name) : drawFractal(spec.rule, spec.corner, aspect);
}
