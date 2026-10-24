import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { parseDeck } from '../src/lib/parser/deck.ts';
import { loadWorkspace } from '../src/lib/workspace/config.ts';

const wsRoot = path.join(import.meta.dir, 'fixtures/ws');
const brokenRoot = path.join(import.meta.dir, 'fixtures/broken');
const resolveAsset = (abs: string) => `asset:${path.relative(wsRoot, abs)}`;

async function parseBasic(brandFile?: string) {
	return parseDeck(loadWorkspace(wsRoot, brandFile), '2026/2026-01-01-basic', { resolveAsset });
}

describe('parseDeck', () => {
	test('headmatter からデッキの情報を読み、省略した項目は kazeori.yaml の defaults で補う', async () => {
		const { deck } = await parseBasic();
		expect(deck).toMatchObject({
			title: '基本のデッキ',
			color: 'blue',
			author: '発表者',
			event: 'テスト勉強会',
			date: '2026-01-01'
		});
	});

	test('hide のスライドを除き、ページ番号を振り直す', async () => {
		const { deck } = await parseBasic();
		expect(deck.slides.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6]);
		expect(deck.slides.map((s) => s.title)).not.toContain('隠すスライド');
	});

	test('1 枚目の既定のレイアウトは cover、2 枚目以降は default', async () => {
		const { deck } = await parseBasic();
		expect(deck.slides[0].layout).toBe('cover');
		expect(deck.slides[5].layout).toBe('default');
	});

	test('共通スライドを展開し、プレースホルダーをデッキの値で置き換え、読み込む側のフロントマターを合成する', async () => {
		const { deck } = await parseBasic();
		const [about, second] = deck.slides.slice(1, 3);
		expect(about).toMatchObject({
			layout: 'profile',
			className: 'about',
			title: '発表者',
			subtitle: 'テスト勉強会 の発表者'
		});
		expect(second.title).toBe('2 枚目の共通スライド');
		expect(about.source.file).toBe(path.join(wsRoot, 'partials/about.md'));
	});

	test('frontmatter の title と titleAccent、サブタイトル、項目、前後の本文、ノートを取り出す', async () => {
		const { deck } = await parseBasic();
		const slide = deck.slides[3];
		expect(slide).toMatchObject({
			layout: 'features',
			title: '機能',
			titleAccent: '一覧',
			subtitle: 'サブタイトル',
			notes: '発表者のノート'
		});
		expect(slide.items.map((i) => i.title)).toEqual(['項目 1', '項目 2']);
		expect(slide.items[0].html).toBe('<p>説明 1</p>');
		expect(slide.introHtml).toBe('<p>導入文です。</p>');
		expect(slide.restHtml).toBe('<p>後ろの本文。</p>');
		expect(slide.bodyHtml).not.toContain('発表者のノート');
	});

	test('archify の HTML を図として取り込む', async () => {
		const { deck } = await parseBasic();
		const slide = deck.slides[4];
		expect(slide.title).toBe('構成図');
		expect(slide.figures).toHaveLength(1);
		expect(slide.figures[0].alt).toBe('全体の構成');
		expect(slide.bodyHtml).toBe('');
	});

	test('/ で始まる画像はデッキの public/ から、相対パスはスライドのファイルから解決する', async () => {
		const { deck } = await parseBasic();
		const slide = deck.slides[5];
		expect(slide.images).toEqual([
			{ src: 'asset:decks/2026/2026-01-01-basic/public/photo.png', alt: '写真' }
		]);
		expect(slide.bodyHtml).toContain('src="asset:decks/2026/2026-01-01-basic/local.png"');
	});

	test('コードの行ハイライトは指定行に highlighted、それ以外に dimmed を付ける', async () => {
		const { deck } = await parseBasic();
		const html = deck.slides[5].bodyHtml;
		expect(html).toContain('class="line dimmed"');
		expect(html).toContain('class="line highlighted"');
	});

	test('ブランド設定を配色に応じて解決し、copyright の {year} と {name} を置き換える', async () => {
		const { deck } = await parseBasic();
		expect(deck.brand).toEqual({
			name: 'Test Inc.',
			copyright: '© 2026 Test Inc.',
			logo: 'asset:brand/logo.png',
			logoWhite: 'asset:brand/logo.png'
		});
	});

	test('--brand のファイルは kazeori.yaml のブランド設定を上書きする', async () => {
		const brand = path.join(import.meta.dir, 'fixtures/brand-override.yaml');
		await Bun.write(brand, 'name: Other LLC\n');
		const { deck } = await parseBasic(brand);
		expect(deck.brand.name).toBe('Other LLC');
		expect(deck.brand.copyright).toBe('© 2026 Other LLC');
	});

	test('pattern:<名前> は模様として扱い、未知の名前はエラーになる', async () => {
		const dir = path.join(wsRoot, 'decks/2026/2026-01-02-pattern');
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			path.join(dir, 'slides.md'),
			'---\ntitle: 模様\nimage: pattern:wave\n---\n\n---\n\n![](pattern:fractal-inward-tl)\n\n---\n\n![](pattern:nothing)\n'
		);
		try {
			const { deck, diagnostics } = await parseDeck(
				loadWorkspace(wsRoot),
				'2026/2026-01-02-pattern',
				{
					resolveAsset
				}
			);
			expect(deck.slides[0].images).toEqual([{ src: '', alt: '', pattern: 'wave' }]);
			expect(deck.slides[1].images).toEqual([{ src: '', alt: '', pattern: 'fractal-inward-tl' }]);
			expect(diagnostics.filter((d) => d.level === 'error').map((d) => d.message)).toEqual([
				expect.stringContaining('未知の模様「nothing」')
			]);
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	test('タイトルの <br> と YAML の改行を改行にし、素の文字列からは HTML のタグを除く（#10）', async () => {
		const dir = path.join(wsRoot, 'decks/2026/2026-01-03-title');
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			path.join(dir, 'slides.md'),
			[
				'---',
				'title: |',
				'  人に見せる図、',
				'  自分が分かるための図',
				'titleAccent: 2 行目<br/>3 行目',
				'---',
				'',
				'---',
				'',
				'# 見出しの<BR>改行と <b>太字</b>',
				'',
				'## サブ<br>タイトル',
				''
			].join('\n')
		);
		try {
			const { deck } = await parseDeck(loadWorkspace(wsRoot), '2026/2026-01-03-title', {
				resolveAsset
			});
			expect(deck.title).toBe('人に見せる図、\n自分が分かるための図');
			expect(deck.slides[0].titleAccent).toBe('2 行目\n3 行目');
			expect(deck.slides[1].title).toBe('見出しの\n改行と 太字');
			expect(deck.slides[1].titleHtml).toBe('見出しの\n改行と <b>太字</b>');
			expect(deck.slides[1].subtitle).toBe('サブ\nタイトル');
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	test('title がなければディレクトリ名を題名にし、markdown として解析しない', async () => {
		const dir = path.join(wsRoot, 'decks/2026/2026-01-04-*no*-title');
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, 'slides.md'), '---\nauthor: 発表者\n---\n\n# 本文\n');
		try {
			const { deck } = await parseDeck(loadWorkspace(wsRoot), '2026/2026-01-04-*no*-title', {
				resolveAsset
			});
			expect(deck).toMatchObject({
				title: '2026-01-04-*no*-title',
				titleHtml: '2026-01-04-*no*-title'
			});
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	test('title、titleAccent、event、見出しのインラインの markdown を HTML にする', async () => {
		const dir = path.join(wsRoot, 'decks/2026/2026-01-04-inline');
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			path.join(dir, 'slides.md'),
			[
				'---',
				'title: "[archify](https://example.com/archify)<br>の紹介"',
				'event: はんなり LT **#1**',
				'---',
				'',
				'---',
				'title: 1. `code` と <a href="https://example.com">HTML</a>',
				'titleAccent: "*強調* & <小なり>"',
				'---',
				'',
				'## サブ **タイトル** <br> [リンク](https://example.com/sub)',
				'',
				'[本文のリンク](https://example.com/body) と [ページ内](#3)',
				''
			].join('\n')
		);
		try {
			const { deck } = await parseDeck(loadWorkspace(wsRoot), '2026/2026-01-04-inline', {
				resolveAsset
			});
			expect(deck).toMatchObject({
				title: 'archify\nの紹介',
				titleHtml:
					'<a href="https://example.com/archify" target="_blank" rel="noopener noreferrer">archify</a>\nの紹介',
				event: 'はんなり LT #1',
				eventHtml: 'はんなり LT <strong>#1</strong>'
			});
			// 「1. 」で始まっても箇条書きにせず、行頭の HTML も段落の中の HTML として読む
			expect(deck.slides[1]).toMatchObject({
				title: '1. code と HTML',
				titleHtml: '1. <code>code</code> と <a href="https://example.com">HTML</a>',
				titleAccent: '強調 & <小なり>',
				titleAccentHtml: '<em>強調</em> &#x26; &#x3C;小なり>',
				subtitle: 'サブ タイトル\nリンク',
				subtitleHtml:
					'サブ <strong>タイトル</strong> \n <a href="https://example.com/sub" target="_blank" rel="noopener noreferrer">リンク</a>'
			});
			// 外部の URL だけを別のタブで開き、ページ内のリンクと HTML の直書きはそのままにする
			expect(deck.slides[1].bodyHtml).toBe(
				'<p><a href="https://example.com/body" target="_blank" rel="noopener noreferrer">本文のリンク</a> と <a href="#3">ページ内</a></p>'
			);
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	test('current、columns、titleLines は 1 以上の整数でなければ警告する', async () => {
		const dir = path.join(wsRoot, 'decks/2026/2026-01-04-keys');
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			path.join(dir, 'slides.md'),
			'---\ntitle: 項目\ntitleLines: 1\n---\n\n---\nlayout: feature-grid\ncolumns: 3\n---\n\n---\nlayout: feature-grid\ncolumns: two\n---\n\n---\nlayout: agenda\ncurrent: 0\ntitleLines: 0\n---\n'
		);
		try {
			const { deck, diagnostics } = await parseDeck(loadWorkspace(wsRoot), '2026/2026-01-04-keys', {
				resolveAsset
			});
			expect(diagnostics.map((d) => d.message)).toEqual([
				'columns は 1 以上の整数で指定してください',
				'current は 1 以上の整数で指定してください',
				'titleLines は 1 以上の整数で指定してください'
			]);
			// 正しくない titleLines は使わず、レイアウトの既定の行数に任せる
			expect(deck.slides.map((s) => s.titleLines)).toEqual([1, null, null, null]);
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	test('レイアウトが描かない画像や図は警告する（#3）', async () => {
		const dir = path.join(wsRoot, 'decks/2026/2026-01-05-visuals');
		fs.mkdirSync(dir, { recursive: true });
		fs.copyFileSync(
			path.join(wsRoot, 'decks/2026/2026-01-01-basic/diagrams/overview.html'),
			path.join(dir, 'figure.html')
		);
		fs.writeFileSync(
			path.join(dir, 'slides.md'),
			[
				'---',
				'title: 画像',
				'---',
				'',
				'---',
				'layout: two-cols',
				'---',
				'',
				'![](pattern:wave)',
				'![](pattern:rise)',
				'',
				'::right::',
				'',
				'右',
				'',
				'---',
				'layout: center',
				'---',
				'',
				'![](pattern:wave)',
				'',
				'---',
				'layout: image-left',
				'---',
				'',
				'![](pattern:wave)',
				'![](./figure.html)',
				''
			].join('\n')
		);
		try {
			const { diagnostics } = await parseDeck(loadWorkspace(wsRoot), '2026/2026-01-05-visuals', {
				resolveAsset
			});
			expect(diagnostics.map((d) => [d.line, d.message])).toEqual([
				[16, 'center レイアウトは画像を描きません'],
				[22, 'image-left レイアウトは archify の図を描きません']
			]);
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	test('画像のタイトルをキャプションとして読む（#7）', async () => {
		const dir = path.join(wsRoot, 'decks/2026/2026-01-06-caption');
		fs.mkdirSync(dir, { recursive: true });
		fs.copyFileSync(
			path.join(wsRoot, 'decks/2026/2026-01-01-basic/diagrams/overview.html'),
			path.join(dir, 'figure.html')
		);
		fs.writeFileSync(
			path.join(dir, 'slides.md'),
			[
				'---',
				'title: キャプション',
				'---',
				'',
				'---',
				'layout: two-cols',
				'---',
				'',
				'![模様](pattern:wave "模様の説明")',
				'![図](./figure.html "図の出典")',
				'',
				'::right::',
				'',
				'![写真](https://example.com/a.png "右の段の説明")',
				''
			].join('\n')
		);
		try {
			const { deck } = await parseDeck(loadWorkspace(wsRoot), '2026/2026-01-06-caption', {
				resolveAsset
			});
			const slide = deck.slides[1];
			expect(slide.images).toEqual([
				{ src: '', alt: '模様', pattern: 'wave', caption: '模様の説明' }
			]);
			expect(slide.figures[0].caption).toBe('図の出典');
			expect(slide.slots.right).toContain(
				'<span class="kz-figure"><img src="https://example.com/a.png" alt="写真"><span class="kz-caption">右の段の説明</span></span>'
			);
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	test('不備のあるデッキは、行番号付きのエラーを返す', async () => {
		const { diagnostics } = await parseDeck(loadWorkspace(brokenRoot), '2026/bad', {
			resolveAsset
		});
		const errors = diagnostics.filter((d) => d.level === 'error').map((d) => d.message);
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringContaining('未知のレイアウト「no-such-layout」'),
				expect.stringContaining('画像 ./missing.png が見つかりません'),
				expect.stringContaining('循環しています')
			])
		);
		expect(diagnostics.find((d) => d.message.includes('no-such-layout'))?.line).toBe(5);
	});
});
