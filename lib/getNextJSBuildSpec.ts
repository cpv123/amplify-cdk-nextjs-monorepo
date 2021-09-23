export const getNextJSBuildSpec = (appName: string) => ({
  version: 1,
  applications: [
    {
      appRoot: `packages/${appName}`,
      frontend: {
        phases: {
          preBuild: {
            commands: ["yarn install"],
          },
          build: {
            commands: ["yarn build"],
          },
        },
        artifacts: {
          files: ["**/*"],
          baseDirectory: ".next",
        },
        cache: {
          paths: ["node_modules/**/*", ".next/cache/**/*"],
        },
      },
    },
  ],
});
