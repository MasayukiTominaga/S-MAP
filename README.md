# S-MAP
オープン地図を管理

## Webアプリ（OpenStreetMapビューア）

`webapp/` 配下に、OpenStreetMapのタイルを表示し、ユーザー情報（座標・住所・名称）レイヤーの表示/非表示を切り替えられる静的Webアプリがあります。

### 使い方

1. `webapp/index.html` をブラウザで直接開く、もしくは簡易サーバーで配信します。
   ```bash
   cd webapp
   python3 -m http.server 8000
   ```
   ブラウザで `http://localhost:8000` を開きます。
2. 左サイドバーの「ユーザー情報レイヤーを表示」チェックボックスでプロットの表示/非表示を切り替えられます。
3. 「Geocodeツール」で名称・住所を入力すると、[Nominatim](https://nominatim.openstreetmap.org/)（OpenStreetMapのジオコーディングAPI）で住所から緯度・経度を検索し、地図上にプロットを自動登録します。Nominatimで見つからない場合は[国土地理院（GSI）の住所検索API](https://msearch.gsi.go.jp/address-search/AddressSearch)に自動でフォールバックします（会社名付きの住所や郵便番号は自動で除去して検索します）。
4. 登録したプロットはブラウザの `localStorage` に保存されます。「サンプルデータに戻す」で初期データ（`webapp/data/points.json`）にリセットできます。

### 注意事項

- Nominatimは個人利用・低頻度アクセスを前提とした無料APIです。大量・高頻度の検索は[利用ポリシー](https://operations.osmfoundation.org/policies/nominatim/)に反するため避けてください。
- 自分のPCで使う場合は、`webapp/` フォルダを `C:\Users\m-tomina\Desktop\OpenStreetMap` などにクローン・コピーしてご利用ください。
