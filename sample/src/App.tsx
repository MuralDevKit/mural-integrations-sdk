import {
  Canvas,
  SessionActivation
} from "@tactivos/mural-integrations-mural-canvas";
import buildApiClient, {
  authorizeHandler,
  buildClientConfig,
  Mural,
  refreshTokenHandler,
  requestTokenHandler
} from "@tactivos/mural-integrations-mural-client";
import {
  MuralPicker,
  PropTypes
} from "@tactivos/mural-integrations-mural-picker";
import * as React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

console.log(APP_ID);
console.log(SERVICES);

// --- Configuration ---
const tokenHandlerConfig = {
  authorizeUri: new URL("/auth", `http://${SERVICES.auth}`).href,
  requestTokenUri: new URL("/auth/token", `http://${SERVICES.auth}`).href,
  refreshTokenUri: new URL("/auth/refresh", `http://${SERVICES.auth}`).href
};

const authorize = authorizeHandler(tokenHandlerConfig);
const requestToken = requestTokenHandler(tokenHandlerConfig);
const refreshToken = refreshTokenHandler(tokenHandlerConfig);

// --- MURAL API client ---
const clientConfig = buildClientConfig({
  appId: APP_ID,
  muralHost: SERVICES.mural,
  ...tokenHandlerConfig
});

const apiClient = buildApiClient(clientConfig);

const handleError = (_: Error, message: string) => {
  console.log(message);
};

enum Segue {
  LOADING,
  PICKER,
  CANVAS
}

type AppState = {
  segue: Segue;
  muralId: string | null;
  state: string | null;
};

class App extends React.Component<{}, AppState> {
  state: AppState = {
    segue: Segue.LOADING,
    muralId: null,
    state: null
  };

  handleMessage = (evt: MessageEvent) => {
    console.log(evt);
  };

  handleMural = (mural: Mural) => {
    const parts = mural.visitorsSettings.link.split("/");
    const state = parts[parts.length - 1];

    this.setState({
      segue: Segue.CANVAS,
      muralId: mural.id,
      state
    });
  };

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const route = window.location.pathname;

    if (route.startsWith("/canvas")) {
      const muralId = params.get("muralId");
      const state = params.get("state");
      this.setState({ segue: Segue.CANVAS, muralId, state });
    }

    // TODO: handle callback route
    if (route.startsWith("/auth/callback") && params.has("code")) {
      const code = params.get("code");
      const state = params.get("state");
      await requestToken(code, state, { store: true });

      this.setState({ segue: Segue.PICKER });
      return;
    }

    if (route.startsWith("/auth")) {
      try {
        await refreshToken({ store: true });
        this.setState({ segue: Segue.PICKER });
        return;
      } catch (err) {
        const authorizeUrl = await authorize(null, { store: true });
        window.location.replace(authorizeUrl);
      }
    }

    this.setState({ segue: Segue.CANVAS });
  }

  render() {
    const muralPickerProps: PropTypes = {
      apiClient: apiClient,
      onCreateMural: async _mural => {
        return undefined;
      },
      onMuralSelect: this.handleMural,
      handleError: handleError
    };

    const authUrl = new URL("/session", window.origin);

    switch (this.state.segue) {
      case Segue.LOADING: {
        return <h1>Loading...</h1>;
      }
      case Segue.PICKER: {
        return <MuralPicker {...muralPickerProps} />;
      }
      case Segue.CANVAS: {
        return (
          <Canvas
            apiClient={apiClient}
            authUrl={authUrl}
            muralId={this.state.muralId!}
            state={this.state.state!}
            onVisitorAccessDenied={() => alert("ACCESS DENIED")}
            onError={() => alert("ERROR")}
            onMessage={this.handleMessage}
            onReady={() => console.log("READY")}
          />
        );
      }
    }
  }
}

const AppRoute = () => {
  return (
    <Routes>
      <Route
        path="/session"
        element={<SessionActivation apiClient={apiClient} />}
      />
      <Route path="*" element={<App />} />
    </Routes>
  );
};

export default AppRoute;
