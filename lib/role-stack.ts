import { Stack, StackProps, aws_iam } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class RoleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaServiceRole = new aws_iam.CfnRole(
      this,
      "custom-cdk-bootstrap-test-role",
      {
        roleName: "custom-cdk-bootstrap-test",
        description: "test role for custom cdk bootstrap",
        assumeRolePolicyDocument: {
          Statement: [
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "lambda.amazonaws.com",
              },
            },
          ],
          Version: "2012-10-17",
        },
        managedPolicyArns: [
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
        ],
      }
    );
  }
}
