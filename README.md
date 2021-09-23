# amplify-cdk-nextjs-monorepo

Example showing how to deploy SSR Next.js applications within a monorepo to AWS Amplify, using the AWS Cloud Development Kit (CDK).

The monorepo being deployed has two apps: `app-1` and `app-2`. Running `yarn deploy` will create an Amplify application for each, with the necessary configuration to support a monorepo and server-side rendered Next.js applications.

## Issues

Currently the default Amplify service role does not have enough permissions to deploy all the resources required for an SSR Next.js application, see [GitHub issue](https://github.com/aws-amplify/amplify-console/issues/2086). The workaround is to give the service role full permissions on all resources as done here in `lib/amplify-nextjs-stack.ts`.
