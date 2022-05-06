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
  muralUrl: string | null;
};

interface RpcMessage {
  type: string;
  rpcid: string;
  method: string;
  args?: string[];
}

interface RpcContext {
  user: any;
  participants: any[];
  facilitators: any[]
}

interface RpcCallback {
  type: string;
  rpcid: string;
  error?: string;
  context?: RpcContext;
}

// simple queue abstraction
class Queue<T> {
  constructor() {
    this.data = new Array<T>();
  }

  private data: T[];

  //put value on end of queue
  push(elem: T) {
    this.data.push(elem);
  }

  //Take first value from queue
  pop(): T {
    return this.data.shift();
  }
}


class App extends React.Component<{}, AppState> {
  private canvasEl: any;
  private rpcContext: any;
  private rpcQueue: Queue<RpcMessage> = new Queue<RpcMessage>();
  private outboundRpcs = new Map();

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
    console.log('[handleMessage]', evt);
  };

  dispatch = () => {
    const msg = this.rpcQueue.pop();

    if (msg) {
      // send the message through the canvas
      const canvasMessageReceiver = this.canvasEl?.current?.contentWindow;
      if (canvasMessageReceiver) {
        const targetOrigin = `https://${SERVICES.mural}`;
        canvasMessageReceiver.postMessage(msg, targetOrigin)
      }
    }
  }

  sendMessageToCanvas = (msg: RpcMessage) => {
    // push the message on the queue to preserve call ordering
    this.rpcQueue.push(msg);

    const uponRpc = new Promise((resolve, reject) => {
      // we could potentially have a `timeout` here to automatically reject
      // stale RPCs after a while

      // index the message per RPC id
      this.outboundRpcs[msg.rpcid] = [resolve, reject];
    });

    // send the message
    this.dispatch();

    return uponRpc;
  }

  startRecordingBot = () => {
    console.log('[startRecordingBot] initial context:', this.rpcContext);

    const visitorId = this.rpcContext?.user?.visitorId;
    if (!visitorId) {
      console.log('[startRecordingBot] I am not a visitor');
      return;
    }

    this.sendMessageToCanvas({
      type: 'mural.rpc_message',
      rpcid: uuid(),
      method: 'dispatcher.participants.update.visitor',
      args: [visitorId, {
        name: 'Recording Bot',
        avatar: 'https://cdn.icon-icons.com/icons2/1371/PNG/512/robot02_90810.png',
        color: '#FF0000'
      }]
    }).then(() => {
      console.log('promise resolved')
      this.sendMessageToCanvas({
        type: 'mural.rpc_message',
        rpcid: uuid(),
        method: 'modal.close',
        args: ['visitor-modal']

      }).then(() => {
        if (this.rpcContext.facilitators && this.rpcContext.facilitators.length > 0) {
          const facilitatorUserName = this.rpcContext.facilitators[0].username;
          this.sendMessageToCanvas({
            type: 'mural.rpc_message',
            rpcid: uuid(),
            method: 'dispatcher.facilitation.asParticipant.followParticipant',
            args: [facilitatorUserName],
          });
        }
      })
    })
  }

  // this is first incoming message - make RPC context call with params
  onRpcReady = () => {
  };

  onRpcCallback = (data: any) => {
    const msg: RpcCallback = data;
    console.info(msg);

    if (!this.outboundRpcs.has(msg.rpcid)) {
      console.warn(`Ignoring non-originating RPC ${msg.rpcid}`);
    }

    if (msg.context) {
      this.rpcContext = msg.context;
    }

    if (msg.rpcid) {
      // figure out if we have an error of a success
      if (!msg.error) {
        this.outboundRpcs[msg.rpcid][0](msg);
      } else {
        console.log('App received rpc error', msg.error);
        this.outboundRpcs[msg.rpcid][1](msg);
      }
      // dispatch the next RPC in the queue
      this.dispatch();
    } else {
      this.startRecordingBot();
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
            onRpcCallback={this.onRpcCallback}
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
