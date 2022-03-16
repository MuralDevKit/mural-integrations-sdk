import { ApiClient } from '@muraldevkit/mural-integrations-mural-client';
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
): Promise<URL> {
  const redirectUrl = new URL(muralUrl.toString());

  const {
    api: { host, protocol },
  } = apiClient.config;
  const claimRequestUrl = new URL(
    `/api/v0/authenticate/oauth2/session/${code}`,
    `${protocol}//${host}`,
  );

  claimRequestUrl.searchParams.set('redirectUrl', redirectUrl.href);

  const res: Response = await apiClient.fetch(claimRequestUrl.href, {
    method: 'PUT',
  });

  const claimUrl = await res.json();
  return new URL(claimUrl);
}

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
      const claimUrl = await getMuralSessionClaimUrl(
        apiClient,
        redirectUrl,
        code,
      );

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
