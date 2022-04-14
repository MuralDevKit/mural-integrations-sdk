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
  authUrl?: URL | string;
  canvasParams: CanvasParams;
  muralId: string;
  state?: string;
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
    const { muralId, canvasParams, state } = this.props;
    const { appId } = this.props.apiClient.config;
    const [workspaceId, boardId] = muralId.split('.');

    let muralPath = `/a/${appId}/t/${workspaceId}/m/${workspaceId}/${boardId}`;
    if (state) muralPath += `/${state}`;

    const muralUrl = this.props.apiClient.url(muralPath);
    for (const [key, value] of Object.entries(canvasParams)) {
      if (value) muralUrl.searchParams.set(key, value.toString());
    }

    let canvasUrl: string;
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

    return (
      <iframe
        data-qa="mural-canvas"
        className="mural-canvas"
        src={canvasUrl}
        seamless
      />
    );
  }
}

export default CanvasHost;
