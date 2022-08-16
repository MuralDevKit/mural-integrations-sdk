import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import RpcClient from '../../lib/rpc';
import { muralSessionActivationUrl } from '../../lib/session-activation';
import { EventHandler } from '../../types';
import './styles.scss';

interface CanvasEvents {
  onBack?: EventHandler;
  onError?: EventHandler;
  onGuestAccessDenied?: EventHandler;
  onMemberAccessDenied?: EventHandler;
  onMessage?: EventHandler<MessageEvent>;
  onMuralUnavailable?: EventHandler;
  onReady?: EventHandler;
  onVisitorAccessDenied?: EventHandler;
}

const MESSAGE_EVENT: Record<string, keyof CanvasEvents> = {
  'mural.error': 'onError',
  'mural.guest_access_denied': 'onGuestAccessDenied',
  'mural.integrated_client.back_event': 'onBack',
  'mural.member_access_denied': 'onMemberAccessDenied',
  'mural.mural_unavailable': 'onMuralUnavailable',
  'mural.ready': 'onReady',
  'mural.visitor_access_denied': 'onVisitorAccessDenied',
};

export interface CanvasParams {
  backUri?: URL | string;
}

export interface PropTypes extends CanvasEvents {
  apiClient: ApiClient;
  canvasLink: URL | string;

  authUrl?: URL | string;
  canvasParams?: CanvasParams;
  rpcClient?: RpcClient;
}

/**
 * Hosts a MURAL canvas to be embedded in any web application.
 *
 * This component ensures the displayed MURAL will be allowed to
 * be iframed within the current browsing context.
 *
 * If the `authUrl` parameter is supplied (see the SessionActivation
 * component), then it will use the Canvas session activation flow
 * to ensure the MURAL canvas will be properly authenticated.
 *
 * @param canvasLink this should always match the MURAL `_canvasLink`
 * property. Using a raw MURAL url will not properly load the mural.
 *
 * @experimental A RpcClient can also be wired to issue command to the
 * MURAL canvas programatically.
 */
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

    window.addEventListener('message', this.handleMessage);

    this.props.apiClient.track('Mural canvas is opened', {
      ...getCommonTrackingProperties(),
      clientAppId: this.props.apiClient.config.appId,
      canvasLink: this.props.canvasLink,
    });
  }

  componentWillUnmount() {
    const { rpcClient } = this.props;

    if (rpcClient) {
      rpcClient.dispose();
    }

    window.removeEventListener('message', this.handleMessage);
  }

  render() {
    const { apiClient, authUrl, canvasLink, canvasParams, onBack } = this.props;
    if (!canvasLink)
      throw new Error(`Cannot render the supplied 'canvasLink': ${canvasLink}`);

    // Add the canvasParams to the URL
    let canvasUrl = new URL(canvasLink.toString());
    for (const [key, value] of Object.entries(canvasParams || {})) {
      if (value) canvasUrl.searchParams.set(key, value.toString());
    }

    // Wire up the `onBack` handler if it is specified
    if (onBack) {
      canvasUrl.searchParams.set('backUri', 'mural:back-event');
    }

    // Add UTM parameters to track canvas events in iframe
    canvasUrl.searchParams.set('utm_source', 'mural-canvas');
    canvasUrl.searchParams.set('utm_content', apiClient.config.appId);

    // Convert the url to the session activation link if supported
    if (authUrl && apiClient.authenticated()) {
      canvasUrl = muralSessionActivationUrl(apiClient, authUrl, canvasUrl);
    }

    return (
      <iframe
        data-qa="mural-canvas"
        ref={this.iframeRef}
        className="mural-canvas"
        src={canvasUrl.href}
        referrerPolicy="origin"
        seamless
      />
    );
  }
}

export default CanvasHost;
