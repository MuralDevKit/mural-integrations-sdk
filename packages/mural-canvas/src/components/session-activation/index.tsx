import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
import * as React from 'react';
import { useEffect } from 'react';
import { muralSessionClaimUrl } from '../../lib/session-activation';
import { EventHandler } from '../../types';
import './styles.scss';

interface PropTypes {
  apiClient: ApiClient;
  onError?: EventHandler;
}

/**
 * Session activation handler
 * This component should be mounted in a well-known URL that you will be required
 * as the `authUrl` parameter on the `Canvas` component.
 *
 * Alternatively, you can use the `muralSessionClaimUrl` helper manually and
 * redirect the user manually, or even use a HTTP redirect from a back-end route
 * to the same effect.
 */
const SessionActivation: React.FC<PropTypes> = ({ apiClient, onError }) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const rawRedirectUrl = params.get('redirectUrl');

  if (!code || !rawRedirectUrl) {
    if (onError) onError();
    return null;
  }

  const navigateSessionClaimUrl = async () => {
    const redirectUrl = new URL(rawRedirectUrl);

    try {
      const claimUrl = await muralSessionClaimUrl(apiClient, redirectUrl, code);

      window.location.replace(claimUrl.href);
    } catch (e: any) {
      // worst case scenario, send the user on `mural` and let it go
      window.location.replace(redirectUrl.href);
    }
  };

  useEffect(() => {
    navigateSessionClaimUrl();
  });

  return <h3 className="session-activation__header">Logging you in...</h3>;
};

export default SessionActivation;
