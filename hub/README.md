# hub — 公式LINE・最新アプリへの誘導（相互送客）

各アプリは `https://itoshiyou.github.io/hub/promo.json` を読み、表示内容を決めます。
**LINE の URL や推しアプリを変えるときは、この JSON を直して push するだけ**です（アプリ更新・再審査は不要）。
アプリは前回取得した JSON をキャッシュし、通信できないときはそれ（無ければアプリ同梱の既定値）を使います。

## promo.json

| キー | 意味 |
|---|---|
| `enabled` | `false` で全アプリの誘導を一斉に止める |
| `line_url` | 公式LINEの友だち追加URL（`https://lin.ee/...`）。空なら LINE 部分は非表示 |
| `line_url_by_app` | アプリ別の友だち追加URL（流入経路を分けたいとき）。例 `{"untangle": "https://lin.ee/xxx"}` |
| `line_copy` | LINE の説明文 |
| `apps` | 推しアプリ（新しい順）。各アプリは「自分以外で先頭のもの」を出す |
| `apps[].id` | アプリID（`untangle` / `stack_tower` / `odd_one` / `english_lesson` …） |
| `apps[].url` | 飛び先。App Store の URL なら `ct=<元アプリID>`、それ以外は `utm_source=<元アプリID>` が自動で付く |
| `apps[].icon` | 正方形アイコン（`hub/icons/` に置く。256px 程度） |
| `launch_notice.every` | 起動時通知を何回に1回出すか（`0` で起動時通知だけ止める） |
| `launch_notice.skip_first` | 最初の何回の起動では出さないか |
| `launch_notice.seconds` | 通知が自動で消えるまでの秒数 |

## 表示ルール（全アプリ共通）

1. **設定画面に常設**: 公式LINE・最新アプリの項目を置く
2. **リザルト画面**: ボタンの下に控えめな1行
3. **起動時の通知**: 画面上部から帯が下りてくる（モーダルにしない・×で閉じられる・数秒で自動で消える）。3回に1回、初回起動では出さない。LINE と最新アプリを交互に出す
4. **出さない場面**: プレイ中、撮影モード中
5. **自分自身は推さない**（`apps` から自分の id を除外）
6. **報酬を付けない**: 「友だち追加でアイテム」などは App Store 審査で問題になりやすいので禁止
7. 見た目は各アプリの画面デザインに合わせる（審査ガイドライン 4.3 対策。部品を共通化しない）

## 導入済み

| アプリ | id | 実装 |
|---|---|---|
| ほどけライン | `untangle` | puzzle-apps/untangle `lib/services/promo.dart` |
| ぴったりタワー | `stack_tower` | puzzle-apps/stack_tower `lib/services/promo.dart` |
| ひとつだけちがう | `odd_one` | puzzle-apps/odd_one `lib/services/promo.dart` |

App Store で公開されたら、`apps` にそのアプリを App Store の URL で追加すると、ほかのアプリから誘導されるようになります。
