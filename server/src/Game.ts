import {EColor, IRawGame, IRuleSet, TMove} from '../../src/types/game';
import * as SocketIO                       from 'socket.io';
import {execMove, initGame, testMove}      from '../../src/utils/gameLogic';
import Connection, {IPlayer}               from './Connection';

export default class Game {
  private nsp: SocketIO.Namespace;

  public state: IRawGame;
  public moveNumber: number = 0;

  public players: {
    [EColor.White]?: IPlayer,
    [EColor.Black]?: IPlayer,
  } = {};

  public connections: Connection[] = [];

  constructor(nsp: SocketIO.Namespace, ruleSet: IRuleSet) {
    this.nsp = nsp;

    this.nsp.on('connection', (socket) => new Connection(socket, this));

    this.state = initGame(ruleSet);
  }

  public execMove(move: TMove): boolean {
    if (testMove(this.state, move)) {
      this.state = execMove(this.state, move);
      this.emitMove(move);
      return true;
    }
    return false;
  }

  public emitPlayerUpdate() {
    this.nsp.emit('update', {
      players: this.players,
    });
  }

  public emitMove(move: TMove) {
    this.nsp.emit('move', move);
  }

}