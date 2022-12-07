# Component SDK Storybook

## Getting started

First, you need to build the SDK packages, using `npm run build` on the monorepo root.

```
cd ..
npm run build

# if you have RAM to spare, you can also `--watch` the whole SDK
npm run build:watch
```


Then, you can start the Storybook using `npm run storybook`

## Development

If you are using Storybook for SDK component development, make sure to use the `--watch` option on the component you are building.

For instance, if you are working on the `@muraldevkit/mural-integrations-mural-account-chooser` component:

```
cd ../packages/mural-account-chooser
npm run build -- --watch
```

Storybook should automatically reload whenever the component has been compiled.

## FAQ

* Why are we not compiling the components with Storybook?

Our component SDK is meant to be a standalone bundle and is currently compiled using Rollup.
Storybook uses Webpack for its build pipeline, and having to keep compability between Rollup and Webpack is tedious.

Also, running the compiled component ensures parity with how the components are to be used in the wild.

* It doesn't work, what should I do?

Lerna (the monorepo tooling) is something a bit finicky, so `cd` in the monorepo root and run `npx lerna bootstrap`.


