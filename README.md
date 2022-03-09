## MURAL Integration SDK

This repository hosts the MURAL integration SDK

> Note: this is a sub-tree split of https://github.com/tactivos/mural-integrations/tree/master/lib

### Components

- mural-picker: Mural selection wizard with workspace/room level filtering.
- mural-canvas: Mural canvas host to embed murals into third-party applications.
- mural-client: Mural public API client supporting OAuth 2.0 authentication.
- mural-common: (internal) Assets and shared code.

### Roadmap

 - [x] Use this repository in `mural-integrations/lib`
 - [ ] Generalize build configuration and
 - [x] Generalize TypeScript configuration for all components
 - [ ] Add testing rig
 - [ ] Add sample application
 - [x] Add code quality tooling (prettier, eslint) https://github.com/tactivos/mural-integrations-sdk/pull/8
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
