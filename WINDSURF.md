# PriceBotX 要件定義書 (v1.0)

最終更新: 2025-07-09

---

## 1. プロジェクト概要
| 項目 | 内容 |
| ---- | ---- |
| プロジェクト名 | **PriceBotX** |
| 目的 | Amazon 商品価格を定期監視し、指定価格以下になったら SNS / 通知で知らせる |
| 想定ユーザー | 物販プレイヤー / 副業ユーザー / 節約家 / ガジェット好き |

## 2. コア機能 (MVP)
1. **価格取得**: Keepa API で対象 ASIN の現在価格を取得
2. **しきい値判定**: 設定価格以下かを判定し、結果を JSON 履歴へ追記
3. **投稿文生成**: ChatGPT API で SNS 用メッセージを生成
4. **通知 / 投稿**: Zapier (または Make) 経由で X (旧 Twitter) へ投稿、または他チャネルに通知
5. **UI 管理画面**: Windsurf で履歴・商品状態を一覧表示 (限定公開、読み取り専用)

## 3. 使用技術スタック
| 機能 | サービス / 技術 |
| ---- | --------------- |
| 価格取得 | Keepa API |
| 判定・記録 | Node.js (スクリプト / Cloud Functions) |
| メッセージ生成 | ChatGPT API |
| 投稿・通知 | Zapier / Make Webhook |
| UI 表示 | Windsurf |

### ディレクトリ構成 (案)
```
PriceBotX/
├── core/              # 中核ロジック
│   ├── fetchPrice.js  # Keepa API 取得
│   └── judgePrice.js  # しきい値判定
├── tweet/
│   └── generateTweet.js  # ChatGPT 連携
├── logs/
│   ├── price-log.json   # 価格履歴
│   └── tweets.log       # 投稿ログ
├── env/
│   └── .env             # API キー (Git 除外)
├── windsurf/            # UI アプリ
└── zapier/
    └── webhookHandler.js
```

## 4. セキュリティ要件 (抜粋)
1. **API キー保護**: `.env` と Windsurf シークレット変数で管理し、Git に含めない
2. **Webhook 保護**: Zapier / Make の Webhook URL は GUID + トークン認証
3. **投稿前フィルタ**: NG ワード・URL・文字数 (140 文字) をチェック
4. **通知制御**: 同一 ASIN への通知は 1 日 1 回まで
5. **UI 制限**: 限定公開・読み取り専用、入力値は検証して XSS 対策

## 5. 実装スケジュール (初期フェーズ)
| Step | 内容 | 状態 |
| ---- | ---- | ---- |
| 1 | Keepa API で価格取得 & 判定 | ✅ 着手中 / 完了 |
| 2 | ChatGPT 連携 + Zapier 投稿 | 🔜 次に着手 |
| 3 | Windsurf UI で履歴表示 | 🧪 並行作業可 |
| 4 | テンプレ公開 / 収益化 | 🎯 将来 |

## 6. 開発原則 & プロセス
- **WINDSURF_PROJECT_RULES.md** に従い、YAGNI / DRY / KISS を遵守
- コード実装後は `SELF_REVIEW.md` のチェックリストで自己レビュー & テスト

---

> 本ドキュメントは PriceBotX の公式要件定義書 (v1.0) です。以後の変更は本ファイルを更新するか、バージョンを上げて管理します。
