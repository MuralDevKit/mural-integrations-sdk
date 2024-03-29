import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';

import App from './app-basic';
// import App from './app-automation';
import reportWebVitals from './reportWebVitals';
import { defineDSComponents } from '@muraldevkit/mural-integrations-mural-picker';

import '@muraldevkit/ds-foundation/dist/foundation.min.css';
import '@muraldevkit/ds-foundation/dist/fonts.min.css';

// must be placed before render
defineDSComponents();
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
