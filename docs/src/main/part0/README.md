# CDK for Terraformの初期化
## 概要
CDK for Terraformを使用できるように設定を行います。
設定は、下記公式を参照しています。<br>
[CDK for Terraform: Enabling Python & TypeScript Support](https://medium.com/r/?url=https%3A%2F%2Fwww.hashicorp.com%2Fblog%2Fcdk-for-terraform-enabling-python-and-typescript-support)

## Terraformのインストール
Terraformをインストールしていないと、下記のようなエラーが発生してしまします。

```bash
# Terraform CLI not present - Please install a current version
https://learn.hashicorp.com/terraform/getting-started/install.html
```
なのでまずは、公式を参照してTerraformをインストールしていきます。

公式: [Install Terraform](https://medium.com/r/?url=https%3A%2F%2Flearn.hashicorp.com%2Ftutorials%2Fterraform%2Finstall-cli)

```bash
$ brew tap hashicorp/tap
$ brew install hashicorp/tap/terraform
```

インストール完了後、Terraformはバージョンアップに追従しやすいtfenvの利用を推奨しているので、以下手順でtfenvもインストールします。

1. Terraformのバージョンマネージャである、tfenvをインストール
2. 現在使用可能なTerraformのバージョンを確認
3. 使用したいTerraformのバージョンをインストールする
4. 使用したいTerraformのバージョンを使用する

```bash
$ brew install tfenv
$ tfenv list-remote
$ tfenv install 使用したいバージョン
$ tfenv use 使用したいバージョン
```

インストール完了後、以下コマンドでバージョンを確認できれば完了です。

```bash
$ terraform --version
Terraform v0.14.8
$ tfenv --version
tfenv 2.0.0
```

## CDK for Terraformのインストール
Terraformのインストールが終わったので、本命のCDK for Terraformをインストールしていきます。

今回は、公式と同じように下記コマンドで、グローバルインストールを行います。

```bash
$ npm install -g cdktf-cli
```

グローバルインストールが嫌な場合は、以下記事を参考にインストールと初期化を行ってください。

[AWS CDKでプロバイダーとしてTerraformが使える！！CDK for Terraformが発表されました！！](https://medium.com/r/?url=https%3A%2F%2Fdev.classmethod.jp%2Farticles%2Fcdk-for-terraform%2F)

## CDK for Terraformの初期化
以下コマンドを実行し、新規プロジェクトの初期化を行います。

今回は、TypeScriptを使用しますので、templateにtypescriptを指定します。

```bash
$ mkdir sample-cfktf
$ cd sample-cfktf
$ cdktf init --template=typescript
```

初期化完了後、ファイルが生成されていれば成功です。

初期化完了後のファイル一覧に.genディレクトリがなければ、以下手順を行う必要があります。

作成したプロジェクトで、再度 npm install cdktf-cliを行うもしくは、生成されたcdktf.jsonを以下のように編集します。

```typescript
{
  "language": "typescript",
  "app": "npm run --silent compile && node main.js",
  "terraformProviders": [
    "aws@~> 2.0" // <- 追加
  ],
  ...
}
```

上記のように、terraformProvidersの中にaws@~があれば、次は以下コマンドを実行します。

```bash
$ cdktf get
```

実行後、Generated typescript constructs in the output directory: .genと表示されてプロジェクトにも.genディレクトリ生成されていれば、成功です。

CDK for Terraformは、この.genディレクトリにパッケージを置いておくようです。

今回は、awsのみインストールしています。

これで、aws用のパッケージをimportして使用することができるようになりました。

ここまでで、CDK for Terraformの初期化は完了です。
