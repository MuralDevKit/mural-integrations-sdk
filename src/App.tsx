import * as React from 'react';
import './App.css';
import MuralPicker, { PropTypes } from 'mural-integrations-mural-picker'
import buildApiClient, { ApiClient, ClientConfig, buildClientConfig, authorizeHandler, requestTokenHandler } from 'mural-integrations-mural-client'

// --- Configuration ---

const tokenHandlerConfig = {
  authorizeUri: 'http://localhost:4001/auth',
  requestTokenUri: 'http://localhost:4001/auth/token',
  refreshTokenUri: 'http://localhost:4001/auth/refresh',
}

const authorize = authorizeHandler(tokenHandlerConfig)
const requestToken = requestTokenHandler(tokenHandlerConfig)
const clientConfig = buildClientConfig(
  'https://app.mural.co',
  tokenHandlerConfig
)

// --- MURAL API client ---
const apiClient = buildApiClient(clientConfig)

const handleMural = (mural: any) => {
  console.log(JSON.stringify(mural));
}

const handleError = (_: Error, message: string) => {
  console.log(message);
};

const muralPickerProps: PropTypes = {
  apiClient: apiClient,
  onCreateMural: handleMural,
  onMuralSelect: handleMural,
  handleError: handleError,
}

type AppState = {
  loaded: boolean;
}

class App extends React.Component<{}, AppState> {
  state: AppState = {
    loaded: false,
  }

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search)

    if (params.has("code")) {
      const code = params.get("code")
      const state = params.get("state")
      await requestToken(
        code, state, { store: true }
      );

      clientConfig.fetchFn('https://app.mural.co/api/public/v1/workspaces').then(async res => console.log(await res.json()));

      this.setState({ loaded: true });
    } else {
      const authorizeUrl = await authorize(null, { store: true })
      window.location.replace(authorizeUrl)
    }
  }

  render() {
    return (
      this.state.loaded
      ? <MuralPicker {...muralPickerProps} />
      : <h1>Loading</h1>
    )
  }
}

export default App;
