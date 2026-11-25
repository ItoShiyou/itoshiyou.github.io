# hub — THE Bonjin 公式LINE・アプリ相互送客

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
7. 見た目は各アプリの画面デザインに合わせる（審査ガイドライン 4.3 対策。仕組みは共通部品でよいが、色・書体・置き方はアプリごとのテーマや既存の部品に揃える）

## THE Bonjin 公式LINE（thebonjin.project / @629zrowt）
- アカウント名「THE Bonjin」、プロフィール画像はロゴ（`icons/thebonjin_logo.png`）、ステータス「作る力を社会の力に。」
- あいさつメッセージ: 自己紹介＋アプリ一覧リンク
- 応答メッセージ: 一律応答（受け付けました＋キーワード案内）／キーワード「アプリ・ゲーム・アプリ一覧」「新作・新しいアプリ」「サイト・Webサイト・ホームページ」「依頼・相談・お問い合わせ」
- リッチメニュー: アプリ一覧／新作をあそぶ／Webサイト（画像 `line/richmenu.jpg`、元 `line/menu.html`）
- 新作を出したら: `promo.json` の `apps` 先頭に追加 → リッチメニューBと「新作」返信のURLも差し替える
- ビジネスプロフィール: お知らせ「THE Bonjin 公式LINEをはじめました」、Webサイト（bonjin.gitpullpull.me）、Instagram（thebonjin_official）を掲載・公開済み
- 友だち追加の入口: アプリ（promo.json）／THE Bonjin サイトのフッター（PR #2）／Instagram のリンク欄（lin.ee/vhoCKJj → @629zrowt）／QRコード `line/line_qr.png`（ストーリー・チラシ用）

### 最新情報を配るとき（運用）
1. LINE Official Account Manager →「メッセージを作成」で配信（新作公開・大型アップデート・イベントなど。月数回までが目安）
2. 同じ内容をビジネスプロフィールの「お知らせ」にも追加（友だち以外も見られる）
3. 新作なら上の「新作を出したら」の3点（promo.json・リッチメニューB・「新作」返信）を更新
4. Instagram の投稿・ストーリーで告知し、QRコードかリンク欄から公式LINEへ

## 相互送客のしくみ
`apps` に並ぶアプリを、各アプリが起動のたびに順番に1つおすすめする（自分は除く）。設定画面には「THE Bonjin 公式LINE」「おすすめ」「THE Bonjin のアプリ一覧（all_apps_url）」が並ぶ。

## 共通部品

| 種類 | ファイル | 入れ方 |
|---|---|---|
| Flutter | `flutter/promo.dart` `flutter/promo_widgets.dart` | `hub/flutter/install.sh <アプリのフォルダ> <id>` で `lib/promo/` にコピー（依存とテストも追加）。`main` で `Promo.init('<id>')`、`MaterialApp(builder: (_, c) => LaunchNotice(child: c!))`、設定に `PromoPanel()`、リザルトに `PromoStrip()`。起動時に広告の同意/ATT を出すアプリは `Promo.init('<id>', waitForReady: true)` にして、同意のあと `Promo.markReady()` |
| Web | `promo.js` | `<script src="https://itoshiyou.github.io/hub/promo.js" data-app="<id>" defer></script>`。設定などに `<div data-ito-promo></div>` を置くとリンクが入る |
| ストアに出す Web アプリ（Capacitor など） | `promo.js` のコピー | 外部のコードを読み込まないよう、アプリに同梱して同じタグを付ける。起動時に同意ダイアログがあるなら `data-wait="ready"` を付け、同意のあと `ItoPromo.ready()` |

Flutter 部品は、アプリのテーマの色と書体をそのまま使う。日本語以外の表示があるアプリでは、日本語のときだけ出す。

## 導入済み

| アプリ | id | 場所 | 置いたところ |
|---|---|---|---|
| ほどけライン | `untangle` | puzzle-apps/untangle | 設定・リザルト・起動時 |
| ぴったりタワー | `stack_tower` | puzzle-apps/stack_tower | 設定・リザルト・起動時 |
| ひとつだけちがう | `odd_one` | puzzle-apps/odd_one | 設定・リザルト・起動時 |
| ひびあかり | `hibiakari` | chill_game/hibiakari | 設定・完成画面・起動時 |
| ハンダン | `handangaku` | handangaku | 設定・起動時（同意のあと） |
| ふたりの糸 | `futari_no_ito` | futari-no-ito | あそびかた・クリア画面・起動時 |
| 思い出百貨店 | `omoide_hyakkaten` | omoide_hyakkaten | 設定・起動時（同意のあと・日本語のみ） |
| 雪だるま帰り道 | `snowman_way_home` | snowman-way-home | 設定・起動時（同意のあと・日本語のみ） |
| 宮大アプリ | `miyadai_app` | 宮大アプリver2 | 設定・起動時 |
| Mimi English | `english_lesson` | english_lesson | 設定・起動時（同意のあと。自分自身は推さないので LINE のみ） |
| ドパガキ | `dopagaki` | ドパガキシリーズ | 起動時（Web） |
| ひとひねりゲーム集 | `hitohineri_games` | hitohineri_games | 一覧ページ・起動時（Web） |
| komorebi | `komorebi` | yo-kai/komorebi.html | 起動時（Web） |
| つみあげ出前 | `tsumiage_demae` | mobile-local-games/apps/tsumiage_demae | 設定・起動時（日本語のみ） |
| ふすま渡り | `fusuma_watari` | mobile-local-games/apps/fusuma_watari | 設定・起動時（日本語のみ） |
| だし回し | `dashi_mawashi` | mobile-local-games/apps/dashi_mawashi | 設定・起動時（日本語のみ） |
| 灯台守の日誌 | `lighthouse_log` | lighthouse_log | タイトル画面・起動時 |
| けもの道 | `kemonomichi` | kemonomichi | 起動時 |
| moonlit bells | `moonlit_bells` | Codex/2026-11-09/moonlit-bells | 起動時 |
| snowball path | `snowball_path` | Codex/2026-11-09/snowball-path | 起動時 |
| インビジブルワールド | `invisibleworld` | invisibleworld | 起動時（Web） |
| The Taling | `the_taling` | the_talingver2 | 起動時（Web） |
| THE Bonjin 脱出ゲーム | `bonjin_escape` | bonjin-escape | 設定・ゲーム選択・起動時（同梱） |
| 非公式宮大アプリ | `unofficial_miyazaki_univ_app` | unofficial_miyazaki_univ_app | マイページ・起動時（Web） |
| HINATA LOOP | `hinata_loop` | manus/app/0825/hinata-loop | 起動時（Web） |
| THE Bonjin サイト | — | ~/Claude/bonjin/bonjin | フッター LINKS に公式LINE |

### 入れていないもの
- **作業中の変更が多く、入れると衝突するもの**（その作業がコミットされてから入れる）: stained-light、encounter-diary、focus_wave
- **公開版のソースが特定できないもの**: ロウソク行脚（candle-walk。おすすめされる側には入っている）
- **古い版**: the_taling の Flutter 版（後継の the_talingver2 に入れた）

App Store で公開されたら、`apps` にそのアプリを App Store の URL で追加すると、ほかのアプリから誘導されるようになる。
