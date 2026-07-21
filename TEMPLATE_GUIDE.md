# テンプレート構造

システムを「演出エンジン」「デッキデータ」「テーマ」に分けています。

| 層 | 場所 | 差し替えるもの |
| --- | --- | --- |
| 共通演出 | `app/oracle-room.tsx` | シャッフル、配札、反転、結果表示 |
| デッキ一覧 | `public/decks/manifest.json` | 選択肢と初期デッキ |
| デッキ本体 | `public/decks/<id>/deck.json` | カード、言葉、確率、画像 |
| テーマ | `app/globals.css` | 部屋の色、光、カード装飾 |
| 画像 | `public/decks/<id>/` | 表面、裏面、紋章 |

## `deck.json` の主な設定

- `theme`: CSSテーマ名。現在は `ketsu` と `kikorot`。
- `backImage`: カード裏面に使う画像。
- `jumpChance`: 0〜1。`0.18` は18%を表す。
- `allowReversed`: 逆位置を使うか。
- `cards`: カード本文。
- `cards[].image`: 指定した場合は画像カード。省略時はCSS仮カード。
- `cards[].palette`: CSS仮カードの色名。

## 次段階で分離する予定の設定

- シャッフル時間と軌道
- 部屋プリセット（和風神域、森、星空など）
- BGM／効果音と音量
- スプレッド定義
- シェア画像生成
- WebGL品質と軽量モード

この試作で操作感を確定したあと、これらを `experience.json` と `room.json` に移すと、コードを触らずに案件ごとのサイトを組めるようになります。
