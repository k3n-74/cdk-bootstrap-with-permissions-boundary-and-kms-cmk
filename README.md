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
