import Debug        from 'debug';
import * as express from 'express';
import Game         from './Game';
import GameServer   from './GameServer';

const debug = Debug('torusgo:server');


const env = process.env;
const prod = env.NODE_ENV === 'production';

const port = prod ? (env.PORT) : 3450;

const app = express();

const server = app.listen(port, () => {
  debug('listening on port %d', port);
});

GameServer.instance = new GameServer(server);

GameServer.instance.games.add(new Game('asdf', {
  size: {
    x: 12,
    y: 12,
  },
  komi: 0,
  handicap: 0,
}));

if (prod) {
  // TODO add serving of nodejs
}

