import { StackContext, Api } from "sst/constructs";
import { 
  Effect, 
  PolicyDocument, 
  PolicyStatement, 
  Role, 
  ServicePrincipal 
} from "aws-cdk-lib/aws-iam";
import { CfnPolicy, CfnThing } from 'aws-cdk-lib/aws-iot';

export function API({ stack }: StackContext) {
  const iotPolicyStatement = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'iot:Connect', 
      'iot:Publish', 
      'iot:Subscribe', 
      'iot:Receive'
    ],
    resources: ["*"]
  })

  const iotRole = new Role(stack, "IoTRole", {
    assumedBy: new ServicePrincipal('iot.amazonaws.com'),
  })
  iotRole.addToPolicy(iotPolicyStatement)

  const iotPolicyDocument = new PolicyDocument({})
  iotPolicyDocument.addStatements(iotPolicyStatement)

  const ioTPolicy = new CfnPolicy(stack, 'MyIoTPolicy', {
    policyDocument: iotPolicyDocument,
    policyName: 'IoTPicoPolicy',
  });

  const iotThing = new CfnThing(stack, "MyIotThing", {
    thingName: "MyRaspberryPi",
    attributePayload: {
      attributes: {
        RoleArn: iotRole.roleArn,
        PolicyArn: ioTPolicy.attrArn
      }
    },
  })

  const api = new Api(stack, "api", {
    customDomain: "pico-iot-dev.sunitkulkarni.com",
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    ThingName: iotThing.thingName
  });
}
