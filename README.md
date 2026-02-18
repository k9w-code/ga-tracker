# Grand Archive Tracker

Grand Archive TCG の対戦記録と統計を管理するためのプログレッシブウェブアプリ（PWA）です。
清潔感のある明るいデザインと、対戦をサポートする便利な機能を備えています。

## 主な機能

- **対戦記録の管理**: デッキごとの勝敗、対戦相手のヒーロー、先攻・後攻などを記録。
- **統計分析**: 勝率、対戦数などのデータを自動的に集計。
- **プレイ支援 (Play)**: 
    - ライフカウンター（0からカウントアップ方式）
    - 3種の独立タイマー（5分 / 30分 / 60分）
- **デッキ連携**: 「Shout At Your Decks」のURLを登録し、ワンタップでアクセス可能。
- **PWA対応**: モバイル端末のホーム画面に追加してアプリのように利用可能。

## デプロイ方法

このプロジェクトは Vercel と Supabase を使用して公開することを想定しています。

### 1. Supabase の準備

1. [Supabase](https://supabase.com/) で新しいプロジェクトを作成します。
2. テーブル（`decks`, `matches`, `tournaments` 等）を作成します。
3. `Project Settings` > `API` から `URL` と `anon key` を取得します。

### 2. Vercel へのデプロイ

1. このリポジトリを GitHub にプッシュします。
2. Vercel で `New Project` を作成し、GitHub リポジトリを選択します。
3. `Environment Variables` に以下を設定します：
    - `VITE_SUPABASE_URL`: 取得した Supabase の URL
    - `VITE_SUPABASE_ANON_KEY`: 取得した Supabase の Anon Key
4. デプロイを実行します。

## 開発用セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```
