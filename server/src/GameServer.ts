import {Server}      from 'http';
import {generate}    from 'shortid';
import * as SocketIO from 'socket.io';
import {IRuleSet}    from '../../src/types/game';
import {IMap}        from '../../src/types/utils';
import Game          from './Game';


export default class GameServer {
  public static instance: GameServer;

  private games: IMap<Game> = {};
  private gameIds: string[] = [];

  private readonly server: SocketIO.Server;

  public constructor(httpServer: Server) {
    this.server = SocketIO(httpServer, {
      path: '/ws',
      pingInterval: 2500,
    });
  }

  public createGame(ruleSet: IRuleSet) {
    let id = generate();

    while (this.gameIds.indexOf(id) !== -1) {
      id = generate();
    }

    this.gameIds.push(id);
    this.games[id] = new Game(this.server.of(id), ruleSet);

    return id;
  }

}