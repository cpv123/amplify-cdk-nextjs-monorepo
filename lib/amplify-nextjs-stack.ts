import * as cdk from "@aws-cdk/core";
import * as amplify from "@aws-cdk/aws-amplify";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as iam from "@aws-cdk/aws-iam";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { getNextJSBuildSpec } from "./getNextJSBuildSpec";

export class AmplifyInfraStack extends cdk.Stack {
  readonly sourceCodeProvider: amplify.GitHubSourceCodeProvider;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Secret created through the AWS console meaning it has the following JSON format:
    // { GITHUB_AMPLIFY_ACCESS_TOKEN: gh-access-token-value }
    const githubAccessToken = secretsmanager.Secret.fromSecretNameV2(
      this,
      "githubAmplifyAccessToken",
      "GitHubAmplifyAccessToken"
    ).secretValueFromJson("GITHUB_AMPLIFY_ACCESS_TOKEN");

    this.sourceCodeProvider = new amplify.GitHubSourceCodeProvider({
      owner: "cpv123",
      repository: "nextjs-sharing-code-monorepo",
      oauthToken: githubAccessToken,
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

    amplifyApp.addBranch("develop");
    amplifyApp.addBranch("main");

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
