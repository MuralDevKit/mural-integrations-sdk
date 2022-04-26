import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { EventHandler } from '../../types';
import './styles.scss';

interface CanvasEvents {
  onMessage?: EventHandler<MessageEvent>;
  onMemberAccessDenied?: EventHandler;
  onVisitorAccessDenied?: EventHandler;
  onGuestAccessDenied?: EventHandler;
  onMuralUnavailable?: EventHandler;
  onError?: EventHandler;
  onReady?: EventHandler;
  onRpcReady?: EventHandler;
  onRpcContext?: EventHandler;
  onRpcMessage?: EventHandler;
}

const MESSAGE_EVENT: Record<string, keyof CanvasEvents> = {
  'mural.member_access_denied': 'onMemberAccessDenied',
  'mural.visitor_access_denied': 'onVisitorAccessDenied',
  'mural.guest_access_denied': 'onGuestAccessDenied',
  'mural.mural_unavailable': 'onMuralUnavailable',
  'mural.error': 'onError',
  'mural.ready': 'onReady',
  'mural.rpc_ready': 'onRpcReady',
  'mural.rpc_context': 'onRpcContext',
  'mural.rpc_message': 'onRpcMessage',
};

export interface CanvasParams {
  backUri?: URL | string;
}

export interface PropTypes extends CanvasEvents {
  apiClient: ApiClient;
  authUrl?: URL | string;
  canvasParams: CanvasParams;
  muralId: string;
  muralUrl: string;
  state?: string;
  iframeRef: any;
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
  handleMessage = async (evt: MessageEvent) => {
    const eventHandlerKey = MESSAGE_EVENT[evt.data.type];
    const eventHandler = this.props[eventHandlerKey] as EventHandler;

    if (eventHandler) {
      await eventHandler.call(null, evt.data.payload ?? null);
    }

    if (this.props.onMessage) {
      this.props.onMessage.call(null, evt);
    }
  };

  componentDidMount() {
    window.addEventListener('message', this.handleMessage);
  }

  render() {
    const { muralUrl, authUrl, apiClient } = this.props;

    const canvasUrl: string =
      authUrl && apiClient.authenticated()
        ? muralSessionActivationUrl(apiClient, authUrl, muralUrl)
        : muralUrl;

    const { iframeRef } = this.props;

    return (
      <iframe
        data-qa="mural-canvas"
        ref={iframeRef}
        className="mural-canvas"
        src={canvasUrl}
        seamless
      />
    );
  }
}

export default CanvasHost;
