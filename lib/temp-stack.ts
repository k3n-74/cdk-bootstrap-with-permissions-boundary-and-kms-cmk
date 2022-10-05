import {
  Stack,
  StackProps,
  cloudformation_include,
  aws_iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TempStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdkToolkit = new cloudformation_include.CfnInclude(
      this,
      "CDKToolkit",
      {
        templateFile:
          "./node_modules/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml",
        preserveLogicalIds: true,
      }
    );
    const roles = cdkToolkit.node.findAll().map((node) => {
      if (node instanceof aws_iam.CfnRole) {
        const cfnRole = node as aws_iam.CfnRole;
        cfnRole.addPropertyOverride(
          "PermissionsBoundary",
          `arn:aws:iam::${this.account}:policy/gov-base---permissions-boundary-for-role`
        );
      }
      return node;
    });

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'TempQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
