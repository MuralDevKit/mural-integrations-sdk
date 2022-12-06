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

## How to create app in mural.co and run it with sample


First of all, you need to install [ngrok](https://ngrok.com/download) and run it on the port that is used by the server so we can provide a redirect URL with HTTPS.
To start ngrok run command (in this case port will be 2022 by default):
```
ngrok http 2022
```
The second step is to create an app in Mural
   1. Go to mural dashboard
   2. Down in the left corner click user options
   3. Choose My apps
   4. Click the button New app.
   5. In modal window need to insert name of app and redirect url from ngrok adding to the end `/auth/callback` so it will looks like `https://9d60d5e97ed2.eu.ngrok.io/auth/callback`

After creating app add `clientId` and `clientSecret` to config file in `/sample/config/defaults.json` and change  redirect url to same that provided in app config.

Next step is to choose needed scopes in app config in Mural and make sure that they are the same in `default.json` file.

In app config in section access add ngrok domain in allow list domains `*.ngrok.com`
The last step is to run commands:
```
cd sample
yarn install
yarn start
```
