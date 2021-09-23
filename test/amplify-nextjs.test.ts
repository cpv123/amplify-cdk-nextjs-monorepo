import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as AmplifyNextJs from "../lib/amplify-nextjs-stack";

test("Amplify app created", () => {
  const app = new cdk.App();
  const stack = new AmplifyNextJs.AmplifyInfraStack(app, "MyTestStack");
  expectCDK(stack).to(haveResource("AWS::Amplify::App"));
  expectCDK(stack).to(haveResource("AWS::Amplify::Branch"));
});
