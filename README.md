## MURAL Integration SDK

This repository hosts the MURAL integration SDK

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
 - [ ] Generalize build configuration and
 - [x] Generalize TypeScript configuration for all components
 - [ ] Add testing rig
 - [x] Add sample application
 - [x] Add code quality tooling (prettier, eslint)
 - [ ] Changelog

### Documentation

TDB

### Building

```
npm install
npx lerna bootstrap
npx lerna run build
npx lerna run pack
ls -la dist/
```

### Versioning

```
npx lerna version <(pre)patch|minor|major>
```

### Publishing

[Create a new release](https://github.com/tactivos/mural-integrations-sdk/releases/new) from the latest tag.
