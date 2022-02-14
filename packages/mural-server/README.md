# Proxy server for Mural integrations with oAuth support

## Important
the package use `dotEnv`.
### keys:
`MURAL_CLIENT_ID` - required  
`MURAL_CLIENT_SECRET` - required  
`REDIRECT_URI` - required. URL to be redirected to route to get token from Mural; (ex. https://example.ngrok.io/auth/token/)  
`SERVER_PORT` - optional. Default 8301.  

## Usage:
`import app, {listen, setScopes} from 'mural-server';`  
`setScopes([
    "murals:read"
]);`  
`listen()`

## Useful
`app` - is express instance. Any additional routs can be added before `listen()` is called.