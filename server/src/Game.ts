import debug                                                          from 'debug';
import {EventEmitter}                                                 from 'events';
import {
  execMove,
  initGame,
  testMove,
  IRawGame,
  EColor,
  IRuleSet,
  TMove,
}                                                                     from '../../shared/gameLogic';
import {IGameState, IColorMap, EGamePhase, EServerEvent, IPlayerInfo} from '../../shared/types';
import Session                                                        from './Session';

const debugStatus = debug('torusgo:game');

export default class Game extends EventEmitter {
  static ROOM_PREFIX = 'game/';

  public id: string;

  // ---- game state ----
  public rawGame: IRawGame;

  public phase: EGamePhase = EGamePhase.Waiting;

  public moveNumber: number = 0;

  public players: Partial<IColorMap<Session>> = {};

  constructor(id: string, ruleSet: IRuleSet) {
    super();
    this.id = id;
    this.rawGame = initGame(ruleSet);
    this.debug('created with ruleset %o', ruleSet);

    this.on(EServerEvent.Move, (...args) => this.debug('executed move %o', args[0]));

    this.on(EServerEvent.PhaseUpdate, () => this.debug('switched to phase %o', this.phase));

    this.on(
      EServerEvent.PlayerUpdate,
      () => this.debug('updated players %o', this.getPlayerInfo()),
    );
  }

  private debug(format: string, ...args: any[]) {
    debugStatus('[%s]' + format, Game.ROOM_PREFIX + this.id, ...args);
  }

  public connect(session: Session, role: EColor) {
    this.players[role] = session;

    this.emit(EServerEvent.PlayerUpdate);
  }

  public disconnect(role: EColor) {
    delete this.players[role];

    this.emit(EServerEvent.PlayerUpdate);
  }

  public getState(): IGameState {
    return {
      rawGame: this.rawGame,
      phase: this.phase,
      moveNumber: this.moveNumber,
      players: this.getPlayerInfo(),
    };
  }

  public getPlayerInfo(): Partial<IColorMap<IPlayerInfo>> {
    const white = this.players[EColor.White];
    const black = this.players[EColor.Black];
    return {
      [EColor.White]: white && {
        name: white.name,
      },
      [EColor.Black]: black && {
        name: black.name,
      },
    };
  }

  public execMove(move: TMove): boolean {
    if (!testMove(this.rawGame, move)) return false;

    this.rawGame = execMove(this.rawGame, move);
    this.moveNumber++;

    this.emit(EServerEvent.Move, move);
    return true;
  }

}