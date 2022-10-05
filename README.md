# cdk-bootstrap-with-permissions-boundary-and-kms-cmk

## 使い方

- コンテナのビルドをした後は下記を実行する。

  ```shell
  ika-musume:/workspace$ npm ci
  ika-musume:/workspace$ poetry install --no-root
  ika-musume:/workspace$ source ~/.profile
  ```

- `cfn-lint` のアップデートは下記を実行する。
  ```shell
  ika-musume:/workspace$ poetry update cfn-lint
  ```

---

### 無駄な情報が少ない cdk synth の実行方法

```shell
$ npm run cdk --silent -- synth --no-version-reporting --no-path-metadata --no-asset-metadata > ./customized-bootstrap-template.yaml
```

### 手動でカスタマイズ

やることは下記１つ。

- `IAM:Role` リソースに permissions boundary の ポリシーを追加する。  
  作業ミスをしにくくなるから Properties の直下に追加したほうが良い。
  ```yaml
  # 例
  FilePublishingRole:
    Type: AWS::IAM::Role
    Properties:
      PermissionsBoundary: !Sub "arn:aws:iam::${AWS::AccountId}:policy/gov-base---permissions-boundary-for-role"
      AssumeRolePolicyDocument:
        Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              AWS:
                Ref: AWS::AccountId
  ```
- デプロイする。

  ```shell
  $ npm run cdk --silent -- bootstrap aws://{AWSアカウントID}/ap-southeast-1 --template ./cfn/customized-bootstrap-template.yaml
  ```

- 独自の KMS CMK を使用する設定でデプロイ

  ```shell
  $ npm run cdk --silent -- bootstrap aws://{AWSアカウントID}/ap-northeast-1 --template ./cfn/customized-bootstrap-template.yaml ----bootstrap-kms-key-id arn:aws:kms:ap-northeast-1:{AWSアカウントID}:alias/cdk-bootstrap-test
  ```

### 実験用リソース

KMS CMK プライマリ @ 東京

```shell
$ aws cloudformation deploy --stack-name cdk-bootstrap-test-kms-cmk-primary --template-file ./cfn/kms-cmk-primary.yaml --capabilities CAPABILITY_NAMED_IAM --region ap-northeast-1 --no-fail-on-empty-changeset
```

KMS CMK レプリカ @ シンガポール

```shell
$ aws cloudformation deploy --stack-name cdk-bootstrap-test-kms-cmk-replica --template-file ./cfn/kms-cmk-replica.yaml --parameter-overrides PrimaryKeyArn={プライマリキーのARN(エイリアスのARNじゃダメ)} --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset
```

サンプルアプリのデプロイ/デストロイ

```shell
# deploy
$ npm run cdk -- deploy custom-cdk-bootstrap-test-app

# destroy
$ npm run cdk -- destroy custom-cdk-bootstrap-test-app
```
