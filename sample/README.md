# Mural Integration SDK sample

This project hosts a variety of samples for the `mural-integrations-sdk` component library.

## Samples

In order to select the sample you want to run, edit the `src/index.tsx` and change the 
`app` import at the top of the file.

  - `src/app-basic.tsx` — Basic simple of the mural-picker, mural-canvas component
  - `src/app-automation.tsx` — (Experimental) Advanced example of the mural-canvas RPCClient

## Configuration it

First you will need to configure the sample to run on your application

1. Copy the `config/defaults.json` to `config/app.json`
2. Edit `config/app.json` and set the following values accordingly:

 - `clientApp.clientId`
 - `clientApp.clientSecret`
 
## Running it

> Note: you can have as many configuration as you require, just make sure
> to set `NODE_ENV` to the proper configuration name.

`NODE_ENV=app npm run start`
