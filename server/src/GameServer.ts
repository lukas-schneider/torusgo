import {Server}      from 'http';
import {generate}    from 'shortid';
import * as SocketIO from 'socket.io';
import {IRuleSet}    from '../../shared/gameLogic';
import Game          from './Game';
import Session       from './Session';
import {Collection}  from './utils';

export default class GameServer {
  public static instance: GameServer;

  public readonly games: Collection<Game> = new Collection<Game>();

  public readonly sessions: Collection<Session> = new Collection<Session>();

  public readonly server: SocketIO.Server;

  public constructor(httpServer: Server) {
    this.server = SocketIO(httpServer, {
      path: '/ws',
      pingInterval: 2500,
    });

    this.server.on('connection', (socket) => {
      const session = new Session(socket, this);

      this.sessions.add(session);
      socket.on('disconnect', () => this.sessions.remove(session));
    });
  }

  public createGame(ruleSet: IRuleSet) {
    let id = generate();

    while (this.games.has(id)) {
      id = generate();
    }

    this.games.add(new Game(id, ruleSet));

    return id;
  }

}