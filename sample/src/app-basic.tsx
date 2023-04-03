import {
  Canvas,
  SessionActivation,
} from '@muraldevkit/mural-integrations-mural-canvas';
import buildApiClient, {
  authorizeHandler,
  Mural,
  refreshTokenHandler,
  requestTokenHandler,
  setupAuthenticatedFetch,
  setupSessionStore,
} from '@muraldevkit/mural-integrations-mural-client';
import {
  MuralPicker,
  RoomPicker,
  WorkspacePicker,
} from '@muraldevkit/mural-integrations-mural-picker';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import './app.css';

// These definitions are implementation details from this sample build
// configuration and this may vary in your integration.
//
// In this case, we are using the `webpack-define-plugin` to define these
// constants at build time.
declare const APP_ID: string;
declare const SERVICES: any;

// First, we need to configure the ApiClient to enable us to issue calls
// to the MURAL Public API.
//
// This is a two step process
//
// 1) Building the authorization handlers for the OAuth flow
//
// While developing your auth service, you might require to use an insecure
// URL.
const protocol = SERVICES.auth.secure ? 'https' : 'http';

// These URLs are well-known endpoints on your authentication service, which
// should expose 3 routes:
//
// 1) authorizeUri — Auth service endpoint that returns a URL to MURAL's OAuth 'authorize' endpoint
// https://app.mural.co/api/public/v1/oauth/ with the appropriate request parameters (scopes, redirectUri)
//
// 2) requestTokenUri — Auth service endpoint to exchange the issued `code` to using the MURAL's OAuth 'token'
// endpoint https://app.mural.co/api/public/v1/oauth/token with the appropirate parameters (client_secret, redirectUri)
//
// 3) refreshTokenUri — Auth service endpoint that exchange a refresh token using MURAL's OAuth 'refresh'
// endpoint https://app.mural.co/api/public/v1/oauth/refresh (the 'token' endpoint is also valid here)
//
const tokenHandlerConfig = {
  authorizeUri: new URL('/auth', `${protocol}://${SERVICES.auth.host}`).href,
  requestTokenUri: new URL('/auth/token', `${protocol}://${SERVICES.auth.host}`)
    .href,
  refreshTokenUri: new URL(
    '/auth/refresh',
    `${protocol}://${SERVICES.auth.host}`,
  ).href,
};

// These helpers will automatically take care of the client-side business logic when interacting with
// the Auth service.
//
// We will inject these handlers in our ApiClient instance so it can automatically handle
// token refresh if required, without having to manage it.
const authorize = authorizeHandler(tokenHandlerConfig);
const requestToken = requestTokenHandler(tokenHandlerConfig);
const refreshToken = refreshTokenHandler(tokenHandlerConfig);

const fetchFn = setupAuthenticatedFetch({
  authorizeFn: authorize,
  requestTokenFn: requestToken,
  refreshTokenFn: refreshToken,
  sessionStore: setupSessionStore(localStorage),
});

const apiClient = buildApiClient(fetchFn, {
  appId: APP_ID,
  muralHost: SERVICES.mural.host,
  integrationsHost: SERVICES.integrations.host,
  secure: true,
});

const handleError = (_: Error, message: string) => {
  console.log(message);
};

enum Segue {
  LOADING,
  PICKER,
  CANVAS,
}

type AppState = {
  segue: Segue;
  canvasLink: string | null;
};

class App extends React.Component<{}, AppState> {
  state: AppState = {
    segue: Segue.LOADING,
    canvasLink: null,
  };

  handleMessage = (evt: MessageEvent) => {
    console.log('[handleMessage]', evt);
  };

  handleMural = (mural: Mural) => {
    this.setState({
      //segue: Segue.CANVAS,
      canvasLink: mural._canvasLink,
    });
  };

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const route = window.location.pathname;

    if (route.startsWith('/canvas')) {
      this.setState({
        segue: Segue.CANVAS,
        canvasLink: params.get('canvasLink'),
      });
    }

    // This is how we handle the MURAL OAuth callback to our `redirectUri`
    //
    // Most of the logic is handled by our `requestToken` handler
    else if (route.startsWith('/auth/callback') && params.has('code')) {
      const code = params.get('code');
      const state = params.get('state');
      await requestToken(code, state, { store: true });

      return this.setState({ segue: Segue.PICKER });
    }

    // This is how we start the authorization process, unless we have
    // a valid session already.
    //
    // Another option would be to use `apiClient.authenticated()`
    else if (route.startsWith('/auth')) {
      try {
        await refreshToken({ store: true });
        return this.setState({ segue: Segue.PICKER });
      } catch (err) {
        const authorizeUrl = await authorize(null, { storeState: true });
        window.location.replace(authorizeUrl);
      }
    }

    this.setState({ segue: Segue.CANVAS });
  }

  render() {
    switch (this.state.segue) {
      case Segue.LOADING: {
        return <h1>Loading...</h1>;
      }
      case Segue.PICKER: {
        return (
          <>
            <WorkspacePicker
              apiClient={apiClient}
              onSelect={console.log}
              onError={console.log}
            />
            <hr />
            <RoomPicker
              apiClient={apiClient}
              onSelect={console.log}
              onError={console.log}
              buttonTitle="Select"
            />
            <hr />
            {/*
            * MuralPicker aborts in-flight requests when selecting a new
            * workspace or room. Clone the ApiClient to prevent affecting
            * requests in other components.
            */}
            <MuralPicker
              apiClient={apiClient.clone()}
              onSelect={this.handleMural}
              onError={handleError}
            />
          </>
        );
      }
      case Segue.CANVAS: {
        return (
          <Canvas
            apiClient={apiClient}
            onMessage={this.handleMessage}
            canvasLink={this.state.canvasLink}
          />
        );
      }
    }
  }
}

const AppRoute = () => {
  return (
    <Routes>
      {/*
       * This route is very important for the Canvas session activation flow.
       * If you can't use this component, there is a `muralSessionClaimUrl`
       * helper that will create the `claimUrl` to be redirected to.
       */}
      <Route
        path="/session"
        element={<SessionActivation apiClient={apiClient} />}
      />
      <Route path="*" element={<App />} />
    </Routes>
  );
};

export default AppRoute;
