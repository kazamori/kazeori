// ルートの load と entries で共有する、デッキの検索。
import { error } from '@sveltejs/kit';
import { decks } from 'virtual:kazeori/decks';

export function findDeck(id: string) {
	// trailingSlash: 'always' のため、パラメータの末尾に / が付くことがある
	const key = id.replace(/\/+$/, '');
	const deck = decks.find((d) => d.id === key);
	if (!deck) error(404, `デッキ「${id}」が見つかりません`);
	return deck;
}

export function deckEntries() {
	return decks.map((d) => ({ deck: d.id }));
}
