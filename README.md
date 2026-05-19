# プレミアム・パーソナルダイアリー (Premium Personal Diary)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/ja/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/ja/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/ja/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

直感的で美しいカレンダーUIを備えた、**完全スタンドアロン型（サーバーレス）**の個人向けメモ・日報ログツールです。

---

## ✨ 特徴と強力なプライバシー保護

本アプリケーションは、入力されたメモデータを外部のサーバーへ送信したり、データベースに保存したりすることは一切ありません。

- **🔒 100%のプライバシー安全性**
  データはすべてユーザー自身のブラウザ内（`localStorage`）にのみ暗号のように隔離保存されます。そのため、**このリポジトリをそのまま GitHub Pages などで一般公開しても、あなたのメモが他人に共有されたり見られたりする心配は絶対にありません。**
- **📅 カレンダー連動タイムライン**
  日付をタップするだけで、その日に記録されたメモが「何時何分」のタイムスタンプ付きでタイムライン出力されます。
- **🎯 メモのある日が一目でわかる**
  メモが保存されている日付の下には自動的にインジケーター（ドット）が点灯します。
- **⌨️ 爆速コーディング/執筆体験**
  `Ctrl + Enter` (Macは `Cmd + Enter`) のショートカットキーで、マウスに触れることなくメモをメモリに即時コミットできます。
- **💾 安全なデータポータビリティ**
  ブラウザのキャッシュ削除に備え、ワンクリックで全データをJSONファイルとしてローカルにバックアップ（エクスポート）可能です。

---

## 🛠️ 技術スタック

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
- **Styling:** Tailwind CSS (CDN版), Font Awesome 6.4.0 (アイコン)
- **Fonts:** Plus Jakarta Sans, Noto Sans JP

---

## 🚀 使い方（インストール不要）

本アプリはサーバー不要で動作します。

### ローカルで動かす場合
1. このリポジトリをクローンまたはZIPダウンロードします。
2. フォルダ内の `index.html` をダブルクリックしてブラウザで開くだけで、すぐに利用可能です。

### GitHub Pagesで自分専用のWebサイトにする場合
1. あなたのGitHubアカウントにこのコードをプッシュします。
2. リポジトリの **Settings** > **Pages** に移動します。
3. Build and deployment の Source で `Deploy from a branch` を選択し、`main`（または `master`）ブランチを選択して **Save** します。
4. 数分後、発行されたURLにアクセスすれば、いつでもどこからでも自分専用の安全な日記帳にアクセスできます（データはアクセスした端末のブラウザに保存されます）。

---

## 📂 ファイル構成

```text
├── index.html   # アプリケーションの骨組み・UI構造
├── style.css    # アニメーション、カスタムフォント、スクロールバー等の装飾
├── script.js    # カレンダー生成、ローカルストレージ制御、データエクスポートのコアロジック
└── README.md    # 本ドキュメント
