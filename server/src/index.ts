import * as express from 'express';
import GameServer   from './GameServer';

const env = process.env;
const prod = env.NODE_ENV === 'production';

const port = prod ? (env.PORT) : 3450;

const app = express();

const server = app.listen(port);

GameServer.instance = new GameServer(server);

if (prod) {
  // TODO add serving of nodejs
}

