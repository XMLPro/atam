# atam

### 概要

AtCoderへの提出をCLI上で行うことができるツールです。
1. ブラウザへ移動することなくAtCoderが開催している任意のコンテストへ提出することができます。
1. 現在のコードがサンプルケースに正解しているかを確認します。

![overview](https://user-images.githubusercontent.com/31335755/57605478-ab8f7200-75a1-11e9-8e97-14e2d0b54123.png)

### install方法

npmにて公開しています。

```bash
$ sudo npm install -g atam --unsafe-perm=true
```

### 使用方法

#### ログイン

まず初めにatamを利用したAtCoderへのログインが必要となります。

```bash
$ atam l
```

上記のコマンドを実行した後にユーザ名とパスワードを聞かれるのでログインをしてください、なおこの操作は初回1度のみの実行です。

#### サンプルケースをテスト

サンプルケースに正解しているかテストします。

```bash
$ atam t <コンテスト名> <コンテスト回数> <プログラム実行のコマンド> # ex) atam t abc 001 python3 main.py
```

#### 提出
submit(sに省略可能)コマンドの引数に、提出したいファイル、コンテスト名、コンテスト回数を渡します。

```bash
$ atam s <コンテスト名> <コンテスト回数> <提出したいファイル> # ex) atam s abc 001 main.py
```

提出ファイルの言語を選択してください、なおこの状態であいまい検索での言語選択が可能となっております。

言語の選択が終了したあと、提出する問題を選択する状態になります。
この状態も言語選択と同様、あいまい検索での問題検索が可能となっています。

問題の選択が終了した後、問題の提出が行われます。AtCoderのジャッジが終わり次第パソコンに通知が来ます。

![notification](https://user-images.githubusercontent.com/31335755/57605985-e0e88f80-75a2-11e9-9762-802b67c69de8.png)

なお、AtCoderサイトでの提出と同様に、空のファイルを選択した状態では提出が行われません。
