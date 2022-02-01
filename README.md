## MURAL Integration SDK

This repository hosts the MURAL integration SDK

> Note: this is a sub-tree split of https://github.com/tactivos/mural-integrations/tree/master/lib

### Components

- mural-picker: Mural selection wizard with workspace/room level filtering.
- mural-canvas: Mural canvas host to embed murals into third-party applications.
- mural-client: Mural public API client supporting OAuth 2.0 authentication.
- mural-common: (internal) Assets and shared code.

### Roadmap

 - [ ] Use this repository in `mural-integrations/lib`
 - [ ] Generalize build configuration and TypeScript configuration for all components
 - [ ] Add testing rig
 - [ ] Add sample application
 - [ ] Add code quality tooling (prettier, eslint)

### Upstream (mural-integrations)

Pulling changes from `mural-integrations`

```bash
# mural-integrations
git subtree split --prefix lib -b sub/lib

# mural-integrations-sdk
git fetch upstream # this should be the `mural-integrations` local repository
git subtree merge [--squash] --prefix packages upstream/sub/lib
```

In the future `mural-integrations` will either use submodules, or have the SDK as a dependency.

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

TBD

### Publishing

