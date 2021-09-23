#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { AmplifyInfraStack } from "../lib/amplify-nextjs-stack";

const app = new cdk.App();
new AmplifyInfraStack(app, "AmplifyNextJsStack");
