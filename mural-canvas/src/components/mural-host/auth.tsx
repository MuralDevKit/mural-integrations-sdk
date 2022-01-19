import * as React from 'react';
import { useEffect } from 'react';
import { ApiClient } from 'mural-integrations-mural-client';
import { useHistory, useLocation } from 'react-router';

// import './style.scss';

interface PropTypes {
  apiClient: ApiClient;
}

export async function getMuralSessionClaimUrl(
  apiClient: ApiClient,
  muralUrl: URL | string,
  code: string,
) {
  const _muralUrl = new URL(muralUrl.toString());
  const claimRequestUrl = new URL(
    `/api/v0/authenticate/oauth2/session/${code}`,
    apiClient.config.hostname,
  );

  claimRequestUrl.searchParams.set('redirectUrl', _muralUrl.href);

  const res: Response = await apiClient.fetch(claimRequestUrl.href, {
    method: 'PUT',
  });

  // Workaround for the wrong content-type
  const decoder = new TextDecoder();
  const buf = await res.arrayBuffer();
  const claimUrl = decoder.decode(buf);

  return new URL(claimUrl.replace('"', ''));
}

const OAuthSessionActivation: React.FC<PropTypes> = ({ apiClient }) => {
  const history = useHistory();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const rawRedirectUrl = params.get('redirectUrl');

  if (!code || !rawRedirectUrl) {
    history.replace('/e/error');
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
      console.log('CLAIM URL', claimUrl);

      window.location.replace(claimUrl.href);
    } catch (e) {
      debugger;
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

export default OAuthSessionActivation;
