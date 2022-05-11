import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { EventHandler } from '../../types';
import RpcClient from '../../rpc';
import './styles.scss';

interface CanvasEvents {
  onMessage?: EventHandler<MessageEvent>;
  onMemberAccessDenied?: EventHandler;
  onVisitorAccessDenied?: EventHandler;
  onGuestAccessDenied?: EventHandler;
  onMuralUnavailable?: EventHandler;
  onError?: EventHandler;
  onReady?: EventHandler;
}

const MESSAGE_EVENT: Record<string, keyof CanvasEvents> = {
  'mural.member_access_denied': 'onMemberAccessDenied',
  'mural.visitor_access_denied': 'onVisitorAccessDenied',
  'mural.guest_access_denied': 'onGuestAccessDenied',
  'mural.mural_unavailable': 'onMuralUnavailable',
  'mural.error': 'onError',
  'mural.ready': 'onReady',
};

export interface CanvasParams {
  backUri?: URL | string;
}

export interface PropTypes extends CanvasEvents {
  apiClient: ApiClient;
  canvasParams: CanvasParams;
  muralId: string;
  muralUrl: string;
  iframeRef: React.Ref<HTMLIFrameElement>;

  authUrl?: URL | string;
  state?: string;
  rpcClient?: RpcClient;
}

export function muralSessionActivationUrl(
  apiClient: ApiClient,
  authUrl: URL | string,
  muralUrl: URL | string,
) {
  const authURL = new URL(authUrl.toString());
  const muralURL = new URL(muralUrl.toString());

  const activateURL = new URL('/signin-code/authenticate', muralURL);

  activateURL.searchParams.set('redirectUrl', muralURL.href);
  activateURL.searchParams.set('authUrl', authURL.href);
  activateURL.searchParams.set('clientId', apiClient.config.appId);
  activateURL.searchParams.set('t', new Date().getTime().toString()); // disable any caching

  return activateURL.href;
}

export class CanvasHost extends React.Component<PropTypes> {
  private iframeRef = React.createRef<HTMLIFrameElement>();

  handleMessage = async (evt: MessageEvent) => {
    const eventHandlerKey = MESSAGE_EVENT[evt.data.type];
    const eventHandler = this.props[eventHandlerKey] as EventHandler;

    if (eventHandler) {
      await eventHandler.call(null, evt.data ?? null);
    }

    if (this.props.onMessage) {
      this.props.onMessage.call(null, evt);
    }
  };

  componentDidMount() {
    const { rpcClient } = this.props;

    if (rpcClient) {
      rpcClient.init({
        source: window,
        target: this.iframeRef?.current?.contentWindow as any,
      });
    }

    // Wire the other events
    window.addEventListener('message', this.handleMessage);
  }

  render() {
    const { muralUrl, authUrl, apiClient } = this.props;

    const canvasUrl: string =
      authUrl && apiClient.authenticated()
        ? muralSessionActivationUrl(apiClient, authUrl, muralUrl)
        : muralUrl;

    return (
      <iframe
        data-qa="mural-canvas"
        ref={this.iframeRef}
        className="mural-canvas"
        src={canvasUrl}
        seamless
      />
    );
  }
}

export default CanvasHost;
