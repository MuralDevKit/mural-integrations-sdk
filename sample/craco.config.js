const { DefinePlugin } = require('webpack');
const path = require('path');
const config = require('dos-config');

module.exports = {
  webpack: {
    alias: {
      '@muraldevkit/mural-integrations-common': path.join(
        __dirname,
        '../packages/mural-common/src',
      ),
      react: path.join(__dirname, 'node_modules/react'),
      'react-dom': path.join(__dirname, 'node_modules/react-dom'),
    },
    plugins: [
      new DefinePlugin({
        APP_ID: JSON.stringify(config.clientApp.clientId),
        SERVICES: JSON.stringify(config.services),
      }),
    ],
  },
  devServer: {
    port: config.client.port,
    host: config.client.host,
    https: config.client.https ?? false,
    before: (app, server, compiler) => {
      app.get('/', (_, res) => {
        res.redirect('/auth');
      });
    },
  },
};
