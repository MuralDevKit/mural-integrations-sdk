## Mural Integration SDK

This repository hosts the Mural integration SDK

### Components

- mural-picker: Mural selection wizard with workspace/room level filtering.
- mural-canvas: Mural canvas host to embed murals into third-party applications.
- mural-client: Mural public API client supporting OAuth 2.0 authentication.
- mural-account-chooser: Mural account selection.
- mural-common: (internal) Assets and shared code.

### Sample application

Take a look at the sample integration [here](sample/README.md)

> Make sure to build the components before starting the sample, as it requires
> the compilation output to be ready.

In order to run this application, you need to have a registered application create/update the configuration file.

### Roadmap

 - [x] Use this repository in `mural-integrations/lib`
 - [x] Generalize build configuration and
 - [x] Generalize TypeScript configuration for all components
 - [x] Add testing rig
 - [x] Add sample application
 - [x] Add code quality tooling (prettier, eslint)
 - [ ] Changelog

### Documentation

[Documentation page](https://developers.mural.co/public/docs/integration-sdk)

### Building

```
# select the runtime the component targets
ln -sf runtimes/16.13.1 runtimes/current

npm install
npx lerna bootstrap
npm run build

# or to watch the changes 
npm run build:watch
```

### Testing

The testing rig setup follows the conventional testing philosophy at Mural — test behaviors, not implementation.
We are using the Gherkin syntax to create high-level behavior description and assert that the components replicate it accurately.

In order to develop and build, it is useful to use the _npm run build -- --watch_ command on the component you are currently developing for.

```
cd packages/<pkg>
npm run build -- --watch
```

#### Running the tests

Then, use the `test` package to run the testing rig on all the built components.

```
cd test
npm install --omit=peer
npm run test:react [features, …]

# conventionally, each component has a folder inside the features
npm run test:react features/mural-picker
```

#### Advanced options

|Variable|Default|Notes|
|--------|-------|-----|
|DEBUG|Off|Turn on inline source maps for all bundles. This will cause the bundles to be significantly larger, but enables debuging from the browser development tools.|
|BUNDLE_STATS|Off|Outputs a `dist/stats.html` file alongside the bundle that describes the topology and imports.|

### Publishing

In order to publish a new version of the SDK on `npm`, follow this process:

1. Decide on the version number

Read diff between the latest version and master, and decide on the version number:

  - `major`: There are breaking changes (i.e. incompatible interfaces)
  - `minor`: There are behavioral changes, but changes are backward compatible
  - `patch`: Bug-fixes only

2. Create a new release branch

```
git fetch origin
git checkout -b release/$(git describe --abbrev=0)-next origin/master
```

3. Update the packages version

```
npx lerna version <(pre)patch|minor|major>
```

Once the tag has been pushed, create the PR on GitHub, review it, and merge it.

4. Create the release on GitHub

Publishing is handled through GitHub Actions after a Release is created on GitHub.
Head to https://github.com/MuralDevKit/mural-integrations-sdk/releases/new and select the tag that was pushed by Lerna.

Use the generated release notes.

### Notes 

> It seems like there is an issue with Node *v16.15.1* where the `npx lerna bootstrap` command do not properly work in CI.
> We need more investigation to figure out the issue. For now we will stick to *v16.13.0*
