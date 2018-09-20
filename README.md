# atam

### デバッグ用atamのinstall

現在のディレクトリのatamを実行できるようにする。

```shell
# atam/の直下で実行する
/atam $ sudo npm install -g .
```

上記のコマンドを実行することで現在のソースコードのatamを実行することができる、

現段階ではコマンドに3の引数を与えることによりそれぞれの引数をfilename,number,probとして出力する。

```shell
$ atam <filename> <number> <prob>
$ filename: <filename>
  number: <number>
  prob: <prob>
```
