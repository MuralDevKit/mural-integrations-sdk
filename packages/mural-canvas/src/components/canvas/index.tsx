import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { getCommonTrackingProperties } from '../../common/tracking-properties';
import RpcClient, { RpcMessage } from '../../lib/rpc';
import {
  createMuralSession,
  muralSessionActivationUrl,
  muralSessionActivationUrlRpc,
} from '../../lib/session-activation';
import { EventHandler } from '../../types';
import './styles.scss';

interface CanvasEvents {
  onBack?: EventHandler;
  onError?: EventHandler;
  onGuestAccessDenied?: EventHandler;
  onInvalidInvitation?: EventHandler;
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
  'mural.invalid_invitation': 'onInvalidInvitation',
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
 * If the `rpcClient` parameter is supplied, then it will use the RPC-based
 * Canvas session activation flow to ensure the Mural canvas is properly
 * authenticated.
 *
 * Alternatively, if the `authUrl` parameter is supplied (see the
 * SessionActivation component), then it will use the redirect-based Canvas
 * session activation flow.
 *
 * @param canvasLink this should always match the MURAL `_canvasLink`
 * property. Using a raw MURAL url will not properly load the mural.
 *
 * @experimental The RpcClient can also be wired to issue command to the
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

  handleRpcMessage = async (message: RpcMessage) => {
    const { apiClient, rpcClient } = this.props;

    if (!rpcClient) {
      throw new Error('Broken RPC connection: rpcClient is missing');
    }

    // Handle only session activation request
    if (message.method !== 'session_activation_request') return;

    const code = message.args?.at(0);
    if (!code) {
      return rpcClient.rpcCallback(message, {
        error: "'code' not found in args",
      });
    }

    // Create a Mural session from the client app claims
    await createMuralSession(apiClient, code);

    // Notify that the session is ready to be consumed
    await rpcClient.rpcCallback(message);
  };

  componentDidMount() {
    const { rpcClient } = this.props;

    if (rpcClient) {
      rpcClient.init({
        source: window,
        target: this.iframeRef?.current?.contentWindow as any,
      });

      // Register RPC listener for canvas session activation flow
      rpcClient.addListener('rpc_message', this.handleRpcMessage);
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
      rpcClient.removeListener('rpc_message', this.handleRpcMessage);
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
    if (apiClient.authenticated()) {
      if (authUrl) {
        // Redirect flow
        canvasUrl = muralSessionActivationUrl(apiClient, authUrl, canvasUrl);
      } else if (this.props.rpcClient) {
        // RPC flow
        canvasUrl = muralSessionActivationUrlRpc(apiClient, canvasUrl);
      }
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
