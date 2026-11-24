# Daily Tarot — Discord占いボット

Discordで引けるタロット占いボット。カードデータは既存のタロット辞典サイト（日英）の78枚をそのまま再利用。

## コマンド
- `/tarot [language]` — 今日の1枚。ユーザーごとに日替わり（UTC 0時リセット）、1日中同じカード
- `/draw [language]` — いつでも引けるランダム1枚
- language は English（デフォルト）/ 日本語

表示内容：カード名・正位置／逆位置・キーワード・意味（抜粋）・アドバイス・辞典ページへのリンク。

## 必要なもの
1. Altareアカウント（無料枠でボットを常駐させる）
2. Discordボットのトークン（Discord Developer Portalで発行）

## Discord側の準備（ユーザーのDiscordアカウントで実施）
1. https://discord.com/developers/applications を開く
2. 「New Application」→ 名前（例：Daily Tarot）→ Create
3. 左メニュー「Bot」→「Reset Token」でトークンを発行し、安全な場所に控える（チャットに貼らない）
4. 「OAuth2 → URL Generator」で scope に `bot` と `applications.commands` を選び、権限は「Send Messages」「Embed Links」だけでURLを生成
5. そのURLを開いて、ボットを入れたいサーバー（自分のテストサーバーでOK）を選んで承認

## Altare側のデプロイ
1. Altareでサーバーを1台作成（Node.jsテンプレート、無料枠から割り当て）
2. このフォルダ一式をアップロード（node_modules は除く）
3. 環境変数 `DISCORD_TOKEN` にボットのトークンを設定
4. 起動コマンド `npm install && npm start` で起動
5. コンソールログに「Logged in as ...」「Slash commands registered.」が出れば稼働中

## ローカル確認
- `node test.js` — 抽選ロジックのテスト（Discord接続なし）
- `npm start` — .env にトークンを入れればそのまま起動する

## 注意
- トークンは秘密情報。漏れたらDeveloper Portalで即リセットする
- 無料枠は稼働率保証なし。落ちたらAltareコンソールから再起動する
