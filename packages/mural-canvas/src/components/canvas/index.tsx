import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { commonTrackingProperties } from '../../../../mural-picker/src/common/tracking-properties';
import RpcClient from '../../lib/rpc';
import { muralSessionActivationUrl } from '../../lib/session-activation';
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
  canvasParams?: CanvasParams;
  muralId: string;
  muralUrl: string;
  authUrl?: URL | string;
  state?: string;
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
 * @techdebt
 * @param muralUrl this should always match the MURAL `_canvasLink`
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

    this.props.apiClient.track('Mural canvas is opened', 'canvas_user_id', {
      ...commonTrackingProperties,
      clientAppId: this.props.apiClient.config.appId,
      muralId: this.props.muralId,
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
    const { muralUrl, authUrl, apiClient } = this.props;

    const canvasUrl: string =
      authUrl && apiClient.authenticated()
        ? muralSessionActivationUrl(apiClient, authUrl, muralUrl).toString()
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
