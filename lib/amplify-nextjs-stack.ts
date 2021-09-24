import * as cdk from "@aws-cdk/core";
import * as amplify from "@aws-cdk/aws-amplify";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as iam from "@aws-cdk/aws-iam";
import { getNextJSBuildSpec } from "./getNextJSBuildSpec";

// TODO - should use AWS Secrets Manager instead.
require("dotenv").config();

export class AmplifyInfraStack extends cdk.Stack {
  readonly sourceCodeProvider: amplify.GitHubSourceCodeProvider;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.sourceCodeProvider = new amplify.GitHubSourceCodeProvider({
      owner: "cpv123",
      repository: "nextjs-sharing-code-monorepo",
      oauthToken: cdk.SecretValue.plainText(
        process.env.GITHUB_ACCESS_TOKEN as string
      ),
    });

    // For each app in the monorepo, create an Amplify app.
    const apps = ["app-1", "app-2"];
    apps.forEach((appName) => {
      this.buildAmplifyApp(appName);
    });
  }

  buildAmplifyApp(appName: string) {
    const buildSpecJson = getNextJSBuildSpec(appName);
    const amplifyApp = new amplify.App(this, appName, {
      sourceCodeProvider: this.sourceCodeProvider,
      buildSpec: codebuild.BuildSpec.fromObjectToYaml(buildSpecJson),
      autoBranchDeletion: true,
    });

    amplifyApp.addBranch("master");

    // This env variable is required for monorepo deployments. The value must match the appRoot value in the buildSpec.
    amplifyApp.addEnvironment(
      "AMPLIFY_MONOREPO_APP_ROOT",
      `packages/${appName}`
    );

    // This seems to be a bug, where the default Amplify role does not have enough permissions to deploy SSR apps.
    // Workaround is to give full permissions (not ideal).
    amplifyApp.grantPrincipal.addToPrincipalPolicy(
      // TODO - find out why this has a type mismatch.
      // @ts-ignore
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["*"],
      })
    );
  }
}
