# PriceBotX

Amazon 価格監視ボット（MVP）

## 1. 概要
Amazon の指定 ASIN を Keepa API で定期取得し、設定価格を下回ったら通知（将来は X / Discord などへ投稿）するボットです。

- 価格取得: `core/fetchPrice.js`
- しきい値判定: `core/judgePrice.js`
- 履歴保存: `logs/price-log.json`
- 環境変数: `env/.env`

## 2. セットアップ
```bash
# 依存インストール
npm install

# 環境変数
cp env/.env.example env/.env         # Windows PowerShell: copy env/.env.example env/.env
# .env を編集して以下を入力
# KEEPA_API_KEY=...
# OPENAI_API_KEY=...
# ASIN=...
# PRICE_THRESHOLD=10000
```

## 3. 使い方
```bash
npm run fetch   # 最新価格を取得し logs/price-log.json に追記
npm run judge   # 直近価格と PRICE_THRESHOLD を比較して判定
```

- `PRICE_DROP_TRIGGER:` が出力されれば通知条件クリア（今後 Webhook を呼び出す予定）。
- `NO_TRIGGER:` はしきい値を超過し通知不要。

## 4. ディレクトリ構成
```
PriceBotX/
├── core/              # 中核ロジック
│   ├── fetchPrice.js  # Keepa API 取得
│   └── judgePrice.js  # しきい値判定
├── env/               # API キーなど（Git 除外）
│   ├── .env           # 実キー
│   └── .env.example   # 雛形
├── logs/              # ログ・履歴
│   └── price-log.json
├── windsurf/          # UI アプリ（未実装）
├── zapier/            # Webhook ハンドラ（未実装）
├── WINDSURF.md        # 要件定義書
└── README.md          # 本ファイル
```

## 5. 今後のロードマップ
1. ChatGPT API を用いた投稿文生成 (`tweet/generateTweet.js` 予定)
2. Zapier Webhook で X へ投稿 / 通知
3. Windsurf UI で履歴の可視化
4. 複数 ASIN 管理・通知制御の拡張

---
開発原則: YAGNI / DRY / KISS を遵守し、SELF_REVIEW.md のチェックリストで自己レビューします。
