// レイアウトで使う小さな整形処理。

/** 2026-10-17 を「2026年10月17日」にする。形式が違えばそのまま返す。 */
export function formatDate(date: string | null): string | null {
	if (!date) return null;
	const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(date.trim());
	if (!m) return date;
	return `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日`;
}

/** HTML からタグを除いた文字列を返す。 */
export function stripTags(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replaceAll('&amp;', '&')
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&quot;', '"')
		.trim();
}

/** 「ラベル 75%」の形の文字列を、ラベルと割合に分ける。形が違えば null。 */
export function parseProgress(text: string): { label: string; value: number } | null {
	const m = /^(.*?)[\s:：]*(\d{1,3}(?:\.\d+)?)\s*[%％]$/.exec(text.trim());
	if (!m) return null;
	return { label: m[1].trim(), value: Number(m[2]) };
}

/** 項目の順に使う accent 色。テンプレートのアイコン付きの格子と同じ順。 */
const accentCycle = [
	'var(--kz-accent1)',
	'var(--kz-accent2)',
	'var(--kz-accent3)',
	'var(--kz-accent4)',
	'var(--kz-accent5)',
	'var(--kz-accent6)'
];

export function accentAt(index: number): string {
	return accentCycle[index % accentCycle.length];
}

/** 項目を順に塗る色。隣り合う項目が見分けられるよう、配色ごとに accent 色の順を変える（--kz-item1 から --kz-item6）。 */
export function itemColorAt(index: number): string {
	return `var(--kz-item${(index % accentCycle.length) + 1})`;
}

/** 01、02 のような 2 桁の番号。 */
export function pad2(n: number): string {
	return String(n).padStart(2, '0');
}

/** blockquote とそれ以外に HTML を分ける。 */
export function splitBlockquote(html: string): { quote: string; rest: string } {
	const m = /<blockquote>([\s\S]*?)<\/blockquote>/.exec(html);
	if (!m) return { quote: '', rest: html };
	return { quote: m[1], rest: html.slice(0, m.index) + html.slice(m.index + m[0].length) };
}

/** HTML の特殊文字をエスケープする。 */
export function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}
