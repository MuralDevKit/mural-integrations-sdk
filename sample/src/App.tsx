import {
  Canvas,
  SessionActivation,
  RpcClient,
} from '@muraldevkit/mural-integrations-mural-canvas';
import buildApiClient, {
  authorizeHandler,
  buildClientConfig,
  Mural,
  refreshTokenHandler,
  requestTokenHandler,
} from '@muraldevkit/mural-integrations-mural-client';
import {
  MuralPicker,
  PropTypes,
} from '@muraldevkit/mural-integrations-mural-picker';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';

declare const APP_ID: string;
declare const SERVICES: any;

console.log(APP_ID);
console.log(SERVICES);

// --- Configuration ---
const protocol = SERVICES.auth.secure ? 'https' : 'http';
const tokenHandlerConfig = {
  authorizeUri: new URL('/auth', `${protocol}://${SERVICES.auth.host}`).href,
  requestTokenUri: new URL('/auth/token', `${protocol}://${SERVICES.auth.host}`).href,
  refreshTokenUri: new URL('/auth/refresh', `${protocol}://${SERVICES.auth.host}`).href,
};

const authorize = authorizeHandler(tokenHandlerConfig);
const requestToken = requestTokenHandler(tokenHandlerConfig);
const refreshToken = refreshTokenHandler(tokenHandlerConfig);

// --- MURAL API client ---
const clientConfig = buildClientConfig({
  appId: APP_ID,
  muralHost: SERVICES.mural.host,
  ...tokenHandlerConfig,
});

const apiClient = buildApiClient(clientConfig);

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
  muralId: string | null;
  state: string | null;
  muralUrl: string | null;
};

class App extends React.Component<{}, AppState> {
  private rpcClient = new RpcClient({
    origin: apiClient.url('').origin,
  });

  state: AppState = {
    segue: Segue.LOADING,
    muralId: null,
    state: null,
    muralUrl: null,
  };

  handleMessage = (evt: MessageEvent) => {
    console.log('[handleMessage]', evt);
  };

  startRecordingBot = async () => {
    const context = () => this.rpcClient.context;
    console.log('[startRecordingBot] initial context:', context());

    const visitorId = context().user?.visitorId;
    if (!visitorId) {
      console.log('[startRecordingBot] I am not a visitor');
      return;
    }

    await Promise.all([
      this.rpcClient.rpc('dispatcher.participants.update.visitor', visitorId, {
        name: 'Recording Bot',
        avatar:
          'https://cdn.icon-icons.com/icons2/1371/PNG/512/robot02_90810.png',
        color: '#FF0000',
      }),
      this.rpcClient.rpc('modal.close', 'visitor-modal'),
    ]);

    if (context().facilitators && context().facilitators.length > 0) {
      const facilitatorUserName = context().facilitators[0].username;
      this.rpcClient.rpc(
        'dispatcher.facilitation.asParticipant.followParticipant',
        facilitatorUserName,
      );
    }
  };

  // this is first incoming message - make RPC context call with params
  onRpcReady = () => {
    this.startRecordingBot();
  };

  handleMural = (mural: Mural) => {
    const parts = mural.visitorsSettings.link.split('/');
    const state = parts[parts.length - 1];

    this.setState({
      segue: Segue.CANVAS,
      muralId: mural.id,
      state,
      muralUrl: mural._canvasLink,
    });
  };

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const route = window.location.pathname;

    this.rpcClient.on('rpc_callback', (...args: any[]) => {
      console.log('RPC Callback', args);
    });
    this.rpcClient.on('rpc_context', (...args: any[]) =>
      console.log('RPC Context', args),
    );
    this.rpcClient.on('rpc_dispatch', msg => console.log('RPC Dispatch', msg));
    this.rpcClient.on('rpc_ready', this.startRecordingBot);

    if (route.startsWith('/canvas')) {
      const muralId = params.get('muralId');
      const state = params.get('state');
      const muralUrl = params.get('muralUrl');
      console.log(
        'this.setState({ segue: Segue.CANVAS });',
        muralId,
        state,
        muralUrl,
      );

      this.setState({ segue: Segue.CANVAS, muralId, state, muralUrl });
    }

    // TODO: handle callback route
    if (route.startsWith('/auth/callback') && params.has('code')) {
      const code = params.get('code');
      const state = params.get('state');
      await requestToken(code, state, { store: true });

      this.setState({ segue: Segue.PICKER });
      return;
    }

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
    const muralPickerProps: PropTypes = {
      apiClient: apiClient,
      onCreateMural: async _mural => {
        return undefined;
      },
      onMuralSelect: this.handleMural,
      handleError: handleError,
    };

    switch (this.state.segue) {
      case Segue.LOADING: {
        return <h1>Loading...</h1>;
      }
      case Segue.PICKER: {
        return <MuralPicker {...muralPickerProps} />;
      }
      case Segue.CANVAS: {
        const visitorUrl = new URL(
          `/canvas?muralId=${this.state.muralId!}&state=${this.state
            .state!}&muralUrl=${this.state.muralUrl}`,
          window.origin,
        );
        console.log('visitor link:', visitorUrl.href);

        return (
          <Canvas
            apiClient={apiClient}
            muralId={this.state.muralId!}
            state={this.state.state!}
            onVisitorAccessDenied={() => alert('ACCESS DENIED')}
            onError={() => alert('ERROR')}
            onMessage={this.handleMessage}
            onReady={() => console.log('READY')}
            rpcClient={this.rpcClient}
            muralUrl={this.state.muralUrl}
          />
        );
      }
    }
  }
}

const AppRoute = () => {
  return (
    <Routes>
      <Route
        path="/session"
        element={<SessionActivation apiClient={apiClient} />}
      />
      <Route path="*" element={<App />} />
    </Routes>
  );
};

export default AppRoute;
