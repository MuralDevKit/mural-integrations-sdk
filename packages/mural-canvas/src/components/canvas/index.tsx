import { ApiClient } from '@tactivos/mural-integrations-mural-client';
import * as React from 'react';
import { EventHandler } from '../../types';
import './styles.scss';

interface CanvasEvents {
  onMessage?: EventHandler<MessageEvent>;
  onMemberAccessDenied?: EventHandler;
  onVisitorAccessDenied?: EventHandler;
  onGuestAccessDenied?: EventHandler;
  onError?: EventHandler;
  onReady?: EventHandler;
}

const MESSAGE_EVENT: Record<string, keyof CanvasEvents> = {
  'mural.member_access_denied': 'onMemberAccessDenied',
  'mural.visitor_access_denied': 'onVisitorAccessDenied',
  'mural.guest_access_denied': 'onGuestAccessDenied',
  'mural.error': 'onError',
  'mural.ready': 'onReady',
};

export interface PropTypes extends CanvasEvents {
  apiClient: ApiClient;
  muralId: string;
  muralUrl: string;
  state?: string;
  authUrl?: URL | string;
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
      await eventHandler.call(null);
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
    let canvasUrl: string = muralUrl;

    if (authUrl && apiClient.authenticated()) {
      canvasUrl = muralSessionActivationUrl(apiClient, authUrl, muralUrl);
    }

    return <iframe className="mural-canvas" src={canvasUrl} seamless />;
  }
}

export default CanvasHost;
