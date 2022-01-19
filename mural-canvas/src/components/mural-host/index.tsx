import * as React from 'react';
import { Router, Switch, Route, RouteComponentProps } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ApiClient } from 'mural-integrations-mural-client';
import OAuthSessionActivation from './auth';

const history = createBrowserHistory();

import './styles.scss';

type EventHandler = () => Promise<void> | void;

interface CanvasEvents {
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

export interface PropTypes extends CanvasEvents, RouteComponentProps {
  apiClient: ApiClient;
  muralId: string;
  state: string;
}

export function muralSessionActivationUrl(
  apiClient: ApiClient,
  muralUrl: URL | string,
) {
  const _muralUrl = new URL(muralUrl.toString());
  const activateUrl = new URL('/signin-code/authenticate', muralUrl);
  const authUrl = new URL('/session', window.location.href);

  activateUrl.searchParams.set('redirectUrl', _muralUrl.href);
  activateUrl.searchParams.set('authUrl', authUrl.href);
  activateUrl.searchParams.set('clientId', apiClient.config.appId);
  activateUrl.searchParams.set('t', new Date().getTime().toString()); // disable any caching

  console.log('Activation flow urls', activateUrl.href);

  return activateUrl.href;
}

export class CanvasHost extends React.Component<PropTypes> {
  canvasFrameRef: any = null;

  handleMessage = (evt: MessageEvent) => {
    const eventHandlerKey = MESSAGE_EVENT[evt.data.type];
    const eventHandler = this.props[eventHandlerKey];

    if (eventHandler) {
      eventHandler.call(null);
    }
  };

  componentDidMount() {
    window.addEventListener('message', this.handleMessage);
  }

  render() {
    const { muralId, state } = this.props;
    const [workspaceId, boardId] = muralId.split('.');
    let canvasUrl: string;

    // build a mural canvas url
    const url = new URL(
      `/canvas/t/${workspaceId}/m/${workspaceId}/${boardId}/${state}`,
      this.props.apiClient.config.hostname,
    );

    console.log('Canvas URL', url);

    if (this.props.apiClient.authenticated()) {
      canvasUrl = muralSessionActivationUrl(this.props.apiClient, url);
    } else {
      // directly to the visitor flow
      canvasUrl = url.href;
    }

    return (
      <iframe
        className="mural-canvas"
        ref={this.canvasFrameRef}
        seamless
        src={canvasUrl}
      ></iframe>
    );
  }
}

export class CanvasHostRoute extends React.Component<PropTypes> {
  handleError = () => {
    history.replace('/e/error');
  };

  handleAccessDenied = () => {
    history.replace('/e/access-denied');
  };

  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/e/access-denied">
            <h1>Access DENIED</h1>
          </Route>
          <Route exact path="/e/error">
            <h1>Error</h1>
          </Route>
          <Route path="/session">
            <OAuthSessionActivation apiClient={this.props.apiClient} />
          </Route>
          <Route
            render={(routeProps: any) => (
              <CanvasHost
                onMemberAccessDenied={this.handleAccessDenied}
                onVisitorAccessDenied={this.handleAccessDenied}
                onMuralError={this.handleError}
                onVisitorError={this.handleError}
                onWorkspaceError={this.handleError}
                onUserError={this.handleError}
                onReady={() => console.log('READY')}
                {...this.props}
                {...routeProps}
              />
            )}
          />
        </Switch>
      </Router>
    );
  }
}

export default CanvasHostRoute;
