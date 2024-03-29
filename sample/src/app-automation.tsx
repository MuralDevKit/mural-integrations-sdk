import {
  Canvas,
  RpcClient,
} from '@muraldevkit/mural-integrations-mural-canvas';
import buildApiClient, {
  authorizeHandler,
  Mural,
  refreshTokenHandler,
  requestTokenHandler,
  setupAuthenticatedFetch,
  setupSessionStore,
} from '@muraldevkit/mural-integrations-mural-client';
import { MuralPicker } from '@muraldevkit/mural-integrations-mural-picker';
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
  // In order to perform automation, we need to initialize RpcClient
  // The RpcClient allows dispatching automation messages to MURAL core app
  private rpcClient = new RpcClient({
    origin: apiClient.url('').origin,
  });

  state: AppState = {
    segue: Segue.LOADING,
    canvasLink: null,
  };

  handleMessage = (evt: MessageEvent) => {
    console.log('[handleMessage]', evt);
  };

  // Here we perform an automation logic
  // the function is called upon receiving rpc_ready event from the RPC client
  // we do automation
  startRecordingBot = async () => {
    // The RpcContext is updated upon every call to RpcClient
    // Currently RpcContext includes user, participants and facilitators
    const context = () => this.rpcClient.context;
    console.log('[startRecordingBot] initial context:', context());

    // The visitorId can be used to dispatch further messages, like updating visitor name or avatar
    const visitorId = context().user?.visitorId;

    // Handle the case when current user is not a visitor here
    if (!visitorId) {
      console.log('[startRecordingBot] I am not a visitor');
      return;
    }

    await Promise.all([
      // Here we update visitor name, color and avatar
      // (avatar change is not fully supported, provided here for future)
      this.rpcClient.rpc('dispatcher.participants.update.visitor', visitorId, {
        name: 'Recording Bot',
        avatar:
          'https://cdn.icon-icons.com/icons2/1371/PNG/512/robot02_90810.png',
        color: '#FF0000',
      }),

      // Close visitor overlay window
      this.rpcClient.rpc('modal.close', 'visitor-modal'),
    ]);

    // As at some cases there may be browser zoom popup,
    // we are sending message to close this popup
    await new Promise(r => setTimeout(r, 10000));
    this.rpcClient.rpc('dispatcher.modals.browserZoom.close').then(() => {
      if (context().facilitators && context().facilitators.length > 0) {
        // Get facilitator user name from first facilitator within context
        const facilitatorUserName = context().facilitators[0].username;

        // Finally, we are sending the command to follow facilitator
        this.rpcClient.rpc(
          'dispatcher.facilitation.asParticipant.followParticipant',
          facilitatorUserName,
        );
      }
    });
  };

  handleMural = (mural: Mural) => {
    this.setState({
      segue: Segue.CANVAS,
      canvasLink: mural._canvasLink,
    });
  };

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const route = window.location.pathname;

    // trace rpc callback for debug purposes
    this.rpcClient.on('rpc_callback', (...args: any[]) => {
      console.log('RPC Callback', args);
    });

    // trace rpc context for debug purposes
    this.rpcClient.on('rpc_context', (...args: any[]) =>
      console.log('RPC Context', args),
    );

    // trace confirmation of RPC message dispatching
    this.rpcClient.on('rpc_dispatch', msg => console.log('RPC Dispatch', msg));

    // start the automation script upon receiving rpc_ready event
    this.rpcClient.on('rpc_ready', this.startRecordingBot);

    if (route.startsWith('/canvas')) {
      const canvasLink = params.get('canvasLink');

      this.setState({ segue: Segue.CANVAS, canvasLink });
    }

    // This is how we handle the MURAL OAuth callback to our `redirectUri`
    //
    // Most of the logic is handled by our `requestToken` handler
    if (route.startsWith('/auth/callback') && params.has('code')) {
      const code = params.get('code');
      const state = params.get('state');
      await requestToken(code, state, { store: true });

      this.setState({ segue: Segue.PICKER });
      return;
    }

    // This is how we start the authorization process, unless we have
    // a valid session already.
    //
    // Another option would be to use `apiClient.authenticated()`
    if (route.startsWith('/auth')) {
      try {
        await refreshToken({ store: true });
        this.setState({ segue: Segue.PICKER });
        return;
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
          <MuralPicker
            apiClient={apiClient}
            onSelect={this.handleMural}
            onError={handleError}
          />
        );
      }
      case Segue.CANVAS: {
        return (
          <Canvas
            apiClient={apiClient}
            onMessage={this.handleMessage}
            onReady={() => console.log('READY')}
            rpcClient={this.rpcClient}
            canvasLink={this.state.canvasLink ?? ''}
          />
        );
      }
    }
  }
}

const AppRoute = () => {
  return (
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
  );
};

export default AppRoute;
