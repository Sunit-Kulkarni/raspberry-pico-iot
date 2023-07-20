import { StackContext, Api, EventBus, Stack } from "sst/constructs";
import { Effect, Policy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnThing } from 'aws-cdk-lib/aws-iot';

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
  // const iotPolicy = new Policy(this, 'IoTPolicy')
  // iotPolicy.addStatements(iotPolicyStatement)

  const iotRole = new Role(this, "IoTRole", {
    assumedBy: new ServicePrincipal('iot.amazonaws.com'),
  })
  iotRole.addToPolicy(iotPolicyStatement)

  const iotThing = new CfnThing(this, "MyIotThing", {
    thingName: "MyRaspberryPi",
    attributePayload: {
      attributes: {
        RoleArn: iotRole.roleArn,
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
