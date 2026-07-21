# Card Oracle Template — Prototype 01

カード画像・文言・配色を差し替えて使える、3DオラクルカードWebシステムの試作です。

現段階では、WebGLではなくCSS 3Dを使っています。まずシャッフル、配札、反転、1枚／3枚引き、デッキ切り替え、スマートフォン表示の手触りを検証するためです。背景の油絵生成と本格的なWebGLルームは次段階に分離しています。

## 起動

```powershell
npm install
npm run dev -- --port 5173
```

ブラウザで `http://localhost:5173` を開きます。

## 現在の機能

- 専用部屋「尻ノ間」への入室演出
- マウス位置に反応する2.5D空間
- CSS 3Dによるカードの浮上・分離・合流シャッフル
- 1枚引き／3枚引き
- ジャンプカード確率
- 正位置／逆位置（デッキごとに設定可）
- 結果カードの反転とメッセージ表示
- 仮のケツオラクル12枚
- 既存キコロット6枚のサンプルデッキ
- デッキに連動した部屋テーマ変更
- `prefers-reduced-motion` 対応

## デッキの差し替え

1. `public/decks/<deck-id>/` を複製する。
2. `deck.json` のカード、文言、画像パス、挙動設定を変更する。
3. `public/decks/manifest.json` にデッキを追加する。
4. 必要なら `app/globals.css` に `.theme-<theme-name>` の変数を追加する。

詳しい項目は [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) を参照してください。

## 確認コマンド

```powershell
npm run build
npm run lint
```

## 素材について

- ケツオラクル側は家紋画像とCSS製の仮カードです。
- キコロット側は差し替え検証用として0〜5番と裏面だけを複製しています。
- 本番化するときは画像をWeb向けに軽量化し、権利表記と公開範囲を再確認します。
