本リポジトリは下記手順と実例のコードである。

- cdk bootstrap ( cdk toolkit ) に下記カスタマイズをしてデプロイする方法。

  - 独自の KMS CMK を指定。
  - Permissions Boundary を追加。

- cdk app の全スタックに一括で permissions boundary を適用する方法。

* おまけ：KMS CMK の作成方法

---

## 🚀 Dev Container の使い方

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

## 🚀 cdk bootstrap のカスタマイズとデプロイ方法

> note: cdk bootstrap ( cdk toolkit ) の CFn テンプレートの入手方法はいくつかあるが、下記場所から取得する方法が一番良い。  
> `/node_modules/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml`

1. Permissions Boundary 対応をする。  
   `/node_modules/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml` ファイルをコピーして、下記作業を手作業で実施する。  
   `bootstrap-template.yaml` の `IAM:Role` リソースに permissions boundary の ポリシーを追加する。  
   作業ミスを軽減するために `Properties:` の直下に追加したほうが良い。

   > note: 具体例については `./cfn/bootstrap` ディレクトリを参照

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

1. KMS Key を指定してデプロイする。  
   `--bootstrap-kms-key-id` オプションで KMS Key を指定する。ここで指定する ARN は Key ID でも Alias でも良い。

   ```shell
   $ npx cdk bootstrap aws://{AWSアカウントID}/ap-northeast-1 --template ./cfn/bootstrap/customized-bootstrap-template.yaml --bootstrap-kms-key-id arn:aws:kms:ap-northeast-1:{AWSアカウントID}:alias/cdk-bootstrap-test
   ```

   > note: 独自の KMS Key を指定しない場合
   >
   > ```shell
   > $ npx cdk bootstrap aws://{AWSアカウントID}/ap-southeast-1 --template ./cfn/bootstrap/customized-bootstrap-template.yaml
   > ```

## 🚀 cdk app の全スタックに一括で permissions boundary を適用してデプロイ

1. Permissions Boundary を適用。  
   下記コードにより cdk app 内の全てのスタックの全ての IAM:Role に一括で Permissions Boundary を適用する。

   ```ts
   // 作成済みのPermissions boundary のポリシーを空スタックに対して名前指定で読み込む
   const permissionsBoundaryPolicy =
     aws_iam.ManagedPolicy.fromManagedPolicyName(
       new Stack(app, "permissions-boundary-policy-stack", {}),
       "permissions-boundary-policy",
       "gov-base---permissions-boundary-for-role"
     );
   // app (全スタック) にPermissions boundaryを適用する
   aws_iam.PermissionsBoundary.of(app).apply(permissionsBoundaryPolicy);
   ```

1. デプロイ

   ```shell
   # deploy
   $ npx cdk deploy custom-cdk-bootstrap-test-app
   ```

   > note: デストロイ
   >
   > ```shell
   > # destroy
   > $ npx cdk destroy custom-cdk-bootstrap-test-app
   > ```

## 🚀 おまけ：KMS CMK の作成方法

- KMS CMK マルチリージョンキー with alias @ 東京 を作成

  ```shell
  $ aws cloudformation deploy --stack-name cdk-bootstrap-test-kms-cmk-primary --template-file ./cfn/kms-cmk/kms-cmk-primary.yaml --capabilities CAPABILITY_NAMED_IAM --region ap-northeast-1 --no-fail-on-empty-changeset
  ```

- KMS CMK マルチリージョンキーレプリカ with alias @ シンガポール を作成

  ```shell
  $ aws cloudformation deploy --stack-name cdk-bootstrap-test-kms-cmk-replica --template-file ./cfn/kms-cmk/kms-cmk-replica.yaml --parameter-overrides PrimaryKeyArn={プライマリキーのARN(エイリアスのARNは指定できないので注意)} --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-1 --no-fail-on-empty-changeset
  ```
