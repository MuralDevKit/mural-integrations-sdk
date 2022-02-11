import { ApiClient } from '@tactivos/mural-integrations-mural-client';
import * as React from 'react';
import { useEffect } from 'react';
import { EventHandler } from '../../types';
import './styles.scss';

interface PropTypes {
  apiClient: ApiClient;
  onError?: EventHandler;
}

export async function getMuralSessionClaimUrl(
  apiClient: ApiClient,
  muralUrl: URL | string,
  code: string,
) {
  muralUrl = new URL(muralUrl.toString());
  const claimRequestUrl = new URL(
    `/api/v0/authenticate/oauth2/session/${code}`,
    `https://${apiClient.config.host}`,
  );

  claimRequestUrl.searchParams.set('redirectUrl', muralUrl.href);

  const res: Response = await apiClient.fetch(claimRequestUrl.href, {
    method: 'PUT',
  });

  // Workaround for the wrong content-type
  const decoder = new TextDecoder();
  const buf = await res.arrayBuffer();
  const claimUrl = decoder.decode(buf);

  return new URL(claimUrl.replace('"', ''));
}

const SessionActivation: React.FC<PropTypes> = ({ apiClient, onError }) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const rawRedirectUrl = params.get('redirectUrl');

  if (!code || !rawRedirectUrl) {
    onError && onError();
    return null;
  }

  const navigateSessionClaimUrl = async () => {
    const redirectUrl = new URL(rawRedirectUrl);

    try {
      const claimUrl = await getMuralSessionClaimUrl(
        apiClient,
        redirectUrl,
        code,
      );

      window.location.replace(claimUrl.href);
    } catch (e) {
      // worst case scenario, send the user on `mural` and let it go
      window.location.replace(redirectUrl.href);
      return null;
    }
  };

  useEffect(() => {
    navigateSessionClaimUrl();
  });

  return <h3 className="session-activation__header">Logging you in...</h3>;
};

export default SessionActivation;
