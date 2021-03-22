# sample-cdktf
## 概要
CDK for Terraformを使用した、AWSインフラ環境構築
## 実行環境
```
$ terraform --version
Terraform v0.14.8
$ tfenv --version
tfenv 2.0.0
```
## 構成図
![Untitled Diagram-AWS (5)](https://user-images.githubusercontent.com/57429437/112000225-2132d480-8b61-11eb-97bb-11a16374d669.png)


## ブログ
[[1章] AWSへのデプロイ自動化と、CDK for Terraformでの管理](https://medium.com/nextbeat-engineering/1%E7%AB%A0-aws%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E8%87%AA%E5%8B%95%E5%8C%96%E3%81%A8-cdk-for-terraform%E3%81%A7%E3%81%AE%E7%AE%A1%E7%90%86-425aaf06757e)

[[2章] Github Actionsでdocker imageを、AWS ECRへPUSHする](https://medium.com/@easygoing_mint_wombat_223/2%E7%AB%A0-github-actions%E3%81%A7docker-image%E3%82%92-aws-ecr%E3%81%B8push%E3%81%99%E3%82%8B-8d83a2e24c39)

[[3章] AWS ECRへのPUSH内容を、Slackへ通知する]()

[[4章] CDK for Terraformで、AWS Fargateの環境構築]()

[[5章] SlackからAWS ECSを更新させる]()

[[6章] AWS ECSの更新内容を、Slackへ通知する]()
## 初期化
```
$ git clone git@github.com:takapi327/sample-cdktf.git
```
## デプロイ
```
$ cdktf deploy
```
## 削除
```
$ cdktf destroy
```
