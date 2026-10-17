---
title: kazeori のご紹介
themeConfig:
  color: blue
author: 山田 太郎
event: サンプル勉強会
date: 2026-10-17
brand:
  name: Example Inc.
---

## markdown で書くカザモリスタイルのスライド

---
layout: agenda
title: Agenda
current: 1
---

## 今日の内容

1. kazeori とは
2. レイアウトの一覧
3. 図と PDF

---
src: /partials/about-me.md
---

---
layout: agenda
title: Agenda
current: 2
---

## 次の章

章の扉の前に目次を再掲するときは、current で次の章を強調します。

1. kazeori とは
2. レイアウトの一覧
3. 図と PDF

---
layout: section
title: レイアウトの
titleAccent: 一覧
---

## 組み込みのレイアウトを順に紹介します

---
title: 標準の
titleAccent: レイアウト
---

## default

- 1 枚目以外のスライドは、指定しなければこのレイアウトになります
- タイトルはフロントマターの `title` と `titleAccent` で書きます
- コードは shiki でハイライトし、Slidev と同じ書式で行を強調できます

```go {3}
func main() {
	name := "kazeori"
	fmt.Println("hello,", name)
}
```

<!--
ここは発表者のノートです。スライドにも PDF にも表示されません。
-->

---
layout: features
title: Featured List
titleAccent: Slides
---

## features

左に導入文、右に番号付きの帯で項目を並べます。

- ### Slidev の書式
  区切りやフロントマターは Slidev と同じです
- ### カザモリスタイル
  配色と装飾はテンプレートから書き起こしました
- ### PDF 出力
  `kazeori pdf` で 1 スライド 1 ページの PDF を出力します

---
layout: feature-grid
title: Featured Icon
titleAccent: Slides
---

項目をカードの格子で並べます。項目の数に応じて 2 列か 3 列になります。

- ### 書く
  markdown で内容を書きます
- ### 確かめる
  `kazeori dev` でプレビューします
- ### 検査する
  `kazeori check` で不備を見つけます
- ### 出力する
  `kazeori pdf` で PDF にします
- ### 共有する
  `kazeori build` で静的サイトにします
- ### 使い回す
  共通スライドを `src` で読み込みます

---
layout: two-cols
title: 2 段組み
---

左の段です。

- Slidev の two-cols と同じく `::right::` で区切ります

::right::

右の段です。

| 項目 | 値 |
| --- | --- |
| 段数 | 2 |
| 区切り | `::right::` |

---
layout: image-left
image: pattern:fractal-clockwise
title: Featured Picture
titleAccent: Slides
---

## image-left

画像を左に、本文を右に置きます。
画像はフロントマターの `image` で指定します。

- 本文中の画像だけの段落も使えます
- 写真の枠は、画像がなければ accent 色で埋めます

---
layout: image-right
image: pattern:fractal-counter-bl
title: Featured Picture
titleAccent: Slides
---

## image-right

画像を右に、本文を左に置きます。

---
layout: three-images
title: Three Picture
titleAccent: Slides
---

## three-images

画像 3 枚と、それぞれの説明を並べます。

![](pattern:fractal-fixed)
![](pattern:fractal-inward-bl)
![](pattern:fractal-outward)

- ### Feature 01
  1 枚目の画像の説明
- ### Feature 02
  2 枚目の画像の説明
- ### Feature 03
  3 枚目の画像の説明

---
layout: gallery
title: Gallery
titleAccent: Images
---

## gallery

画像を格子に並べます。足りないマスは accent 色で埋めます。

![](pattern:fractal-clockwise-tl)
![](pattern:fractal-inward)
![](pattern:fractal-mirror-tr)
![](pattern:fractal-outward-bl)
![](pattern:fractal-counter)

---
layout: quote
title: Quotation
titleAccent: Slides
image: pattern:fractal-inward
---

> 内容は markdown で管理し、見た目はレイアウトに任せる。

## 進捗

「ラベル 75%」の形の箇条書きは進捗バーになります。

- 設計 100%
- 実装 75%
- ドキュメント 40%

---
layout: fact
title: '24'
titleAccent: 種類
---

## 組み込みのレイアウト

- ### 7
  発表で多用する第 1 群
- ### 17
  テンプレート由来と Slidev 互換

---
layout: team
title: Our
titleAccent: Team
---

- ![](pattern:fractal-fixed)
  ### 山田 太郎
  代表

  設計と実装を担当
- ![](pattern:fractal-clockwise-bl)
  ### 佐藤 花子
  デザイナー

  配色と装飾を担当
- ![](pattern:fractal-inward)
  ### 鈴木 一郎
  エンジニア

  PDF 出力を担当
- ![](pattern:fractal-counter-tl)
  ### 高橋 さくら
  エンジニア

  ドキュメントを担当

---
layout: process
title: Process
titleAccent: Infographic
---

- ### 書く
  slides.md に内容を書く
- ### 確かめる
  dev server でプレビューする
- ### 検査する
  check で不備を見つける
- ### 出力する
  pdf で PDF にする
- ### 共有する
  build で静的サイトにする

---
layout: timeline
title: Timeline
titleAccent: Infographic
---

- ### 2026年4月
  **構想**
  markdown で書けるようにしたい
- ### 2026年7月
  **設計**
  Slidev の書式に合わせる
- ### 2026年10月
  **実装**
  カザモリスタイルを再現
- ### 2027年1月
  **運用**
  社内外の発表で使う

---
layout: center
title: 中央にそろえる
---

Slidev の `center` と `statement` はこのレイアウトで描きます。

---
layout: image
image: pattern:fractal-inward
title: 全面の画像
---

## Slidev の image と同じです

---
layout: agenda
title: Agenda
current: 3
---

## 次の章

1. kazeori とは
2. レイアウトの一覧
3. 図と PDF

---
layout: section
title: 図と
titleAccent: PDF
---

## 構成図の埋め込みと PDF の出力

---
layout: diagram
title: archify の図
---

![データの流れ](./diagrams/dataflow/dataflow.html)

archify スキルで描いた図を、画像と同じ記法で埋め込みます。

---
title: PDF の
titleAccent: 出力
---

## kazeori pdf

- `kazeori pdf --deck <名前>` で、1 スライドを 1 ページにした PDF を出力します
- 出力の前にデッキを検査し、エラーがあれば出力しません
- スライドの枠から文字がはみ出していれば警告します（`--strict` でエラーにします）

```sh
bunx kazeori pdf --deck sample
bunx kazeori pdf --year 2026
```

---
layout: references
---

1. [Slidev](https://sli.dev/)
2. [SvelteKit](https://svelte.dev/docs/kit)
3. [archify](https://github.com/tt-a1i/archify)

---
layout: end
---
