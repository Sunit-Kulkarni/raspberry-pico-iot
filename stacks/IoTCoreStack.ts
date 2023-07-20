import { StackContext, Api } from "sst/constructs";
import { 
  Effect, 
  PolicyStatement, 
  Role, 
  ServicePrincipal 
} from "aws-cdk-lib/aws-iam";
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

  const iotRole = new Role(stack, "IoTRole", {
    assumedBy: new ServicePrincipal('iot.amazonaws.com'),
  })
  iotRole.addToPolicy(iotPolicyStatement)

  const iotThing = new CfnThing(stack, "MyIotThing", {
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
