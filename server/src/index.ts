import HTTPServer from './HTTPServer';
import GameServer from './GameServer';

const httpServer = new HTTPServer(3450);

GameServer.instance = new GameServer(httpServer.server);
