#!/usr/bin/env node
import "source-map-support/register";
import { App, aws_iam, Stack } from "aws-cdk-lib";
import { TempStack } from "../lib/temp-stack";
import { RoleStack } from "../lib/role-stack";
import { ImagePullPrincipalType } from "aws-cdk-lib/aws-codebuild";

const app = new App();

// IAM Roleのリソースを持っているスタック
const roleStack = new RoleStack(app, "custom-cdk-bootstrap-test-app", {});

/////////////////////////////////////////////
// permissions boundary のポリシーを適用
/////////////////////////////////////////////

// 作成済みのPermissions boundary のポリシーを空スタックに対して名前指定で読み込む
const permissionsBoundaryPolicy = aws_iam.ManagedPolicy.fromManagedPolicyName(
  new Stack(app, "permissions-boundary-policy-stack", {}),
  "permissions-boundary-policy",
  "gov-base---permissions-boundary-for-role"
);
// app (全スタック) にPermissions boundaryを適用する
aws_iam.PermissionsBoundary.of(app).apply(permissionsBoundaryPolicy);

// new TempStack(app, "TempStack", {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */
//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },
//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
