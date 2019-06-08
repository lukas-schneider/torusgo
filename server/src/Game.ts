import debug                                                          from 'debug';
import * as SocketIO                                                  from 'socket.io';
import {EColor, EGamePhase, IPlayerWithId, IRawGame, IRuleSet, TMove} from '../../src/types/game';
import {EServerEvents}                                                from '../../src/types/utils';
import {
  execMove,
  initGame,
  testMove,
}                                                                     from '../../src/utils/gameLogic';
import Connection                                                     from './Connection';


const debugStatus = debug('torusgo:game-status');
const debugSend = debug('torusgo:game-send');
const debugRecv = debug('torusgo:game');

export default class Game {
  private nsp: SocketIO.Namespace;
  public connections: Connection[] = [];

  // ---- game state ----
  public rawGame: IRawGame;

  public phase: EGamePhase = EGamePhase.Waiting;

  public moveNumber: number = 0;

  public players: {
    [EColor.White]?: IPlayerWithId,
    [EColor.Black]?: IPlayerWithId,
  } = {};


  constructor(nsp: SocketIO.Namespace, ruleSet: IRuleSet) {
    this.nsp = nsp;

    debugStatus('listening on namespace %s ...', this.nsp.name);
    this.nsp.on('connection', (socket) => new Connection(socket, this));

    this.rawGame = initGame(ruleSet);
  }

  public execMove(move: TMove): boolean {
    if (testMove(this.rawGame, move)) {
      this.rawGame = execMove(this.rawGame, move);
      this.moveNumber++;

      this.emitMove(move);
      return true;
    }
    return false;
  }

  public assignPlayer(color: EColor, player: IPlayerWithId) {
    this.players[color] = player;
    this.emitPlayerUpdate();

    if (this.players[EColor.Black] && this.players[EColor.White]) {
      this.phase = EGamePhase.Running;
      this.emitPhaseUpdate();
    }

  }

  public emitPhaseUpdate() {
    debugSend('%s %s', EServerEvents.PhaseUpdate, EGamePhase[this.phase]);
    this.nsp.emit(EServerEvents.PhaseUpdate, this.phase);
  }

  public emitPlayerUpdate() {
    const players = this.getPlayersWithoutId();

    debugSend('%s %o', EServerEvents.PlayerUpdate, players);
    this.nsp.emit(EServerEvents.PlayerUpdate, players);
  }

  public emitMove(move: TMove) {
    debugSend('%s %o', EServerEvents.Move, move);
    this.nsp.emit(EServerEvents.Move, move);
  }

  public getPlayersWithoutId() {
    return {
      [EColor.White]: this.players[EColor.White] && {
        ...this.players[EColor.White],
        id: undefined,
      },
      [EColor.Black]: this.players[EColor.Black] && {
        ...this.players[EColor.Black],
        id: undefined,
      },
    };
  }

}