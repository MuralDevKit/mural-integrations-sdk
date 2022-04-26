import {
  Canvas,
  SessionActivation,
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
import { v4 as uuid } from 'uuid';

declare const APP_ID: string;
declare const SERVICES: any;

console.log(APP_ID);
console.log(SERVICES);

// --- Configuration ---
const tokenHandlerConfig = {
  authorizeUri: new URL("/auth", `https://${SERVICES.auth}`).href,
  requestTokenUri: new URL("/auth/token", `https://${SERVICES.auth}`).href,
  refreshTokenUri: new URL("/auth/refresh", `https://${SERVICES.auth}`).href
};

const authorize = authorizeHandler(tokenHandlerConfig);
const requestToken = requestTokenHandler(tokenHandlerConfig);
const refreshToken = refreshTokenHandler(tokenHandlerConfig);

// --- MURAL API client ---
const clientConfig = buildClientConfig({
  appId: APP_ID,
  muralHost: SERVICES.mural,
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
  muralUrl: string| null;
};

interface RpcCallInfo {
  method: string;
  args?: string[];
}

interface RpcMessage {
  type: string;
  calls: RpcCallInfo[]
  rpcid: string;
}

class App extends React.Component<{}, AppState> {
  private canvasEl: React.Ref<Canvas>;
  private rpcContext: any;

  constructor(props) {
    super(props);
    // create a ref to store the canvasEl DOM element
    this.canvasEl = React.createRef();
  }

  state: AppState = {
    segue: Segue.LOADING,
    muralId: null,
    state: null,
    muralUrl: null,
  };

  handleMessage = (evt: MessageEvent) => {
    console.log(evt);
  };

  // make RPC context call with params
  onRpcReady = () => {
    this.startRecordingBot();
  };

  onRpcMessage = (msg) => {
    console.info(msg);
  }

  onRpcContext = (context) => {
    console.log('onRpcContext', context);
    this.rpcContext = context;
  };

  sendMessageToCanvas = (msg: RpcMessage) => {
    const canvasMessageReceiver = this.canvasEl?.current?.contentWindow;
    if (canvasMessageReceiver) {
      const targetOrigin = `https://${SERVICES.mural}`;
      canvasMessageReceiver.postMessage(msg, targetOrigin)
    }
  }

  startRecordingBot = () => {
    const rpcMessageType = 'mural.integration.rpc';

    console.log('startRecordingBot', this.rpcContext);

    const visitorId = this.rpcContext?.user?.visitorId;
    if (!visitorId) {
      console.log('I am not a visitor');
      return;
    }

    this.sendMessageToCanvas({
      type: rpcMessageType,
      rpcid: uuid(),
      calls: [
        {
          method: 'dispatcher.participants.update.visitor',
          args: [visitorId, {
            name: 'Recording Bot',
            avatar: 'https://cdn.icon-icons.com/icons2/1371/PNG/512/robot02_90810.png',
            color: '#FF0000'
          }]
        },
        // { method: 'remote.send.visitor.data' },
        { method: 'modal.close', args: ['visitor-modal'] }
      ]
    });


    if (this.rpcContext.facilitators && this.rpcContext.facilitators.length > 0) {
      const facilitatorUserName = this.rpcContext.facilitators[0].username;
      this.sendMessageToCanvas({
        type: rpcMessageType,
        rpcid: uuid(),
        calls: [
          {
            method: 'dispatcher.facilitation.asParticipant.followParticipant',
            args: [facilitatorUserName],
          }
        ]
      });
    }
  }

  handleMural = (mural: Mural) => {
    const parts = mural.visitorsSettings.link.split('/');
    const state = parts[parts.length - 1];

    this.setState({
      segue: Segue.CANVAS,
      muralId: mural.id,
      state,
      muralUrl: mural._canvasLink.replace('http', 'https'),
    });
  };

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const route = window.location.pathname;

    if (route.startsWith('/canvas')) {
      const muralId = params.get('muralId');
      const state = params.get('state');
      const muralUrl = params.get('muralUrl');
      console.log('this.setState({ segue: Segue.CANVAS });', muralId, state, muralUrl);
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

    const authUrl = new URL('/session', window.origin);

    switch (this.state.segue) {
      case Segue.LOADING: {
        return <h1>Loading...</h1>;
      }
      case Segue.PICKER: {
        return <MuralPicker {...muralPickerProps} />;
      }
      case Segue.CANVAS: {
        const visitorUrl = new URL(`/canvas?muralId=${this.state.muralId!}&state=${this.state.state!}&muralUrl=${this.state.muralUrl}`, window.origin);
        console.log('visitor link:', visitorUrl.href);
        return (
          <Canvas
            apiClient={apiClient}
            authUrl={authUrl}
            muralId={this.state.muralId!}
            state={this.state.state!}
            onVisitorAccessDenied={() => alert('ACCESS DENIED')}
            onError={() => alert('ERROR')}
            onMessage={this.handleMessage}
            onReady={() => console.log('READY')}
            onRpcReady={this.onRpcReady}
            onRpcContext={this.onRpcContext}
            onRpcMessage={this.onRpcMessage}
            muralUrl={this.state.muralUrl}
            iframeRef={this.canvasEl}
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
