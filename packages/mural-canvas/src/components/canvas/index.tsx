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
  state: string;
  authUrl?: URL | string;
}

export function muralSessionActivationUrl(
  apiClient: ApiClient,
  authUrl: URL | string,
  muralUrl: URL | string,
) {
  authUrl = new URL(authUrl.toString());
  muralUrl = new URL(muralUrl.toString());

  const activateUrl = new URL('/signin-code/authenticate', muralUrl);

  activateUrl.searchParams.set('redirectUrl', muralUrl.href);
  activateUrl.searchParams.set('authUrl', authUrl.href);
  activateUrl.searchParams.set('clientId', apiClient.config.appId);
  activateUrl.searchParams.set('t', new Date().getTime().toString()); // disable any caching

  return activateUrl.href;
}

export class CanvasHost extends React.Component<PropTypes> {
  handleMessage = async (evt: MessageEvent) => {
    const eventHandlerKey = MESSAGE_EVENT[evt.data.type];
    const eventHandler = this.props[eventHandlerKey];

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
    const { muralId, state } = this.props;
    const { appId, host } = this.props.apiClient.config;
    const [workspaceId, boardId] = muralId.split('.');
    let canvasUrl: string;

    const muralUrl = new URL(
      `/a/${appId}/t/${workspaceId}/m/${workspaceId}/${boardId}/${state}`,
      `https://${host}`,
    );

    if (this.props.authUrl && this.props.apiClient.authenticated()) {
      canvasUrl = muralSessionActivationUrl(
        this.props.apiClient,
        this.props.authUrl,
        muralUrl,
      );
    } else {
      // directly to the visitor flow
      canvasUrl = muralUrl.href;
    }

    return <iframe className="mural-canvas" src={canvasUrl} seamless></iframe>;
  }
}

export default CanvasHost;
