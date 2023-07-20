import { StackContext, Api, EventBus, Stack } from "sst/constructs";
import { Effect, Policy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnThing } from 'aws-cdk-lib/aws-iot';

export function API({ stack }: StackContext) {
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

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
    defaults: {
      function: {
        bind: [bus],
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /todo": "packages/functions/src/todo.list",
      "POST /todo": "packages/functions/src/todo.create",
    },
  });

  bus.subscribe("todo.created", {
    handler: "packages/functions/src/events/todo-created.handler",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    ThingName: iotThing.thingName
  });
}
