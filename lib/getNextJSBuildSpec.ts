// Note the preBuild commands which install dependencies from the monorepo root.
export const getNextJSBuildSpec = (appName: string) => ({
  version: 1,
  applications: [
    {
      appRoot: `packages/${appName}`,
      frontend: {
        phases: {
          preBuild: {
            commands: ["cd ../..", "yarn", `cd packages/${appName}`],
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
