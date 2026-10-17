import { deckEntries, findDeck } from '../../deck';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = deckEntries;

export const load: PageLoad = ({ params }) => ({ deck: findDeck(params.deck) });
