# AGENTS.md

このリポジトリで作業するエージェント向けの手引きです。
利用者向けの説明は README.md にあります。

## kazeori とは

kazeori（風織り）は、カザモリスタイルのスライドを Slidev 互換の markdown から生成するツールです。
SvelteKit 3（Svelte 5）で描画し、bun で動かします。
特定の会社に依存しないツールとして作っており、ロゴ、社名、copyright 表記は利用者が workspace の `kazeori.yaml` から渡します。

構成は `docs/architecture/` の図と README の「構成」の節を参照してください。

## ディレクトリ

| 場所 | 内容 |
| --- | --- |
| `cli/` | `kazeori` コマンド（dev、build、pdf、check、list、new、templates） |
| `src/lib/parser/` | slides.md を Deck に変換するパーサ（split、sources、slide、images、markdown、keys） |
| `src/lib/workspace/` | workspace の探索と設定の読み込み（config）、デッキの読み込み（decks）、Vite プラグイン（vite-plugin） |
| `src/lib/layouts/` | 組み込みレイアウト。ファイル名がレイアウト名になる |
| `src/lib/components/` | レイアウトが使う部品（SlideHeader、SideColumn、SlideTitle、Picture、Pattern など） |
| `src/lib/patterns.ts` | `pattern:<名前>` の模様（波の模様とフラクタルの模様） |
| `src/lib/themes/base.css` | 配色（blue / green）と本文の書式 |
| `src/lib/index.ts` | 独自レイアウト向けの公開 API |
| `src/routes/` | デッキ一覧、発表ビュー、印刷ビュー |
| `examples/` | ロゴのないサンプル workspace。全レイアウトを使うサンプルデッキがある |
| `templates/` | kazeori に同梱するデッキの雛形 |
| `test/` | `bun test` の単体テストとフィクスチャ |
| `docs/architecture/` | archify で作った構成図（定義、HTML、PNG） |

## コマンド

```sh
bun install
bun run dev          # examples/ の workspace で dev server を起動する
bun test             # 単体テスト
bun run check        # 型検査（svelte-check）
bun run lint         # prettier と eslint
bun run kazeori pdf --deck sample   # サンプルデッキの PDF を examples/dist/ に出力する
```

## 守ること

- **会社固有の値を書かない**：コードや同梱のファイルに、特定の会社のロゴのファイル、社名、copyright 表記を書かない。値はすべてブランド設定から受け取る。「カザモリスタイル」というスタイル名は使ってよい。
- **Slidev の書式に合わせる**：markdown の書式は、kazeori の機能と競合しない限り Slidev に合わせる。kazeori 独自の項目は、Slidev で開いたときに無視されるものにする。
- **配色は CSS 変数で塗る**：色を直接書かず、`--kz-accent1` から `--kz-accent6` などの変数を使う。blue と green の両方で見た目を確かめる。
- **四角を基調にする**：装飾、写真枠、強調の印は正方形や長方形で表す。三角などの形は使わない。
- **乱数を使わない**：模様やレイアウトの見た目は、同じ入力なら常に同じになるようにする。
- **日本語で書く**：README、コメント、CLI のメッセージは日本語で書く。コードの識別子は英語にする。

## Svelte のコード

`.claude/skills/` にある sveltejs/ai-tools のスキル（`svelte-core-bestpractices`、`svelte-code-writer`）に従います。

- Svelte 5 の runes を使う（`$state`、`$derived`、`$props`）。`$effect` より `$derived` を優先し、DOM の操作は `{@attach}` で行う。
- `class` は配列とオブジェクトの形で書き、`class:` ディレクティブは使わない。
- `.svelte` を書いたり直したりしたら、`bunx @sveltejs/mcp svelte-autofixer <file> --svelte-version 5` で検証する。markdown を描く `Html.svelte` の `{@html}` への警告は意図したものなので残す。
- SvelteKit 3 では `$lib` が廃止されているので、`#lib/...`（`package.json` の `imports`）を使う。設定は `vite.config.ts` の `sveltekit({...})` で渡す。

## レイアウトの追加と変更

- 組み込みレイアウトを足したら、`src/lib/parser/keys.ts` の `builtinLayouts` に名前を加える。
- 上部の見出しには `SlideHeader`、左右の段には `SideColumn` を使い、位置と大きさをほかのレイアウトとそろえる。
- 枠の装飾（四隅の正方形、ページ番号、フッター）を描かないレイアウトは、`<script module>` で `export const chrome = 'none'` を書き出す。
- 文字がはみ出しうる領域には `.kz-fit` を付ける。dev server と `kazeori pdf` がはみ出しを検出する。
- `transform` で位置を合わせない。PDF の印刷で位置がずれる。

## 変更後の確かめ方

1. `bun test`、`bun run check`、`bun run lint` が通ることを確かめる。
2. 見た目に関わる変更では、`bun run kazeori pdf --deck sample` で PDF を出し、`pdftoppm` などで画像にして、変更前の画像と見比べる。サンプルデッキの配色を green にしたものでも確かめる（`slides.md` は書き換えず、workspace を一時的な場所に複製して試す）。
3. 書式やレイアウトを変えたら、`examples/` のサンプルデッキと README を合わせて直す。
4. 構成を変えたら、archify スキルで `docs/architecture/*/candidate.json` を直して図を作り直し、`bun run diagrams:png` で PNG を書き出し直す。

## 関係するリポジトリ

kazamori のデッキ、ロゴ、デザインの原本（pptx）は、非公開の decks リポジトリにあります。
このリポジトリには、ロゴや pptx を持ち込まないでください。
