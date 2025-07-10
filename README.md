# PriceBotX

Amazon 価格監視ボット（MVP）

## 1. 概要
Amazon の指定 ASIN を Keepa API で定期取得し、設定価格を下回ったら通知（将来は X / Discord などへ投稿）するボットです。

- メイン実行: `core/main.js`
- 価格取得サービス: `services/keepaService.js`
- ログ管理サービス: `services/logService.js`
- 判定 & 通知サービス: `services/judgeService.js`
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
# ZAPIER_WEBHOOK_URL=
# DISCORD_WEBHOOK_URL=
# SLACK_WEBHOOK_URL=
# LINE_NOTIFY_TOKEN=
# OPENAI_API_KEY=...
```

## 3. 使い方
```bash
# 取得→判定→通知までワンコマンド
npm run runAll

# ユニットテストを実行（Jest）
npm test
```

### asin-list.json サンプル
```jsonc
[
  {
    "asin": "B09H1TPSFT",
    "title": "製品タイトル",
    "通知条件価格": 1500 // 価格がこの金額以下になったら通知します
  }
]
```

- `PRICE_DROP_TRIGGER:` が出力されれば通知条件クリア（Webhook 送信）。
- `NO_TRIGGER:` はしきい値を超過し通知不要。

### npm スクリプト一覧
| コマンド | 目的 |
| -------- | ---- |
| `npm run runAll` | ASIN リストをループし、価格取得→ログ→判定→マルチチャネル通知 |
| `npm test` | Jest でユニットテスト実行 |
| `npm run tweet` | OpenAI でツイート文生成（任意） |

## 4. ディレクトリ構成
```
PriceBotX/
├── core/              # 中核ロジック
│   └── main.js        # 実行エントリ（ループ制御）
├── services/          # ビジネスロジック層
│   ├── keepaService.js  # Keepa API 取得
│   ├── logService.js    # ログ管理
│   └── judgeService.js  # 判定 & 通知
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
2. マルチチャネル Webhook で通知（Zapier / Discord / Slack / LINE）
3. Windsurf UI で履歴の可視化
4. 複数 ASIN 管理・通知制御の拡張

---
開発原則: YAGNI / DRY / KISS を遵守し、SELF_REVIEW.md のチェックリストで自己レビューします。
