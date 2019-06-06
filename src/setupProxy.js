const proxy = require('http-proxy-middleware');

// Redirects backend requests to the backend, which runs on a different port
// This is only needed for development. On production, static serving & backend should run on a
// single port
module.exports = function (app) {

  // redirects websocket connections
  app.use('/ws', proxy({target: 'http://localhost:3450', ws: true}));

  // redirects createGame requests
  app.use('/createGame', proxy({target: 'http://localhost:3450'}));
};